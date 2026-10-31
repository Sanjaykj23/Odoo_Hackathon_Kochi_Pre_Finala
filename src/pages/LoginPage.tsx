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
  Home,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, authenticatedUser, requestPasswordReset, users } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState('');

  // If already logged in, redirect to their role dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      if (authenticatedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (authenticatedUser.role === 'FINANCE_LEAD') navigate('/finance/dashboard');
      else if (authenticatedUser.role === 'STAFF') navigate('/staff/subscriptions-list');
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
      const trimmed = email.trim().toLowerCase();
      const targetUser = users.find((u) => u.email.toLowerCase() === trimmed) || authenticatedUser;
      if (targetUser.role === 'ADMIN' || trimmed.includes('admin')) {
        navigate('/admin/dashboard');
      } else if (targetUser.role === 'FINANCE_LEAD' || trimmed.includes('finance')) {
        navigate('/finance/dashboard');
      } else if (targetUser.role === 'STAFF' || trimmed.includes('sales')) {
        navigate('/staff/subscriptions-list');
      } else {
        navigate('/customer/portal');
      }
    }
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
            <span>{isSupabaseConfigured ? 'Supabase Auth & DB Live' : 'Supabase (Awaiting .env Keys)'}</span>
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
              Enter your corporate credentials to access your authorized role dashboard.
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
                    setResetFeedback('');
                  }}
                  className="text-[#6254E8] hover:underline text-[11px] font-medium cursor-pointer"
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
              <span>{loading ? 'Authenticating with Supabase Auth...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

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
                <span>Reset Account Password via Supabase</span>
              </h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-[#9299A8] hover:text-[#252735] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-2xl card-mint border border-[#55C9A2]/40 text-xs text-[#252735] space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-[#55C9A2]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password Reset Dispatched!</span>
                </div>
                <p className="text-[#697386] leading-relaxed">
                  {resetFeedback || `A password reset link was dispatched via Supabase Auth to ${resetEmail}. Please check your email inbox and spam folder.`}
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
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!resetEmail) return;
                  setResetLoading(true);
                  const res = await requestPasswordReset(resetEmail);
                  setResetLoading(false);
                  if (res.success) {
                    setResetSent(true);
                    setResetFeedback(res.message);
                  } else {
                    alert(`Reset Failed: ${res.message}`);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-[#697386] text-[11px] leading-relaxed">
                  Enter your registered corporate email. Supabase Auth will generate a secure recovery token and email a password reset link to you.
                </p>
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Registered Corporate Email
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
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#6254E8]/20 cursor-pointer flex items-center gap-1.5"
                  >
                    {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{resetLoading ? 'Dispatching...' : 'Send Reset Link'}</span>
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
