export default function ChartPanel({ title, className, children }) {
  return (
    <div className={`panel chart-panel ${className || ""}`}>
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}