const express = require('express');
const router = express.Router();
const YahooFinanceAPI = require('../apis/yahooFinance');
const AlphaVantageAPI = require('../apis/alphaVantage');

const yahooAPI = new YahooFinanceAPI();
const alphaAPI = new AlphaVantageAPI();

// Get real-time quote for a single stock
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooAPI.getQuote(symbol.toUpperCase());
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get multiple quotes
router.post('/quotes', async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ success: false, error: 'Symbols array is required' });
    }
    
    const quotes = await yahooAPI.getMultipleQuotes(symbols.map(s => s.toUpperCase()));
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get historical data
router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period1, period2, interval = '1d' } = req.query;
    
    if (!period1 || !period2) {
      return res.status(400).json({ 
        success: false, 
        error: 'period1 and period2 parameters are required (Unix timestamps)' 
      });
    }

    const historicalData = await yahooAPI.getHistoricalData(
      symbol.toUpperCase(), 
      parseInt(period1), 
      parseInt(period2), 
      interval
    );
    
    res.json({ success: true, data: historicalData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get intraday data from Alpha Vantage
router.get('/intraday/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '5min' } = req.query;
    
    const intradayData = await alphaAPI.getIntradayData(symbol.toUpperCase(), interval);
    res.json({ success: true, data: intradayData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get options chain
router.get('/options/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { expiration } = req.query;
    
    const optionsData = await yahooAPI.getOptionsChain(symbol.toUpperCase(), expiration);
    res.json({ success: true, data: optionsData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get technical indicators from Alpha Vantage
router.get('/technical/:symbol/:indicator', async (req, res) => {
  try {
    const { symbol, indicator } = req.params;
    const { interval = 'daily', ...params } = req.query;
    
    let technicalData;
    switch (indicator.toUpperCase()) {
      case 'SMA':
        technicalData = await alphaAPI.getSMA(symbol, interval, params.timePeriod, params.seriesType);
        break;
      case 'EMA':
        technicalData = await alphaAPI.getEMA(symbol, interval, params.timePeriod, params.seriesType);
        break;
      case 'RSI':
        technicalData = await alphaAPI.getRSI(symbol, interval, params.timePeriod, params.seriesType);
        break;
      case 'MACD':
        technicalData = await alphaAPI.getMACD(symbol, interval, params.seriesType);
        break;
      case 'BBANDS':
        technicalData = await alphaAPI.getBollingerBands(symbol, interval, params.timePeriod, params.seriesType);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported technical indicator. Supported: SMA, EMA, RSI, MACD, BBANDS' 
        });
    }
    
    res.json({ success: true, data: technicalData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get forex data
router.get('/forex/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    const { interval = '5min' } = req.query;
    
    const forexData = await alphaAPI.getForexData(from.toUpperCase(), to.toUpperCase(), interval);
    res.json({ success: true, data: forexData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get crypto data
router.get('/crypto/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { market = 'USD', interval = '5min' } = req.query;
    
    const cryptoData = await alphaAPI.getCryptoData(symbol.toUpperCase(), market.toUpperCase(), interval);
    res.json({ success: true, data: cryptoData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get market overview
router.get('/overview', async (req, res) => {
  try {
    const majorIndices = ['SPY', 'QQQ', 'IWM', 'DIA', 'VIX'];
    const quotes = await yahooAPI.getMultipleQuotes(majorIndices);
    
    const overview = {
      indices: quotes,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN' // This could be enhanced with market hours logic
    };
    
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
