import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

export default function PaymentSchedule({ schedule }) {
  const [display, setDisplay] = useState('12');

  if (!schedule.length) {
    return (
      <div className="card full-width">
        <h2>Monthly Payment Schedule</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Calculate to see payment schedule
        </div>
      </div>
    );
  }

  const visible = display === 'all' ? schedule : schedule.slice(0, parseInt(display));

  const exportToCSV = () => {
    const header = 'Month,Payment,Principal,Interest,Balance\n';
    const rows = schedule.map(r =>
      `${r.period},${r.payment.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(2)},${r.balance.toFixed(2)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment_schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card full-width" style={{ position: 'relative', paddingBottom: '70px' }}>
      <h2>Monthly Payment Schedule</h2>
      <div className="payment-schedule">
        <table id="scheduleTable">
          <thead>
            <tr>
              <th>Month</th>
              <th>Payment</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(row => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>{formatCurrency(row.payment)}</td>
                <td>{formatCurrency(row.principal)}</td>
                <td>{formatCurrency(row.interest)}</td>
                <td>{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ position: 'absolute', bottom: '25px', left: '25px', right: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-export" onClick={exportToCSV}>📥 Export to CSV</button>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <label style={{ marginRight: '8px', fontSize: '0.9em', color: '#555' }}>Show:</label>
          <select value={display} onChange={e => setDisplay(e.target.value)} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}>
            <option value="12">12 months</option>
            <option value="60">5 years</option>
            <option value="120">10 years</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </div>
  );
}
