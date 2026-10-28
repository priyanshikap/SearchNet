
import {
  Search,
  Network,
  ChartNoAxesCombined,
  BookOpen,
  History,
  ArrowRight,
  GitCompareArrows,
  Server,
  Activity,
} from "lucide-react";

const sections = [
  {
    title: "Search Playground",
    description: "Explore and rank the sample networking document dataset.",
    icon: Search,
    page: "Search Playground",
  },
  {
    title: "Architecture Simulator",
    description: "Configure request traffic, server architecture, and failures.",
    icon: Network,
    page: "Architecture Simulator",
  },
  {
    title: "Performance Results",
    description: "Compare latency, throughput, delivery, and availability.",
    icon: ChartNoAxesCombined,
    page: "Performance Results",
  },
  {
    title: "Saved Experiment Results",
    description: "Review previous runs and download their CSV results.",
    icon: History,
    page: "Saved Experiment Results",
  },
  {
    title: "Network Visualization",
    description: "Explore regional servers and conceptual failure scenarios.",
    icon: Server,
    page: "Network Visualization",
  },
  {
    title: "Methodology",
    description: "Review model assumptions, metric definitions, and limitations.",
    icon: BookOpen,
    page: "Methodology",
  },
];

export default function Dashboard({ onNavigate }) {
  return (
    <main className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">COMPUTER NETWORKS / PROJECT OVERVIEW</p>
          <h1>Welcome to SearchNet</h1>
          <p className="subtitle">
            Study centralized hosting versus multi-region distributed hosting
            using a reproducible Python network simulation.
          </p>
        </div>

        <span className="backend-badge">React + Flask + Python</span>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <Activity size={22} />
          <p>Performance analysis</p>
          <h2>5 metrics</h2>
          <small>Latency, P95, throughput, delivery, availability</small>
        </article>

        <article className="metric-card">
          <Server size={22} />
          <p>Hosting architectures</p>
          <h2>2 models</h2>
          <small>Centralized and distributed</small>
        </article>

        <article className="metric-card">
          <Network size={22} />
          <p>Network regions</p>
          <h2>3 regions</h2>
          <small>India, Europe, and USA</small>
        </article>

        <article className="metric-card">
          <GitCompareArrows size={22} />
          <p>Failure scenarios</p>
          <h2>3 scenarios</h2>
          <small>Normal, regional server, and network link</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Explore the Project</h2>
            <p className="muted">
              Choose a workspace to begin or continue your analysis.
            </p>
          </div>
        </div>

        <div className="dashboard-link-grid">
          {sections.map(({ title, description, icon: Icon, page }) => (
            <button
              key={title}
              type="button"
              className="dashboard-link-card"
              onClick={() => onNavigate?.(page)}
            >
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{description}</p>
              <span>
                Open section <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>How to Use SearchNet</h2>

        <ol>
          <li>
            Open <strong>Architecture Simulator</strong> and run a baseline
            experiment.
          </li>
          <li>
            Change the architecture or failure scenario while keeping the
            request count and seed fixed for comparison.
          </li>
          <li>
            Open <strong>Performance Results</strong> to compare the two
            architectures under matching settings.
          </li>
          <li>
            Visit <strong>Saved Experiment Results</strong> to review runs and
            export CSV data.
          </li>
          <li>
            Consult <strong>Methodology</strong> before interpreting the
            results in your report.
          </li>
        </ol>

        <p className="disclaimer">
          SearchNet uses illustrative simulation assumptions. Its results are
          not real-world network measurements and are not automatically
          synchronized with Cisco Packet Tracer.
        </p>
      </section>
    </main>
  );
}
