import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/calculations';

function formatYAxis(value) {
  if (value >= 1000000) return 'S$' + (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return 'S$' + (value / 1000).toFixed(0) + 'k';
  return 'S$' + value;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 600, marginBottom: '6px', color: '#333' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: '0.9em' }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function PaymentChart({ chartData }) {
  if (!chartData) {
    return (
      <div className="card full-width">
        <h2>Payment Breakdown Over Time</h2>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          Calculate to see chart
        </div>
      </div>
    );
  }

  const data = chartData.labels.map((label, i) => ({
    name: label,
    'Principal Paid': chartData.principalData[i],
    'Interest Paid': chartData.interestData[i],
  }));

  return (
    <div className="card full-width">
      <h2>Payment Breakdown Over Time</h2>
      <div style={{ height: '320px', marginTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#667eea" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#764ba2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: '#666' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="Principal Paid" stroke="#667eea" fill="url(#colorPrincipal)" strokeWidth={2} />
            <Area type="monotone" dataKey="Interest Paid" stroke="#764ba2" fill="url(#colorInterest)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
