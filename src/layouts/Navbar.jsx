import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  PieChart,
  Wallet,
  History,
  ShieldCheck,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    ...(isAuthenticated
      ? [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Portfolio', path: '/portfolio', icon: PieChart },
          { name: 'Wallet', path: '/wallet', icon: Wallet },
          { name: 'History', path: '/transactions', icon: History },
        ]
      : [
          { name: 'Home', path: '/' },
          { name: 'Stocks', path: '/stocks' },
          { name: 'About', path: '/about' },
        ]),
  ];

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Stock<span className="text-emerald-400">Trade</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    SIM
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                  Stock Buying & Selling Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Admin Link if Admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Section: Wallet & User profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Wallet Balance Pill */}
                <Link
                  to="/wallet"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition group"
                  title="Click to view wallet"
                >
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Wallet</span>
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      {formatCurrency(user?.walletBalance)}
                    </span>
                  </div>
                  <PlusCircle className="w-4 h-4 text-emerald-400/80 group-hover:text-emerald-400 transition ml-1" />
                </Link>

                {/* User Info & Role Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[100px] leading-tight">
                      {user?.name || user?.username}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider ${
                        isAdmin ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {isAdmin ? 'ADMIN' : 'TRADER'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-rose-500/20 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition"
                >
                  Start Trading
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2">
          {isAuthenticated && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
              <div>
                <div className="text-xs font-bold text-slate-200">{user?.name}</div>
                <div className="text-[10px] text-slate-400">{user?.role}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Balance</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {formatCurrency(user?.walletBalance)}
                </div>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive(link.path)
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-amber-400 hover:bg-slate-900"
            >
              Admin Panel
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-slate-900 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
              >
                Start Trading
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
