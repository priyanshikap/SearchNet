
import { useState } from "react";
import { CircleHelp } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import SearchPlayground from "./pages/SearchPlayground";
import Simulator from "./pages/Simulator";
import PerformanceResults from "./pages/PerformanceResults";
import Methodology from "./pages/Methodology";
import NetworkVisualization from "./pages/NetworkVisualization";
import Results from "./pages/Results";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard onNavigate={setActivePage} />;

      case "Search Playground":
        return (
          <main className="dashboard-content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">SEARCHNET / PLAYGROUND</p>
                <h1>Search Playground</h1>
                <p className="subtitle">
                  Explore the sample networking document dataset.
                </p>
              </div>
            </section>
            <SearchPlayground />
          </main>
        );

      case "Architecture Simulator":
        return <Simulator />;

      case "Performance Results":
        return <PerformanceResults />;

      case "Network Visualization":
        return <NetworkVisualization />;

      case "Saved Experiment Results":
        return <Results />;

      case "Methodology":
        return <Methodology />;

      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="main-column">
        <Topbar activePage={activePage} />

        {renderPage()}

        <div className="help-strip">
          <CircleHelp size={15} />
          Keep the random seed fixed when comparing scenarios.
        </div>
      </div>
    </div>
  );
}
