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
  CheckCircle2,
  LogIn,
  Home,
  User,
  Phone,
  MapPin,
  ShieldCheck
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

  // Password validation rules (From PDF Scene 1: >8 chars, 1 uppercase, 1 lowercase, 1 special character)
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
    <div className="min-h-screen bg-[#EAF3F8] text-[#252735] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      {/* Atmosphere Glow */}
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
            to="/login"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E3E8EE] bg-white hover:bg-[#F0EDFA]/40 text-xs font-semibold text-[#252735] shadow-[0_2px_6px_rgba(41,42,58,0.03)] transition-all"
          >
            <LogIn className="w-4 h-4 text-[#6254E8]" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Registration Container */}
      <main className="max-w-xl w-full mx-auto my-8 z-10">
        <div className="bg-white/95 border border-[#E3E8EE] rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(41,42,58,0.06)] backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E1F3EB] text-[#252735] border border-[#55C9A2]/40 font-mono inline-block">
              CUSTOMER SELF-SERVICE REGISTRATION
            </span>
            <h1 className="text-2xl font-bold text-[#252735] mt-3 font-display">
              Register Customer Account
            </h1>
            <p className="text-xs text-[#697386] mt-1">
              Create an account for your business to manage software licenses, review quotations, and track GST invoices.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Contact Person Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Solutions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Business Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                  <input
                    type="email"
                    required
                    placeholder="billing@acmetech.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs font-mono focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="29AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs font-mono uppercase focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Billing Address
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                  <input
                    type="text"
                    placeholder="Outer Ring Road, Bengaluru"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                  />
                </div>
              </div>
            </div>

            {/* Password with Scene 1 complexity enforcement */}
            <div>
              <label className="block font-semibold text-[#252735] mb-1">
                Account Password *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9299A8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 special char"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/40 text-[#252735] text-xs font-mono focus:ring-2 focus:ring-[#6254E8] focus:outline-none placeholder:text-[#9299A8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9299A8] hover:text-[#252735]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password validation indicators (Required by Scene 1) */}
              <div className="mt-2.5 grid grid-cols-2 gap-2 p-2.5 rounded-xl card-lavender border border-[#E3E8EE] text-[10px]">
                <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? 'text-[#55C9A2]' : 'text-[#9299A8]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>&gt; 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasUppercase ? 'text-[#55C9A2]' : 'text-[#9299A8]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasLowercase ? 'text-[#55C9A2]' : 'text-[#9299A8]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasSpecialChar ? 'text-[#55C9A2]' : 'text-[#9299A8]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 special character</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full py-3 rounded-xl bg-[#55C9A2] hover:bg-[#45b791] disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-[#55C9A2]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Registering with Supabase...' : 'Create Customer Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-4 border-t border-[#E3E8EE] text-center">
            <p className="text-xs text-[#697386]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6254E8] hover:underline font-bold">
                Sign In to Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-[#697386] border-t border-[#E3E8EE] pt-4 z-10">
        Brightloop Software Pvt Ltd © 2026. Certified ISO 27001 & GST India Rule 46 Compliant.
      </footer>
    </div>
  );
};
