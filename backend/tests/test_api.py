"""API tests placeholder."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app


def test_health_endpoint():
    client = app.test_client()
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_regions_endpoint():
    client = app.test_client()
    response = client.get("/api/regions")

    assert response.status_code == 200
    data = response.get_json()
    assert "india" in [region["id"] for region in data["regions"]]
    assert "Distributed" in data["architectures"]


def test_simulation_endpoint():
    client = app.test_client()
    response = client.post(
        "/api/simulate",
        json={
            "architecture": "Distributed",
            "region": "india",
            "failure": "Normal",
            "requests": 20,
            "seed": 42,
        },
    )

    assert response.status_code == 200
    data = response.get_json()
    assert "experiment_id" in data
    assert data["metrics"]["successful_requests"] == 20


def test_invalid_region():
    client = app.test_client()
    response = client.post(
        "/api/simulate",
        json={
            "architecture": "Distributed",
            "region": "mars",
            "failure": "Normal",
            "requests": 20,
            "seed": 42,
        },
    )

    assert response.status_code == 400
