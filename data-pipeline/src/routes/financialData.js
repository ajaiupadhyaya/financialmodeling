const express = require('express');
const router = express.Router();
const YahooFinanceAPI = require('../apis/yahooFinance');
const AlphaVantageAPI = require('../apis/alphaVantage');

const yahooAPI = new YahooFinanceAPI();
const alphaAPI = new AlphaVantageAPI();

// Get company financial statements
router.get('/financials/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const financials = await yahooAPI.getFinancials(symbol.toUpperCase());
    res.json({ success: true, data: financials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get company overview from Alpha Vantage
router.get('/overview/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const overview = await alphaAPI.getCompanyOverview(symbol.toUpperCase());
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get income statement
router.get('/income-statement/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const incomeStatement = await alphaAPI.getIncomeStatement(symbol.toUpperCase());
    res.json({ success: true, data: incomeStatement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get balance sheet
router.get('/balance-sheet/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const balanceSheet = await alphaAPI.getBalanceSheet(symbol.toUpperCase());
    res.json({ success: true, data: balanceSheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cash flow statement
router.get('/cash-flow/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cashFlow = await alphaAPI.getCashFlow(symbol.toUpperCase());
    res.json({ success: true, data: cashFlow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get earnings data
router.get('/earnings/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get earnings from both sources and combine
    const [yahooEarnings, alphaEarnings] = await Promise.allSettled([
      yahooAPI.getEarnings(symbol.toUpperCase()),
      alphaAPI.getEarnings(symbol.toUpperCase())
    ]);

    const earnings = {
      yahoo: yahooEarnings.status === 'fulfilled' ? yahooEarnings.value : null,
      alphavantage: alphaEarnings.status === 'fulfilled' ? alphaEarnings.value : null
    };

    res.json({ success: true, data: earnings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive financial analysis
router.get('/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params.symbol.toUpperCase();
    
    // Fetch multiple data sources in parallel
    const [
      financials,
      overview,
      incomeStatement,
      balanceSheet,
      cashFlow,
      earnings
    ] = await Promise.allSettled([
      yahooAPI.getFinancials(symbol),
      alphaAPI.getCompanyOverview(symbol),
      alphaAPI.getIncomeStatement(symbol),
      alphaAPI.getBalanceSheet(symbol),
      alphaAPI.getCashFlow(symbol),
      yahooAPI.getEarnings(symbol)
    ]);

    const analysis = {
      symbol,
      timestamp: new Date().toISOString(),
      financials: financials.status === 'fulfilled' ? financials.value : null,
      overview: overview.status === 'fulfilled' ? overview.value : null,
      statements: {
        income: incomeStatement.status === 'fulfilled' ? incomeStatement.value : null,
        balance: balanceSheet.status === 'fulfilled' ? balanceSheet.value : null,
        cashFlow: cashFlow.status === 'fulfilled' ? cashFlow.value : null
      },
      earnings: earnings.status === 'fulfilled' ? earnings.value : null
    };

    // Calculate basic financial ratios if data is available
    if (analysis.financials && analysis.financials.financialData) {
      const fd = analysis.financials.financialData;
      analysis.ratios = {
        peRatio: fd.trailingPE?.raw || null,
        pegRatio: fd.pegRatio?.raw || null,
        priceToBook: fd.priceToBook?.raw || null,
        priceToSales: fd.priceToSalesTrailing12Months?.raw || null,
        debtToEquity: fd.debtToEquity?.raw || null,
        returnOnEquity: fd.returnOnEquity?.raw || null,
        returnOnAssets: fd.returnOnAssets?.raw || null,
        profitMargins: fd.profitMargins?.raw || null,
        operatingMargins: fd.operatingMargins?.raw || null,
        grossMargins: fd.grossMargins?.raw || null
      };
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get peer comparison data
router.post('/peer-comparison', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Symbols array is required and must not be empty' 
      });
    }

    const comparisons = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const [financials, overview] = await Promise.allSettled([
          yahooAPI.getFinancials(symbol.toUpperCase()),
          alphaAPI.getCompanyOverview(symbol.toUpperCase())
        ]);

        return {
          symbol: symbol.toUpperCase(),
          financials: financials.status === 'fulfilled' ? financials.value : null,
          overview: overview.status === 'fulfilled' ? overview.value : null
        };
      })
    );

    const validComparisons = comparisons
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    res.json({ success: true, data: validComparisons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dividend history
router.get('/dividends/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate } = req.query;
    
    // This would require additional API integration or web scraping
    // For now, return dividend data from Yahoo financials
    const financials = await yahooAPI.getFinancials(symbol.toUpperCase());
    
    const dividendData = {
      symbol: symbol.toUpperCase(),
      dividendYield: financials.summaryDetail?.dividendYield || null,
      dividendRate: financials.summaryDetail?.dividendRate || null,
      payoutRatio: financials.summaryDetail?.payoutRatio || null,
      exDividendDate: financials.summaryDetail?.exDividendDate || null,
      lastDividendValue: financials.summaryDetail?.lastDividendValue || null
    };

    res.json({ success: true, data: dividendData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
