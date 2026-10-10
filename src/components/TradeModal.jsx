import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { tradeService, portfolioService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

export const TradeModal = ({ isOpen, onClose, stock, initialMode = 'BUY', onSuccess }) => {
  const { user, refreshUserWallet } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState(initialMode); // 'BUY' or 'SELL'
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userHoldings, setUserHoldings] = useState(0);

  useEffect(() => {
    setMode(initialMode);
    setQuantity(1);
  }, [initialMode, stock]);

  useEffect(() => {
    if (isOpen && user?.id && stock?.id) {
      portfolioService
        .getUserPortfolio(user.id)
        .then((res) => {
          const item = res.data.find((p) => p.stockId === stock.id);
          setUserHoldings(item ? item.quantity : 0);
        })
        .catch(() => setUserHoldings(0));
    }
  }, [isOpen, user?.id, stock?.id]);

  if (!isOpen || !stock) return null;

  const price = Number(stock.currentPrice || 0);
  const totalAmount = Number((quantity * price).toFixed(2));
  const walletBalance = Number(user?.walletBalance || 0);

  const canAfford = mode === 'BUY' ? walletBalance >= totalAmount : true;
  const canSell = mode === 'SELL' ? userHoldings >= quantity && quantity > 0 : true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      error('Quantity must be greater than 0');
      return;
    }

    if (mode === 'BUY' && !canAfford) {
      error('Insufficient wallet balance!');
      return;
    }

    if (mode === 'SELL' && !canSell) {
      error(`You only own ${userHoldings} shares of ${stock.symbol}`);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'BUY') {
        const res = await tradeService.buyStock({
          stockId: stock.id,
          quantity: Number(quantity),
        });
        success(res.data.message || `Successfully bought ${quantity} shares of ${stock.symbol}!`);
      } else {
        const res = await tradeService.sellStock({
          stockId: stock.id,
          quantity: Number(quantity),
        });
        success(res.data.message || `Successfully sold ${quantity} shares of ${stock.symbol}!`);
      }

      await refreshUserWallet();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Trade execution failed';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-100">{stock.symbol}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{stock.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buy / Sell Tabs */}
        <div className="p-6">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setMode('BUY')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === 'BUY'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Buy Order
            </button>
            <button
              type="button"
              onClick={() => setMode('SELL')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === 'SELL'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" /> Sell Order
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Price Row */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Market Price</span>
              <span className="text-base font-bold text-slate-100">{formatCurrency(stock.currentPrice)}</span>
            </div>

            {/* Quantity Input with Stepper */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-400 font-medium">Quantity (Shares)</label>
                {mode === 'SELL' && (
                  <span className="text-xs text-slate-400">
                    Owned: <strong className="text-slate-200">{userHoldings}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center justify-center border border-slate-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={mode === 'SELL' ? userHoldings || 1 : 99999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-11 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center justify-center border border-slate-700"
                >
                  +
                </button>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex gap-2 mt-2">
                {[5, 10, 25, 50].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setQuantity(step)}
                    className="flex-1 py-1 text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition font-medium"
                  >
                    +{step}
                  </button>
                ))}
                {mode === 'SELL' && userHoldings > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantity(userHoldings)}
                    className="flex-1 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 transition font-semibold"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Estimated Value</span>
                <span className="font-semibold text-slate-200">
                  {quantity} × {formatCurrency(price)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-sm font-semibold text-slate-300">Total Amount</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Wallet Balance / Error indicator */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wallet:</span>
                <strong className="text-slate-200">{formatCurrency(walletBalance)}</strong>
              </div>

              {mode === 'BUY' && !canAfford && (
                <div className="flex items-center gap-1 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> Insufficient Funds
                </div>
              )}
              {mode === 'SELL' && !canSell && (
                <div className="flex items-center gap-1 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> Insufficient Shares
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (mode === 'BUY' && !canAfford) || (mode === 'SELL' && !canSell)}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500'
                  : 'bg-rose-500 hover:bg-rose-400 text-white disabled:bg-slate-800 disabled:text-slate-500'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'BUY' ? 'Confirm Purchase' : 'Confirm Sale'} — {formatCurrency(totalAmount)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
