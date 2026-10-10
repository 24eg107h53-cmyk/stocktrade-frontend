import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Wallet,
  Sparkles,
  Layers
} from 'lucide-react';
import { portfolioService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TradeModal } from '../components/TradeModal';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const PortfolioPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');

  const fetchPortfolio = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await portfolioService.getUserPortfolioSummary(user.id);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleOpenTrade = (item, mode) => {
    setSelectedStock({
      id: item.stockId,
      symbol: item.symbol,
      companyName: item.companyName,
      sector: item.sector,
      currentPrice: item.currentPrice,
    });
    setTradeMode(mode);
    setTradeModalOpen(true);
  };

  const isOverallPositive = Number(summary?.totalProfitLoss || 0) >= 0;
  const isTodayPositive = Number(summary?.todayProfitLoss || 0) >= 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const holdings = summary?.holdings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            My Portfolio <span className="text-emerald-400">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic asset tracking, cost basis, valuation, and real-time profit & loss analytics.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Trade More Stocks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Portfolio Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Investment
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono mt-1">
            {formatCurrency(summary?.totalInvestment || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Cumulative cost basis</div>
        </div>

        {/* Current Portfolio Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Value
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono mt-1">
            {formatCurrency(summary?.totalPortfolioValue || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Live mark-to-market</div>
        </div>

        {/* Total Profit / Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Profit / Loss
            </span>
            {isOverallPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary?.totalProfitLoss || 0)}
          </div>
          <div className="mt-2 text-[11px] font-mono font-bold flex items-center gap-1">
            <span className={isOverallPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {formatPercentage(summary?.totalProfitLossPercentage)}
            </span>
            <span className="text-slate-500 font-normal">all-time returns</span>
          </div>
        </div>

        {/* Today's Profit / Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today's P&L
            </span>
            {isTodayPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
              isTodayPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary?.todayProfitLoss || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Unrealized day movement</div>
        </div>
      </div>

      {/* Holdings Table (Section 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Holdings Breakdown ({holdings.length})
          </h2>
          <span className="text-xs text-slate-500">Calculated in real-time</span>
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl">
            <PieChart className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No stocks in your portfolio yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't purchased any equities yet. Browse the market and execute your first simulation trade!
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
            >
              Start Trading Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-4 text-right">Avg Buy Price</th>
                  <th className="py-3.5 px-4 text-right">Current Price</th>
                  <th className="py-3.5 px-4 text-right">Invested Amount</th>
                  <th className="py-3.5 px-4 text-right">Current Value</th>
                  <th className="py-3.5 px-4 text-right">Profit / Loss</th>
                  <th className="py-3.5 px-4 text-right">Profit %</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {holdings.map((item) => {
                  const isItemPositive = Number(item.profitLoss || 0) >= 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Stock Name & Symbol */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/stocks/${item.stockId}`}
                          className="font-bold text-slate-100 hover:text-emerald-400 transition flex items-center gap-1.5"
                        >
                          <span>{item.symbol}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                        <span className="text-xs text-slate-400 truncate max-w-[150px] block">
                          {item.companyName}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-100 font-mono">
                        {item.quantity}
                      </td>

                      {/* Average Buy Price */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-300 font-mono text-xs">
                        {formatCurrency(item.averageBuyPrice)}
                      </td>

                      {/* Current Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100 font-mono text-xs">
                        {formatCurrency(item.currentPrice)}
                      </td>

                      {/* Invested Amount (Qty x Avg Price) */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-300 font-mono text-xs">
                        {formatCurrency(item.investedAmount)}
                      </td>

                      {/* Current Value (Qty x Current Price) */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100 font-mono text-xs">
                        {formatCurrency(item.currentValue)}
                      </td>

                      {/* Profit/Loss (Current Value - Invested) */}
                      <td
                        className={`py-3.5 px-4 text-right font-bold font-mono text-xs ${
                          isItemPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(item.profitLoss)}
                      </td>

                      {/* Profit % */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                            isItemPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isItemPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {formatPercentage(item.profitLossPercentage)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenTrade(item, 'BUY')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition"
                          >
                            Buy More
                          </button>
                          <button
                            onClick={() => handleOpenTrade(item, 'SELL')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white transition"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialMode={tradeMode}
        onSuccess={fetchPortfolio}
      />
    </div>
  );
};
