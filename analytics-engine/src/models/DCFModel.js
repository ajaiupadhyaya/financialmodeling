const math = require('mathjs');
const { Matrix } = require('ml-matrix');
const stats = require('simple-statistics');

class DCFModel {
  constructor(options = {}) {
    this.discountRate = options.discountRate || 0.10; // 10% WACC default
    this.terminalGrowthRate = options.terminalGrowthRate || 0.025; // 2.5% terminal growth
    this.projectionYears = options.projectionYears || 5;
    this.taxRate = options.taxRate || 0.25; // 25% tax rate
  }

  /**
   * Calculate DCF valuation for a company
   * @param {Object} financialData - Company financial data
   * @param {Object} projections - Revenue and margin projections
   * @returns {Object} DCF valuation results
   */
  calculateDCF(financialData, projections) {
    try {
      const results = {
        projectedCashFlows: [],
        terminalValue: 0,
        presentValue: 0,
        sharesOutstanding: financialData.sharesOutstanding || 0,
        intrinsicValue: 0,
        currentPrice: financialData.currentPrice || 0,
        upside: 0,
        assumptions: {
          discountRate: this.discountRate,
          terminalGrowthRate: this.terminalGrowthRate,
          projectionYears: this.projectionYears,
          taxRate: this.taxRate
        }
      };

      // Calculate projected cash flows
      let lastRevenue = financialData.revenue || 0;
      let totalPV = 0;

      for (let year = 1; year <= this.projectionYears; year++) {
        const revenueGrowth = projections.revenueGrowth[year - 1] || 0;
        const revenue = lastRevenue * (1 + revenueGrowth);
        const ebitda = revenue * (projections.ebitdaMargin[year - 1] || 0.15);
        const ebit = ebitda - (projections.depreciation[year - 1] || revenue * 0.03);
        const tax = ebit * this.taxRate;
        const nopat = ebit - tax;
        const capex = projections.capex[year - 1] || revenue * 0.04;
        const workingCapitalChange = projections.workingCapitalChange[year - 1] || 0;
        
        const freeCashFlow = nopat + (projections.depreciation[year - 1] || revenue * 0.03) - capex - workingCapitalChange;
        const presentValue = freeCashFlow / Math.pow(1 + this.discountRate, year);
        
        results.projectedCashFlows.push({
          year,
          revenue,
          ebitda,
          ebit,
          nopat,
          freeCashFlow,
          presentValue
        });

        totalPV += presentValue;
        lastRevenue = revenue;
      }

      // Calculate terminal value
      const terminalCashFlow = results.projectedCashFlows[this.projectionYears - 1].freeCashFlow * (1 + this.terminalGrowthRate);
      const terminalValue = terminalCashFlow / (this.discountRate - this.terminalGrowthRate);
      const terminalPV = terminalValue / Math.pow(1 + this.discountRate, this.projectionYears);

      results.terminalValue = terminalValue;
      results.presentValue = totalPV + terminalPV;
      
      if (results.sharesOutstanding > 0) {
        results.intrinsicValue = results.presentValue / results.sharesOutstanding;
        if (results.currentPrice > 0) {
          results.upside = (results.intrinsicValue - results.currentPrice) / results.currentPrice;
        }
      }

      return results;
    } catch (error) {
      console.error('DCF calculation error:', error);
      throw new Error(`DCF calculation failed: ${error.message}`);
    }
  }

  /**
   * Perform sensitivity analysis on key assumptions
   * @param {Object} financialData - Company financial data
   * @param {Object} projections - Revenue and margin projections
   * @param {Object} sensitivityRanges - Ranges for sensitivity analysis
   * @returns {Object} Sensitivity analysis results
   */
  sensitivityAnalysis(financialData, projections, sensitivityRanges = {}) {
    const discountRates = sensitivityRanges.discountRates || [0.08, 0.09, 0.10, 0.11, 0.12];
    const terminalGrowthRates = sensitivityRanges.terminalGrowthRates || [0.015, 0.020, 0.025, 0.030, 0.035];
    
    const results = [];
    
    for (const discountRate of discountRates) {
      for (const terminalGrowthRate of terminalGrowthRates) {
        const originalDiscount = this.discountRate;
        const originalTerminal = this.terminalGrowthRate;
        
        this.discountRate = discountRate;
        this.terminalGrowthRate = terminalGrowthRate;
        
        const dcfResult = this.calculateDCF(financialData, projections);
        
        results.push({
          discountRate,
          terminalGrowthRate,
          intrinsicValue: dcfResult.intrinsicValue,
          upside: dcfResult.upside
        });
        
        // Restore original values
        this.discountRate = originalDiscount;
        this.terminalGrowthRate = originalTerminal;
      }
    }
    
    return results;
  }

  /**
   * Monte Carlo simulation for DCF valuation
   * @param {Object} financialData - Company financial data
   * @param {Object} projections - Revenue and margin projections with distributions
   * @param {number} simulations - Number of simulations to run
   * @returns {Object} Monte Carlo simulation results
   */
  monteCarloDCF(financialData, projections, simulations = 10000) {
    const results = [];
    
    for (let i = 0; i < simulations; i++) {
      // Generate random projections based on distributions
      const randomProjections = this.generateRandomProjections(projections);
      
      // Random discount rate and terminal growth rate
      const randomDiscountRate = this.discountRate + (Math.random() - 0.5) * 0.04; // ±2%
      const randomTerminalGrowth = this.terminalGrowthRate + (Math.random() - 0.5) * 0.02; // ±1%
      
      const originalDiscount = this.discountRate;
      const originalTerminal = this.terminalGrowthRate;
      
      this.discountRate = Math.max(0.05, randomDiscountRate); // Minimum 5%
      this.terminalGrowthRate = Math.max(0, Math.min(0.05, randomTerminalGrowth)); // 0-5%
      
      try {
        const dcfResult = this.calculateDCF(financialData, randomProjections);
        results.push({
          intrinsicValue: dcfResult.intrinsicValue,
          upside: dcfResult.upside,
          presentValue: dcfResult.presentValue
        });
      } catch (error) {
        // Skip failed simulations
        console.warn(`Simulation ${i} failed:`, error.message);
      }
      
      // Restore original values
      this.discountRate = originalDiscount;
      this.terminalGrowthRate = originalTerminal;
    }
    
    // Calculate statistics
    const intrinsicValues = results.map(r => r.intrinsicValue).filter(v => v > 0);
    const upsides = results.map(r => r.upside).filter(v => !isNaN(v));
    
    return {
      simulations: results.length,
      intrinsicValue: {
        mean: stats.mean(intrinsicValues),
        median: stats.median(intrinsicValues),
        std: stats.standardDeviation(intrinsicValues),
        percentile10: stats.quantile(intrinsicValues, 0.1),
        percentile90: stats.quantile(intrinsicValues, 0.9),
        min: Math.min(...intrinsicValues),
        max: Math.max(...intrinsicValues)
      },
      upside: {
        mean: stats.mean(upsides),
        median: stats.median(upsides),
        std: stats.standardDeviation(upsides),
        percentile10: stats.quantile(upsides, 0.1),
        percentile90: stats.quantile(upsides, 0.9)
      },
      probabilityOfPositiveUpside: upsides.filter(u => u > 0).length / upsides.length,
      results: results.slice(0, 100) // Return first 100 results for analysis
    };
  }

  generateRandomProjections(projections) {
    const randomProjections = {
      revenueGrowth: [],
      ebitdaMargin: [],
      depreciation: [],
      capex: [],
      workingCapitalChange: []
    };
    
    for (let year = 0; year < this.projectionYears; year++) {
      // Generate random values based on mean and standard deviation
      randomProjections.revenueGrowth.push(
        this.normalRandom(projections.revenueGrowth[year] || 0.05, 0.02)
      );
      randomProjections.ebitdaMargin.push(
        this.normalRandom(projections.ebitdaMargin[year] || 0.15, 0.03)
      );
      randomProjections.depreciation.push(
        Math.abs(this.normalRandom(projections.depreciation[year] || 0, 0.01))
      );
      randomProjections.capex.push(
        Math.abs(this.normalRandom(projections.capex[year] || 0, 0.01))
      );
      randomProjections.workingCapitalChange.push(
        this.normalRandom(projections.workingCapitalChange[year] || 0, 0.005)
      );
    }
    
    return randomProjections;
  }

  normalRandom(mean, std) {
    // Box-Muller transformation for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * std;
  }

  /**
   * Calculate WACC (Weighted Average Cost of Capital)
   * @param {Object} params - WACC calculation parameters
   * @returns {number} WACC
   */
  calculateWACC(params) {
    const {
      marketValueEquity,
      marketValueDebt,
      costOfEquity,
      costOfDebt,
      taxRate
    } = params;

    const totalValue = marketValueEquity + marketValueDebt;
    const equityWeight = marketValueEquity / totalValue;
    const debtWeight = marketValueDebt / totalValue;

    return equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate);
  }

  /**
   * Calculate Cost of Equity using CAPM
   * @param {Object} params - CAPM parameters
   * @returns {number} Cost of equity
   */
  calculateCostOfEquity(params) {
    const { riskFreeRate, beta, marketRiskPremium } = params;
    return riskFreeRate + beta * marketRiskPremium;
  }
}

module.exports = DCFModel;
