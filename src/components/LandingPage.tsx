import React from 'react';
import { useApp } from '../context/AppContext';
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
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setScreenMode, loginAsRole, products, billingPlans } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Platform Capabilities</a>
            <a href="#catalog" className="hover:text-white transition-colors">Software Catalog</a>
            <a href="#clients" className="hover:text-white transition-colors">Client Portfolio</a>
            <a href="#compliance" className="hover:text-white transition-colors">GST Compliance</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreenMode('LOGIN')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>Sign In to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
            <button
              onClick={() => setScreenMode('LOGIN')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Launch Platform Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
          </div>

          {/* Interactive Hero Showcase Mockup */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-bold text-slate-400 font-mono ml-2">Brightloop Console · Live Preview</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ACTIVE ENGINE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Monthly Recurring Revenue (MRR)</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">₹11,145</div>
                  <div className="text-[10px] text-slate-500">ARR Run-Rate: ₹1.34 Lakhs</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">GST Invoicing Engine</div>
                  <div className="text-lg font-bold text-indigo-400 font-mono">18% GST (IN)</div>
                  <div className="text-[10px] text-slate-500">CGST 9% + SGST 9% / IGST</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Subscriptions Milestone Kanban</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">6 Active Contracts</div>
                  <div className="text-[10px] text-slate-500">Draft ➔ Quote ➔ Confirmed ➔ Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Platform Features</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
              Built for High-Velocity Subscription Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Eliminate error-prone spreadsheet billing with strict state transitions and automated tax reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit text-amber-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Automated Bulk Billing Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan active subscriptions due on billing day. Cryptographic idempotency keys lock each run to prevent duplicate charges or skipped cycles.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 w-fit text-indigo-400">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Lifecycle Kanban State Graph</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual Kanban swimlanes for milestone state tracking: Draft $\rightarrow$ Quotation $\rightarrow$ Confirmed $\rightarrow$ Active $\rightarrow$ Closed/Paused.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit text-emerald-400">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">GST Invoicing & Printable Tax Bills</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Itemized 18% GST (CGST/SGST/IGST), HSN/SAC code mapping, and official Rule 46 printable tax invoice templates (<code className="text-indigo-300 font-mono">window.print()</code>).
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit text-purple-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Tenant Customer Self-Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Isolated portal for clients to review sales offers, accept and activate subscriptions, negotiate terms, and download GST receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Software Catalog Preview */}
      <section id="catalog" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Master Catalog</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
              Software Applications, Add-ons & SLAs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                    {p.type}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    ₹{p.salesPrice.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.notes}</p>
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
