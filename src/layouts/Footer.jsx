import React from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Educational Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-amber-300 font-bold block mb-0.5">
              Simulation & Educational Trading Platform Disclaimer
            </strong>
            StockTrade is a mock simulation and educational trading application designed strictly for learning
            purposes. All prices, trades, portfolios, and wallet funds are virtual and have no real financial
            value. No actual stock transactions or brokerage operations are carried out on any exchange.
          </div>
        </div>

        {/* Links & Brand */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-slate-950" />
            </div>
            <span className="font-bold text-slate-200">StockTrade Simulator</span>
            <span className="text-slate-500">© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-200 transition">Home</Link>
            <Link to="/stocks" className="hover:text-slate-200 transition">Markets</Link>
            <Link to="/about" className="hover:text-slate-200 transition">About</Link>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Risk Free
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
