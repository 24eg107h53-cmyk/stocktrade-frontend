import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  LineChart,
  History,
  TrendingUp,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import { adminService, stockService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

export const AdminDashboardPage = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('DASHBOARD'); // 'DASHBOARD', 'STOCKS', 'USERS', 'TRANSACTIONS'
  const [stats, setStats] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stock Modal state (Add / Edit)
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockForm, setStockForm] = useState({
    companyName: '',
    symbol: '',
    sector: '',
    currentPrice: '',
    openingPrice: '',
    previousClose: '',
    high: '',
    low: '',
    fiftyTwoWeekHigh: '',
    fiftyTwoWeekLow: '',
  });

  // Price update modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceUpdateStock, setPriceUpdateStock] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // User portfolio view modal
  const [userPortfolioModalOpen, setUserPortfolioModalOpen] = useState(false);
  const [selectedUserPortfolio, setSelectedUserPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const loadAllAdminData = useCallback(async () => {
    try {
      const [dashRes, stocksRes, usersRes, txRes] = await Promise.all([
        adminService.getDashboard(),
        stockService.getAllStocks(),
        adminService.getAllUsers(),
        adminService.getAllTransactions(),
      ]);
      setStats(dashRes.data);
      setStocks(stocksRes.data);
      setUsers(usersRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  // Open Add Stock Modal
  const handleOpenAddStock = () => {
    setEditingStock(null);
    setStockForm({
      companyName: '',
      symbol: '',
      sector: '',
      currentPrice: '',
      openingPrice: '',
      previousClose: '',
      high: '',
      low: '',
      fiftyTwoWeekHigh: '',
      fiftyTwoWeekLow: '',
    });
    setStockModalOpen(true);
  };

  // Open Edit Stock Modal
  const handleOpenEditStock = (stock) => {
    setEditingStock(stock);
    setStockForm({
      companyName: stock.companyName,
      symbol: stock.symbol,
      sector: stock.sector,
      currentPrice: stock.currentPrice.toString(),
      openingPrice: stock.openingPrice.toString(),
      previousClose: stock.previousClose.toString(),
      high: stock.high.toString(),
      low: stock.low.toString(),
      fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh.toString(),
      fiftyTwoWeekLow: stock.fiftyTwoWeekLow.toString(),
    });
    setStockModalOpen(true);
  };

  // Submit Add or Edit Stock
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...stockForm,
        currentPrice: parseFloat(stockForm.currentPrice),
        openingPrice: parseFloat(stockForm.openingPrice || stockForm.currentPrice),
        previousClose: parseFloat(stockForm.previousClose || stockForm.currentPrice),
        high: parseFloat(stockForm.high || stockForm.currentPrice),
        low: parseFloat(stockForm.low || stockForm.currentPrice),
        fiftyTwoWeekHigh: parseFloat(stockForm.fiftyTwoWeekHigh || stockForm.currentPrice),
        fiftyTwoWeekLow: parseFloat(stockForm.fiftyTwoWeekLow || stockForm.currentPrice),
      };

      if (editingStock) {
        await stockService.updateStock(editingStock.id, payload);
        success(`Stock ${editingStock.symbol} updated successfully!`);
      } else {
        await stockService.createStock(payload);
        success(`Stock ${payload.symbol} created and listed on exchange!`);
      }

      setStockModalOpen(false);
      await loadAllAdminData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save stock');
    }
  };

  // Delete Stock
  const handleDeleteStock = async (id, symbol) => {
    if (!window.confirm(`Are you sure you want to delete stock ${symbol}? This action cannot be undone.`)) {
      return;
    }
    try {
      await stockService.deleteStock(id);
      success(`Stock ${symbol} deleted.`);
      await loadAllAdminData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete stock');
    }
  };

  // Open Quick Price Update Modal
  const handleOpenPriceUpdate = (stock) => {
    setPriceUpdateStock(stock);
    setNewPrice(stock.currentPrice.toString());
    setPriceModalOpen(true);
  };

  // Submit Price Update
  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      error('Please enter a valid price');
      return;
    }
    try {
      await stockService.updateStockPrice(priceUpdateStock.id, priceNum);
      success(`Updated price of ${priceUpdateStock.symbol} to ${formatCurrency(priceNum)}`);
      setPriceModalOpen(false);
      await loadAllAdminData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update price');
    }
  };

  // Toggle User Status (Activate/Deactivate)
  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      success(`User ${user.username} is now ${newStatus}`);
      await loadAllAdminData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // View User Portfolio Modal
  const handleViewUserPortfolio = async (userId) => {
    setPortfolioLoading(true);
    setUserPortfolioModalOpen(true);
    try {
      const res = await adminService.getUserPortfolio(userId);
      setSelectedUserPortfolio(res.data);
    } catch (err) {
      error('Failed to load user portfolio');
      setUserPortfolioModalOpen(false);
    } finally {
      setPortfolioLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title & Nav Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrative Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Exchange Management & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Oversee listed stocks, manage registered users, monitor orders, and calibrate market prices.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
          {[
            { id: 'DASHBOARD', label: 'Overview', icon: LineChart },
            { id: 'STOCKS', label: 'Manage Stocks', icon: Sliders },
            { id: 'USERS', label: 'Manage Users', icon: Users },
            { id: 'TRANSACTIONS', label: 'Manage Trades', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core Admin Dashboard Cards (Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {stats?.totalUsers || users.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Active: <strong className="text-emerald-400 font-mono">{stats?.totalActiveUsers || 0}</strong>
          </div>
        </div>

        {/* Total Stocks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Listed Stocks</span>
            <LineChart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {stats?.totalStocks || stocks.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Trading instruments</div>
        </div>

        {/* Total Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Trades</span>
            <History className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {stats?.totalTransactions || transactions.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">B: {stats?.totalBuyTransactions || 0}</span>
            <span className="text-rose-400 font-mono">S: {stats?.totalSellTransactions || 0}</span>
          </div>
        </div>

        {/* Total Trading Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Trading Volume</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-400 font-mono mt-1 truncate">
            {formatCurrency(stats?.totalTradingVolume || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Total traded value</div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Trades Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" /> Recent Market Activity
              </h3>
              <button
                onClick={() => setActiveTab('TRANSACTIONS')}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(stats?.recentTransactions || transactions.slice(0, 8)).map((tx) => (
                    <tr key={tx.transactionId} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-bold text-slate-100">{tx.stockSymbol}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.transactionType === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{tx.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-200">
                        {formatCurrency(tx.totalAmount)}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{formatDate(tx.transactionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" /> Recent Registered Users
              </h3>
              <button
                onClick={() => setActiveTab('USERS')}
                className="text-xs text-sky-400 hover:underline font-bold"
              >
                Manage All →
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.slice(0, 8).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-400">{u.role}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-200">
                        {formatCurrency(u.walletBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className="text-[11px] font-bold text-amber-400 hover:underline"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE STOCKS (Section 9) */}
      {activeTab === 'STOCKS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Stock Directory ({stocks.length})</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add, edit, delete securities, or calibrate prices.</p>
            </div>

            <button
              onClick={handleOpenAddStock}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Stock</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4 text-right">Current Price</th>
                  <th className="py-3 px-4 text-right">Open / Prev</th>
                  <th className="py-3 px-4 text-right">High / Low</th>
                  <th className="py-3 px-4 text-right">52W Range</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {stocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-slate-100">{stock.symbol}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{stock.companyName}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-100 font-mono">
                      {formatCurrency(stock.currentPrice)}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400 font-mono">
                      <div>O: {formatCurrency(stock.openingPrice)}</div>
                      <div>C: {formatCurrency(stock.previousClose)}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400 font-mono">
                      <div className="text-emerald-400">H: {formatCurrency(stock.high)}</div>
                      <div className="text-rose-400">L: {formatCurrency(stock.low)}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400 font-mono">
                      <div>H: {formatCurrency(stock.fiftyTwoWeekHigh)}</div>
                      <div>L: {formatCurrency(stock.fiftyTwoWeekLow)}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPriceUpdate(stock)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                          title="Update Price"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditStock(stock)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                          title="Edit Stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStock(stock.id, stock.symbol)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete Stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE USERS (Section 9) */}
      {activeTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Registered Users ({users.length})</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review accounts, toggle active/inactive access, and inspect user portfolios.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Wallet Balance</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-400">#{u.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{u.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">{u.username}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'ROLE_ADMIN'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(u.walletBalance)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewUserPortfolio(u.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1"
                          title="View Portfolio"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Holdings</span>
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white'
                              : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE TRANSACTIONS (Section 9) */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Platform Trades Audit ({transactions.length})</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit stream of all securities traded across the entire platform.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-400">
                      #{tx.transactionId}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">User #{tx.userId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{tx.stockSymbol}</div>
                      <div className="text-[11px] text-slate-500">{tx.companyName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          tx.transactionType === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200 font-mono">
                      {tx.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-300">
                      {formatCurrency(tx.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {formatCurrency(tx.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{formatDate(tx.transactionDate)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STOCK (Section 9) */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingStock ? `Edit Stock (${editingStock.symbol})` : 'Add New Listed Stock'}
              </h3>
              <button
                onClick={() => setStockModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={stockForm.companyName}
                    onChange={(e) => setStockForm({ ...stockForm, companyName: e.target.value })}
                    placeholder="e.g. Infosys Limited"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Symbol</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStock}
                    value={stockForm.symbol}
                    onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g. INFY"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sector</label>
                <input
                  type="text"
                  required
                  value={stockForm.sector}
                  onChange={(e) => setStockForm({ ...stockForm, sector: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={stockForm.currentPrice}
                    onChange={(e) => setStockForm({ ...stockForm, currentPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.openingPrice}
                    onChange={(e) => setStockForm({ ...stockForm, openingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Previous Close</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.previousClose}
                    onChange={(e) => setStockForm({ ...stockForm, previousClose: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Today High</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.high}
                    onChange={(e) => setStockForm({ ...stockForm, high: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Today Low</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.low}
                    onChange={(e) => setStockForm({ ...stockForm, low: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">52 Week High</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.fiftyTwoWeekHigh}
                    onChange={(e) => setStockForm({ ...stockForm, fiftyTwoWeekHigh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">52 Week Low</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.fiftyTwoWeekLow}
                    onChange={(e) => setStockForm({ ...stockForm, fiftyTwoWeekLow: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                >
                  {editingStock ? 'Save Changes' : 'List Stock on Exchange'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK PRICE UPDATE (Section 9) */}
      {priceModalOpen && priceUpdateStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Calibrate Stock Price</h3>
                <p className="text-xs text-slate-400">{priceUpdateStock.symbol} — {priceUpdateStock.companyName}</p>
              </div>
              <button
                onClick={() => setPriceModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Market Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
                >
                  Update Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW USER PORTFOLIO (Section 9) */}
      {userPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">User Portfolio Inspection</h3>
                <p className="text-xs text-slate-400">Holdings & valuation breakdown</p>
              </div>
              <button
                onClick={() => setUserPortfolioModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {portfolioLoading ? (
              <div className="p-8 text-center text-slate-400">Loading portfolio...</div>
            ) : selectedUserPortfolio ? (
              <div className="space-y-4 overflow-y-auto">
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Wallet</span>
                    <div className="text-sm font-bold text-slate-200 font-mono">
                      {formatCurrency(selectedUserPortfolio.walletBalance)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Invested</span>
                    <div className="text-sm font-bold text-slate-200 font-mono">
                      {formatCurrency(selectedUserPortfolio.totalInvestment)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Portfolio Value</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {formatCurrency(selectedUserPortfolio.totalPortfolioValue)}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <tr>
                        <th className="py-2 px-3">Stock</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Avg Price</th>
                        <th className="py-2 px-3 text-right">Current Price</th>
                        <th className="py-2 px-3 text-right">Value</th>
                        <th className="py-2 px-3 text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {(selectedUserPortfolio.holdings || []).map((h) => (
                        <tr key={h.id}>
                          <td className="py-2 px-3 font-bold text-slate-100">{h.symbol}</td>
                          <td className="py-2 px-3 text-center font-mono">{h.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">
                            {formatCurrency(h.averageBuyPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">
                            {formatCurrency(h.currentPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-100">
                            {formatCurrency(h.currentValue)}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono font-bold ${
                              Number(h.profitLoss) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatCurrency(h.profitLoss)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
