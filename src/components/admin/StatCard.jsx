/**
 * Kartu statistik dashboard admin.
 * tone: 'gold' | 'dark' | 'warn' | 'default'
 * icon: bootstrap icon class tanpa prefix bi- (opsional)
 */
const ICONS = {
  gold: 'bi-people',
  dark: 'bi-receipt',
  warn: 'bi-exclamation-circle',
  default: 'bi-box-seam',
};

export default function StatCard({ label, value, hint, tone = 'default', icon }) {
  const iconClass = icon || ICONS[tone] || ICONS.default;
  return (
    <div className={`admin-stat-card admin-stat-card--${tone}`}>
      <div className="admin-stat-icon">
        <i className={`bi ${iconClass}`} />
      </div>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value ?? 0}</div>
      {hint ? <div className="admin-stat-hint">{hint}</div> : null}
    </div>
  );
}
