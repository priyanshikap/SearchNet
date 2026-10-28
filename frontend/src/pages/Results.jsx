
import { useEffect, useState } from "react";
import {
  getExperiments,
  getExperiment,
  getResultsCSVUrl,
} from "../services/api";

export default function Results() {
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadExperiments() {
    setLoading(true);
    setError("");

    try {
      const data = await getExperiments();
      setExperiments(data.experiments || []);
    } catch (err) {
      setError(
        "Could not load saved experiments. Make sure the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExperiments();
  }, []);

  async function viewExperiment(id) {
    setError("");

    try {
      const data = await getExperiment(id);
      setSelectedExperiment(data);
    } catch (err) {
      setError("Could not load the selected experiment.");
    }
  }

  function formatMetric(value, suffix = "") {
    if (value === undefined || value === null || value === "") {
      return "—";
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
      return `${numericValue.toFixed(2)}${suffix}`;
    }

    return `${value}${suffix}`;
  }

  function getMetrics(experiment) {
    const metrics = experiment.metrics || {};

    return {
      averageLatency:
        metrics.average_latency_ms ?? metrics.avg_latency_ms,
      p95Latency: metrics.p95_latency_ms,
      throughput:
        metrics.throughput_rps ??
        metrics.throughput_requests_per_second,
      availability:
        metrics.availability ?? metrics.availability_percent,
    };
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Saved Experiment Results</h1>
          <p>
            Review previous SearchNet simulations and download their results.
          </p>
        </div>

        <button onClick={loadExperiments} disabled={loading}>
          {loading ? "Loading..." : "Refresh Results"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading saved experiments...</p>
      ) : experiments.length === 0 ? (
        <div className="results-empty">
          <h3>No saved experiments yet</h3>
          <p>
            Run a simulation from Architecture Simulator or Performance Results
            first. Your saved experiments will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="results-summary">
            <h3>Experiment History</h3>
            <p>Total saved experiments: {experiments.length}</p>
          </div>

          <div className="experiment-list">
            {experiments.map((experiment) => {
              const metrics = getMetrics(experiment);

              return (
                <div
                  className="experiment-card"
                  key={experiment.experiment_id}
                >
                  <div className="experiment-card-header">
                    <div>
                      <h3>
                        {experiment.architecture || "Unknown Architecture"}
                      </h3>
                      <p>
                        {experiment.region || "Unknown region"} ·{" "}
                        {experiment.failure || "Normal"}
                      </p>
                    </div>

                    <span className="experiment-traffic">
                      {experiment.traffic_intensity || "Unknown"} traffic
                    </span>
                  </div>

                  <p className="experiment-id">
                    ID: {experiment.experiment_id}
                  </p>

                  {experiment.created_at && (
                    <p className="experiment-date">
                      Saved:{" "}
                      {new Date(experiment.created_at).toLocaleString()}
                    </p>
                  )}

                  <div className="experiment-metrics">
                    <div>
                      <span>Avg. Latency</span>
                      <strong>
                        {formatMetric(metrics.averageLatency, " ms")}
                      </strong>
                    </div>

                    <div>
                      <span>P95 Latency</span>
                      <strong>
                        {formatMetric(metrics.p95Latency, " ms")}
                      </strong>
                    </div>

                    <div>
                      <span>Throughput</span>
                      <strong>
                        {formatMetric(metrics.throughput, " req/s")}
                      </strong>
                    </div>

                    <div>
                      <span>Availability</span>
                      <strong>
                        {formatMetric(metrics.availability, "%")}
                      </strong>
                    </div>
                  </div>

                  <div className="experiment-actions">
                    <button
                      onClick={() =>
                        viewExperiment(experiment.experiment_id)
                      }
                    >
                      View Details
                    </button>

                    <a
                      href={getResultsCSVUrl(experiment.experiment_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="download-link"
                    >
                      Download CSV
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedExperiment && (
        <div className="experiment-detail">
          <div className="experiment-card-header">
            <h2>Experiment Details</h2>
            <button onClick={() => setSelectedExperiment(null)}>
              Close
            </button>
          </div>

          <p>
            <strong>Experiment ID:</strong>{" "}
            {selectedExperiment.experiment_id}
          </p>

          <pre className="experiment-json">
            {JSON.stringify(selectedExperiment, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
