import { getABSDRate } from '../utils/calculations';

export default function UserProfileCard({ inputs, updateInput, maxTenure, absdRate }) {
  const { age, monthlyIncome, cpfAvailable, monthlyCPF, buyerProfile, entityType, propertyType } = inputs;

  const fmtNum = (n) => Number(n).toLocaleString('en-SG');
  const parseNum = (s) => parseFloat(String(s).replace(/,/g, '')) || 0;

  const handleNumberInput = (field, e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    updateInput(field, parseFloat(raw) || 0);
  };

  const absdBg = absdRate === 0 ? '#d4edda' : '#ffd7d7';
  const absdText = absdRate === 0
    ? (propertyType === 'hdb' ? '🏛️ ABSD: 0% (No ABSD for citizens/PRs buying HDB)' : '🏛️ ABSD: 0% (No additional stamp duty)')
    : `🏛️ ABSD: ${absdRate}% applies to your purchase`;

  return (
    <div className="card">
      <h2>User Profile</h2>

      <div className="input-group">
        <label>Your Current Age</label>
        <input
          type="number" value={age} min={21} max={64}
          onChange={e => updateInput('age', parseInt(e.target.value) || 35)}
        />
        <small>📅 Max loan tenure: {maxTenure} years (loan must end by age 65)</small>
      </div>

      <div className="input-group">
        <label>Monthly Household Income (SGD)</label>
        <input
          type="text" value={fmtNum(monthlyIncome)}
          onChange={e => handleNumberInput('monthlyIncome', e)}
        />
      </div>

      <div className="input-group">
        <label>CPF Available for Down Payment (SGD)</label>
        <input
          type="text" value={fmtNum(cpfAvailable)}
          onChange={e => handleNumberInput('cpfAvailable', e)}
        />
      </div>

      <div className="input-group">
        <label>Monthly CPF Contribution for Mortgage (SGD)</label>
        <input
          type="text" value={fmtNum(monthlyCPF)}
          onChange={e => handleNumberInput('monthlyCPF', e)}
        />
      </div>

      <div className="input-group">
        <label>Buyer Profile</label>
        <select value={buyerProfile} onChange={e => updateInput('buyerProfile', e.target.value)}>
          <option value="sc_first">Singapore Citizen - 1st Property</option>
          <option value="sc_second">Singapore Citizen - 2nd Property</option>
          <option value="sc_third">Singapore Citizen - 3rd+ Property</option>
          <option value="pr_first">PR - 1st Property</option>
          <option value="pr_second">PR - 2nd+ Property</option>
          <option value="pr_third">PR - 3rd+ Property</option>
          <option value="foreigner">Foreigner</option>
          <option value="entity">Entity (Company/Trust)</option>
        </select>
      </div>

      {buyerProfile === 'entity' && (
        <div className="input-group">
          <label>Entity Type</label>
          <select value={entityType} onChange={e => updateInput('entityType', e.target.value)}>
            <option value="housing_developer">Housing Developer</option>
            <option value="other_entity">Other Entity</option>
          </select>
        </div>
      )}

      <div className="info-badge" style={{ background: absdBg }}>
        {absdText}
      </div>
    </div>
  );
}
