const STATUS_MAP = {
  // Generic
  active: { label: "Active", cls: "badge-success", dot: true },
  inactive: { label: "Inactive", cls: "badge-neutral", dot: true },
  suspended: { label: "Suspended", cls: "badge-danger", dot: true },
  maintenance: { label: "Maintenance", cls: "badge-warning", dot: true },
  // IoT
  online: { label: "Online", cls: "badge-success", dot: true },
  offline: { label: "Offline", cls: "badge-neutral", dot: true },
  // Trips
  completed: { label: "Completed", cls: "badge-success" },
  in_progress: { label: "In Progress", cls: "badge-info" },
  cancelled: { label: "Cancelled", cls: "badge-danger" },
  // Behavior
  harsh_braking: { label: "Harsh Braking", cls: "event-harsh-braking" },
  overspeeding: { label: "Overspeeding", cls: "event-overspeeding" },
  harsh_cornering: { label: "Harsh Cornering", cls: "event-harsh-cornering" },
  phone_usage: { label: "Phone Usage", cls: "event-phone-usage" },
};

const StatusBadge = ({ status }) => {
  const key = (status || "").toLowerCase().replace(/\s+/g, "_");
  const cfg = STATUS_MAP[key] || { label: status || "—", cls: "badge-neutral" };

  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.dot && (
        <span className="badge-dot" style={{ background: "currentColor" }} />
      )}
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
