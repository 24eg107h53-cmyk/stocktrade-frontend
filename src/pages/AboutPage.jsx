import React from 'react';
import { ShieldCheck, TrendingUp, Cpu, Database, Lock, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" /> About StockTrade Simulator
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Next-Generation Virtual Stock Exchange
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Designed for aspiring traders, financial analysts, and computer science students to master modern
          electronic trading mechanisms, order execution algorithms, and portfolio management without financial risk.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Full Stack Java & React</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Powered by modern Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security with stateless JWT,
            and high-performance React 18 with Tailwind CSS.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Layered MVC Architecture</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Strict separation of concerns: Controller → Service → Repository → MySQL 8.0, with atomic
            database transactions (<code className="text-sky-300">@Transactional</code>) preventing balance anomalies.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Role-Based Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            BCrypt-hashed passwords, JWT bearer tokens, and granular permission enforcement distinguishing
            trader capabilities from system administrator controls.
          </p>
        </div>
      </div>

      {/* Disclaimers & Mission */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Educational Simulation Pledge
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          StockTrade does not handle real currency, does not route orders to live financial brokerages or depositories,
          and exists exclusively for educational and training purposes. Every user starts with ₹50,000 in virtual funds
          to trade listed equities with realistic market bid/ask spreads.
        </p>

        <div className="pt-4 flex gap-4">
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
          >
            Create Free Account
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
