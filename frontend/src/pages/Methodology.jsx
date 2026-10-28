
export default function Methodology() {
  return (
    <main className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">SEARCHNET / TECHNICAL DOCUMENTATION</p>
          <h1>Simulation Methodology</h1>
          <p className="subtitle">
            Model design, experimental assumptions, performance metrics,
            reproducibility, and limitations of the SearchNet network
            architecture study.
          </p>
        </div>
        <span className="backend-badge">Model Documentation</span>
      </section>

      <section className="panel">
        <h2>1. Project Objective</h2>
        <p className="muted">
          SearchNet studies the performance of centralized hosting compared
          with multi-region distributed hosting for a hypothetical large-scale
          search service. The model investigates how geographic distance,
          workload intensity, server processing capacity, queueing, and
          simulated failures can affect response latency, throughput, packet
          delivery, and request success.
        </p>
        <p className="muted">
          The objective is to compare both architectures under matching
          experimental settings. SearchNet is an educational simulation;
          it does not measure the public internet or represent a production
          search engine.
        </p>
      </section>

      <section className="panel">
        <h2>2. Architectures Under Study</h2>

        <div className="form-grid">
          <div className="info-card">
            <h3>Centralized Architecture</h3>
            <p className="muted">
              All requests are directed to the central hosting region, Europe.
              Users in India and the USA therefore use the configured
              inter-region network delay to reach that server. The model uses
              a processing time of 35 ms per request and eight concurrent
              processing slots. A central server failure makes the service
              unavailable in the modeled regional server failure scenario.
            </p>
          </div>

          <div className="info-card">
            <h3>Distributed Architecture</h3>
            <p className="muted">
              The model provides regional server locations in India, Europe,
              and the USA. Requests are initially directed to the selected
              user region. The configured processing time is 25 ms per request,
              with eight concurrent processing slots per modeled region.
              When the relevant regional server fails, the simulator can
              redirect requests to a backup region if failover is enabled.
            </p>
          </div>
        </div>

        <p className="disclaimer">
          The processing times and server capacities are configurable
          assumptions, not measured hardware performance. Because the two
          architectures use different configured processing times, the
          comparison represents the complete configured models, not geography
          alone.
        </p>
      </section>

      <section className="panel">
        <h2>3. Geographic Network Model</h2>
        <p className="muted">
          The simulator uses a configured one-way network latency matrix.
          Rows represent the source region and columns represent the
          destination region.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Source Region</th>
                <th>India</th>
                <th>Europe</th>
                <th>USA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>India</td>
                <td>20 ms</td>
                <td>110 ms</td>
                <td>210 ms</td>
              </tr>
              <tr>
                <td>Europe</td>
                <td>110 ms</td>
                <td>20 ms</td>
                <td>130 ms</td>
              </tr>
              <tr>
                <td>USA</td>
                <td>210 ms</td>
                <td>130 ms</td>
                <td>20 ms</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="muted">
          For example, a request originating in India and served from Europe
          uses the configured 110 ms network delay before the other modeled
          response components are included.
        </p>

        <p className="disclaimer">
          All latency values are illustrative assumptions from
          backend/config.py. They are not measured internet round-trip times,
          physical link measurements, or Cisco Packet Tracer observations.
        </p>
      </section>

      <section className="panel">
        <h2>4. Workload Generation and Request Processing</h2>
        <p className="muted">
          The simulator generates request arrival times using an exponential
          inter-arrival-time distribution. This corresponds to a Poisson
          arrival process with a configured mean arrival rate. A fixed random
          seed makes the generated workload repeatable for the same simulator
          version and configuration.
        </p>

        <div className="info-card">
          <h3>Modeled response latency</h3>
          <p>
            <strong>
              Response latency = network delay + modeled jitter + queue
              waiting time + server processing time
            </strong>
          </p>
          <p className="muted">
            When failover is used, its configured delay may also contribute
            to the request's modeled latency. The exact value depends on the
            selected scenario and the simulator's implementation.
          </p>
        </div>

        <div className="info-card">
          <h3>Server queueing</h3>
          <p className="muted">
            Each server is modeled with a finite number of concurrent
            processing slots. If all slots are occupied when another request
            reaches the server, that request waits until a slot becomes
            available. Queue waiting time therefore depends on the arrival
            pattern, processing duration, and server availability.
          </p>
        </div>

        <div className="info-card">
          <h3>Randomness and repeatability</h3>
          <p className="muted">
            The simulation uses a seed for request arrivals and separate
            seeded random streams for modeled jitter and packet loss. Holding
            the seed and configuration fixed supports reproducible experiments.
            Identical seeds do not guarantee identical request outcomes when
            the architectures follow different execution paths.
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>5. Traffic Intensity and Server Configuration</h2>
        <p className="muted">
          Traffic intensity controls the configured mean request arrival
          rate. Higher arrival rates can increase queueing when server
          processing capacity is constrained.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Centralized</th>
                <th>Distributed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Server processing time</td>
                <td>35 ms/request</td>
                <td>25 ms/request</td>
              </tr>
              <tr>
                <td>Concurrent processing slots</td>
                <td>8</td>
                <td>8 per region</td>
              </tr>
              <tr>
                <td>Primary hosting region</td>
                <td>Europe</td>
                <td>Selected user region</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Traffic Level</th>
                <th>Mean Arrival Rate</th>
                <th>Intended Workload</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Low</td>
                <td>20 requests/sec</td>
                <td>Light load</td>
              </tr>
              <tr>
                <td>Medium</td>
                <td>100 requests/sec</td>
                <td>Moderate load</td>
              </tr>
              <tr>
                <td>High</td>
                <td>300 requests/sec</td>
                <td>Heavy load</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="disclaimer">
          These rates are workload-generation parameters, not guaranteed
          achieved throughput. Actual simulated throughput is calculated
          from completed requests and the simulated experiment duration.
        </p>
      </section>

      <section className="panel">
        <h2>6. Failure Scenarios and Recovery</h2>

        <div className="info-card">
          <h3>Normal Operation</h3>
          <p className="muted">
            No explicit server or network-link failure is introduced.
            Requests are processed according to the selected architecture,
            configured latency, server capacity, workload, and modeled jitter.
          </p>
        </div>

        <div className="info-card">
          <h3>Regional Server Failure</h3>
          <p className="muted">
            Europe is the central hosting region. A centralized server failure
            prevents requests from being served in this scenario. In the
            distributed architecture, a request directed to the failed region
            can be redirected to a backup region when failover is enabled.
            The backup is selected using the configured geographic latency
            matrix.
          </p>
          <p className="muted">
            The configured failover delay is 50 ms. For a successfully
            rerouted request, this delay is added to its modeled response
            latency. The reported recovery/failover-delay metric is an average
            of the configured delay paid by successful rerouted requests; it
            is not the time needed to restore a failed service. The simulator
            applies a scenario-based failure rather than modeling a failure
            beginning at a particular timestamp and recovering through a
            time-dependent state transition.
          </p>
        </div>

        <div className="info-card">
          <h3>Network Link Failure</h3>
          <p className="muted">
            The model uses a configured packet-loss probability of 20% for
            the failed-link scenario. Each request has a set of modeled
            packets; delivery is simulated probabilistically rather than
            through actual packet transmission. A request can fail when its
            required modeled packets are not all delivered. This packet-loss
            model is separate from server availability, so packet delivery
            ratio and request-success availability can differ.
          </p>
          <p className="muted">
            This scenario does not reproduce a particular physical link,
            router failure, routing-table update, or routing-protocol
            convergence process.
          </p>
        </div>

        <p className="disclaimer">
          Failure outcomes are determined by the simulator's implementation
          and configuration. The topology page is a conceptual illustration
          and is not proof of successful request recovery.
        </p>
      </section>

      <section className="panel">
        <h2>7. Performance Metrics and Formulas</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Definition</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Average latency</td>
                <td>
                  Sum of successful request response latencies divided by
                  the number of successful requests.
                </td>
                <td>Lower is generally better.</td>
              </tr>
              <tr>
                <td>Median latency</td>
                <td>
                  The middle value of the sorted successful request
                  response latencies.
                </td>
                <td>Represents a typical successful response.</td>
              </tr>
              <tr>
                <td>P95 latency</td>
                <td>
                  The 95th-percentile successful response latency, using
                  the simulator's percentile calculation.
                </td>
                <td>
                  Describes the slower end of successful response times.
                </td>
              </tr>
              <tr>
                <td>Throughput</td>
                <td>
                  Successful requests divided by the modeled interval from
                  the first request arrival to the later of the final request
                  arrival or the final successful request completion. The
                  interval is converted to seconds to report requests/second.
                </td>
                <td>Higher is generally better.</td>
              </tr>
              <tr>
                <td>Packet delivery ratio</td>
                <td>
                  (Delivered modeled packets / Total modeled packets sent)
                  × 100%.
                </td>
                <td>Higher indicates fewer modeled packet losses.</td>
              </tr>
              <tr>
                <td>Availability</td>
                <td>
                  (Successful requests / Total requested operations) × 100%.
                </td>
                <td>
                  A request-success proxy, not real service uptime.
                </td>
              </tr>
              <tr>
                <td>Failed requests</td>
                <td>
                  Total requests minus successfully delivered requests.
                </td>
                <td>Lower is generally better.</td>
              </tr>
              <tr>
                <td>Recovery / failover delay</td>
                <td>
                  The average configured failover delay paid by successful
                  rerouted requests; the configured delay is 50 ms.
                </td>
                <td>
                  A modeled delay, not measured outage recovery time.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="disclaimer">
          Latency statistics are calculated from successful requests.
          If no requests succeed, this implementation reports zero for the
          latency summaries because there are no successful-request samples.
          Packet delivery ratio and request availability are different:
          modeled packets may all be counted as delivered even when a server
          failure prevents the corresponding requests from being served.
        </p>
      </section>

      <section className="panel">
        <h2>8. Experimental Procedure</h2>
        <ol className="method-steps">
          <li>
            Select Centralized or Distributed architecture.
          </li>
          <li>
            Select the user region and traffic intensity.
          </li>
          <li>
            Set the number of requests and random seed.
          </li>
          <li>
            Select Normal, Regional Server Failure, or Network Link Failure.
          </li>
          <li>
            Configure failover where the scenario supports it.
          </li>
          <li>
            Run the experiment and record the returned metrics and experiment ID.
          </li>
          <li>
            Repeat the experiment with the other architecture while keeping
            the workload settings consistent.
          </li>
          <li>
            Compare latency, throughput, packet delivery ratio, availability,
            and failed-request counts.
          </li>
          <li>
            Repeat the comparison under additional traffic and failure settings.
          </li>
          <li>
            Record the configuration, results, and limitations in the final report.
          </li>
        </ol>

        <p className="muted">
          A fixed request count and seed improve reproducibility. For a
          controlled comparison, both architectures should also use the same
          user region, traffic intensity, failure scenario, and failover
          setting where applicable.
        </p>
      </section>

      <section className="panel">
        <h2>9. Reproducibility, API, and Data Storage</h2>
        <p className="muted">
          The frontend communicates with a Flask backend through HTTP API
          endpoints. The backend validates simulation inputs, executes the
          Python model, assigns experiment identifiers, and saves experiment
          output as JSON in the configured experiments directory.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>GET /api/health</code></td>
                <td>Check whether the backend is running.</td>
              </tr>
              <tr>
                <td><code>GET /api/regions</code></td>
                <td>Return configured regions and related options.</td>
              </tr>
              <tr>
                <td><code>POST /api/simulate</code></td>
                <td>Run and save a simulation experiment.</td>
              </tr>
              <tr>
                <td><code>GET /api/experiments</code></td>
                <td>List saved experiments, if enabled in the backend.</td>
              </tr>
              <tr>
                <td><code>GET /api/experiments/:id</code></td>
                <td>Retrieve a saved experiment.</td>
              </tr>
              <tr>
                <td><code>GET /api/experiments/:id/results</code></td>
                <td>Retrieve experiment results.</td>
              </tr>
              <tr>
                <td><code>GET /api/experiments/:id/results.csv</code></td>
                <td>Download request-level results as CSV.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="muted">
          Saved experiment IDs and JSON outputs allow results to be reviewed
          later. Reproducibility assumes the same simulator version,
          configuration, seed, and relevant execution logic.
        </p>
      </section>

      <section className="panel">
        <h2>10. Cisco Packet Tracer Comparison</h2>
        <p className="muted">
          Cisco Packet Tracer and the SearchNet Python simulator are separate
          experimental components. Packet Tracer represents the configured
          network topology and its supported networking behavior. SearchNet
          calculates modeled results using the latency, workload, capacity,
          packet-loss, and failover assumptions described here.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Python Simulator</th>
                <th>Cisco Packet Tracer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Architecture</td>
                <td>Centralized and distributed model configurations.</td>
                <td>Configured topology and device arrangement.</td>
              </tr>
              <tr>
                <td>Latency</td>
                <td>Illustrative latency matrix and modeled processing delays.</td>
                <td>Observations from the configured simulation and tools.</td>
              </tr>
              <tr>
                <td>Failures</td>
                <td>Scenario-based server failure and probabilistic packet loss.</td>
                <td>Configured device or link changes and observed behavior.</td>
              </tr>
              <tr>
                <td>Results</td>
                <td>Computed metrics and saved experiment records.</td>
                <td>Measurements or observations collected from the lab.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="disclaimer">
          Do not present Python-generated values as Packet Tracer measurements.
          Include actual Packet Tracer observations separately and compare
          trends only when the scenarios and measurements are meaningfully
          comparable.
        </p>
      </section>

      <section className="panel">
        <h2>11. Assumptions and Limitations</h2>
        <ul className="method-steps">
          <li>
            Regional latency values are illustrative and are not based on
            live internet measurements.
          </li>
          <li>
            Server processing times and concurrency limits are simplified
            model parameters.
          </li>
          <li>
            The workload is generated using a stochastic arrival model and
            does not represent a measured production traffic trace.
          </li>
          <li>
            The model does not reproduce every aspect of TCP, congestion
            control, retransmission, routing protocols, or physical networks.
          </li>
          <li>
            Link packet loss is probabilistic and does not identify a
            specific failed physical link.
          </li>
          <li>
            Server failure and failover are simplified scenarios rather than
            a full time-dependent failure and recovery process.
          </li>
          <li>
            Availability is calculated from request outcomes and is not
            equivalent to long-term service uptime.
          </li>
          <li>
            Throughput and latency depend on the simulator's duration,
            workload, queueing, capacity, and processing assumptions.
          </li>
          <li>
            Python simulation results and Packet Tracer observations must be
            reported separately.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Conclusion</h2>
        <p className="muted">
          SearchNet provides a repeatable educational framework for comparing
          centralized and distributed hosting under selected workloads and
          failure scenarios. Distributed hosting may reduce modeled geographic
          delay for users served regionally and may offer backup options, but
          the outcome depends on the configured assumptions and failure
          behavior. Conclusions should be based on recorded experiment
          results rather than architecture labels alone.
        </p>
      </section>

      <p className="disclaimer">
        SearchNet is an educational Computer Networks project. Its output
        should be interpreted within the documented model assumptions.
      </p>
    </main>
  );
}
