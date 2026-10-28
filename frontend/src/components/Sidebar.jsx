// Sidebar component placeholder.

import {
  LayoutDashboard,
  Search,
  Network,
  ChartNoAxesCombined,
  BookOpen,
  FileBarChart,
} from "lucide-react";


const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Search Playground", icon: Search },
  { name: "Architecture Simulator", icon: Network },
  { name: "Network Visualization", icon: Network },
  { name: "Performance Results", icon: ChartNoAxesCombined },
  { name: "Saved Experiment Results", icon: ChartNoAxesCombined },
  { name: "Methodology", icon: BookOpen },
  { name: "Documentation", icon: FileBarChart },{ name: "Cisco Packet Tracer Results", icon: FileBarChart },
];


export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <button
        className="brand brand-button"
        onClick={() => onNavigate("Dashboard")}
        aria-label="Go to Dashboard"
      >
        <div className="brand-icon">S</div>
        <div>
          <strong>SearchNet</strong>
          <span>Network Lab</span>
        </div>
      </button>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {menuItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            type="button"
            className={`nav-item ${activePage === name ? "active" : ""}`}
            onClick={() => onNavigate(name)}
            aria-current={activePage === name ? "page" : undefined}
          >
            <Icon size={17} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <span className="status-dot" />
        <div>
          <strong>Local Simulation</strong>
          <span>React + Flask</span>
        </div>
      </div>
    </aside>
  );
}
