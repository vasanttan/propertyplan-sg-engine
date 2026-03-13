import { useState, useCallback } from 'react';
import { runCalculation, getMaxTenure, getABSDRate, generateSchedule, generateChartData } from '../utils/calculations';

const DEFAULT_INPUTS = {
  age: 35,
  monthlyIncome: 15000,
  cpfAvailable: 100000,
  monthlyCPF: 2000,
  buyerProfile: 'sc_first',
  entityType: 'housing_developer',
  propertyType: 'condo',
  propertyPrice: 1300000,
  downPaymentPercent: 25,
  loanTenure: 25,
  interestRate: 2.6,
  loanType: 'bank_fixed',
  scheduleDisplay: '12',
};

export function useCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [summaryView, setSummaryView] = useState('grid'); // 'grid' | 'table'

  const maxTenure = getMaxTenure(inputs.age);
  const absdRate = getABSDRate(inputs.buyerProfile, inputs.entityType, inputs.propertyType);

  const updateInput = useCallback((field, value) => {
    setInputs(prev => {
      const next = { ...prev, [field]: value };
      // Auto-cap tenure when age changes
      if (field === 'age') {
        const max = getMaxTenure(Number(value));
        if (next.loanTenure > max) next.loanTenure = max;
      }
      return next;
    });
  }, []);

  const calculate = useCallback(() => {
    const res = runCalculation(inputs);
    setResults(res);

    const sched = generateSchedule(res.loanAmount, res.annualRate, res.monthlyPayment, res.totalPayments);
    setSchedule(sched);

    const chart = generateChartData(res.loanAmount, res.annualRate, res.monthlyPayment, res.totalPayments);
    setChartData(chart);
  }, [inputs]);

  const saveScenario = useCallback((name) => {
    if (!results) return;
    const scenario = {
      id: Date.now(),
      name,
      inputs: { ...inputs },
      results: { ...results },
      savedAt: new Date().toLocaleDateString('en-SG'),
    };
    setSavedScenarios(prev => [...prev, scenario]);
  }, [inputs, results]);

  const deleteScenario = useCallback((id) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
  }, []);

  const loadScenario = useCallback((scenario) => {
    setInputs(scenario.inputs);
    setResults(scenario.results);
  }, []);

  return {
    inputs, updateInput,
    results, schedule, chartData,
    savedScenarios, saveScenario, deleteScenario, loadScenario,
    calculate,
    maxTenure, absdRate,
    summaryView, setSummaryView,
  };
}
