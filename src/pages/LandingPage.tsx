import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from '../router/Router';
import {
  Zap,
  Kanban,
  Receipt,
  PieChart,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Package,
  TrendingUp,
  Cpu,
  Boxes,
  Wrench,
  Users,
  ChevronRight,
  Layers,
  Sparkles,
  UserPlus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { products, billingPlans } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              B
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-display">
                Brightloop <span className="text-indigo-400">Software</span>
              </span>
              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Enterprise Recurring Billing Platform
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Platform Capabilities</a>
            <a href="#catalog" className="hover:text-white transition-colors">Software Catalog</a>
            <a href="#clients" className="hover:text-white transition-colors">Client Portfolio</a>
            <a href="#compliance" className="hover:text-white transition-colors">GST Compliance</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Register</span>
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Generation Recurring Billing & Subscription Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto font-display leading-tight">
            Run Your Subscription Business on One Unified Backbone
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From master catalog software licenses and custom duration plans to sales offer quotations, automated 18% GST invoicing, and real-time MRR analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Customer Self-Registration</span>
            </Link>
          </div>

          {/* Metrics Band */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-white font-mono">₹41.8 Lakhs</div>
              <div className="text-xs text-slate-400 mt-0.5">Annual Recurring Revenue</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-emerald-400 font-mono">100% Zero</div>
              <div className="text-xs text-slate-400 mt-0.5">Double-Billing Rate (Idempotent)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-indigo-400 font-mono">18% GST</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated Rule 46 Tax Invoicing</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-sky-400 font-mono">&lt; 1.8s</div>
              <div className="text-xs text-slate-400 mt-0.5">Response Time on Heavy Tables</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="py-20 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
              ENGINEERED FOR MODERN SAAS & ENTERPRISES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Built to Eliminate Every Friction in Recurring Billing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Addresses all operational scenes: from public sign-up and catalog launch to Kanban lifecycle tracking, batch invoicing, and executive finance ledgering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Subscription Lifecycle Kanban
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual pipeline moving licenses smoothly across Draft, Quotation, Confirmed, Active, Paused, and Closed states without spreadsheet chaos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Batch Billing Day Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated monthly bulk billing with cryptographic idempotency key hashes, ensuring no subscription is ever skipped or duplicate-invoiced.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Rule 46 GST Invoicing & Receipts
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic 18% GST taxation calculation (CGST 9% + SGST 9% or IGST 18%), multi-method payment receipt recording, and balance reconciliation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Preview */}
      <section id="catalog" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                PRODUCT & PLAN CATALOG
              </span>
              <h2 className="text-2xl font-bold text-white mt-1 font-display">
                Available Software Licenses & Modules
              </h2>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Sign In to Configure Plans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    {p.type}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    ₹{p.salesPrice.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{p.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{p.notes}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>SAC: {p.hsnSacCode}</span>
                  <span className="text-indigo-400">GST 18%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Social Proof */}
      <section id="clients" className="py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Trusted by Enterprise Software & Retail Clients
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm font-bold text-slate-400 font-display">
            <span>Infosys Tech Solutions</span>
            <span>Wipro Digital Systems</span>
            <span>TCS Enterprise Services</span>
            <span>Shree Ram Enterprises</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="text-slate-300 font-bold font-display">Brightloop Software Pvt Ltd</span>
          </div>
          <div>Embassy TechVillage, Outer Ring Road, Bengaluru, Karnataka 560103</div>
          <div>© 2026 Brightloop Software. GST India Rule 46 Compliant.</div>
        </div>
      </footer>
    </div>
  );
};
