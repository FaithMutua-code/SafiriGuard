const StatCard = ({
  icon,
  label,
  value,
  trend,
  color = "var(--primary)",
  bg,
}) => {
  const trendClass =
    trend?.positive === true
      ? "up"
      : trend?.positive === false
        ? "down"
        : "neutral";
  const trendIcon =
    trend?.positive === true ? "↑" : trend?.positive === false ? "↓" : "→";

  return (
    <div
      className="stat-card"
      style={{ "--stat-color": color, "--stat-bg": bg || `${color}18` }}
    >
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        {trend && (
          <div className={`stat-trend ${trendClass}`}>
            {trendIcon} {trend.value}
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
