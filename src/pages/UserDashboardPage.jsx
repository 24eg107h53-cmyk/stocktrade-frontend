import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  Search,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { stockService, portfolioService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TradeModal } from '../components/TradeModal';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const UserDashboardPage = () => {
  const { user, refreshUserWallet } = useAuth();
  const { success, error, info } = useToast();

  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [simulating, setSimulating] = useState(false);

  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');

  const loadDashboardData = useCallback(async () => {
    try {
      const [stocksRes, summaryRes] = await Promise.all([
        stockService.getAllStocks(),
        user?.id ? portfolioService.getUserPortfolioSummary(user.id) : Promise.resolve({ data: null }),
      ]);
      setStocks(stocksRes.data);
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSimulateTick = async () => {
    setSimulating(true);
    try {
      const res = await stockService.simulateTick();
      setStocks(res.data);
      await loadDashboardData();
      info('Market price tick simulated across all stocks!');
    } catch (err) {
      error('Failed to simulate market movement');
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenTrade = (stock, mode) => {
    setSelectedStock(stock);
    setTradeMode(mode);
    setTradeModalOpen(true);
  };

  // Sectors list
  const sectors = ['ALL', ...new Set(stocks.map((s) => s.sector))];

  // Filtered stocks
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const isTodayPositive = Number(summary?.todayProfitLoss || 0) >= 0;
  const isOverallPositive = Number(summary?.totalProfitLoss || 0) >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Trading Dashboard <span className="text-emerald-400">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-200">{user?.name || user?.username}</strong>. Real-time portfolio analytics & live exchange simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateTick}
            disabled={simulating}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-500/5 transition flex items-center gap-2"
            title="Simulate random market fluctuation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>Simulate Market Movement</span>
          </button>

          <Link
            to="/wallet"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deposit Funds</span>
          </Link>
        </div>
      </div>

      {/* 5 Core Dashboard Metric Cards (Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Wallet Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            {formatCurrency(summary?.walletBalance ?? user?.walletBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Available cash</span>
            <Link to="/wallet" className="text-emerald-400 font-bold hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* 2. Total Portfolio Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Portfolio Value</span>
            <PieChart className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            {formatCurrency(summary?.totalPortfolioValue || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Current market valuation
          </div>
        </div>

        {/* 3. Today's Profit / Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's P&L</span>
            {isTodayPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono ${
              isTodayPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary?.todayProfitLoss || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Day performance
          </div>
        </div>

        {/* 4. Total Investment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Investment</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            {formatCurrency(summary?.totalInvestment || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Overall P&L:</span>
            <span className={isOverallPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {formatPercentage(summary?.totalProfitLossPercentage)}
            </span>
          </div>
        </div>

        {/* 5. Number of Stocks Owned */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stocks Owned</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            {summary?.numberOfStocksOwned ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Unique assets</span>
            <Link to="/portfolio" className="text-amber-400 font-bold hover:underline">
              Holdings →
            </Link>
          </div>
        </div>
      </div>

      {/* Market Overview Section (Section 4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Market Overview
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {filteredStocks.length} Stocks
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live equity prices, price changes, and instant order triggers
            </p>
          </div>

          {/* Search & Sector Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search stocks or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Sector Dropdown */}
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec} className="bg-slate-900 text-slate-200">
                    {sec === 'ALL' ? 'All Sectors' : sec}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4 text-right">Current Price</th>
                <th className="py-3.5 px-4 text-right">Price Change</th>
                <th className="py-3.5 px-4 text-right">% Change</th>
                <th className="py-3.5 px-4 text-right">Day High / Low</th>
                <th className="py-3.5 px-4 text-center">Trade Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filteredStocks.map((stock) => {
                const isPositive = Number(stock.priceChange || 0) >= 0;
                return (
                  <tr
                    key={stock.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Stock Symbol & Company */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/stocks/${stock.id}`}
                        className="font-bold text-slate-100 hover:text-emerald-400 transition flex items-center gap-1.5"
                      >
                        <span>{stock.symbol}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition" />
                      </Link>
                      <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                        {stock.companyName}
                      </span>
                    </td>

                    {/* Sector */}
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                        {stock.sector}
                      </span>
                    </td>

                    {/* Current Price */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100 font-mono">
                      {formatCurrency(stock.currentPrice)}
                    </td>

                    {/* Price Change */}
                    <td
                      className={`py-3.5 px-4 text-right font-semibold font-mono text-xs ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(stock.priceChange)}
                    </td>

                    {/* Percentage Change */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercentage(stock.percentageChange)}
                      </span>
                    </td>

                    {/* Day High / Low */}
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400 font-mono">
                      <div>H: {formatCurrency(stock.high)}</div>
                      <div className="text-slate-500">L: {formatCurrency(stock.low)}</div>
                    </td>

                    {/* Buy & Sell Buttons (Section 4) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenTrade(stock, 'BUY')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition shadow"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => handleOpenTrade(stock, 'SELL')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition shadow"
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
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialMode={tradeMode}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
