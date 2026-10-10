import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { walletService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const WalletPage = () => {
  const { user, refreshUserWallet } = useAuth();
  const { success, error } = useToast();

  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw Form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWalletData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [infoRes, txsRes] = await Promise.all([
        walletService.getWallet(user.id),
        walletService.getWalletTransactions(user.id),
      ]);
      setWalletInfo(infoRes.data);
      setTransactions(txsRes.data);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      error('Please enter a valid amount to deposit');
      return;
    }

    setDepositLoading(true);
    try {
      await walletService.deposit({ amount: amountNum });
      success(`Successfully credited ${formatCurrency(amountNum)} to your simulation wallet!`);
      setDepositAmount('');
      await refreshUserWallet();
      await fetchWalletData();
    } catch (err) {
      error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      error('Please enter a valid amount to withdraw');
      return;
    }

    if (amountNum > Number(walletInfo?.balance || 0)) {
      error('Insufficient balance to withdraw this amount');
      return;
    }

    setWithdrawLoading(true);
    try {
      await walletService.withdraw({ amount: amountNum });
      success(`Successfully withdrawn ${formatCurrency(amountNum)} from your simulation wallet!`);
      setWithdrawAmount('');
      await refreshUserWallet();
      await fetchWalletData();
    } catch (err) {
      error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentBalance = Number(walletInfo?.balance ?? user?.walletBalance ?? 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Simulation Wallet <span className="text-emerald-400">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your virtual cash, add practice funds, and monitor fund movements.
        </p>
      </div>

      {/* Wallet Cards (Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Available Balance
            </span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Virtual capital available for buying equities
          </p>
        </div>

        {/* Total Deposits */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Deposits</span>
            <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
            {formatCurrency(walletInfo?.totalDeposits || 0)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Cumulative cash loaded into wallet</p>
        </div>

        {/* Total Withdrawals */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Withdrawals</span>
            <ArrowUpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
            {formatCurrency(walletInfo?.totalWithdrawals || 0)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Simulated withdrawals recorded</p>
        </div>
      </div>

      {/* Forms Grid: Add Money & Withdraw Money (Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Money Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Virtual Money</h2>
              <p className="text-xs text-slate-400">Instantly top-up mock capital for trading practice</p>
            </div>
          </div>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 25000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2">
              {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepositAmount(preset.toString())}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition font-mono"
                >
                  +{formatCurrency(preset)}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={depositLoading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {depositLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Add Money to Wallet</span>
              )}
            </button>
          </form>
        </div>

        {/* Withdraw Money Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Withdraw Virtual Money</h2>
              <p className="text-xs text-slate-400">Withdraw unused funds back out of trading wallet</p>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Amount (₹)</label>
                <span className="text-xs text-slate-400">
                  Max: <strong className="text-slate-200 font-mono">{formatCurrency(currentBalance)}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  max={currentBalance}
                  step="any"
                  required
                  placeholder="e.g. 10000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2">
              {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                <button
                  key={frac}
                  type="button"
                  onClick={() => setWithdrawAmount(Math.floor(currentBalance * frac).toString())}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition font-mono"
                >
                  {frac * 100}%
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={withdrawLoading || currentBalance <= 0}
              className="w-full py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {withdrawLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Withdraw Funds</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Wallet Transactions History (Section 7) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Wallet Fund History ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            No wallet deposits or withdrawals recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
                            isDeposit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isDeposit ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                          {tx.type}
                        </span>
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-extrabold font-mono ${
                          isDeposit ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400">
                        {formatDate(tx.transactionDate)}
                      </td>

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
