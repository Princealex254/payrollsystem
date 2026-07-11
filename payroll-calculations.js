/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Kenya Payroll Calculations Module
 * ============================================================
 * PRESERVED & IMPROVED: All existing payroll calculation logic
 * maintained with zero changes to the core algorithms.
 * 
 * Covers: NSSF, SHIF, Housing Levy, PAYE, Net Pay
 */

/**
 * Calculate NSSF (Kenya 2024 tiers)
 * Tier I: 6% of salary up to KES 7,000 (max KES 420)
 * Tier II: 6% of salary from KES 7,001 to KES 36,000 (max KES 1,740)
 * @param {number} basicSalary
 * @returns {{ tierI: number, tierII: number, total: number }}
 */
export function calculateNSSF(basicSalary) {
  const LEL = 7000, UEL = 36000;
  let tierI = 0, tierII = 0;
  if (basicSalary <= LEL) {
    tierI = basicSalary * 0.06;
  } else {
    tierI = LEL * 0.06; // 420
    tierII = (Math.min(basicSalary, UEL) - LEL) * 0.06;
  }
  return { tierI, tierII, total: tierI + tierII };
}

/**
 * Calculate SHIF — Social Health Insurance Fund (2.75% of gross)
 * @param {number} grossPay
 * @returns {number}
 */
export function calculateSHIF(grossPay) {
  return grossPay * 0.0275;
}

/**
 * Calculate Affordable Housing Levy (1.5% of gross)
 * @param {number} grossPay
 * @returns {number}
 */
export function calculateHousingLevy(grossPay) {
  return grossPay * 0.015;
}

/**
 * Calculate PAYE using Kenya income tax bands (2024)
 * Band 1: 0 – 24,000         @ 10%
 * Band 2: 24,001 – 32,333    @ 25%
 * Band 3: 32,334+             @ 30%
 * Personal Relief: KES 2,400
 * @param {number} taxableIncome
 * @returns {{ incomeTax: number, personalRelief: number, paye: number }}
 */
export function calculatePAYE(taxableIncome) {
  if (taxableIncome <= 0) return { incomeTax: 0, personalRelief: 2400, paye: 0 };
  let tax = 0;
  if (taxableIncome <= 24000) {
    tax = taxableIncome * 0.10;
  } else if (taxableIncome <= 32333) {
    tax = 24000 * 0.10 + (taxableIncome - 24000) * 0.25;
  } else {
    tax = 24000 * 0.10 + 8333 * 0.25 + (taxableIncome - 32333) * 0.30;
  }
  const personalRelief = 2400;
  const paye = Math.max(0, tax - personalRelief);
  return { incomeTax: tax, personalRelief, paye };
}

/**
 * Master payroll calculation function
 * @param {Object} emp - Employee record
 * @param {number} overtime
 * @param {number} bonus
 * @param {number} advance
 * @param {number} helb
 * @param {number} otherDeductions
 * @returns {Object} Full payroll breakdown
 */
export function calculatePayroll(
  emp,
  overtime = 0,
  bonus = 0,
  advance = 0,
  helb = 0,
  otherDeductions = 0
) {
  const basic = parseFloat(emp.salary) || 0;
  const house = parseFloat(emp.house) || 0;
  const transport = parseFloat(emp.transport) || 0;

  // ── Earnings ────────────────────────────────────────────
  const grossPay = basic + house + transport + bonus + overtime;

  // ── Before-Tax Deductions ──────────────────────────────
  const nssf = calculateNSSF(basic);
  const shif = calculateSHIF(grossPay);
  const housingLevy = calculateHousingLevy(grossPay);
  const totalBfTax = nssf.total + shif + housingLevy;

  // ── PAYE ──────────────────────────────────────────────
  const taxableIncome = Math.max(0, grossPay - nssf.total); // NSSF is pre-tax
  const { incomeTax, personalRelief, paye } = calculatePAYE(taxableIncome);

  // ── Gross After Tax ───────────────────────────────────
  const grossAfterTax = grossPay - totalBfTax - paye;

  // ── After-Tax Deductions ──────────────────────────────
  const totalAfTax = advance + helb + otherDeductions;

  // ── Net Pay ───────────────────────────────────────────
  const netPay = grossAfterTax - totalAfTax;

  return {
    basic,
    house,
    transport,
    bonus,
    overtime,
    grossPay,
    nssfTierI: nssf.tierI,
    nssfTierII: nssf.tierII,
    nssfTotal: nssf.total,
    shif,
    housingLevy,
    totalBfTax,
    taxableIncome,
    incomeTax,
    personalRelief,
    paye,
    grossAfterTax,
    advance,
    helb,
    otherDeductions,
    totalAfTax,
    netPay
  };
}

/**
 * Calculate annual projections from a monthly payroll result
 * @param {Object} monthlyCalc - Result from calculatePayroll
 * @returns {Object} Annual projections
 */
export function calculateAnnualProjections(monthlyCalc) {
  return {
    annualGrossPay: monthlyCalc.grossPay * 12,
    annualPAYE: monthlyCalc.paye * 12,
    annualNSSF: monthlyCalc.nssfTotal * 12,
    annualSHIF: monthlyCalc.shif * 12,
    annualHousingLevy: monthlyCalc.housingLevy * 12,
    annualNetPay: monthlyCalc.netPay * 12,
    annualTotalDeductions: (monthlyCalc.totalBfTax + monthlyCalc.paye + monthlyCalc.totalAfTax) * 12
  };
}

/**
 * Calculate employer costs (statutory employer contributions)
 * @param {Object} calc - Result from calculatePayroll
 * @returns {Object} Employer costs
 */
export function calculateEmployerCosts(calc) {
  // Employer NSSF matches employee
  const employerNSSF = calc.nssfTotal;
  // Employer SHIF matches employee
  const employerSHIF = calc.shif;
  // Employer Housing Levy matches employee
  const employerHousingLevy = calc.housingLevy;
  // Employer may provide other benefits
  const totalEmployerCost = calc.grossPay + employerNSSF + employerSHIF + employerHousingLevy;

  return {
    employerNSSF,
    employerSHIF,
    employerHousingLevy,
    totalEmployerCost
  };
}