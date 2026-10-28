
import { useMemo, useState } from "react";

const documents = [
  {
    id: 1,
    title: "Distributed Systems",
    description:
      "Multiple computers work together across regions to provide scalable and reliable services.",
    keywords: ["distributed", "servers", "regions", "replication", "scalability"],
    category: "Architecture",
  },
  {
    id: 2,
    title: "Computer Networks",
    description:
      "Understand latency, throughput, routing, packet delivery, and network communication.",
    keywords: ["network", "latency", "throughput", "routing", "packets"],
    category: "Networking",
  },
  {
    id: 3,
    title: "Centralized Architecture",
    description:
      "A service is hosted at a central server location and accessed by users from different regions.",
    keywords: ["centralized", "server", "hosting", "architecture"],
    category: "Architecture",
  },
  {
    id: 4,
    title: "Fault Tolerance",
    description:
      "Failover and recovery mechanisms help services handle server or network failures.",
    keywords: ["failure", "recovery", "availability", "failover", "backup"],
    category: "Reliability",
  },
  {
    id: 5,
    title: "Network Latency",
    description:
      "Latency measures the time taken for data to travel through a network and for a service to respond.",
    keywords: ["delay", "response time", "milliseconds", "latency"],
    category: "Performance",
  },
  {
    id: 6,
    title: "Load Balancing",
    description:
      "Distributes incoming requests across available servers to reduce overload and improve performance.",
    keywords: ["traffic", "requests", "servers", "load", "balancing"],
    category: "Performance",
  },
  {
    id: 7,
    title: "Packet Delivery Ratio",
    description:
      "The percentage of modeled packets successfully delivered relative to the total number sent.",
    keywords: ["packet", "delivery", "ratio", "loss", "reliability"],
    category: "Networking",
  },
  {
    id: 8,
    title: "High Availability",
    description:
      "Architectural techniques that help a service remain accessible during component failures.",
    keywords: ["availability", "uptime", "failover", "redundancy"],
    category: "Reliability",
  },
];

const regionLatency = {
  india: { india: 20, europe: 110, usa: 210 },
  europe: { india: 110, europe: 20, usa: 130 },
  usa: { india: 210, europe: 130, usa: 20 },
};

const regionNames = {
  india: "India",
  europe: "Europe",
  usa: "USA",
};

export default function SearchPlayground() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("india");
  const [architecture, setArchitecture] = useState("Distributed");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = submittedQuery.trim().toLowerCase();

    if (!normalizedQuery) return [];

    const terms = normalizedQuery
      .split(/\s+/)
      .filter(Boolean);

    return documents
      .map((document) => {
        const title = document.title.toLowerCase();
        const description = document.description.toLowerCase();
        const keywords = document.keywords.join(" ").toLowerCase();
        const searchableText = `${title} ${description} ${keywords}`;

        const score = terms.reduce((total, term) => {
          if (title.includes(term)) return total + 4;
          if (keywords.includes(term)) return total + 3;
          if (description.includes(term)) return total + 1;
          return total;
        }, 0);

        return { ...document, score, searchableText };
      })
      .filter((document) => document.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.title.localeCompare(b.title)
      );
  }, [submittedQuery]);

  const servingRegion =
    architecture === "Centralized" ? "europe" : region;

  const baseLatency = regionLatency[region][servingRegion];

  // Illustrative estimate only; this is not a measured API response time.
  const estimatedResponseMs =
    baseLatency + (architecture === "Centralized" ? 35 : 25);

  function handleSearch(event) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  function clearSearch() {
    setQuery("");
    setSubmittedQuery("");
  }

  return (
    <main className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">SEARCHNET / LOCAL SEARCH LAB</p>
          <h1>Search Playground</h1>
          <p className="subtitle">
            Explore how hosting architecture and user location affect a
            simulated search service.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Search Configuration</h2>
            <p className="muted">
              Search a small local collection of computer-networking documents.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
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
              Hosting Architecture
              <select
                value={architecture}
                onChange={(event) =>
                  setArchitecture(event.target.value)
                }
              >
                <option value="Distributed">Distributed</option>
                <option value="Centralized">Centralized</option>
              </select>
            </label>
          </div>

          <label className="search-label">
            Search query
            <input
              className="search-input"
              type="search"
              placeholder="Try latency, distributed, packet delivery..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="experiment-actions">
            <button className="primary-button" type="submit">
              Search Documents
            </button>

            <button type="button" onClick={clearSearch}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Search Results</h2>
            <p className="muted">
              {submittedQuery.trim()
                ? `${results.length} matching document${results.length === 1 ? "" : "s"} for "${submittedQuery.trim()}"`
                : "Enter a query and select Search Documents to begin."}
            </p>
          </div>

          {submittedQuery.trim() && (
            <span className="status-pill">
              {results.length} results
            </span>
          )}
        </div>

        {!submittedQuery.trim() ? (
          <div className="empty-state">
            <h3>Explore the SearchNet document collection</h3>
            <p>
              Try searching for distributed systems, latency, failover,
              routing, availability, or packet delivery.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <h3>No matching documents found</h3>
            <p>
              Try a broader term such as network, server, failure, or latency.
            </p>
          </div>
        ) : (
          <div className="search-results">
            {results.map((document, index) => (
              <article className="search-result" key={document.id}>
                <div className="experiment-card-header">
                  <div>
                    <h3>{document.title}</h3>
                    <p>{document.description}</p>
                  </div>

                  <span className="experiment-traffic">
                    #{index + 1}
                  </span>
                </div>

                <p className="muted">
                  Category: {document.category}
                </p>

                <div className="topology-legend">
                  {document.keywords.slice(0, 4).map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Simulated Request Information</h2>

        <div className="experiment-metrics">
          <div>
            <span>User region</span>
            <strong>{regionNames[region]}</strong>
          </div>

          <div>
            <span>Hosting architecture</span>
            <strong>{architecture}</strong>
          </div>

          <div>
            <span>Serving region</span>
            <strong>{regionNames[servingRegion]}</strong>
          </div>

          <div>
            <span>Illustrative base + processing delay</span>
            <strong>{estimatedResponseMs} ms</strong>
          </div>
        </div>

        <p className="disclaimer">
          The document search runs locally in your browser. The displayed
          latency is a simplified estimate based on SearchNet configuration
          assumptions, not a measured search duration or a live Python
          simulation result.
        </p>
      </section>
    </main>
  );
}
