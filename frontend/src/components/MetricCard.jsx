// MetricCard component placeholder.

export default function MetricCard({
  title,
  value,
  unit = "",
  description,
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
      </div>

      <div className="metric-value">
        {value ?? "—"}
        <small>{value !== null && value !== undefined ? unit : ""}</small>
      </div>

      <p>{description}</p>
    </article>
  );
}
