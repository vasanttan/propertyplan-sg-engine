import { formatCurrency } from '../utils/calculations';

export default function FinancialSummaryCard({ results, summaryView, setSummaryView }) {
  if (!results) {
    return (
      <div className="card full-width">
        <h2>Financial Summary</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <div style={{ fontSize: '2em', marginBottom: '12px' }}>🏠</div>
          <p>Fill in your details and click <strong>Calculate Payment Plan</strong> to see your summary.</p>
        </div>
      </div>
    );
  }

  const {
    downPayment, loanAmount, monthlyPayment, totalInterest,
    stampDuty, absdAmount, totalStampDuty,
    totalDownPaymentNeeded, cashNeeded, totalAmountNeeded,
    tdsrRatio, cashPayment,
  } = results;

  const tdsrColor = tdsrRatio > 55 ? '#d9534f' : tdsrRatio > 50 ? '#f0ad4e' : '#5cb85c';
  const tdsrWarn = tdsrRatio > 55
    ? '⚠️ Exceeds 55% TDSR limit! Loan may not be approved.'
    : tdsrRatio > 50 ? '⚠️ Close to 55% limit. Consider reducing loan amount.' : null;

  const summaryItems = [
    { label: '💰 Down Payment', value: formatCurrency(downPayment) },
    { label: '🏦 Loan Amount', value: formatCurrency(loanAmount) },
    { label: '💳 Monthly Payment', value: formatCurrency(monthlyPayment) },
    { label: '📊 Total Interest', value: formatCurrency(totalInterest) },
    { label: "📜 Buyer's Stamp Duty (BSD)", value: formatCurrency(stampDuty) },
    { label: '📋 Additional BSD (ABSD)', value: formatCurrency(absdAmount) },
    { label: '📑 Total Stamp Duty', value: formatCurrency(totalStampDuty) },
    { label: '💰 Total Upfront Needed', value: formatCurrency(totalDownPaymentNeeded), sub: 'Down Payment + Total Stamp Duty' },
    { label: '💵 Minimum Cash Needed', value: formatCurrency(cashNeeded), sub: 'Cash Down (5%) + BSD + ABSD' },
    { label: '🏢 Total Amount Needed', value: formatCurrency(totalAmountNeeded), sub: 'Property + Duties' },
    { label: '📈 TDSR Ratio', value: tdsrRatio.toFixed(1) + '%', color: tdsrColor, warn: tdsrWarn },
    { label: '💴 Cash After CPF', value: formatCurrency(cashPayment) },
  ];

  return (
    <div className="card full-width">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Financial Summary</h2>
        <button
          onClick={() => setSummaryView(summaryView === 'grid' ? 'table' : 'grid')}
          style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9em' }}
        >
          {summaryView === 'grid' ? '📋 Table View' : '📊 Grid View'}
        </button>
      </div>

      {summaryView === 'grid' ? (
        <div className="summary-grid">
          {summaryItems.map(item => (
            <div className="summary-item" key={item.label}>
              <label>{item.label}</label>
              <div className="value" style={item.color ? { color: item.color, fontWeight: 'bold' } : {}}>
                {item.value}
              </div>
              {item.sub && <div style={{ fontSize: '0.75em', color: '#999', marginTop: '3px' }}>{item.sub}</div>}
              {item.warn && <div style={{ fontSize: '0.85em', color: item.color, marginTop: '5px' }}>{item.warn}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #667eea' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#333' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {summaryItems.map(item => (
                <tr key={item.label} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '10px', color: '#666' }}>
                    {item.label}
                    {item.sub && <div style={{ fontSize: '0.75em', color: '#999' }}>{item.sub}</div>}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: item.color || 'inherit' }}>
                    {item.value}
                    {item.warn && <div style={{ fontSize: '0.8em', fontWeight: 400 }}>{item.warn}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="info-badge" style={{ marginTop: '16px' }}>
        📊 TDSR limit: 55% of gross monthly income
      </div>
    </div>
  );
}
