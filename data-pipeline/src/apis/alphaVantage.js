const axios = require('axios');

class AlphaVantageAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.ALPHA_VANTAGE_API_KEY;
    this.baseURL = 'https://www.alphavantage.co/query';
    
    if (!this.apiKey) {
      console.warn('Alpha Vantage API key not provided. Some features may not work.');
    }
  }

  async request(params) {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key is required');
    }

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          ...params,
          apikey: this.apiKey
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        throw new Error('API rate limit reached. Please wait before making another request.');
      }

      return response.data;
    } catch (error) {
      console.error('Alpha Vantage API error:', error.message);
      throw error;
    }
  }

  async getIntradayData(symbol, interval = '5min') {
    const data = await this.request({
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval
    });

    const timeSeriesKey = `Time Series (${interval})`;
    if (!data[timeSeriesKey]) {
      throw new Error('Invalid response format for intraday data');
    }

    return this.formatTimeSeriesData(data[timeSeriesKey]);
  }

  async getDailyData(symbol) {
    const data = await this.request({
      function: 'TIME_SERIES_DAILY',
      symbol
    });

    if (!data['Time Series (Daily)']) {
      throw new Error('Invalid response format for daily data');
    }

    return this.formatTimeSeriesData(data['Time Series (Daily)']);
  }

  async getWeeklyData(symbol) {
    const data = await this.request({
      function: 'TIME_SERIES_WEEKLY',
      symbol
    });

    if (!data['Weekly Time Series']) {
      throw new Error('Invalid response format for weekly data');
    }

    return this.formatTimeSeriesData(data['Weekly Time Series']);
  }

  async getMonthlyData(symbol) {
    const data = await this.request({
      function: 'TIME_SERIES_MONTHLY',
      symbol
    });

    if (!data['Monthly Time Series']) {
      throw new Error('Invalid response format for monthly data');
    }

    return this.formatTimeSeriesData(data['Monthly Time Series']);
  }

  async getCompanyOverview(symbol) {
    const data = await this.request({
      function: 'OVERVIEW',
      symbol
    });

    return data;
  }

  async getIncomeStatement(symbol) {
    const data = await this.request({
      function: 'INCOME_STATEMENT',
      symbol
    });

    return data;
  }

  async getBalanceSheet(symbol) {
    const data = await this.request({
      function: 'BALANCE_SHEET',
      symbol
    });

    return data;
  }

  async getCashFlow(symbol) {
    const data = await this.request({
      function: 'CASH_FLOW',
      symbol
    });

    return data;
  }

  async getEarnings(symbol) {
    const data = await this.request({
      function: 'EARNINGS',
      symbol
    });

    return data;
  }

  async getTechnicalIndicator(symbol, indicator, interval = 'daily', params = {}) {
    const data = await this.request({
      function: indicator,
      symbol,
      interval,
      ...params
    });

    return data;
  }

  async getSMA(symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') {
    return this.getTechnicalIndicator(symbol, 'SMA', interval, {
      time_period: timePeriod,
      series_type: seriesType
    });
  }

  async getEMA(symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') {
    return this.getTechnicalIndicator(symbol, 'EMA', interval, {
      time_period: timePeriod,
      series_type: seriesType
    });
  }

  async getRSI(symbol, interval = 'daily', timePeriod = 14, seriesType = 'close') {
    return this.getTechnicalIndicator(symbol, 'RSI', interval, {
      time_period: timePeriod,
      series_type: seriesType
    });
  }

  async getMACD(symbol, interval = 'daily', seriesType = 'close') {
    return this.getTechnicalIndicator(symbol, 'MACD', interval, {
      series_type: seriesType
    });
  }

  async getBollingerBands(symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') {
    return this.getTechnicalIndicator(symbol, 'BBANDS', interval, {
      time_period: timePeriod,
      series_type: seriesType
    });
  }

  async getForexData(fromSymbol, toSymbol, interval = '5min') {
    const data = await this.request({
      function: 'FX_INTRADAY',
      from_symbol: fromSymbol,
      to_symbol: toSymbol,
      interval
    });

    const timeSeriesKey = `Time Series FX (${interval})`;
    if (!data[timeSeriesKey]) {
      throw new Error('Invalid response format for forex data');
    }

    return this.formatTimeSeriesData(data[timeSeriesKey]);
  }

  async getCryptoData(symbol, market = 'USD', interval = '5min') {
    const data = await this.request({
      function: 'CRYPTO_INTRADAY',
      symbol,
      market,
      interval
    });

    const timeSeriesKey = `Time Series Crypto (${interval})`;
    if (!data[timeSeriesKey]) {
      throw new Error('Invalid response format for crypto data');
    }

    return this.formatTimeSeriesData(data[timeSeriesKey]);
  }

  formatTimeSeriesData(timeSeriesData) {
    return Object.keys(timeSeriesData)
      .map(date => ({
        date: new Date(date),
        open: parseFloat(timeSeriesData[date]['1. open']),
        high: parseFloat(timeSeriesData[date]['2. high']),
        low: parseFloat(timeSeriesData[date]['3. low']),
        close: parseFloat(timeSeriesData[date]['4. close']),
        volume: timeSeriesData[date]['5. volume'] ? parseInt(timeSeriesData[date]['5. volume']) : null
      }))
      .sort((a, b) => a.date - b.date);
  }
}

module.exports = AlphaVantageAPI;
