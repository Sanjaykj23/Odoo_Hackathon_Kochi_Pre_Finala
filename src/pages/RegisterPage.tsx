import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from '../router/Router';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Database,
  Home,
  CheckCircle2,
  LogIn
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerCustomer, isAuthenticated, authenticatedUser } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to their role dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      if (authenticatedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (authenticatedUser.role === 'FINANCE_LEAD') navigate('/finance/dashboard');
      else if (authenticatedUser.role === 'STAFF') navigate('/staff/kanban');
      else navigate('/customer/portal');
    }
  }, [isAuthenticated, authenticatedUser, navigate]);

  // Password validation rules (From PDF: >8 chars, 1 uppercase, 1 lowercase, 1 special character)
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !companyName) return;

    if (!isPasswordValid) {
      alert('Password must be more than 8 characters, with 1 uppercase, 1 lowercase, and 1 special character.');
      return;
    }

    setLoading(true);
    const success = await registerCustomer({
      name: name.trim(),
      email: email.trim(),
      password,
      companyName: companyName.trim(),
      gstin: gstin.trim().toUpperCase() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined
    });

    setLoading(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Atmosphere Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

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
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <LogIn className="w-4 h-4 text-indigo-400" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Registration Container */}
      <main className="max-w-xl w-full mx-auto my-8 z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              CUSTOMER SELF-SERVICE REGISTRATION
            </span>
            <h1 className="text-2xl font-bold text-white mt-3 font-display">
              Register Customer Account
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create an account for your business to manage software licenses, review quotations, and track GST invoices.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password with Scene 1 complexity enforcement */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Account Password *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 special char"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              disabled={loading || !isPasswordValid}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Registering with Supabase...' : 'Create Customer Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline">
                Sign In to Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-900 pt-4 z-10">
        Brightloop Software Pvt Ltd © 2026. Certified ISO 27001 & GST India Rule 46 Compliant.
      </footer>
    </div>
  );
};
