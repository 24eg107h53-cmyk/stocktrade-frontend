import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { stockService } from '../services/api';
import { StockCard } from '../components/StockCard';
import { TradeModal } from '../components/TradeModal';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const fetchStocks = async () => {
    try {
      const res = await stockService.getAllStocks();
      setStocks(res.data);
    } catch (err) {
      console.error('Failed to load stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleOpenTrade = (stock, mode) => {
    setSelectedStock(stock);
    setTradeMode(mode);
    setIsTradeOpen(true);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Live Market Ticker Tape */}
      {stocks.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-800 overflow-hidden py-2.5">
          <div className="flex animate-ticker gap-8 whitespace-nowrap">
            {[...stocks, ...stocks].map((s, idx) => {
              const isPositive = Number(s.priceChange || 0) >= 0;
              return (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-slate-200">{s.symbol}</span>
                  <span className="text-slate-100">{formatCurrency(s.currentPrice)}</span>
                  <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercentage(s.percentageChange)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Simulated Stock Trading
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Master the Market. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Zero Risk. Real Skills.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Trade top Indian blue-chip stocks like Reliance, TCS, Infosys, and HDFC Bank in real-time.
            Experiment with strategies, track dynamic portfolios, and build financial confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="px-8 py-3.5 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Go to Trading Dashboard' : 'Start Trading Now — Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/stocks"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition"
            >
              Explore Live Stocks
            </Link>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-left max-w-2xl mx-auto">
            {[
              '₹50,000 Virtual Funds',
              'Real-Time Charts & P&L',
              'Instant Order Execution',
              '100% Risk Free',
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-medium">Platform Stocks</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 mt-1 font-mono">
              {stocks.length || 10}+
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">NIFTY 50 Blue-chips</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Starting Wallet</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 mt-1 font-mono">
              ₹50,000
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Instant demo credit</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Trading Execution</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">
              &lt; 50ms
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Low-latency simulation</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Market Simulation</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1 font-mono">
              Live
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Tick-by-tick fluctuation</span>
          </div>
        </div>
      </section>

      {/* Featured Stocks Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Market Highlights</h2>
            <p className="text-xs text-slate-400 mt-0.5">Top traded benchmark securities with live pricing</p>
          </div>
          <Link
            to="/stocks"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            <span>View All Stocks ({stocks.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stocks.slice(0, 6).map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                onBuy={(s) => handleOpenTrade(s, 'BUY')}
                onSell={(s) => handleOpenTrade(s, 'SELL')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Why Learn with StockTrade?</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Engineered to replicate real trading dynamics while safeguarding your capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Instant Order Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Place market buy and sell orders with immediate portfolio and wallet balance reconciliation.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Dynamic P&L Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor total investment, current portfolio value, day changes, and percentage returns in real-time.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Role-Based Dashboards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-featured user portal alongside an administrative command center for stock and user oversight.
            </p>
          </div>
        </div>
      </section>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        stock={selectedStock}
        initialMode={tradeMode}
        onSuccess={fetchStocks}
      />
    </div>
  );
};
