
export default function Topology({ architecture, region, failure }) {
  const regions = [
    { id: "india", name: "India" },
    { id: "europe", name: "Europe" },
    { id: "usa", name: "USA" },
  ];

  const centralRegion = "europe";
  const failedRegion =
    failure === "Regional Server Failure" ? centralRegion : null;

  const selectedRegionFailed =
    architecture === "Distributed" && region === failedRegion;

  const backupRegion =
    failure === "Regional Server Failure" &&
    architecture === "Distributed"
      ? regions
          .filter((item) => item.id !== failedRegion)
          .sort((a, b) => {
            const distances = {
              india: { india: 20, europe: 110, usa: 210 },
              europe: { india: 110, europe: 20, usa: 130 },
              usa: { india: 210, europe: 130, usa: 20 },
            };

            return (
              distances[region][a.id] - distances[region][b.id]
            );
          })[0]?.id
      : null;

  function getRegionStatus(item) {
    if (item.id === failedRegion) return "failed";
    if (item.id === region) return "selected";
    if (item.id === backupRegion) return "backup";
    return "available";
  }

  function getNodeClass(status) {
    if (status === "failed") return "failed-node";
    if (status === "selected") return "selected-node";
    if (status === "backup") return "backup-node";
    return "";
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Network Topology</h2>
          <p className="muted">
            Conceptual network view for the selected architecture and
            failure scenario.
          </p>
        </div>

        <span className="status-pill">
          {failure === "Normal" ? "Normal Operation" : failure}
        </span>
      </div>

      <div className="topology">
        <div className="topology-node">
          <span className="node-icon">⌕</span>
          <strong>Search Client</strong>
          <small>{regions.find((item) => item.id === region)?.name} user</small>
        </div>

        <div
          className={`topology-link ${
            failure === "Network Link Failure" ? "failed-link" : ""
          }`}
        >
          <span>
            {failure === "Network Link Failure" ? "──── ✕ ────" : "────→"}
          </span>
          <small>
            {failure === "Network Link Failure"
              ? "Simulated link failure"
              : "Network path"}
          </small>
        </div>

        {architecture === "Centralized" ? (
          <div
            className={`topology-node server-node ${
              failure === "Regional Server Failure" ? "failed-node" : ""
            }`}
          >
            <span className="node-icon">▣</span>
            <strong>Central Server</strong>
            <small>
              {failure === "Regional Server Failure"
                ? "Europe · Unavailable"
                : "Europe · Primary"}
            </small>
          </div>
        ) : (
          <div className="region-nodes">
            {regions.map((item) => {
              const status = getRegionStatus(item);

              return (
                <div
                  key={item.id}
                  className={`topology-node server-node ${getNodeClass(status)}`}
                >
                  <span className="node-icon">
                    {status === "failed" ? "✕" : "▣"}
                  </span>

                  <strong>{item.name}</strong>

                  <small>
                    {status === "failed"
                      ? "Simulated failure"
                      : status === "backup"
                        ? "Backup region"
                        : status === "selected"
                          ? "Selected region"
                          : "Regional server"}
                  </small>

                  {status === "selected" && !selectedRegionFailed && (
                    <span className="topology-status">USER REGION</span>
                  )}

                  {status === "backup" && (
                    <span className="topology-status">BACKUP</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {failure === "Regional Server Failure" && (
        <div className="topology-message">
          {architecture === "Centralized" ? (
            <p>
              <strong>Primary server unavailable.</strong> The centralized
              architecture has no alternate server in this model, so requests
              cannot be served.
            </p>
          ) : (
            <p>
              <strong>Regional failure scenario.</strong> Europe is marked
              unavailable.{" "}
              {backupRegion ? (
                <>
                  The conceptual backup region for the selected user is{" "}
                  <strong>
                    {regions.find((item) => item.id === backupRegion)?.name}
                  </strong>
                  . Actual request recovery depends on the simulator's
                  failover setting.
                </>
              ) : (
                "No backup region is available."
              )}
            </p>
          )}
        </div>
      )}

      {failure === "Network Link Failure" && (
        <div className="topology-message">
          <p>
            <strong>Simulated network link failure.</strong> The broken link is
            a conceptual indicator; the Python model applies probabilistic
            route outages and packet loss rather than identifying a physical
            link.
          </p>
        </div>
      )}

      <div className="topology-legend">
        <span><i className="legend-dot available-dot" /> Available</span>
        <span><i className="legend-dot selected-dot" /> Selected region</span>
        <span><i className="legend-dot failed-dot" /> Failed</span>
        <span><i className="legend-dot backup-dot" /> Backup region</span>
      </div>

      <p className="footnote">
        Conceptual visualization only. It does not control or synchronize
        directly with Cisco Packet Tracer. Backup routing shown here is
        illustrative; the Python simulator determines actual modeled results.
      </p>
    </section>
  );
}
