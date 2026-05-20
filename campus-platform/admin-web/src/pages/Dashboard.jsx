import {
  FiUsers,
  FiShoppingBag,
  FiCompass,
  FiBriefcase
} from "react-icons/fi";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import ChartPanel from "../components/dashboard/ChartPanel";
import { useAppData } from "../context/AppDataContext";
import { growthData, channelData, activityData, chartColors } from "../data/chartsData";

function DashboardPage() {
  const {
    users,
    lostFoundItems,
    goodsItems,
    notifications,
    placements,
    memories,
    clubs,
    examsData,
  } = useAppData();

  const activeUsers = users.length;
  const activeMarketplace = goodsItems.length;
  const resolvedItems = lostFoundItems.filter(
    (item) => String(item.status).toLowerCase() === "resolved",
  ).length;
  const activePlacements = placements.length;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Premium campus operations dashboard"
        text="Real-time style analytics across users, commerce, lost reports, placements, notifications, and moderation."
      />
      <div className="stats-grid">
        <StatCard
          icon={FiUsers}
          label="Active users"
          value={activeUsers.toLocaleString()}
          change="+18.4% this month"
          tone="violet"
        />
        <StatCard
          icon={FiShoppingBag}
          label="Marketplace GMV"
          value={`${activeMarketplace.toLocaleString()} listings`}
          change="+12.8% this week"
          tone="green"
        />
        <StatCard
          icon={FiCompass}
          label="Resolved items"
          value={resolvedItems.toLocaleString()}
          change={`${lostFoundItems.length} total reports`}
          tone="amber"
        />
        <StatCard
          icon={FiBriefcase}
          label="Placement posts"
          value={activePlacements.toLocaleString()}
          change={`${notifications.length} notifications`}
          tone="blue"
        />
      </div>
      <div className="dashboard-grid">
        <ChartPanel title="User growth graph" className="wide-panel">
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--chart-grid)"
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 16, border: 0 }} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#6c5ce7"
                fill="url(#usersGradient)"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke="#00b894"
                strokeWidth={3}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Channel activity">
          <ResponsiveContainer width="100%" height={310}>
            <PieChart>
              <Pie
                data={channelData}
                innerRadius={72}
                outerRadius={108}
                paddingAngle={4}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Lost & Found analytics">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--chart-grid)"
              />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 16, border: 0 }} />
              <Bar dataKey="reports" fill="#ff7675" radius={[12, 12, 0, 0]} />
              <Bar dataKey="approvals" fill="#00b894" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <div className="panel timeline-panel">
          <div className="panel-title">
            <h3>Activity timeline</h3>
            <span>Now</span>
          </div>
          {[
            `${goodsItems[0]?.name || "Marketplace"} listing verified`,
            `${lostFoundItems[0]?.title || "Lost item"} queued for review`,
            `${placements[0]?.company || "Placement"} post reviewed`,
            `${notifications[0]?.title || "Admin notification"} delivered`,
          ].map((item, index) => (
            <motion.div
              className="timeline-item"
              key={item}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <i />
              <div>
                <strong>{item}</strong>
                <span>{index + 1}0 min ago</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
export default DashboardPage;