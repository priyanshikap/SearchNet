
export default function Topology({
  architecture,
  region,
  failure,
  failoverEnabled = false,
}) {
  const regions = [
    { id: "india", name: "India" },
    { id: "europe", name: "Europe" },
    { id: "usa", name: "USA" },
  ];

  const distances = {
    india: { india: 20, europe: 110, usa: 210 },
    europe: { india: 110, europe: 20, usa: 130 },
    usa: { india: 210, europe: 130, usa: 20 },
  };

  // Centralized hosting always uses the Europe primary server.
  // In distributed mode, the selected user's regional server fails.
  const failedRegion =
    failure !== "Regional Server Failure"
      ? null
      : architecture === "Centralized"
        ? "europe"
        : region;

  const selectedRegionFailed =
    architecture === "Distributed" && region === failedRegion;

  // Show a backup only when distributed failover is enabled.
  const backupRegion =
    architecture === "Distributed" &&
    failure === "Regional Server Failure" &&
    failoverEnabled
      ? regions
          .filter((item) => item.id !== failedRegion)
          .sort(
            (a, b) =>
              distances[failedRegion][a.id] -
              distances[failedRegion][b.id]
          )[0]?.id
      : null;

  function getRegionStatus(item) {
    if (item.id === failedRegion) return "failed";
    if (item.id === backupRegion) return "backup";
    if (item.id === region) return "selected";
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
          <small>
            {regions.find((item) => item.id === region)?.name} user
          </small>
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
              failedRegion === "europe" ? "failed-node" : ""
            }`}
          >
            <span className="node-icon">
              {failedRegion === "europe" ? "✕" : "▣"}
            </span>
            <strong>Central Server</strong>
            <small>
              {failedRegion === "europe"
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
              <strong>Primary server unavailable.</strong>{" "}
              The centralized architecture has no alternate server in this
              model, so requests cannot be served.
            </p>
          ) : (
            <p>
              <strong>Regional failure scenario.</strong>{" "}
              {regions.find((item) => item.id === failedRegion)?.name} is
              marked unavailable.{" "}
              {backupRegion ? (
                <>
                  The nearest conceptual backup to the failed region is{" "}
                  <strong>
                    {regions.find((item) => item.id === backupRegion)?.name}
                  </strong>
                  . The simulator determines actual modeled request outcomes.
                </>
              ) : (
                "Failover is disabled, so no active backup is displayed."
              )}
            </p>
          )}
        </div>
      )}

      {failure === "Network Link Failure" && (
        <div className="topology-message">
          <p>
            <strong>Simulated network link failure.</strong>{" "}
            The broken link is a conceptual indicator. The Python model
            applies probabilistic packet loss rather than identifying a
            specific physical link.
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
