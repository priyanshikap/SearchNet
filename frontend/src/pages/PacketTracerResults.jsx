
import { useEffect, useState } from "react";
import {
  Network,
  Server,
  CheckCircle2,
  AlertTriangle,
  FileBarChart,
  Image as ImageIcon,
  RefreshCw,
  Save,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api/packet-tracer-results";

const scenarios = [
  {
    name: "Normal connectivity",
    centralized: "Ping connectivity tested successfully",
    distributed: "Ping connectivity tested successfully",
    description:
      "Verify that devices can communicate with the server during normal network operation.",
  },
  {
    name: "Link failure",
    centralized: "",
    distributed: "",
    description:
      "Disconnect a network link and record whether communication stops or an alternate route is available.",
  },
  {
    name: "Server failure",
    centralized: "",
    distributed: "",
    description:
      "Disable or disconnect a server and record whether the service remains reachable.",
  },
  {
    name: "Regional failure",
    centralized: "",
    distributed: "",
    description:
      "Simulate a regional network outage and record its effect on service availability.",
  },
];

function TopologyCard({ title, description, imagePath, fileName }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="pt-card">
      <div className="pt-card-heading">
        <div className="pt-icon">
          <Network size={20} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="pt-image-container">
        {!imageFailed ? (
          <img
            src={imagePath}
            alt={`${title} Cisco Packet Tracer topology`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="pt-image-placeholder">
            <ImageIcon size={32} />
            <strong>Topology screenshot not added yet</strong>
            <span>
              Save your screenshot as <code>{fileName}</code>
            </span>
          </div>
        )}
      </div>

      <p className="pt-caption">
        Cisco Packet Tracer topology and device connections.
      </p>
    </section>
  );
}

export default function PacketTracerResults() {
  const [observations, setObservations] = useState(scenarios);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load saved Packet Tracer results.");
        }

        const data = await response.json();

        if (cancelled) return;

        if (Array.isArray(data.observations)) {
          const savedByName = new Map(
            data.observations.map((item) => [item.name, item])
          );

          setObservations(
            scenarios.map((scenario) => {
              const saved = savedByName.get(scenario.name);

              return saved
                ? {
                    name: scenario.name,
                    centralized: saved.centralized ?? "",
                    distributed: saved.distributed ?? "",
                  }
                : scenario;
            })
          );
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            "Unable to load saved results. Check that the Flask backend is running."
          );
          setMessageType("error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateObservation(index, field, value) {
    setObservations((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );

    setMessage("");
  }

  async function saveResults() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ observations }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save results.");
      }

      setObservations(data.observations);
      setMessage("Results saved successfully. They will remain available after refreshing.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.message || "Unable to save results. Check your Flask backend."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function reloadResults() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not reload saved results.");
      }

      const data = await response.json();
      const savedByName = new Map(
        (data.observations || []).map((item) => [item.name, item])
      );

      setObservations(
        scenarios.map((scenario) => {
          const saved = savedByName.get(scenario.name);

          return saved
            ? {
                name: scenario.name,
                centralized: saved.centralized ?? "",
                distributed: saved.distributed ?? "",
              }
            : scenario;
        })
      );

      setMessage("Saved results reloaded.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-content pt-page">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">SEARCHNET / PACKET TRACER</p>
          <h1>Cisco Packet Tracer Results</h1>
          <p className="subtitle">
            Record and compare the actual observations from your centralized
            and distributed network experiments.
          </p>
        </div>
      </section>

      <div className="pt-notice">
        <CheckCircle2 size={20} />
        <div>
          <strong>Packet Tracer experiment log</strong>
          <p>
            These are manually recorded Packet Tracer observations. They
            are stored separately from Python simulator estimates.
          </p>
        </div>
      </div>

      <div className="pt-topology-grid">
        <TopologyCard
          title="Centralized Architecture"
          description="A central server handles requests from network clients."
          imagePath="/packet-tracer/centralized.png"
          fileName="centralized.png"
        />

        <TopologyCard
          title="Distributed Architecture"
          description="Multiple regional servers provide distributed service access."
          imagePath="/packet-tracer/distributed.png"
          fileName="distributed.png"
        />
      </div>

      <section className="pt-card pt-results-card">
        <div className="pt-section-heading">
          <div>
            <p className="eyebrow">EXPERIMENT LOG</p>
            <h2>Connectivity and Failure Tests</h2>
            <p>
              Record the outcome you observed for each topology.
            </p>
          </div>

          <button
            type="button"
            className="pt-action-button"
            onClick={reloadResults}
            disabled={loading || saving}
          >
            <RefreshCw size={15} />
            Reload
          </button>
        </div>

        {message && (
          <div
            className={`pt-message ${messageType}`}
            role="status"
          >
            {messageType === "success" ? (
              <CheckCircle2 size={17} />
            ) : (
              <AlertTriangle size={17} />
            )}
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <p className="pt-loading">
            <LoaderCircle size={18} />
            Loading saved observations...
          </p>
        ) : (
          <>
            <div className="pt-table-wrapper">
              <table className="pt-table">
                <thead>
                  <tr>
                    <th>Test scenario</th>
                    <th>Centralized topology</th>
                    <th>Distributed topology</th>
                  </tr>
                </thead>

                <tbody>
                  {observations.map((item, index) => (
                    <tr key={item.name}>
                      <td>
                        <strong>{item.name}</strong>
                        <p>{scenarios[index].description}</p>
                      </td>

                      <td>
                        <textarea
                          aria-label={`${item.name}: centralized observation`}
                          value={item.centralized}
                          onChange={(event) =>
                            updateObservation(
                              index,
                              "centralized",
                              event.target.value
                            )
                          }
                          rows={3}
                          maxLength={2000}
                          placeholder="Enter your observed result..."
                        />
                      </td>

                      <td>
                        <textarea
                          aria-label={`${item.name}: distributed observation`}
                          value={item.distributed}
                          onChange={(event) =>
                            updateObservation(
                              index,
                              "distributed",
                              event.target.value
                            )
                          }
                          rows={3}
                          maxLength={2000}
                          placeholder="Enter your observed result..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-actions">
              <button
                type="button"
                className="pt-save-button"
                onClick={saveResults}
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={17} />
                ) : (
                  <Save size={17} />
                )}
                {saving ? "Saving..." : "Save Results"}
              </button>

              <span className="pt-save-hint">
                Save your observations before leaving this page.
              </span>
            </div>
          </>
        )}
      </section>

      <section className="pt-card pt-file-card">
        <div className="pt-file-icon">
          <Server size={23} />
        </div>

        <div>
          <h2>Packet Tracer project files</h2>
          <p>
            Your original topology files remain in the project root.
            This page displays screenshots and records test observations;
            it does not execute Packet Tracer files.
          </p>
          <ul>
            <li><code>SearchNet_Centralized.pkt</code></li>
            <li><code>SearchNet_Distributed.pkt</code></li>
          </ul>
        </div>

        <FileBarChart size={24} className="pt-file-chart-icon" />
      </section>

      <style>{`
        .pt-page {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .pt-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 1px solid var(--border-color, #dbe3ed);
          border-radius: 12px;
          background: var(--card-bg, #fff);
        }

        .pt-notice > svg {
          flex-shrink: 0;
          color: #16a34a;
          margin-top: 2px;
        }

        .pt-notice p,
        .pt-card-heading p,
        .pt-section-heading p,
        .pt-file-card p {
          margin: 5px 0 0;
          color: var(--muted, #64748b);
          line-height: 1.6;
          font-size: 13px;
        }

        .pt-topology-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .pt-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--border-color, #dbe3ed);
          border-radius: 14px;
          background: var(--card-bg, #fff);
        }

        .pt-card-heading {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .pt-icon,
        .pt-file-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
        }

        .pt-card-heading h2,
        .pt-section-heading h2,
        .pt-file-card h2 {
          margin: 0;
          font-size: 17px;
        }

        .pt-image-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 230px;
          overflow: hidden;
          border: 1px dashed var(--border-color, #cbd5e1);
          border-radius: 10px;
          background: #f8fafc;
        }

        .pt-image-container img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
        }

        .pt-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 25px 15px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        .pt-image-placeholder strong {
          color: #334155;
        }

        .pt-image-placeholder code,
        .pt-file-card code {
          padding: 3px 6px;
          border-radius: 5px;
          background: #f1f5f9;
          font-size: 12px;
        }

        .pt-caption {
          margin: 10px 0 0;
          color: var(--muted, #64748b);
          font-size: 12px;
        }

        .pt-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .pt-action-button,
        .pt-save-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font: inherit;
          cursor: pointer;
        }

        .pt-action-button {
          flex-shrink: 0;
          border: 1px solid var(--border-color, #dbe3ed);
          background: transparent;
          color: inherit;
        }

        .pt-save-button {
          border: 1px solid #2563eb;
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        .pt-action-button:disabled,
        .pt-save-button:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .pt-message {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 16px;
          padding: 12px;
          border: 1px solid var(--border-color, #dbe3ed);
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .pt-message svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pt-message.success {
          color: #15803d;
          background: #f0fdf4;
        }

        .pt-message.error {
          color: #b91c1c;
          background: #fef2f2;
        }

        .pt-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 25px 0;
          color: var(--muted, #64748b);
        }

        .pt-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .pt-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .pt-table th,
        .pt-table td {
          min-width: 190px;
          padding: 13px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          vertical-align: top;
        }

        .pt-table th {
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
        }

        .pt-table th:first-child,
        .pt-table td:first-child {
          min-width: 210px;
        }

        .pt-table td:first-child p {
          max-width: 260px;
          color: var(--muted, #64748b);
          line-height: 1.5;
          font-size: 12px;
        }

        .pt-table textarea {
          display: block;
          box-sizing: border-box;
          width: 100%;
          min-width: 170px;
          padding: 10px;
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 8px;
          background: var(--input-bg, #fff);
          color: inherit;
          font: inherit;
          line-height: 1.5;
          resize: vertical;
        }

        .pt-table textarea:focus {
          outline: 2px solid #93c5fd;
          outline-offset: 1px;
        }

        .pt-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }

        .pt-save-hint {
          color: var(--muted, #64748b);
          font-size: 12px;
        }

        .pt-file-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .pt-file-card > div:nth-child(2) {
          flex: 1;
        }

        .pt-file-card ul {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 22px;
          padding-left: 18px;
          margin-bottom: 0;
        }

        .pt-file-chart-icon {
          flex-shrink: 0;
          color: #64748b;
        }

        @media (max-width: 900px) {
          .pt-topology-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .pt-card {
            padding: 14px;
          }

          .pt-section-heading {
            flex-direction: column;
          }

          .pt-file-chart-icon {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
