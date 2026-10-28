// Topbar component placeholder.

export default function Topbar({ activePage = "Dashboard" }) {
  return (
    <header className="topbar">
      <span>Computer Networks / {activePage}</span>
      <span className="topbar-tag">PROJECT WORKSPACE</span>
    </header>
  );
}
