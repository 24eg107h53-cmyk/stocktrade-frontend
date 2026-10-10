import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Wallet,
  PieChart,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { stockService, tradeService, portfolioService } from '../services/api';
import { StockChart } from '../components/StockChart';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const StockDetailPage = () => {
  const { id } = useParams();
  const { user, refreshUserWallet } = useAuth();
  const { success, error } = useToast();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userHoldings, setUserHoldings] = useState(0);

  // Buy form state
  const [buyQty, setBuyQty] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);

  // Sell form state
  const [sellQty, setSellQty] = useState(1);
  const [sellLoading, setSellLoading] = useState(false);

  const fetchStockData = useCallback(async () => {
    try {
      const res = await stockService.getStockById(id);
      setStock(res.data);

      if (user?.id) {
        const portRes = await portfolioService.getUserPortfolio(user.id);
        const item = portRes.data.find((p) => p.stockId === Number(id));
        setUserHoldings(item ? item.quantity : 0);
      }
    } catch (err) {
      console.error('Failed to load stock details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Stock Not Found</h2>
        <p className="text-sm text-slate-400">The requested stock could not be located in our exchange catalog.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentPrice = Number(stock.currentPrice || 0);
  const isPositive = Number(stock.priceChange || 0) >= 0;

  const buyTotal = Number((buyQty * currentPrice).toFixed(2));
  const sellTotal = Number((sellQty * currentPrice).toFixed(2));
  const walletBalance = Number(user?.walletBalance || 0);

  const canAffordBuy = walletBalance >= buyTotal;
  const canSellShares = userHoldings >= sellQty && sellQty > 0;

  // 52-week range calculation
  const ftwLow = Number(stock.fiftyTwoWeekLow || currentPrice * 0.8);
  const ftwHigh = Number(stock.fiftyTwoWeekHigh || currentPrice * 1.2);
  const ftwSpan = ftwHigh - ftwLow;
  const ftwProgress = ftwSpan > 0 ? Math.min(100, Math.max(0, ((currentPrice - ftwLow) / ftwSpan) * 100)) : 50;

  const handleBuy = async (e) => {
    e.preventDefault();
    if (buyQty <= 0) return;
    if (!canAffordBuy) {
      error('Insufficient wallet balance!');
      return;
    }

    setBuyLoading(true);
    try {
      const res = await tradeService.buyStock({
        stockId: stock.id,
        quantity: Number(buyQty),
      });
      success(res.data.message || `Successfully purchased ${buyQty} shares!`);
      await refreshUserWallet();
      await fetchStockData();
    } catch (err) {
      error(err.response?.data?.message || 'Buy order failed');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (sellQty <= 0) return;
    if (!canSellShares) {
      error(`You only own ${userHoldings} shares!`);
      return;
    }

    setSellLoading(true);
    try {
      const res = await tradeService.sellStock({
        stockId: stock.id,
        quantity: Number(sellQty),
      });
      success(res.data.message || `Successfully sold ${sellQty} shares!`);
      await refreshUserWallet();
      await fetchStockData();
    } catch (err) {
      error(err.response?.data?.message || 'Sell order failed');
    } finally {
      setSellLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Stock Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{stock.symbol}</h1>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {stock.sector}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 font-medium">{stock.companyName}</p>
        </div>

        <div className="flex flex-col sm:items-end">
          <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono">
            {formatCurrency(stock.currentPrice)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 text-sm font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{formatCurrency(stock.priceChange)}</span>
              <span>({formatPercentage(stock.percentageChange)})</span>
            </span>
            <span className="text-xs text-slate-500">Today</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Trading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Chart + Key Statistics (Section 5) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Chart */}
          <StockChart stock={stock} />

          {/* Key Statistics Grid (Section 5) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white tracking-tight">Key Market Statistics</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Opening Price</span>
                <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  {formatCurrency(stock.openingPrice)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Previous Close</span>
                <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  {formatCurrency(stock.previousClose)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Today's High</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(stock.high)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Today's Low</span>
                <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                  {formatCurrency(stock.low)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">52-Week High</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(stock.fiftyTwoWeekHigh)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">52-Week Low</span>
                <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                  {formatCurrency(stock.fiftyTwoWeekLow)}
                </div>
              </div>
            </div>

            {/* 52-Week Range Bar */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>52W Low: {formatCurrency(stock.fiftyTwoWeekLow)}</span>
                <span className="text-slate-500 font-sans text-[11px] font-semibold">52-Week Range</span>
                <span>52W High: {formatCurrency(stock.fiftyTwoWeekHigh)}</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${ftwProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Buy & Sell Trading Panels (Section 5) */}
        <div className="space-y-6">
          {/* User Position Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Position</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Shares Owned</span>
                <span className="text-base font-extrabold text-slate-100 font-mono">{userHoldings}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Market Value</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(userHoldings * currentPrice)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Available Wallet:</span>
              <strong className="text-slate-200 font-mono">{formatCurrency(walletBalance)}</strong>
            </div>
          </div>

          {/* Buy Stock Card (Section 5) */}
          <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Buy Stock
              </span>
              <span className="text-xs text-slate-400 font-mono">{formatCurrency(currentPrice)} / share</span>
            </div>

            <form onSubmit={handleBuy} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center justify-center border border-slate-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={buyQty}
                    onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-10 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-100 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setBuyQty((q) => q + 1)}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center justify-center border border-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Amount</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(buyTotal)}
                </span>
              </div>

              {!canAffordBuy && (
                <div className="text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Insufficient wallet balance
                </div>
              )}

              <button
                type="submit"
                disabled={buyLoading || !canAffordBuy}
                className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center gap-2"
              >
                {buyLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Buy {stock.symbol}</span>
                )}
              </button>
            </form>
          </div>

          {/* Sell Stock Card (Section 5) */}
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Sell Stock
              </span>
              <span className="text-xs text-slate-400 font-mono">Available: {userHoldings}</span>
            </div>

            <form onSubmit={handleSell} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSellQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center justify-center border border-slate-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={userHoldings || 1}
                    value={sellQty}
                    onChange={(e) => setSellQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-10 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-100 font-bold font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSellQty((q) => Math.min(userHoldings, q + 1))}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center justify-center border border-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Proceeds</span>
                <span className="text-base font-extrabold text-rose-400 font-mono">
                  {formatCurrency(sellTotal)}
                </span>
              </div>

              {!canSellShares && (
                <div className="text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Insufficient shares to sell
                </div>
              )}

              <button
                type="submit"
                disabled={sellLoading || !canSellShares || userHoldings === 0}
                className="w-full py-3 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center gap-2"
              >
                {sellLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sell {stock.symbol}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
