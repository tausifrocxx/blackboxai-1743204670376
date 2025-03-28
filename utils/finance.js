/**
 * Calculate EMI (Equated Monthly Installment)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (e.g., 0.085 for 8.5%)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {Object} - Payment details including EMI, total interest, and payment schedule
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12;
  const emi = principal * monthlyRate * 
    Math.pow(1 + monthlyRate, tenureMonths) / 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  
  // Generate payment schedule
  let balance = principal;
  const schedule = [];
  
  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    
    schedule.push({
      month,
      payment: emi,
      principal: principalPaid,
      interest,
      balance: balance > 0 ? balance : 0
    });
  }
  
  return {
    emi,
    totalInterest,
    totalPayment,
    schedule
  };
}

/**
 * Calculate down payment amount
 * @param {number} vehiclePrice - Total vehicle price
 * @param {number} downPaymentPercent - Down payment percentage (e.g., 15 for 15%)
 * @returns {Object} - Down payment details
 */
function calculateDownPayment(vehiclePrice, downPaymentPercent) {
  const downPayment = vehiclePrice * (downPaymentPercent / 100);
  const loanAmount = vehiclePrice - downPayment;
  
  return {
    downPayment,
    loanAmount,
    downPaymentPercent
  };
}

/**
 * Calculate insurance premium
 * @param {number} vehiclePrice - Total vehicle price
 * @param {number} insuranceType - 1: Comprehensive, 2: Third Party
 * @param {number} noClaimBonus - No claim bonus percentage (0-50)
 * @returns {number} - Annual insurance premium
 */
function calculateInsurance(vehiclePrice, insuranceType = 1, noClaimBonus = 0) {
  const baseRate = insuranceType === 1 ? 0.03 : 0.015; // 3% or 1.5%
  const premium = vehiclePrice * baseRate;
  return premium * (1 - (noClaimBonus / 100));
}

module.exports = {
  calculateEMI,
  calculateDownPayment,
  calculateInsurance
};