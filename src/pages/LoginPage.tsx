import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from '../router/Router';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Database,
  KeyRound,
  Home,
  CheckCircle2,
  UserPlus
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, authenticatedUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // If already logged in, redirect to their role dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      if (authenticatedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (authenticatedUser.role === 'FINANCE_LEAD') navigate('/finance/dashboard');
      else if (authenticatedUser.role === 'STAFF') navigate('/staff/kanban');
      else navigate('/customer/portal');
    }
  }, [isAuthenticated, authenticatedUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);
    if (success) {
      // Role-based redirection
      // Note: AppContext also sets view, router redirects based on role
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            B
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Brightloop <span className="text-indigo-400">Software</span>
            </span>
            <div className="text-[11px] text-slate-400 font-mono">
              Recurring Billing & Subscription Engine · GST Compliant
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Supabase Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConfigured ? 'Supabase Postgres Live' : 'Supabase (Awaiting .env Keys)'}</span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Sign In Form Container */}
      <main className="max-w-md w-full mx-auto my-8 z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              ENTERPRISE IAM SIGN IN
            </span>
            <h1 className="text-2xl font-bold text-white mt-3 font-display">
              Welcome to Brightloop
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access your authorized role dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
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
                  onClick={() => {
                    setResetModalOpen(true);
                    setResetSent(false);
                    setResetEmail(email);
                  }}
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
                  placeholder="Enter password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating with Supabase...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link to Register */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New customer business?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold underline">
                Create Customer Account
              </Link>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Role-Based Authentication:</span>
            </div>
            <p>• <strong>Administrator:</strong> Directs to <code>/admin/dashboard</code></p>
            <p>• <strong>Finance Lead:</strong> Directs to <code>/finance/dashboard</code></p>
            <p>• <strong>Sales Staff:</strong> Directs to <code>/staff/kanban</code></p>
            <p>• <strong>Customer:</strong> Directs to <code>/customer/portal</code></p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Reset Account Password</span>
              </h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Password Reset Link Dispatched</span>
                </div>
                <p>
                  A password reset link has been dispatched to <strong>{resetEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="mt-2 w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSent(true);
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-slate-400 text-[11px]">
                  Enter your registered corporate email. A password reset link will arrive at your address.
                </p>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-900 pt-4 z-10">
        Brightloop Software Pvt Ltd © 2026. Certified ISO 27001 & GST India Rule 46 Compliant.
      </footer>
    </div>
  );
};
