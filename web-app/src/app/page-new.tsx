import Link from "next/link";
import { ArrowRightIcon, ChartBarIcon, CubeTransparentIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-white">
              FinanceForge
            </div>
            <div className="hidden md:flex space-x-8 text-white/80">
              <Link href="/dashboard" className="hover:text-white transition-colors">
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

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Wall Street-Level
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Financial Modeling
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Advanced quantitative analytics, interactive visualizations, and comprehensive 
              financial models powered by real-time market data and machine learning.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/dashboard" 
              className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
            >
              Launch Platform
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/demo" 
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Financial Models */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Advanced Models</h3>
            <ul className="text-white/80 space-y-2 text-lg">
              <li>• DCF Valuation</li>
              <li>• LBO Modeling</li>
              <li>• M&A Analysis</li>
              <li>• Options Pricing</li>
              <li>• Credit Risk Models</li>
            </ul>
          </div>

          {/* Analytics */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
              <CubeTransparentIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Quantitative Analytics</h3>
            <ul className="text-white/80 space-y-2 text-lg">
              <li>• Monte Carlo Simulation</li>
              <li>• Portfolio Optimization</li>
              <li>• Risk Management (VaR)</li>
              <li>• Time Series Forecasting</li>
              <li>• Machine Learning Models</li>
            </ul>
          </div>

          {/* Data & Visualizations */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
              <BanknotesIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Data & Reporting</h3>
            <ul className="text-white/80 space-y-2 text-lg">
              <li>• Real-time Market Data</li>
              <li>• Interactive D3.js Charts</li>
              <li>• Excel Integration</li>
              <li>• PDF Report Generation</li>
              <li>• Economic Indicators</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Built with Enterprise Technology</h2>
            <p className="text-xl text-white/80">Modern stack optimized for performance and reliability</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-2">Next.js 14</div>
              <div>React Framework</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-2">D3.js</div>
              <div>Data Visualization</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-2">TypeScript</div>
              <div>Type Safety</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-2">Real-time APIs</div>
              <div>Market Data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white/60">
            <p className="text-lg">Built to showcase advanced financial modeling capabilities</p>
            <p className="mt-2">© 2025 FinanceForge - Portfolio Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
