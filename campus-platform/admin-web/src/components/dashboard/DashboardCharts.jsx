import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { placementChartData } from "../../data/chartsData";

export default function DashboardCharts() {
  return (
    <div className="panel">
      <h3>Placement Growth</h3>

      <div
        style={{
          width: "100%",
          height: 300,
        }}
      >
        <ResponsiveContainer>
          <LineChart
            data={placementChartData}
          >
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="students"
              stroke="#6366f1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}