import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, LineChart } from 'lucide-react';
import { stockService } from '../services/api';
import { StockCard } from '../components/StockCard';
import { TradeModal } from '../components/TradeModal';
import { useToast } from '../context/ToastContext';

export const StocksCatalogPage = () => {
  const { info, error } = useToast();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  // Trade Modal
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');

  const fetchStocks = async () => {
    try {
      const res = await stockService.getAllStocks();
      setStocks(res.data);
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
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
    setTradeModalOpen(true);
  };

  const sectors = ['ALL', ...new Set(stocks.map((s) => s.sector))];

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || stock.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Market Securities Directory <span className="text-emerald-400">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse all listed blue-chip companies, evaluate intraday spreads, and place buy/sell orders.
          </p>
        </div>

        {/* Search & Sector Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="pl-3 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
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

      {/* Grid of Stocks */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
          No stocks match your query "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              onBuy={(s) => handleOpenTrade(s, 'BUY')}
              onSell={(s) => handleOpenTrade(s, 'SELL')}
            />
          ))}
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialMode={tradeMode}
        onSuccess={fetchStocks}
      />
    </div>
  );
};
