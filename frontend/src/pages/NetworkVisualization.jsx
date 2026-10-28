// NetworkVisualization page placeholder.

import { useState } from "react";
import Topology from "../components/Topology";

export default function NetworkVisualization() {
  const [architecture, setArchitecture] = useState("Distributed");
  const [region, setRegion] = useState("india");
  const [failure, setFailure] = useState("Normal");

  return (
    <main className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">SEARCHNET / NETWORK LAB</p>
          <h1>Network Visualization</h1>
          <p className="subtitle">
            Explore the modeled hosting architecture and failure scenarios.
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>Visualization Settings</h2>

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
        </div>
      </section>

      <Topology
  architecture={architecture}
  region={region}
  failure={failure}
  failoverEnabled={failoverEnabled}
/>

      <p className="disclaimer">
        This is a frontend visualization of the modeled architecture.
        It does not control or automatically synchronize with Cisco
        Packet Tracer.
      </p>
    </main>
  );
}
