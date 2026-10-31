import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  PieChart,
  Building2,
  ArrowRight,
  Sparkles,
  Home,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsRole, setScreenMode, users } = useApp();

  const [email, setEmail] = useState('admin@brightloop.io');
  const [password, setPassword] = useState('Brightloop@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  const roleDemoCards: {
    role: UserRole;
    title: string;
    email: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    desc: string;
  }[] = [
    {
      role: 'ADMIN',
      title: 'Administrator',
      email: 'admin@brightloop.io',
      icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100',
      borderColor: 'border-purple-200 dark:border-purple-800',
      desc: 'Master catalog, tax rules, staff IAM, and system settings'
    },
    {
      role: 'STAFF',
      title: 'Sales Rep / Internal Staff',
      email: 'rahul.v@brightloop.io',
      icon: <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100',
      borderColor: 'border-blue-200 dark:border-blue-800',
      desc: 'Quotations builder, subscriptions Kanban, payment logging'
    },
    {
      role: 'FINANCE_LEAD',
      title: 'Finance Lead Executive',
      email: 'vikram.finance@brightloop.io',
      icon: <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      desc: 'MRR/ARR revenue reports, cash velocity, overdue aging matrix'
    },
    {
      role: 'CUSTOMER',
      title: 'Customer Self-Service Portal',
      email: 'billing@infosystechnologies.com',
      icon: <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100',
      borderColor: 'border-amber-200 dark:border-amber-800',
      desc: 'Review quotes, self-approve plans, inspect GST tax invoices'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Atmosphere Backdrop Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            B
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Brightloop <span className="text-indigo-400">Software</span>
            </span>
            <div className="text-[11px] text-slate-400 font-mono">Bengaluru HQ · GST 18% Compliant</div>
          </div>
        </div>

        <button
          onClick={() => setScreenMode('LANDING')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <Home className="w-4 h-4 text-indigo-400" />
          <span>Visit Public Landing Page</span>
        </button>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Standard Login Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              SECURE IAM SIGN IN
            </span>
            <h1 className="text-2xl font-bold text-white mt-3 font-display">
              Welcome Back to Brightloop
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your corporate credentials to access the recurring billing platform.
            </p>
          </div>

          <form onSubmit={handleStandardSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">Account Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your corporate email!')}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember session for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Authenticate Corporate Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Special One-Click Role Demo Sign-In Buttons */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              One-Click Role Demo Access (Instant Login)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleDemoCards.map((card) => (
              <button
                key={card.role}
                onClick={() => loginAsRole(card.role)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.02] shadow-lg flex flex-col justify-between space-y-3 ${card.color} ${card.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 font-mono">
                    {card.role}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold">{card.title}</h3>
                  <p className="text-[11px] opacity-80 line-clamp-2 mt-1">{card.desc}</p>
                </div>

                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-medium">
                  <span className="font-mono opacity-90">{card.email.split('@')[0]}</span>
                  <span className="font-bold flex items-center gap-1">
                    <span>Log In</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-900 pt-4 z-10">
        Brightloop Software Pvt Ltd © 2026. Certified ISO 27001 & GST India Compliant.
      </footer>
    </div>
  );
};
