const math = require('mathjs');
const { Matrix } = require('ml-matrix');
const stats = require('simple-statistics');

class LBOModel {
  constructor(options = {}) {
    this.targetIRR = options.targetIRR || 0.20; // 20% target IRR
    this.holdPeriod = options.holdPeriod || 5;
    this.maxDebtMultiple = options.maxDebtMultiple || 6.0;
    this.minEquityContribution = options.minEquityContribution || 0.3; // 30% minimum equity
  }

  /**
   * Calculate LBO returns and metrics
   * @param {Object} dealParams - LBO deal parameters
   * @returns {Object} LBO analysis results
   */
  calculateLBO(dealParams) {
    try {
      const {
        enterpriseValue,
        ebitda,
        debtMultiple,
        revolver,
        termLoanA,
        termLoanB,
        subordinatedDebt,
        exitMultiple,
        revenueGrowth,
        ebitdaMargin,
        capexAsPercentOfRevenue,
        workingCapitalChange,
        fees
      } = dealParams;

      const results = {
        sourceAndUses: {},
        returns: {},
        creditMetrics: {},
        projections: [],
        sensitivities: {},
        keyMetrics: {}
      };

      // Sources and Uses
      const totalDebt = (revolver || 0) + (termLoanA || 0) + (termLoanB || 0) + (subordinatedDebt || 0);
      const equityContribution = enterpriseValue - totalDebt + (fees || 0);
      
      results.sourceAndUses = {
        sources: {
          revolver: revolver || 0,
          termLoanA: termLoanA || 0,
          termLoanB: termLoanB || 0,
          subordinatedDebt: subordinatedDebt || 0,
          totalDebt,
          equityContribution,
          totalSources: totalDebt + equityContribution
        },
        uses: {
          enterpriseValue,
          fees: fees || 0,
          totalUses: enterpriseValue + (fees || 0)
        }
      };

      // Financial Projections
      let currentRevenue = dealParams.baseRevenue || ebitda / (ebitdaMargin[0] || 0.2);
      let currentDebt = totalDebt;

      for (let year = 0; year <= this.holdPeriod; year++) {
        const revenue = year === 0 ? currentRevenue : currentRevenue * Math.pow(1 + revenueGrowth[year - 1], year);
        const ebitdaAmount = revenue * (ebitdaMargin[year] || ebitdaMargin[0]);
        const capex = revenue * (capexAsPercentOfRevenue[year] || 0.03);
        const depreciation = capex; // Simplified assumption
        const ebit = ebitdaAmount - depreciation;
        const interest = this.calculateInterestExpense(currentDebt, dealParams.interestRates || {});
        const ebt = ebit - interest;
        const taxes = Math.max(0, ebt * (dealParams.taxRate || 0.25));
        const netIncome = ebt - taxes;
        
        const freeCashFlow = netIncome + depreciation - capex - (workingCapitalChange[year] || 0);
        const debtPaydown = Math.max(0, freeCashFlow * (dealParams.debtPaydownRate || 0.5));
        const cashToSponsor = freeCashFlow - debtPaydown;
        
        currentDebt = Math.max(0, currentDebt - debtPaydown);

        results.projections.push({
          year,
          revenue,
          ebitda: ebitdaAmount,
          ebit,
          netIncome,
          freeCashFlow,
          debtBalance: currentDebt,
          debtPaydown,
          cashToSponsor,
          creditMetrics: {
            debtToEbitda: currentDebt / ebitdaAmount,
            ebitdaToInterest: ebitdaAmount / interest,
            fcfToDebt: freeCashFlow / currentDebt
          }
        });
      }

      // Exit Analysis
      const exitEbitda = results.projections[this.holdPeriod].ebitda;
      const exitEnterpriseValue = exitEbitda * exitMultiple;
      const exitDebt = results.projections[this.holdPeriod].debtBalance;
      const exitEquityValue = exitEnterpriseValue - exitDebt;
      
      // Return Calculations
      const totalCashDistributed = results.projections.slice(1).reduce((sum, p) => sum + p.cashToSponsor, 0);
      const totalCashReturned = totalCashDistributed + exitEquityValue;
      const totalMultiple = totalCashReturned / equityContribution;
      const irr = this.calculateIRR(equityContribution, results.projections.slice(1).map(p => p.cashToSponsor), exitEquityValue);

      results.returns = {
        entryEquity: equityContribution,
        exitEquityValue,
        totalCashDistributed,
        totalCashReturned,
        totalMultiple,
        irr,
        exitMultiple,
        exitEbitda
      };

      // Key Credit Metrics
      const maxDebtToEbitda = Math.max(...results.projections.map(p => p.creditMetrics.debtToEbitda));
      const minEbitdaToInterest = Math.min(...results.projections.map(p => p.creditMetrics.ebitdaToInterest));

      results.creditMetrics = {
        entryDebtToEbitda: totalDebt / ebitda,
        maxDebtToEbitda,
        minEbitdaToInterest,
        debtPaydownOverHoldPeriod: totalDebt - exitDebt,
        debtPaydownPercent: (totalDebt - exitDebt) / totalDebt
      };

      // Key Metrics Summary
      results.keyMetrics = {
        meetsTaxgetIRR: irr >= this.targetIRR,
        leverageWithinLimits: maxDebtToEbitda <= this.maxDebtMultiple,
        adequateEquityBuffer: (equityContribution / enterpriseValue) >= this.minEquityContribution,
        riskAdjustedReturn: irr / (maxDebtToEbitda / 6.0) // Risk-adjusted IRR
      };

      return results;
    } catch (error) {
      console.error('LBO calculation error:', error);
      throw new Error(`LBO calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate interest expense based on debt structure
   * @param {number} totalDebt - Total debt amount
   * @param {Object} interestRates - Interest rates by debt type
   * @returns {number} Total interest expense
   */
  calculateInterestExpense(totalDebt, interestRates) {
    // Simplified calculation - assumes even split or use rates provided
    const avgRate = interestRates.weighted || 
      (interestRates.termLoanA * 0.3 + interestRates.termLoanB * 0.5 + interestRates.subordinated * 0.2) || 
      0.08; // 8% default
    
    return totalDebt * avgRate;
  }

  /**
   * Calculate IRR using Newton-Raphson method
   * @param {number} initialInvestment - Initial equity investment
   * @param {Array} cashFlows - Annual cash flows
   * @param {number} terminalValue - Terminal cash flow
   * @returns {number} IRR
   */
  calculateIRR(initialInvestment, cashFlows, terminalValue) {
    const allCashFlows = [-initialInvestment, ...cashFlows];
    allCashFlows[allCashFlows.length - 1] += terminalValue;

    let rate = 0.15; // Starting guess
    let iteration = 0;
    const maxIterations = 1000;
    const tolerance = 1e-6;

    while (iteration < maxIterations) {
      let npv = 0;
      let npvDerivative = 0;

      for (let i = 0; i < allCashFlows.length; i++) {
        const denominator = Math.pow(1 + rate, i);
        npv += allCashFlows[i] / denominator;
        npvDerivative -= i * allCashFlows[i] / Math.pow(1 + rate, i + 1);
      }

      if (Math.abs(npv) < tolerance) break;

      if (Math.abs(npvDerivative) < tolerance) {
        throw new Error('IRR calculation failed: derivative too small');
      }

      rate = rate - npv / npvDerivative;
      iteration++;
    }

    if (iteration >= maxIterations) {
      throw new Error('IRR calculation failed: maximum iterations reached');
    }

    return rate;
  }

  /**
   * Perform sensitivity analysis on key variables
   * @param {Object} dealParams - Base deal parameters
   * @param {Object} sensitivityRanges - Ranges for sensitivity variables
   * @returns {Object} Sensitivity analysis results
   */
  sensitivityAnalysis(dealParams, sensitivityRanges = {}) {
    const exitMultiples = sensitivityRanges.exitMultiples || [8, 9, 10, 11, 12];
    const revenueGrowthRates = sensitivityRanges.revenueGrowthRates || [0.03, 0.05, 0.07, 0.09, 0.11];
    
    const results = [];

    for (const exitMultiple of exitMultiples) {
      for (const revenueGrowth of revenueGrowthRates) {
        const modifiedParams = {
          ...dealParams,
          exitMultiple,
          revenueGrowth: Array(this.holdPeriod).fill(revenueGrowth)
        };

        try {
          const lboResult = this.calculateLBO(modifiedParams);
          results.push({
            exitMultiple,
            revenueGrowth,
            irr: lboResult.returns.irr,
            totalMultiple: lboResult.returns.totalMultiple,
            maxLeverage: lboResult.creditMetrics.maxDebtToEbitda
          });
        } catch (error) {
          console.warn(`Sensitivity calculation failed for exit multiple ${exitMultiple}, growth ${revenueGrowth}:`, error.message);
        }
      }
    }

    return results;
  }

  /**
   * Monte Carlo simulation for LBO returns
   * @param {Object} dealParams - Base deal parameters
   * @param {Object} distributions - Probability distributions for key variables
   * @param {number} simulations - Number of simulations
   * @returns {Object} Monte Carlo results
   */
  monteCarioLBO(dealParams, distributions, simulations = 5000) {
    const results = [];

    for (let i = 0; i < simulations; i++) {
      try {
        const randomParams = this.generateRandomLBOParams(dealParams, distributions);
        const lboResult = this.calculateLBO(randomParams);
        
        results.push({
          irr: lboResult.returns.irr,
          totalMultiple: lboResult.returns.totalMultiple,
          maxLeverage: lboResult.creditMetrics.maxDebtToEbitda,
          exitEquityValue: lboResult.returns.exitEquityValue
        });
      } catch (error) {
        console.warn(`Monte Carlo simulation ${i} failed:`, error.message);
      }
    }

    // Calculate statistics
    const irrs = results.map(r => r.irr).filter(v => !isNaN(v));
    const multiples = results.map(r => r.totalMultiple).filter(v => !isNaN(v));
    const leverages = results.map(r => r.maxLeverage).filter(v => !isNaN(v));

    return {
      simulations: results.length,
      irr: {
        mean: stats.mean(irrs),
        median: stats.median(irrs),
        std: stats.standardDeviation(irrs),
        percentile10: stats.quantile(irrs, 0.1),
        percentile90: stats.quantile(irrs, 0.9)
      },
      multiple: {
        mean: stats.mean(multiples),
        median: stats.median(multiples),
        std: stats.standardDeviation(multiples),
        percentile10: stats.quantile(multiples, 0.1),
        percentile90: stats.quantile(multiples, 0.9)
      },
      maxLeverage: {
        mean: stats.mean(leverages),
        median: stats.median(leverages),
        std: stats.standardDeviation(leverages)
      },
      probabilityOfTargetIRR: irrs.filter(irr => irr >= this.targetIRR).length / irrs.length,
      results: results.slice(0, 100) // First 100 results for detailed analysis
    };
  }

  generateRandomLBOParams(baseParams, distributions) {
    const randomParams = { ...baseParams };
    
    // Generate random exit multiple
    if (distributions.exitMultiple) {
      randomParams.exitMultiple = this.normalRandom(
        distributions.exitMultiple.mean,
        distributions.exitMultiple.std
      );
    }
    
    // Generate random revenue growth
    if (distributions.revenueGrowth) {
      randomParams.revenueGrowth = Array(this.holdPeriod).fill(null).map(() =>
        this.normalRandom(
          distributions.revenueGrowth.mean,
          distributions.revenueGrowth.std
        )
      );
    }
    
    // Generate random EBITDA margins
    if (distributions.ebitdaMargin) {
      randomParams.ebitdaMargin = Array(this.holdPeriod + 1).fill(null).map(() =>
        this.normalRandom(
          distributions.ebitdaMargin.mean,
          distributions.ebitdaMargin.std
        )
      );
    }
    
    return randomParams;
  }

  normalRandom(mean, std) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * std;
  }
}

module.exports = LBOModel;
