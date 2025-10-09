export default function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
