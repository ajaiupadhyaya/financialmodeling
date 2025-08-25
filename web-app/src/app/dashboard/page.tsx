'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  CubeTransparentIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: MarketData[] = [
      { symbol: 'SPY', price: 442.38, change: 2.15, changePercent: 0.49 },
      { symbol: 'QQQ', price: 378.92, change: -1.24, changePercent: -0.33 },
      { symbol: 'IWM', price: 198.45, change: 0.87, changePercent: 0.44 },
      { symbol: 'VIX', price: 16.23, change: -0.45, changePercent: -2.70 },
    ];
    
    setTimeout(() => {
      setMarketData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-white">
              FinanceForge
            </Link>
            <div className="flex space-x-8 text-white/80">
              <Link href="/dashboard" className="text-white font-semibold">
                Dashboard
              </Link>
              <Link href="/models" className="hover:text-white transition-colors">
                Models
              </Link>
              <Link href="/analytics" className="hover:text-white transition-colors">
                Analytics
              </Link>
              <Link href="/reports" className="hover:text-white transition-colors">
                Reports
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Financial Dashboard</h1>
          <p className="text-white/70 text-lg">Real-time market data and analytics overview</p>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-8 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            marketData.map((item) => (
              <div key={item.symbol} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white/70 font-medium">{item.symbol}</h3>
                  {item.change > 0 ? (
                    <ArrowUpIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDownIcon className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${item.price.toFixed(2)}
                </div>
                <div className={`text-sm font-medium ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* DCF Model */}
          <Link href="/models/dcf" className="group">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors h-full">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DCF Valuation</h3>
              <p className="text-white/70 mb-4">Build comprehensive discounted cash flow models with sensitivity analysis</p>
              <div className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                Launch Model →
              </div>
            </div>
          </Link>

          {/* LBO Model */}
          <Link href="/models/lbo" className="group">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors h-full">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                <BanknotesIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">LBO Modeling</h3>
              <p className="text-white/70 mb-4">Analyze leveraged buyout deals with returns and credit metrics</p>
              <div className="text-green-400 font-medium group-hover:text-green-300 transition-colors">
                Launch Model →
              </div>
            </div>
          </Link>

          {/* Portfolio Analytics */}
          <Link href="/analytics/portfolio" className="group">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors h-full">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Portfolio Analytics</h3>
              <p className="text-white/70 mb-4">Optimize portfolios with modern portfolio theory and risk metrics</p>
              <div className="text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                Launch Analytics →
              </div>
            </div>
          </Link>

          {/* Risk Management */}
          <Link href="/analytics/risk" className="group">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors h-full">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
                <CubeTransparentIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Risk Management</h3>
              <p className="text-white/70 mb-4">Calculate VaR, stress testing, and Monte Carlo simulations</p>
              <div className="text-red-400 font-medium group-hover:text-red-300 transition-colors">
                Launch Risk Tools →
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Placeholder */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Market Performance</h3>
            <div className="h-64 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
              <div className="text-white/60 text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Interactive D3.js charts coming soon</p>
              </div>
            </div>
          </div>

          {/* Recent Models */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Recent Models</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">AAPL DCF Analysis</div>
                  <div className="text-white/60 text-sm">Updated 2 hours ago</div>
                </div>
                <Link href="/models/dcf?symbol=AAPL" className="text-blue-400 hover:text-blue-300 font-medium">
                  View →
                </Link>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">Tech LBO Model</div>
                  <div className="text-white/60 text-sm">Updated yesterday</div>
                </div>
                <Link href="/models/lbo" className="text-green-400 hover:text-green-300 font-medium">
                  View →
                </Link>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">Portfolio Risk Report</div>
                  <div className="text-white/60 text-sm">Updated 3 days ago</div>
                </div>
                <Link href="/analytics/risk" className="text-purple-400 hover:text-purple-300 font-medium">
                  View →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
