const axios = require('axios');

class FREDApi {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.FRED_API_KEY;
    this.baseURL = 'https://api.stlouisfed.org/fred';
    
    if (!this.apiKey) {
      console.warn('FRED API key not provided. Some features may not work.');
    }
  }

  async request(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('FRED API key is required');
    }

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          ...params,
          api_key: this.apiKey,
          file_type: 'json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('FRED API error:', error.message);
      throw error;
    }
  }

  async getSeries(seriesId, startDate = null, endDate = null) {
    const params = { series_id: seriesId };
    if (startDate) params.observation_start = startDate;
    if (endDate) params.observation_end = endDate;

    const data = await this.request('/series/observations', params);
    
    return data.observations?.map(obs => ({
      date: new Date(obs.date),
      value: obs.value !== '.' ? parseFloat(obs.value) : null
    })) || [];
  }

  async getSeriesInfo(seriesId) {
    const data = await this.request('/series', { series_id: seriesId });
    return data.seriess ? data.seriess[0] : null;
  }

  async searchSeries(searchText, limit = 10) {
    const data = await this.request('/series/search', {
      search_text: searchText,
      limit
    });
    return data.seriess || [];
  }

  async getCategorySeries(categoryId, limit = 10) {
    const data = await this.request('/category/series', {
      category_id: categoryId,
      limit
    });
    return data.seriess || [];
  }

  // Economic indicators shortcuts
  async getGDP(startDate = null, endDate = null) {
    return this.getSeries('GDP', startDate, endDate);
  }

  async getUnemploymentRate(startDate = null, endDate = null) {
    return this.getSeries('UNRATE', startDate, endDate);
  }

  async getInflationRate(startDate = null, endDate = null) {
    return this.getSeries('CPIAUCSL', startDate, endDate);
  }

  async getFederalFundsRate(startDate = null, endDate = null) {
    return this.getSeries('FEDFUNDS', startDate, endDate);
  }

  async get10YearTreasury(startDate = null, endDate = null) {
    return this.getSeries('GS10', startDate, endDate);
  }

  async get2YearTreasury(startDate = null, endDate = null) {
    return this.getSeries('GS2', startDate, endDate);
  }

  async getYieldCurve(startDate = null, endDate = null) {
    const yields = await Promise.all([
      this.getSeries('GS3M', startDate, endDate),  // 3-month
      this.getSeries('GS6M', startDate, endDate),  // 6-month
      this.getSeries('GS1', startDate, endDate),   // 1-year
      this.getSeries('GS2', startDate, endDate),   // 2-year
      this.getSeries('GS3', startDate, endDate),   // 3-year
      this.getSeries('GS5', startDate, endDate),   // 5-year
      this.getSeries('GS7', startDate, endDate),   // 7-year
      this.getSeries('GS10', startDate, endDate),  // 10-year
      this.getSeries('GS20', startDate, endDate),  // 20-year
      this.getSeries('GS30', startDate, endDate),  // 30-year
    ]);

    const maturities = ['3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'];
    
    // Combine all yield series by date
    const dateMap = new Map();
    
    yields.forEach((series, index) => {
      const maturity = maturities[index];
      series.forEach(point => {
        const dateKey = point.date.toISOString().split('T')[0];
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: point.date, yields: {} });
        }
        dateMap.get(dateKey).yields[maturity] = point.value;
      });
    });

    return Array.from(dateMap.values())
      .sort((a, b) => a.date - b.date)
      .filter(item => Object.keys(item.yields).length > 0);
  }

  async getConsumerSentiment(startDate = null, endDate = null) {
    return this.getSeries('UMCSENT', startDate, endDate);
  }

  async getIndustrialProduction(startDate = null, endDate = null) {
    return this.getSeries('INDPRO', startDate, endDate);
  }

  async getHousingStarts(startDate = null, endDate = null) {
    return this.getSeries('HOUST', startDate, endDate);
  }

  async getRetailSales(startDate = null, endDate = null) {
    return this.getSeries('RSAFS', startDate, endDate);
  }

  async getDollarIndex(startDate = null, endDate = null) {
    return this.getSeries('DTWEXBGS', startDate, endDate);
  }

  async getOilPrices(startDate = null, endDate = null) {
    return this.getSeries('DCOILWTICO', startDate, endDate);
  }

  async getGoldPrices(startDate = null, endDate = null) {
    return this.getSeries('GOLDAMGBD228NLBM', startDate, endDate);
  }

  async getVIX(startDate = null, endDate = null) {
    return this.getSeries('VIXCLS', startDate, endDate);
  }

  async getEconomicDashboard(startDate = null, endDate = null) {
    const indicators = await Promise.all([
      this.getGDP(startDate, endDate),
      this.getUnemploymentRate(startDate, endDate),
      this.getInflationRate(startDate, endDate),
      this.getFederalFundsRate(startDate, endDate),
      this.get10YearTreasury(startDate, endDate),
      this.getConsumerSentiment(startDate, endDate),
      this.getIndustrialProduction(startDate, endDate),
      this.getVIX(startDate, endDate)
    ]);

    return {
      GDP: indicators[0],
      unemploymentRate: indicators[1],
      inflationRate: indicators[2],
      federalFundsRate: indicators[3],
      treasury10Y: indicators[4],
      consumerSentiment: indicators[5],
      industrialProduction: indicators[6],
      VIX: indicators[7]
    };
  }
}

module.exports = FREDApi;
