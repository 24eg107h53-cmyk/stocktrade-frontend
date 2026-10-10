import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      error('Please enter both username/email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(usernameOrEmail.trim(), password);
      success(`Welcome back, ${res.name || res.username}!`);
      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (uname, pwd) => {
    setUsernameOrEmail(uname);
    setPassword(pwd);
    setLoading(true);
    login(uname, pwd)
      .then((res) => {
        success(`Demo login successful as ${res.role === 'ROLE_ADMIN' ? 'Admin' : 'Trader'}!`);
        if (res.role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        error(err.response?.data?.message || 'Login failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Log in to StockTrade</h2>
          <p className="text-xs text-slate-400">Access your portfolio, live market data, and simulation terminal</p>
        </div>

        {/* Quick Demo Login Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> One-Click Demo Access
            </span>
            <span className="text-[10px] text-slate-500">Instant Test</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('trader', 'user123')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Demo Trader</div>
              <div className="text-[10px] text-slate-500 font-mono">user123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-amber-300 group-hover:text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin
              </div>
              <div className="text-[10px] text-slate-500 font-mono">admin123</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. trader or user@stocktrade.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Remember me</span>
              </label>

              <span className="text-slate-500">Need help?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
