const axios = require('axios');

class YahooFinanceAPI {
  constructor() {
    this.baseURL = 'https://query1.finance.yahoo.com';
  }

  async getQuote(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/v8/finance/quote`, {
        params: {
          symbols: symbol
        }
      });

      if (response.data && response.data.quoteResponse && response.data.quoteResponse.result) {
        return response.data.quoteResponse.result[0];
      }
      throw new Error(`No data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getHistoricalData(symbol, period1, period2, interval = '1d') {
    try {
      const response = await axios.get(`${this.baseURL}/v8/finance/chart/${symbol}`, {
        params: {
          period1,
          period2,
          interval,
          includeAdjustedClose: true
        }
      });

      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0];
        const timestamps = result.timestamp;
        const indicators = result.indicators.quote[0];
        const adjClose = result.indicators.adjclose ? result.indicators.adjclose[0].adjclose : null;

        return timestamps.map((timestamp, index) => ({
          date: new Date(timestamp * 1000),
          open: indicators.open[index],
          high: indicators.high[index],
          low: indicators.low[index],
          close: indicators.close[index],
          adjClose: adjClose ? adjClose[index] : indicators.close[index],
          volume: indicators.volume[index]
        })).filter(item => item.close !== null);
      }
      throw new Error(`No historical data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance historical data error for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getMultipleQuotes(symbols) {
    try {
      const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const response = await axios.get(`${this.baseURL}/v8/finance/quote`, {
        params: {
          symbols: symbolString
        }
      });

      if (response.data && response.data.quoteResponse && response.data.quoteResponse.result) {
        return response.data.quoteResponse.result;
      }
      return [];
    } catch (error) {
      console.error('Yahoo Finance multiple quotes error:', error.message);
      throw error;
    }
  }

  async getFinancials(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/v10/finance/quoteSummary/${symbol}`, {
        params: {
          modules: 'financialData,defaultKeyStatistics,summaryDetail,incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory'
        }
      });

      if (response.data && response.data.quoteSummary && response.data.quoteSummary.result) {
        return response.data.quoteSummary.result[0];
      }
      throw new Error(`No financial data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance financials error for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getEarnings(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/v10/finance/quoteSummary/${symbol}`, {
        params: {
          modules: 'earnings,earningsHistory,earningsTrend,calendarEvents'
        }
      });

      if (response.data && response.data.quoteSummary && response.data.quoteSummary.result) {
        return response.data.quoteSummary.result[0];
      }
      throw new Error(`No earnings data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance earnings error for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getOptionsChain(symbol, expiration = null) {
    try {
      const params = { symbol };
      if (expiration) {
        params.date = expiration;
      }

      const response = await axios.get(`${this.baseURL}/v7/finance/options/${symbol}`, {
        params
      });

      if (response.data && response.data.optionChain && response.data.optionChain.result) {
        return response.data.optionChain.result[0];
      }
      throw new Error(`No options data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance options error for ${symbol}:`, error.message);
      throw error;
    }
  }
}

module.exports = YahooFinanceAPI;
