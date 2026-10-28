
"""Flask API for the SearchNet performance simulator."""

import csv
import io
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, Response
from flask_cors import CORS

from config import (
    ARCHITECTURES,
    DEFAULT_REQUESTS,
    DEFAULT_SEED,
    DEFAULT_TRAFFIC_INTENSITY,
    FAILURE_SCENARIOS,
    MAX_REQUESTS,
    REGIONS,
    REGION_DISPLAY_NAMES,
    TRAFFIC_INTENSITY_RPS,
)
from simulator import run_simulation


BASE_DIR = Path(__file__).resolve().parent
EXPERIMENTS_DIR = BASE_DIR.parent / "experiments"
EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
CORS(app)


def load_experiment(experiment_id):
    """Load a saved experiment, or return None when it doesn't exist."""
    if not experiment_id or Path(experiment_id).name != experiment_id:
        return None

    file_path = EXPERIMENTS_DIR / f"{experiment_id}.json"

    if not file_path.is_file():
        return None

    try:
        with file_path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError):
        return None


PACKET_TRACER_RESULTS_FILE = BASE_DIR.parent / "packet_tracer_results.json"

PACKET_TRACER_DEFAULTS = [
    {
        "name": "Normal connectivity",
        "centralized": "Ping connectivity tested successfully",
        "distributed": "Ping connectivity tested successfully",
    },
    {
        "name": "Link failure",
        "centralized": "",
        "distributed": "",
    },
    {
        "name": "Server failure",
        "centralized": "",
        "distributed": "",
    },
    {
        "name": "Regional failure",
        "centralized": "",
        "distributed": "",
    },
]


def load_packet_tracer_results():
    """Load saved Packet Tracer observations or return the defaults."""
    if not PACKET_TRACER_RESULTS_FILE.is_file():
        return PACKET_TRACER_DEFAULTS

    try:
        with PACKET_TRACER_RESULTS_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)

        observations = data.get("observations")

        if isinstance(observations, list):
            return observations

    except (OSError, json.JSONDecodeError, AttributeError):
        app.logger.exception("Unable to load Packet Tracer observations")

    return PACKET_TRACER_DEFAULTS


@app.get("/api/packet-tracer-results")
def get_packet_tracer_results():
    """Return recorded Cisco Packet Tracer observations."""
    return jsonify({
        "observations": load_packet_tracer_results()
    })


@app.put("/api/packet-tracer-results")
def save_packet_tracer_results():
    """Save observations recorded by the user."""
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "error": "Request body must be a JSON object."
        }), 400

    observations = payload.get("observations")

    if not isinstance(observations, list):
        return jsonify({
            "error": "observations must be a list."
        }), 400

    expected_names = [
        "Normal connectivity",
        "Link failure",
        "Server failure",
        "Regional failure",
    ]

    if len(observations) != len(expected_names):
        return jsonify({
            "error": "Exactly four test scenarios are required."
        }), 400

    cleaned_observations = []

    for index, item in enumerate(observations):
        if not isinstance(item, dict):
            return jsonify({
                "error": "Each observation must be a JSON object."
            }), 400

        if item.get("name") != expected_names[index]:
            return jsonify({
                "error": "Test scenarios are missing or in the wrong order."
            }), 400

        centralized = item.get("centralized")
        distributed = item.get("distributed")

        if not isinstance(centralized, str) or not isinstance(distributed, str):
            return jsonify({
                "error": "Observations must be text."
            }), 400

        if len(centralized) > 2000 or len(distributed) > 2000:
            return jsonify({
                "error": "Each observation must be 2000 characters or fewer."
            }), 400

        cleaned_observations.append({
            "name": expected_names[index],
            "centralized": centralized,
            "distributed": distributed,
        })

    try:
        with PACKET_TRACER_RESULTS_FILE.open("w", encoding="utf-8") as file:
            json.dump(
                {"observations": cleaned_observations},
                file,
                indent=2,
            )
    except OSError:
        app.logger.exception("Unable to save Packet Tracer observations")
        return jsonify({
            "error": "Unable to save Packet Tracer results."
        }), 500

    return jsonify({
        "message": "Packet Tracer results saved successfully.",
        "observations": cleaned_observations,
    }), 200

@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "SearchNet Performance Simulator",
    })


@app.get("/api/regions")
def regions():
    return jsonify({
        "regions": [
            {"id": region, "name": REGION_DISPLAY_NAMES[region]}
            for region in REGIONS
        ],
        "architectures": ARCHITECTURES,
        "failure_scenarios": FAILURE_SCENARIOS,
        "traffic_intensities": TRAFFIC_INTENSITY_RPS,
        "defaults": {
            "requests": DEFAULT_REQUESTS,
            "seed": DEFAULT_SEED,
            "traffic_intensity": DEFAULT_TRAFFIC_INTENSITY,
        },
    })


@app.post("/api/simulate")
def simulate():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "error": "Request body must be a valid JSON object."
        }), 400

    architecture = payload.get("architecture", "Distributed")
    region = payload.get("region", "india")
    failure = payload.get("failure", "Normal")
    requests_count = payload.get("requests", DEFAULT_REQUESTS)
    seed = payload.get("seed", DEFAULT_SEED)
    traffic_intensity = payload.get(
        "traffic_intensity",
        DEFAULT_TRAFFIC_INTENSITY,
    )
    failover_enabled = payload.get("failover_enabled", True)

    if architecture not in ARCHITECTURES:
        return jsonify({"error": "Invalid architecture."}), 400

    if region not in REGIONS:
        return jsonify({"error": "Invalid region."}), 400

    if failure not in FAILURE_SCENARIOS:
        return jsonify({"error": "Invalid failure scenario."}), 400

    if traffic_intensity not in TRAFFIC_INTENSITY_RPS:
        return jsonify({"error": "Invalid traffic intensity."}), 400

    if (
        isinstance(requests_count, bool)
        or not isinstance(requests_count, int)
        or not 1 <= requests_count <= MAX_REQUESTS
    ):
        return jsonify({
            "error": f"requests must be an integer from 1 to {MAX_REQUESTS}."
        }), 400

    if isinstance(seed, bool) or not isinstance(seed, int):
        return jsonify({"error": "seed must be an integer."}), 400

    if not isinstance(failover_enabled, bool):
        return jsonify({"error": "failover_enabled must be a boolean."}), 400

    try:
        result = run_simulation(
            architecture=architecture,
            region=region,
            failure=failure,
            requests_count=requests_count,
            seed=seed,
            traffic_intensity=traffic_intensity,
            failover_enabled=failover_enabled,
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    experiment_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    result["experiment_id"] = experiment_id
    result["created_at"] = created_at
    result["configuration"] = {
        "architecture": architecture,
        "region": region,
        "failure": failure,
        "requests": requests_count,
        "seed": seed,
        "traffic_intensity": traffic_intensity,
        "failover_enabled": failover_enabled,
    }

    file_path = EXPERIMENTS_DIR / f"{experiment_id}.json"

    try:
        with file_path.open("w", encoding="utf-8") as file:
            json.dump(result, file, indent=2)
    except OSError:
        app.logger.exception("Unable to save experiment")
        return jsonify({
            "error": "Simulation ran, but the experiment could not be saved."
        }), 500

    return jsonify(result), 200


@app.get("/api/experiments/<experiment_id>")
def get_experiment(experiment_id):
    result = load_experiment(experiment_id)

    if result is None:
        return jsonify({"error": "Experiment not found."}), 404

    # The complete experiment includes its raw request-level results.
    return jsonify(result)


@app.get("/api/experiments/<experiment_id>/results")
def get_experiment_results(experiment_id):
    result = load_experiment(experiment_id)

    if result is None:
        return jsonify({"error": "Experiment not found."}), 404

    return jsonify({
        "experiment_id": result["experiment_id"],
        "created_at": result.get("created_at"),
        "configuration": result.get("configuration", {}),
        "metrics": result["metrics"],
        "methodology": result.get("methodology", {}),
    })


@app.get("/api/experiments/<experiment_id>/results.csv")
def download_experiment_csv(experiment_id):
    result = load_experiment(experiment_id)

    if result is None:
        return jsonify({"error": "Experiment not found."}), 404

    output = io.StringIO()
    fieldnames = [
        "request_id",
        "source_region",
        "served_by",
        "arrival_time_ms",
        "network_latency_ms",
        "queue_wait_ms",
        "processing_time_ms",
        "response_latency_ms",
        "completion_time_ms",
        "packets_sent",
        "packets_delivered",
        "delivered",
        "recovery_latency_ms",
    ]

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(result.get("request_results", []))

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": (
                f'attachment; filename="searchnet_{experiment_id}.csv"'
            )
        },
    )

@app.get("/api/experiments")
def list_experiments():
    """Return saved experiments, newest first."""
    experiments = []

    for file_path in EXPERIMENTS_DIR.glob("*.json"):
        try:
            with file_path.open("r", encoding="utf-8") as file:
                result = json.load(file)

            experiments.append({
                "experiment_id": result.get("experiment_id"),
                "created_at": result.get("created_at"),
                "architecture": result.get("architecture"),
                "region": result.get("region"),
                "failure": result.get("failure"),
                "traffic_intensity": result.get("traffic_intensity"),
                "failover_enabled": result.get("failover_enabled"),
                "metrics": result.get("metrics", {}),
            })
        except (OSError, json.JSONDecodeError):
            app.logger.warning(
                "Skipping unreadable experiment file: %s",
                file_path.name,
            )

    experiments.sort(
        key=lambda item: item.get("created_at") or "",
        reverse=True,
    )

    return jsonify({"experiments": experiments})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
