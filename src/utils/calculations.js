// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(amount) {
  return 'S$' + Math.round(amount).toLocaleString('en-SG');
}

export function formatCurrencyShort(amount) {
  if (amount >= 1000000) return 'S$' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return 'S$' + (amount / 1000).toFixed(0) + 'K';
  return formatCurrency(amount);
}

export function parseFormattedNumber(str) {
  return parseFloat(String(str).replace(/,/g, '')) || 0;
}

// ─── Stamp Duty ───────────────────────────────────────────────────────────────

export function calculateStampDuty(price) {
  // BSD rates updated Feb 2023
  if (price <= 180000) return price * 0.01;
  if (price <= 360000) return 1800 + (price - 180000) * 0.02;
  if (price <= 1000000) return 5400 + (price - 360000) * 0.03;
  if (price <= 1500000) return 24600 + (price - 1000000) * 0.04;
  return 44600 + (price - 1500000) * 0.05;
}

export function getABSDRate(buyerProfile, entityType = null, propertyType = 'condo') {
  if (propertyType === 'hdb') {
    if (['sc_first','sc_second','sc_third','pr_first','pr_second'].includes(buyerProfile)) return 0;
  }
  const rates = {
    sc_first: 0, sc_second: 20, sc_third: 30,
    pr_first: 5, pr_second: 30, pr_third: 35,
    foreigner: 60,
    entity: entityType === 'housing_developer' ? 35 : 65,
  };
  return rates[buyerProfile] ?? 0;
}

export function calculateABSD(price, buyerProfile, entityType, propertyType) {
  return price * (getABSDRate(buyerProfile, entityType, propertyType) / 100);
}

// ─── Loan ─────────────────────────────────────────────────────────────────────

export function calcMonthlyPayment(loanAmount, annualRate, termMonths) {
  const r = annualRate / 12;
  if (r === 0) return loanAmount / termMonths;
  return loanAmount * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

export function getMaxTenure(age) {
  return Math.min(30, Math.max(1, 65 - age));
}

// ─── Amortization Schedule ────────────────────────────────────────────────────

export function generateSchedule(loanAmount, annualRate, monthlyPayment, totalPayments) {
  const monthlyRate = annualRate / 12;
  const schedule = [];
  let balance = loanAmount;

  for (let i = 1; i <= totalPayments; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;
    schedule.push({
      period: i,
      payment: monthlyPayment,
      principal,
      interest,
      balance: Math.max(0, balance),
    });
  }
  return schedule;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export function generateChartData(loanAmount, annualRate, monthlyPayment, totalPayments) {
  const monthlyRate = annualRate / 12;
  const years = Math.ceil(totalPayments / 12);
  const labels = [];
  const principalData = [];
  const interestData = [];
  let balance = loanAmount;
  let totalPrincipal = 0;
  let totalInterest = 0;

  for (let year = 0; year <= years; year++) {
    labels.push(`Year ${year}`);
    principalData.push(Math.round(totalPrincipal));
    interestData.push(Math.round(totalInterest));

    const paymentsThisYear = Math.min(12, totalPayments - year * 12);
    for (let m = 0; m < paymentsThisYear; m++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      totalPrincipal += principal;
      totalInterest += interest;
    }
  }
  return { labels, principalData, interestData };
}

// ─── Core Calculator ──────────────────────────────────────────────────────────

export function runCalculation(inputs) {
  const {
    propertyPrice, downPaymentPercent, loanTenure,
    interestRate, monthlyIncome, cpfAvailable,
    buyerProfile, entityType, propertyType,
  } = inputs;

  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const annualRate = interestRate / 100;
  const totalPayments = loanTenure * 12;
  const monthlyPayment = calcMonthlyPayment(loanAmount, annualRate, totalPayments);
  const totalPaid = monthlyPayment * totalPayments;
  const totalInterest = totalPaid - loanAmount;

  const stampDuty = calculateStampDuty(propertyPrice);
  const absdAmount = calculateABSD(propertyPrice, buyerProfile, entityType, propertyType);
  const totalStampDuty = stampDuty + absdAmount;

  const minCashDown = propertyPrice * 0.05;
  const cpfUsed = Math.min(cpfAvailable, downPayment - minCashDown);
  const cashForDown = downPayment - cpfUsed;
  const totalCashNeeded = minCashDown + totalStampDuty;
  const totalAmountNeeded = propertyPrice + totalStampDuty;
  const tdsrRatio = (monthlyPayment / monthlyIncome) * 100;

  return {
    downPayment, loanAmount, monthlyPayment, totalInterest,
    stampDuty, absdAmount, totalStampDuty,
    totalDownPaymentNeeded: downPayment + totalStampDuty,
    cashNeeded: totalCashNeeded,
    totalAmountNeeded,
    tdsrRatio,
    cashPayment: cashForDown,
    annualRate,
    totalPayments,
  };
}
