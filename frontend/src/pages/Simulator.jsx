
import { useState } from "react";
import { runSimulation, getResultsCSVUrl } from "../services/api";
import MetricCard from "../components/MetricCard";
import Topology from "../components/Topology";
import ResultsCharts from "../components/ResultsCharts";
import SearchPlayground from "./SearchPlayground";

export default function Simulator() {
  const [architecture, setArchitecture] = useState("Distributed");
  const [region, setRegion] = useState("india");
  const [failure, setFailure] = useState("Normal");
  const [trafficIntensity, setTrafficIntensity] = useState("Medium");
  const [requests, setRequests] = useState(500);
  const [seed, setSeed] = useState(42);
  const [failoverEnabled, setFailoverEnabled] = useState(true);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await runSimulation({
        architecture,
        region,
        failure,
        requests: Number(requests),
        seed: Number(seed),
        traffic_intensity: trafficIntensity,
        failover_enabled: failoverEnabled,
      });

      setResult(data);
      setHistory((previous) => [data, ...previous].slice(0, 20));
    } catch (err) {
      setError(
        `${err.message}. Make sure Flask is running at http://127.0.0.1:5000.`
      );
    } finally {
      setLoading(false);
    }
  }

  const metrics = result?.metrics;
  const format = (value) =>
    typeof value === "number" ? value.toFixed(2) : "—";

  const metricCards = [
    {
      title: "Average latency",
      value: format(metrics?.average_latency_ms),
      unit: "ms",
      description: "Mean latency of successful requests",
    },
    {
      title: "P95 latency",
      value: format(metrics?.p95_latency_ms),
      unit: "ms",
      description: "95th percentile response latency",
    },
    {
      title: "Throughput",
      value: format(metrics?.throughput_requests_per_second),
      unit: "req/s",
      description: "Completed requests per simulated second",
    },
    {
      title: "Packet delivery",
      value: format(metrics?.packet_delivery_ratio_percent),
      unit: "%",
      description: "Modeled packets successfully delivered",
    },
    {
      title: "Availability",
      value: format(metrics?.availability_percent),
      unit: "%",
      description: "Successful requests divided by all requests",
    },
    {
      title: "Failed requests",
      value: metrics ? metrics.failed_requests : "—",
      unit: "",
      description: "Requests that did not complete successfully",
    },
  ];

  return (
    <main className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">COMPUTER NETWORKS · PROJECT LAB</p>
          <h1>SearchNet</h1>
          <p className="subtitle">
            Compare centralized hosting against multi-region distributed
            hosting using a reproducible Python simulation.
          </p>
        </div>
        <span className="backend-badge">Python Simulation</span>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Simulation Configuration</h2>
            <p className="muted">
              Keep the request count and seed fixed for fair comparisons.
            </p>
          </div>
        </div>

        <form onSubmit={handleRun}>
          <div className="form-grid">
            <label>
              Architecture
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
              >
                <option value="Centralized">Centralized</option>
                <option value="Distributed">Distributed</option>
              </select>
            </label>

            <label>
              User Region
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="india">India</option>
                <option value="europe">Europe</option>
                <option value="usa">USA</option>
              </select>
            </label>

            <label>
              Traffic Intensity
              <select
                value={trafficIntensity}
                onChange={(e) => setTrafficIntensity(e.target.value)}
              >
                <option value="Low">Low — 20 requests/sec</option>
                <option value="Medium">Medium — 100 requests/sec</option>
                <option value="High">High — 300 requests/sec</option>
              </select>
            </label>

            <label>
              Failure Scenario
              <select
                value={failure}
                onChange={(e) => setFailure(e.target.value)}
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
                required
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
              />
            </label>

            <label>
              Random Seed
              <input
                type="number"
                step="1"
                required
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </label>
          </div>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={failoverEnabled}
              onChange={(e) => setFailoverEnabled(e.target.checked)}
            />
            <span>
              <strong>Enable regional failover</strong>
              <small>
                Allow distributed requests to use a backup region when the
                selected regional server fails.
              </small>
            </span>
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={
              loading ||
              !Number.isInteger(Number(requests)) ||
              Number(requests) < 1 ||
              Number(requests) > 10000 ||
              !Number.isInteger(Number(seed))
            }
          >
            {loading ? "Running Simulation..." : "Run Simulation"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>

      <Topology
        architecture={architecture}
        region={region}
        failure={failure}
      />

      <section>
        <div className="section-title">
          <div>
            <h2>Performance Metrics</h2>
            <p className="muted">
              {result
                ? `Experiment ID: ${result.experiment_id}`
                : "Run a simulation to generate metrics."}
            </p>
          </div>

          {result && (
            <a
              className="secondary-button"
              href={getResultsCSVUrl(result.experiment_id)}
              target="_blank"
              rel="noreferrer"
            >
              Export Request CSV ↓
            </a>
          )}
        </div>

        <div className="metrics-grid">
          {metricCards.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <ResultsCharts history={history} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Experiments</h2>
            <p className="muted">
              Experiments run during this browser session
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            No experiments yet. Run your first simulation above.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Experiment</th>
                  <th>Architecture</th>
                  <th>Region</th>
                  <th>Traffic</th>
                  <th>Failure</th>
                  <th>Avg Latency</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.experiment_id}>
                    <td>{item.experiment_id.slice(0, 8)}</td>
                    <td>{item.architecture}</td>
                    <td>{item.region}</td>
                    <td>{item.traffic_intensity}</td>
                    <td>{item.failure}</td>
                    <td>{format(item.metrics.average_latency_ms)} ms</td>
                    <td>
                      {format(item.metrics.packet_delivery_ratio_percent)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SearchPlayground />

      <p className="disclaimer">
        SearchNet uses a simplified, seeded Python simulation. Results depend
        on the documented assumptions and are not real network measurements
        or Cisco Packet Tracer outputs.
      </p>
    </main>
  );
}
