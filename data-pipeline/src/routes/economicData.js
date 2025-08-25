const express = require('express');
const router = express.Router();
const FREDApi = require('../apis/fred');

const fredAPI = new FREDApi();

// Get economic dashboard with key indicators
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dashboard = await fredAPI.getEconomicDashboard(startDate, endDate);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get GDP data
router.get('/gdp', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const gdpData = await fredAPI.getGDP(startDate, endDate);
    res.json({ success: true, data: gdpData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get unemployment rate
router.get('/unemployment', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const unemploymentData = await fredAPI.getUnemploymentRate(startDate, endDate);
    res.json({ success: true, data: unemploymentData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inflation rate
router.get('/inflation', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const inflationData = await fredAPI.getInflationRate(startDate, endDate);
    res.json({ success: true, data: inflationData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get interest rates
router.get('/interest-rates', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const [fedFunds, treasury2Y, treasury10Y] = await Promise.all([
      fredAPI.getFederalFundsRate(startDate, endDate),
      fredAPI.get2YearTreasury(startDate, endDate),
      fredAPI.get10YearTreasury(startDate, endDate)
    ]);

    const interestRates = {
      federalFundsRate: fedFunds,
      treasury2Y,
      treasury10Y
    };

    res.json({ success: true, data: interestRates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get yield curve
router.get('/yield-curve', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const yieldCurve = await fredAPI.getYieldCurve(startDate, endDate);
    res.json({ success: true, data: yieldCurve });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get consumer sentiment
router.get('/consumer-sentiment', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const sentimentData = await fredAPI.getConsumerSentiment(startDate, endDate);
    res.json({ success: true, data: sentimentData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get industrial production
router.get('/industrial-production', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const productionData = await fredAPI.getIndustrialProduction(startDate, endDate);
    res.json({ success: true, data: productionData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get housing data
router.get('/housing-starts', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const housingData = await fredAPI.getHousingStarts(startDate, endDate);
    res.json({ success: true, data: housingData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get retail sales
router.get('/retail-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const retailData = await fredAPI.getRetailSales(startDate, endDate);
    res.json({ success: true, data: retailData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dollar index
router.get('/dollar-index', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dollarData = await fredAPI.getDollarIndex(startDate, endDate);
    res.json({ success: true, data: dollarData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get commodity prices
router.get('/commodities', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const [oil, gold] = await Promise.all([
      fredAPI.getOilPrices(startDate, endDate),
      fredAPI.getGoldPrices(startDate, endDate)
    ]);

    const commodities = {
      oil,
      gold
    };

    res.json({ success: true, data: commodities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get VIX data
router.get('/vix', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const vixData = await fredAPI.getVIX(startDate, endDate);
    res.json({ success: true, data: vixData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search for FRED series
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query parameter is required' 
      });
    }

    const searchResults = await fredAPI.searchSeries(query, parseInt(limit));
    res.json({ success: true, data: searchResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get custom FRED series
router.get('/series/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { startDate, endDate } = req.query;
    
    const [seriesData, seriesInfo] = await Promise.all([
      fredAPI.getSeries(seriesId, startDate, endDate),
      fredAPI.getSeriesInfo(seriesId)
    ]);

    res.json({ 
      success: true, 
      data: {
        info: seriesInfo,
        observations: seriesData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
