import { useState } from 'react';

export default function PurchaseDetailsCard({ inputs, updateInput, maxTenure, onCalculate, onSave, hasSavedScenarios, hasResults }) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const { propertyType, propertyPrice, downPaymentPercent, loanTenure, interestRate, loanType } = inputs;

  const fmtNum = (n) => Number(n).toLocaleString('en-SG');
  const handlePriceInput = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    updateInput('propertyPrice', parseFloat(raw) || 0);
  };

  const handlePropertyTypeChange = (val) => {
    updateInput('propertyType', val);
    if (val === 'hdb') {
      updateInput('loanType', 'hdb');
      updateInput('interestRate', 2.6);
      if (downPaymentPercent < 10) updateInput('downPaymentPercent', 10);
    } else {
      if (loanType === 'hdb') updateInput('loanType', 'bank_fixed');
    }
  };

  const minDown = propertyType === 'hdb' ? 10 : 25;
  const downRemark = propertyType === 'hdb'
    ? '💰 Min: 10% for HDB (5% cash + 5% cash/CPF)'
    : '💰 Min: 25% for resale condo (5% cash + 20% cash/CPF)';

  const cashCpfInfo = propertyType === 'hdb'
    ? '💡 HDB: Min 5% cash down payment, can use CPF for remaining'
    : '💡 Condo: Min 5% cash, remaining down payment can use CPF';

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    onSave(scenarioName.trim());
    setScenarioName('');
    setShowSaveModal(false);
  };

  return (
    <div className="card">
      <h2>Purchase Details</h2>

      <div className="input-group">
        <label>Property Type</label>
        <select value={propertyType} onChange={e => handlePropertyTypeChange(e.target.value)}>
          <option value="condo">Private Condo (Resale)</option>
          <option value="hdb">HDB Flat (Resale)</option>
        </select>
      </div>

      <div className="input-group">
        <label>Property Price (SGD)</label>
        <input
          type="text" value={fmtNum(propertyPrice)}
          onChange={handlePriceInput}
        />
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Down Payment (%)</label>
          <input
            type="number" value={downPaymentPercent}
            min={minDown} max={100}
            onChange={e => updateInput('downPaymentPercent', parseFloat(e.target.value) || minDown)}
          />
          <small>{downRemark}</small>
        </div>
        <div className="input-group">
          <label>Loan Tenure (Years)</label>
          <input
            type="number" value={loanTenure}
            min={1} max={maxTenure}
            onChange={e => {
              let v = parseInt(e.target.value) || 1;
              if (v > maxTenure) v = maxTenure;
              if (v < 1) v = 1;
              updateInput('loanTenure', v);
            }}
          />
          <small>⏱️ Max: {maxTenure} years</small>
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Interest Rate (%)</label>
          <input
            type="number" value={interestRate} step={0.1} min={0}
            onChange={e => updateInput('interestRate', parseFloat(e.target.value) || 0)}
          />
          <small>📊 Current market rate for bank loans</small>
        </div>
        <div className="input-group">
          <label>Loan Type</label>
          <select value={loanType} onChange={e => updateInput('loanType', e.target.value)}>
            <option value="bank_fixed">Bank Loan - Fixed Rate</option>
            <option value="bank_floating">Bank Loan - Floating Rate</option>
            <option value="hdb" disabled={propertyType !== 'hdb'}>HDB Loan (HDB only)</option>
          </select>
        </div>
      </div>

      <button className="btn" onClick={onCalculate}>Calculate Payment Plan</button>

      <div className="save-compare-section">
        <button
          className="btn-save"
          disabled={!hasResults}
          onClick={() => setShowSaveModal(true)}
        >
          💾 Save Scenario
        </button>
        <button
          className="btn-compare"
          disabled={!hasSavedScenarios}
        >
          📊 Compare ({hasSavedScenarios})
        </button>
      </div>

      <div className="info-badge">{cashCpfInfo}</div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="input-modal-content" onClick={e => e.stopPropagation()}>
            <div className="input-modal-header">💾 Save Scenario</div>
            <input
              className="input-modal-input"
              type="text"
              placeholder="Enter scenario name..."
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div className="input-modal-buttons">
              <button className="input-modal-btn secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="input-modal-btn primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
