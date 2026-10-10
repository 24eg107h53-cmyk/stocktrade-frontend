import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const StockCard = ({ stock, onBuy, onSell }) => {
  const isPositive = Number(stock.priceChange || 0) >= 0;

  // Calculate day range progress
  const low = Number(stock.low || stock.currentPrice);
  const high = Number(stock.high || stock.currentPrice);
  const current = Number(stock.currentPrice || 0);
  const rangeSpan = high - low;
  const progressPercent = rangeSpan > 0 ? Math.min(100, Math.max(0, ((current - low) / rangeSpan) * 100)) : 50;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to={`/stocks/${stock.id}`}
              className="text-base font-bold text-slate-100 hover:text-emerald-400 transition-colors"
            >
              {stock.symbol}
            </Link>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">{stock.companyName}</p>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-slate-100 font-mono">
            {formatCurrency(stock.currentPrice)}
          </div>
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md mt-1 ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{formatPercentage(stock.percentageChange)}</span>
          </div>
        </div>
      </div>

      {/* Day Range Mini Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
          <span>L: {formatCurrency(stock.low)}</span>
          <span className="text-slate-500 text-[10px]">Day Range</span>
          <span>H: {formatCurrency(stock.high)}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPositive ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
        <button
          onClick={() => onBuy(stock)}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-all duration-200"
        >
          Buy
        </button>
        <button
          onClick={() => onSell(stock)}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all duration-200"
        >
          Sell
        </button>
        <Link
          to={`/stocks/${stock.id}`}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="View Details"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
