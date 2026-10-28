
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function ResultsCharts({ history = [] }) {
  const data = history.map((item) => {
    const metrics = item.metrics || {};

    return {
      name: item.architecture || "Unknown",
      latency: Number(
        metrics.average_latency_ms ?? metrics.avg_latency_ms ?? 0
      ),
      delivery: Number(
        metrics.packet_delivery_ratio ??
          metrics.packet_delivery_ratio_percent ??
          0
      ),
    };
  });

  const tooltipStyle = {
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Performance Comparison</h2>
          <p className="muted">
            Centralized versus distributed architecture for the current
            comparison.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          Run a simulation to display charts.
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-container">
            <h3>Average Latency (ms)</h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data}
                margin={{ top: 24, right: 12, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, "auto"]}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    `${Number(value).toFixed(2)} ms`,
                    "Average latency",
                  ]}
                />
                <Bar
                  dataKey="latency"
                  name="Average latency"
                  fill="#8985ff"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={90}
                >
                  <LabelList
                    dataKey="latency"
                    position="top"
                    formatter={(value) => Number(value).toFixed(2)}
                    fill="#cbd5e1"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Packet Delivery Ratio (%)</h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data}
                margin={{ top: 24, right: 12, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    "Packet delivery ratio",
                  ]}
                />
                <Bar
                  dataKey="delivery"
                  name="Packet delivery ratio"
                  fill="#36c9a0"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={90}
                >
                  <LabelList
                    dataKey="delivery"
                    position="top"
                    formatter={(value) => `${Number(value).toFixed(2)}%`}
                    fill="#cbd5e1"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
