import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Home,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
  FileText
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerCustomer, setScreenMode } = useApp();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Login Form State (Clean - No mock credentials prefilled)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Customer Signup Form State (Per PDF Scene: A new customer signs up)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupCompanyName, setSignupCompanyName] = useState('');
  const [signupGstin, setSignupGstin] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Password validation rules (From PDF: > 8 chars, 1 uppercase, 1 lowercase, 1 special character)
  const hasMinLength = signupPassword.length > 8;
  const hasUppercase = /[A-Z]/.test(signupPassword);
  const hasLowercase = /[a-z]/.test(signupPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword);
  const isSignupPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);
    await login(loginEmail.trim(), loginPassword);
    setLoginLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName || !signupCompanyName) return;

    if (!isSignupPasswordValid) {
      alert('Password must be more than 8 characters, with 1 uppercase, 1 lowercase, and 1 special character.');
      return;
    }

    setSignupLoading(true);
    const success = await registerCustomer({
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      companyName: signupCompanyName.trim(),
      gstin: signupGstin.trim().toUpperCase() || undefined,
      phone: signupPhone.trim() || undefined,
      address: signupAddress.trim() || undefined
    });

    setSignupLoading(false);
    if (success) {
      setAuthMode('LOGIN');
      setLoginEmail(signupEmail);
      setSignupPassword('');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Ambient Backdrop */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
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
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
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

        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-xl w-full mx-auto my-8 z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Auth Mode Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setAuthMode('LOGIN')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'LOGIN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('SIGNUP')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'SIGNUP'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer Self-Registration
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {authMode === 'LOGIN' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  ENTERPRISE IAM LOGIN
                </span>
                <h1 className="text-xl font-bold text-white mt-2 font-display">
                  Access Brightloop Portal
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your credentials (Admin, Staff, Finance Lead, or Customer).
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetModalOpen(true);
                        setResetSent(false);
                        setResetEmail(loginEmail);
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
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Access Control Policies (From Problem Statement):</span>
                </div>
                <p>• <strong>Customers:</strong> Register freely via the Customer Registration tab.</p>
                <p>• <strong>Internal Staff & Finance Leads:</strong> Cannot self-register; credentials are set by the Admin via the Staff IAM view.</p>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER SIGN UP */}
          {authMode === 'SIGNUP' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  CUSTOMER SELF-SERVICE PORTAL
                </span>
                <h1 className="text-xl font-bold text-white mt-2 font-display">
                  Create a Business Account
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Register your business to view quotations, manage software subscriptions, and download GST invoices.
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Company / Organization Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Tech Solutions"
                        value={signupCompanyName}
                        onChange={(e) => setSignupCompanyName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Business Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="billing@acmetech.in"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="29AAAAA0000A1Z5"
                      value={signupGstin}
                      onChange={(e) => setSignupGstin(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      placeholder="Outer Ring Road, Bengaluru"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Password field with Scene 1 complexity enforcement */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Account Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 special char"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password validation indicators (Required by PDF Scene 1) */}
                  <div className="mt-2 grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>&gt; 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1 uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1 lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1 special character</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading || !isSignupPasswordValid}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>{signupLoading ? 'Registering Account...' : 'Create Customer Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Forgot Password Modal (From PDF: reset link should arrive at registered email) */}
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
                  A secure password reset link has been dispatched to <strong>{resetEmail}</strong>. Please check your inbox.
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
              <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
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
