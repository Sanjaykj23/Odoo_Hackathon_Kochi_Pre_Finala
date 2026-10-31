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
  UserPlus,
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, authenticatedUser, users } = useApp();
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
      // AppContext sets view & authenticatedUser, redirect occurs via useEffect
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Brightloop@2026!');
  };

  return (
    <div className="min-h-screen bg-[#EAF3F8] text-[#252735] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      {/* Ambient background pastel atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E1F3EB]/60 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#F0EDFA]/70 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-[#E5F0FA]/60 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6254E8] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#6254E8]/20">
            B
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#252735] font-display">
              Brightloop <span className="text-[#6254E8]">Software</span>
            </span>
            <div className="text-[11px] text-[#697386] font-mono">
              Recurring Billing & Subscription Engine · GST Compliant
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Supabase Status */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border ${
              isSupabaseConfigured
                ? 'bg-[#E1F3EB] text-[#252735] border-[#55C9A2]/40'
                : 'bg-[#F0EDFA] text-[#6254E8] border-[#7A8CE8]/30'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#55C9A2]" />
            <span>{isSupabaseConfigured ? 'Supabase Postgres Live' : 'Supabase (Awaiting .env Keys)'}</span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E3E8EE] bg-white hover:bg-[#F0EDFA]/40 text-xs font-semibold text-[#252735] shadow-[0_2px_6px_rgba(41,42,58,0.03)] transition-all"
          >
            <Home className="w-4 h-4 text-[#6254E8]" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Sign In Form Container */}
      <main className="max-w-md w-full mx-auto my-8 z-10">
        <div className="bg-white/95 border border-[#E3E8EE] rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(41,42,58,0.06)] backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E9E6FF] text-[#6254E8] border border-[#7A8CE8]/30 font-mono inline-block">
              ENTERPRISE IAM SIGN IN
            </span>
            <h1 className="text-2xl font-bold text-[#252735] mt-3 font-display">
              Welcome to Brightloop
            </h1>
            <p className="text-xs text-[#697386] mt-1">
              Enter your credentials to access your authorized role dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252735] mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#6254E8] focus:border-transparent transition-all placeholder:text-[#9299A8]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[#252735]">Account Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(true);
                    setResetSent(false);
                    setResetEmail(email);
                  }}
                  className="text-[#6254E8] hover:underline text-[11px] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#6254E8] focus:border-transparent transition-all placeholder:text-[#9299A8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9299A8] hover:text-[#252735]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#6254E8]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating with Supabase...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Presets for Hackathon Judges & Demos */}
          <div className="p-3.5 rounded-2xl card-lavender border border-[#E3E8EE] text-[11px] space-y-2">
            <div className="font-semibold text-[#252735] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#6254E8]" />
              <span>Quick Login Presets (Click to autofill):</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@brightloop.io')}
                className="p-2 rounded-xl bg-white hover:bg-[#F0EDFA] border border-[#E3E8EE] text-left transition-all"
              >
                <div className="font-bold text-[#6254E8]">Administrator</div>
                <div className="text-[10px] text-[#697386] truncate">admin@brightloop.io</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('finance@brightloop.io')}
                className="p-2 rounded-xl bg-white hover:bg-[#E1F3EB] border border-[#E3E8EE] text-left transition-all"
              >
                <div className="font-bold text-[#55C9A2]">Finance Lead</div>
                <div className="text-[10px] text-[#697386] truncate">finance@brightloop.io</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sales@brightloop.io')}
                className="p-2 rounded-xl bg-white hover:bg-[#E5F0FA] border border-[#E3E8EE] text-left transition-all"
              >
                <div className="font-bold text-[#7A8CE8]">Sales Staff</div>
                <div className="text-[10px] text-[#697386] truncate">sales@brightloop.io</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('billing@infosys.com')}
                className="p-2 rounded-xl bg-white hover:bg-[#F0EDFA] border border-[#E3E8EE] text-left transition-all"
              >
                <div className="font-bold text-[#292A3A]">Customer Client</div>
                <div className="text-[10px] text-[#697386] truncate">billing@infosys.com</div>
              </button>
            </div>
          </div>

          {/* Link to Register */}
          <div className="pt-4 border-t border-[#E3E8EE] text-center">
            <p className="text-xs text-[#697386]">
              New customer business?{' '}
              <Link to="/register" className="text-[#6254E8] hover:underline font-bold">
                Create Customer Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#252735]/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#252735] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6254E8]" />
                <span>Reset Account Password</span>
              </h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-[#9299A8] hover:text-[#252735] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-2xl card-mint border border-[#55C9A2]/40 text-xs text-[#252735] space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-[#55C9A2]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password Reset Link Dispatched</span>
                </div>
                <p className="text-[#697386]">
                  A password reset link has been dispatched to <strong>{resetEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="mt-2 w-full py-2 rounded-xl bg-[#55C9A2] text-white text-xs font-bold shadow-xs hover:bg-[#45b791] transition-all cursor-pointer"
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
                <p className="text-[#697386] text-[11px] leading-relaxed">
                  Enter your registered corporate email. A password recovery link will arrive at your address.
                </p>
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/50 text-[#252735] font-mono text-xs focus:ring-2 focus:ring-[#6254E8] focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#EAF3F8] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white text-xs font-bold shadow-md shadow-[#6254E8]/20 cursor-pointer"
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
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-[#697386] border-t border-[#E3E8EE] pt-4 z-10">
        Brightloop Software Pvt Ltd © 2026. Certified ISO 27001 & GST India Rule 46 Compliant.
      </footer>
    </div>
  );
};
