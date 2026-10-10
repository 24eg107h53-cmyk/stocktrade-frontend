import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { tradeService, walletService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'BUY', 'SELL', 'WALLET'
  const [trades, setTrades] = useState([]);
  const [walletTxs, setWalletTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [tradesRes, walletRes] = await Promise.all([
        tradeService.getUserTrades(user.id),
        walletService.getWalletTransactions(user.id),
      ]);
      setTrades(tradesRes.data);
      setWalletTxs(walletRes.data);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Combine trades and wallet transactions into a unified list
  const unifiedList = [
    ...trades.map((t) => ({
      id: `TX-${t.transactionId}`,
      rawId: t.transactionId,
      category: 'TRADE',
      stock: t.stockSymbol,
      company: t.companyName,
      type: t.transactionType, // 'BUY' or 'SELL'
      quantity: t.quantity,
      price: t.price,
      totalAmount: t.totalAmount,
      date: t.transactionDate,
      status: t.status,
    })),
    ...walletTxs.map((w) => ({
      id: `WT-${w.id}`,
      rawId: w.id,
      category: 'WALLET',
      stock: 'WALLET CASH',
      company: 'Virtual Balance Adjustment',
      type: w.type, // 'DEPOSIT' or 'WITHDRAW'
      quantity: 1,
      price: w.amount,
      totalAmount: w.amount,
      date: w.transactionDate,
      status: w.status,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter based on active tab and search
  const filteredList = unifiedList.filter((item) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'BUY' && item.type === 'BUY') ||
      (activeTab === 'SELL' && item.type === 'SELL') ||
      (activeTab === 'WALLET' && (item.type === 'DEPOSIT' || item.type === 'WITHDRAW'));

    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.stock.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Transaction History <span className="text-emerald-400">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete audit trail of all buy, sell, deposit, and withdrawal actions executed on your account.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Filters and Tabs (Section 8) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start">
            {[
              { id: 'ALL', label: 'All Operations' },
              { id: 'BUY', label: 'Buys' },
              { id: 'SELL', label: 'Sells' },
              { id: 'WALLET', label: 'Wallet Transfers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID or stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Transactions Table (Section 8) */}
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No transactions match your selection</p>
            <p className="text-xs text-slate-500">Try changing the tab filter or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Stock / Asset</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Execution Price</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredList.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  const isSell = tx.type === 'SELL';
                  const isDeposit = tx.type === 'DEPOSIT';
                  const isWithdraw = tx.type === 'WITHDRAW';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      {/* Transaction ID */}
                      <td className="py-3 px-4 font-mono font-bold text-xs text-slate-300">
                        {tx.id}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{tx.stock}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{tx.company}</div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isSell
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isDeposit
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isBuy && <TrendingUp className="w-3 h-3" />}
                          {isSell && <TrendingDown className="w-3 h-3" />}
                          {isDeposit && <ArrowDownCircle className="w-3 h-3" />}
                          {isWithdraw && <ArrowUpCircle className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-center font-bold text-slate-200 font-mono">
                        {tx.category === 'WALLET' ? '-' : tx.quantity}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-medium text-slate-300 font-mono text-xs">
                        {tx.category === 'WALLET' ? '-' : formatCurrency(tx.price)}
                      </td>

                      {/* Total Amount */}
                      <td
                        className={`py-3 px-4 text-right font-extrabold font-mono text-sm ${
                          isBuy || isWithdraw ? 'text-slate-100' : 'text-emerald-400'
                        }`}
                      >
                        {isSell || isDeposit ? '+' : '-'} {formatCurrency(tx.totalAmount)}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {formatDate(tx.date)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
