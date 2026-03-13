import { formatCurrency } from '../utils/calculations';

export default function SavedScenarios({ scenarios, onLoad, onDelete }) {
  if (!scenarios.length) return null;

  return (
    <div className="card full-width saved-scenarios">
      <h3>📁 Saved Scenarios</h3>
      <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
        {scenarios.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', background: '#f8f9ff', borderRadius: '10px',
            border: '1px solid #e8ecff'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                🏠 {s.name}
              </div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                {formatCurrency(s.inputs.propertyPrice)} •{' '}
                {formatCurrency(s.results.monthlyPayment)}/mo •{' '}
                {s.inputs.loanTenure}yr @ {s.inputs.interestRate}% •{' '}
                Saved {s.savedAt}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
              <button
                onClick={() => onLoad(s)}
                style={{ padding: '6px 14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em' }}
              >
                Load
              </button>
              <button
                onClick={() => onDelete(s.id)}
                style={{ padding: '6px 14px', background: 'white', color: '#d9534f', border: '1px solid #d9534f', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
