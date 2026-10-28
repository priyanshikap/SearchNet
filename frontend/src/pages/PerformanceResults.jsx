
import { useState } from "react";
import { runSimulation } from "../services/api";
import ResultsCharts from "../components/ResultsCharts";

const METRICS = [
  {
    label: "Average latency",
    key: "average_latency_ms",
    unit: " ms",
    lowerIsBetter: true,
  },
  {
    label: "P95 latency",
    key: "p95_latency_ms",
    unit: " ms",
    lowerIsBetter: true,
  },
  {
    label: "Throughput",
    key: "throughput_rps",
    unit: " req/s",
    lowerIsBetter: false,
  },
  {
    label: "Packet delivery ratio",
    key: "packet_delivery_ratio",
    unit: "%",
    lowerIsBetter: false,
  },
  {
    label: "Request success rate (modeled availability)",
    key: "availability",
    unit: "%",
    lowerIsBetter: false,
  },
];

function getMetricValue(experiment, key) {
  const metrics = experiment?.metrics || {};

  // Support both the current simulator schema and older saved results.
  const aliases = {
    average_latency_ms: ["average_latency_ms", "avg_latency_ms"],
    p95_latency_ms: ["p95_latency_ms"],
    throughput_rps: [
      "throughput_rps",
      "throughput_requests_per_second",
    ],
    packet_delivery_ratio: [
      "packet_delivery_ratio",
      "packet_delivery_ratio_percent",
    ],
    availability: ["availability", "availability_percent"],
  };

  for (const candidate of aliases[key] || [key]) {
    const value = metrics[candidate];

    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function format(value) {
  return value === null || value === undefined
    ? "—"
    : Number(value).toFixed(2);
}

function calculateAdvantage(centralizedValue, distributedValue, lowerIsBetter) {
  if (centralizedValue === null || distributedValue === null) {
    return { winner: "Unavailable", improvement: "—" };
  }

  if (centralizedValue === distributedValue) {
    return { winner: "Equal", improvement: "0.00%" };
  }

  const distributedWins = lowerIsBetter
    ? distributedValue < centralizedValue
    : distributedValue > centralizedValue;

  const winner = distributedWins ? "Distributed" : "Centralized";

  if (centralizedValue === 0) {
    return {
      winner,
      improvement:
        distributedValue === 0 ? "0.00%" : "N/A",
    };
  }

  const rawChange =
    ((distributedValue - centralizedValue) /
      Math.abs(centralizedValue)) *
    100;

  // Positive values always mean Distributed performed better.
  const improvement = lowerIsBetter ? -rawChange : rawChange;

  return {
    winner,
    improvement: `${improvement > 0 ? "+" : ""}${improvement.toFixed(2)}%`,
  };
}

export default function PerformanceResults() {
  const [region, setRegion] = useState("india");
  const [traffic, setTraffic] = useState("Medium");
  const [requests, setRequests] = useState("500");
  const [seed, setSeed] = useState("42");
  const [failure, setFailure] = useState("Normal");
  const [failoverEnabled, setFailoverEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState(null);

  async function runComparison(event) {
    event.preventDefault();

    const requestCount = Number(requests);
    const randomSeed = Number(seed);

    if (
      !Number.isInteger(requestCount) ||
      requestCount < 1 ||
      requestCount > 10000
    ) {
      setError("Number of requests must be an integer between 1 and 10000.");
      return;
    }

    if (!Number.isInteger(randomSeed)) {
      setError("Random seed must be an integer.");
      return;
    }

    setLoading(true);
    setError("");
    setComparison(null);

    try {
      const common = {
        region,
        traffic_intensity: traffic,
        requests: requestCount,
        seed: randomSeed,
        failure,
        failover_enabled: failoverEnabled,
      };

      const [centralized, distributed] = await Promise.all([
        runSimulation({
          ...common,
          architecture: "Centralized",
        }),
        runSimulation({
          ...common,
          architecture: "Distributed",
        }),
      ]);

      if (!centralized?.metrics || !distributed?.metrics) {
        throw new Error("The simulator returned an incomplete result.");
      }

      setComparison({ centralized, distributed });
    } catch (err) {
      setError(
        `${err.message || "Comparison failed."} Check that the Flask backend is running on port 5000.`
      );
    } finally {
      setLoading(false);
    }
  }

  function getAdvantage(metric) {
    return calculateAdvantage(
      getMetricValue(comparison?.centralized, metric.key),
      getMetricValue(comparison?.distributed, metric.key),
      metric.lowerIsBetter
    );
  }

  const chartHistory = comparison
    ? [
        {
          ...comparison.centralized,
          architecture: "Centralized",
        },
        {
          ...comparison.distributed,
          architecture: "Distributed",
        },
      ]
    : [];

  return (
    <main className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">ANALYSIS WORKSPACE</p>
          <h1>Performance Results</h1>
          <p className="subtitle">
            Compare centralized and distributed architectures under the same
            simulated conditions.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Comparison Setup</h2>
            <p className="muted">
              Both architectures use the same region, workload, failure
              scenario, request count, and random seed.
            </p>
          </div>
        </div>

        <form onSubmit={runComparison}>
          <div className="form-grid">
            <label>
              User Region
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="india">India</option>
                <option value="europe">Europe</option>
                <option value="usa">USA</option>
              </select>
            </label>

            <label>
              Traffic Intensity
              <select
                value={traffic}
                onChange={(event) => setTraffic(event.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Failure Scenario
              <select
                value={failure}
                onChange={(event) => setFailure(event.target.value)}
              >
                <option value="Normal">Normal Operation</option>
                <option value="Regional Server Failure">
                  Regional Server Failure
                </option>
                <option value="Network Link Failure">
                  Network Link Failure
                </option>
              </select>
            </label>

            <label>
              Number of Requests
              <input
                type="number"
                min="1"
                max="10000"
                step="1"
                value={requests}
                onChange={(event) => setRequests(event.target.value)}
                required
              />
            </label>

            <label>
              Random Seed
              <input
                type="number"
                step="1"
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={failoverEnabled}
              onChange={(event) => setFailoverEnabled(event.target.checked)}
            />
            Enable regional failover
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={
              loading ||
              !Number.isInteger(Number(requests)) ||
              Number(requests) < 1 ||
              Number(requests) > 10000 ||
              !Number.isInteger(Number(seed))
            }
          >
            {loading ? "Comparing..." : "Compare Architectures"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>

      {loading && (
        <section className="panel">
          <p>Running both simulations. Please wait...</p>
        </section>
      )}

      {comparison && (
        <>
          <section className="metrics-grid">
            <article className="metric-card">
              <p>Centralized Avg Latency</p>
              <h2>
                {format(
                  getMetricValue(comparison.centralized, "average_latency_ms")
                )}{" "}
                <small>ms</small>
              </h2>
            </article>

            <article className="metric-card">
              <p>Distributed Avg Latency</p>
              <h2>
                {format(
                  getMetricValue(comparison.distributed, "average_latency_ms")
                )}{" "}
                <small>ms</small>
              </h2>
            </article>

            <article className="metric-card">
              <p>Centralized Throughput</p>
              <h2>
                {format(
                  getMetricValue(comparison.centralized, "throughput_rps")
                )}{" "}
                <small>req/s</small>
              </h2>
            </article>

            <article className="metric-card">
              <p>Distributed Throughput</p>
              <h2>
                {format(
                  getMetricValue(comparison.distributed, "throughput_rps")
                )}{" "}
                <small>req/s</small>
              </h2>
            </article>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Side-by-Side Metrics</h2>
                <p className="muted">
                  Percentage improvement is relative to centralized hosting.
                  Positive values favour distributed hosting; negative values
                  mean distributed hosting performed worse.
                </p>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Centralized</th>
                    <th>Distributed</th>
                    <th>Winner</th>
                    <th>Distributed Improvement</th>
                  </tr>
                </thead>

                <tbody>
                  {METRICS.map((metric) => {
                    const centralizedValue = getMetricValue(
                      comparison.centralized,
                      metric.key
                    );
                    const distributedValue = getMetricValue(
                      comparison.distributed,
                      metric.key
                    );
                    const result = getAdvantage(metric);

                    return (
                      <tr key={metric.key}>
                        <td>{metric.label}</td>
                        <td>
                          {format(centralizedValue)}
                          {centralizedValue !== null ? metric.unit : ""}
                        </td>
                        <td>
                          {format(distributedValue)}
                          {distributedValue !== null ? metric.unit : ""}
                        </td>
                        <td>{result.winner}</td>
                        <td>{result.improvement}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <ResultsCharts history={chartHistory} />

          <section className="panel">
            <h2>Experiment Details</h2>

            <p className="muted">
              Region: {region.toUpperCase()} · Traffic: {traffic} · Requests:{" "}
              {requests} · Seed: {seed} · Failure: {failure} · Failover:{" "}
              {failoverEnabled ? "Enabled" : "Disabled"}
            </p>

            <p className="muted">
              Centralized experiment ID:{" "}
              {comparison.centralized.experiment_id || "Not provided"}
            </p>

            <p className="muted">
              Distributed experiment ID:{" "}
              {comparison.distributed.experiment_id || "Not provided"}
            </p>

            <p className="disclaimer">
              These are modeled results from SearchNet's Python simulator, not
              real-world measurements or results collected from Cisco Packet
              Tracer. Percentage comparisons describe this simulation run only.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
