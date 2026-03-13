import { useCalculator } from './hooks/useCalculator';
import { formatCurrencyShort } from './utils/calculations';
import UserProfileCard from './components/UserProfileCard';
import PurchaseDetailsCard from './components/PurchaseDetailsCard';
import FinancialSummaryCard from './components/FinancialSummaryCard';
import PaymentChart from './components/PaymentChart';
import PaymentSchedule from './components/PaymentSchedule';
import SavedScenarios from './components/SavedScenarios';
import './App.css';

export default function App() {
  const {
    inputs, updateInput,
    results, schedule, chartData,
    savedScenarios, saveScenario, deleteScenario, loadScenario,
    calculate,
    maxTenure, absdRate,
    summaryView, setSummaryView,
  } = useCalculator();

  const subtitle = `Plan and track your ${formatCurrencyShort(inputs.propertyPrice)} property investment`;

  return (
    <div className="container">
      <div className="header">
        <h1>🏠 <span className="brand">PropertyPlan SG</span> <span className="version">v3.0</span></h1>
        <p>{subtitle}</p>
      </div>

      <div className="dashboard">
        {/* Left: User Profile */}
        <UserProfileCard
          inputs={inputs}
          updateInput={updateInput}
          maxTenure={maxTenure}
          absdRate={absdRate}
        />

        {/* Right: Purchase Details */}
        <PurchaseDetailsCard
          inputs={inputs}
          updateInput={updateInput}
          maxTenure={maxTenure}
          onCalculate={calculate}
          onSave={saveScenario}
          hasSavedScenarios={savedScenarios.length}
          hasResults={!!results}
        />

        {/* Financial Summary */}
        <FinancialSummaryCard
          results={results}
          summaryView={summaryView}
          setSummaryView={setSummaryView}
        />

        {/* Saved Scenarios */}
        <SavedScenarios
          scenarios={savedScenarios}
          onLoad={loadScenario}
          onDelete={deleteScenario}
        />

        {/* Chart */}
        <PaymentChart chartData={chartData} />

        {/* Amortization Schedule */}
        <PaymentSchedule schedule={schedule} />
      </div>
    </div>
  );
}
