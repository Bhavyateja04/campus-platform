import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
export default function StatCard({ icon: Icon, label, value, change, tone = "violet" }) {
  return (
    <motion.article
      className={`stat-card ${tone}`}
      whileHover={{ y: -6, scale: 1.01 }}
    >
      <div className="stat-icon">
        <Icon />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>
        <FiTrendingUp /> {change}
      </small>
    </motion.article>
  );
}