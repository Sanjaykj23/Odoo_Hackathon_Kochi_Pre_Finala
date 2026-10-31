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
  Users,
  ChevronRight,
  Layers,
  Sparkles,
  UserPlus,
  ShieldAlert,
  SlidersHorizontal,
  Lock,
  UserCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { products } = useApp();

  return (
    <div className="min-h-screen bg-[#EAF3F8] text-[#252735] font-sans selection:bg-[#E9E6FF] selection:text-[#6254E8] relative overflow-x-hidden">
      {/* Ambient background pastel atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#E1F3EB]/50 rounded-full blur-3xl" />
        <div className="absolute top-28 right-1/4 w-[550px] h-[350px] bg-[#F0EDFA]/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[400px] bg-[#E5F0FA]/50 rounded-full blur-3xl" />
      </div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E3E8EE] shadow-[0_2px_12px_rgba(41,42,58,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6254E8] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#6254E8]/20">
              B
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#252735] font-display">
                Brightloop <span className="text-[#6254E8]">Software</span>
              </span>
              <div className="text-[10px] text-[#697386] font-mono hidden sm:block">
                Enterprise Recurring Billing Platform
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#697386]">
            <a href="#features" className="hover:text-[#6254E8] transition-colors">Platform Capabilities</a>
            <a href="#roles" className="hover:text-[#6254E8] transition-colors">Role Perspectives</a>
            <a href="#catalog" className="hover:text-[#6254E8] transition-colors">Software Catalog</a>
            <a href="#compliance" className="hover:text-[#6254E8] transition-colors">GST Compliance</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-3.5 py-2 rounded-xl border border-[#E3E8EE] bg-white hover:bg-[#F0EDFA]/40 text-[#252735] text-xs font-semibold transition-all shadow-[0_2px_6px_rgba(41,42,58,0.03)] flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#55C9A2]" />
              <span>Register</span>
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white text-xs font-bold shadow-md shadow-[#6254E8]/25 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#E3E8EE]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E6FF] border border-[#7A8CE8]/30 text-xs font-semibold text-[#6254E8] shadow-[0_2px_8px_rgba(98,84,232,0.08)]">
            <Sparkles className="w-3.5 h-3.5 text-[#6254E8]" />
            <span>Next-Generation Recurring Billing & Subscription Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#252735] max-w-4xl mx-auto font-display leading-[1.15]">
            Run Your Subscription Business on One <span className="text-[#6254E8]">Unified Backbone</span>
          </h1>

          <p className="text-sm sm:text-base text-[#697386] max-w-2xl mx-auto leading-relaxed">
            From master catalog software licenses and custom duration plans to sales offer quotations, automated 18% GST invoicing, and real-time MRR analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white text-xs font-bold shadow-lg shadow-[#6254E8]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#E8F5F1]/50 text-[#252735] text-xs font-semibold border border-[#E3E8EE] shadow-[0_4px_12px_rgba(41,42,58,0.04)] transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-[#55C9A2]" />
              <span>Customer Self-Registration</span>
            </Link>
          </div>

          {/* Metrics Band */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-5 rounded-2xl card-lavender shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE]">
              <div className="text-2xl font-bold text-[#292A3A] font-mono">₹41.8 Lakhs</div>
              <div className="text-xs text-[#697386] mt-1 font-medium">Annual Recurring Revenue</div>
            </div>
            <div className="p-5 rounded-2xl card-mint shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE]">
              <div className="text-2xl font-bold text-[#252735] font-mono">100% Zero</div>
              <div className="text-xs text-[#697386] mt-1 font-medium">Double-Billing Rate (Idempotent)</div>
            </div>
            <div className="p-5 rounded-2xl card-blue shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE]">
              <div className="text-2xl font-bold text-[#6254E8] font-mono">18% GST</div>
              <div className="text-xs text-[#697386] mt-1 font-medium">Rule 46 Automated Invoicing</div>
            </div>
            <div className="p-5 rounded-2xl card-peach shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE]">
              <div className="text-2xl font-bold text-[#252735] font-mono">&lt; 1.8s</div>
              <div className="text-xs text-[#697386] mt-1 font-medium">Response Time on Heavy Tables</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="py-20 border-b border-[#E3E8EE]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6254E8] font-mono bg-[#E9E6FF] px-3 py-1 rounded-full border border-[#7A8CE8]/20">
              ENGINEERED FOR MODERN SAAS & ENTERPRISES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252735] font-display">
              Built to Eliminate Every Friction in Recurring Billing
            </h2>
            <p className="text-xs sm:text-sm text-[#697386] leading-relaxed">
              Addresses all operational scenes: from public sign-up and catalog launch to Kanban lifecycle tracking, batch invoicing, and executive finance ledgering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white/90 border border-[#E3E8EE] hover:border-[#7A8CE8]/40 shadow-[0_10px_30px_rgba(41,42,58,0.03)] hover:shadow-[0_14px_34px_rgba(41,42,58,0.06)] transition-all space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-[#E5F0FA] text-[#6254E8] flex items-center justify-center border border-[#87BCEB]/30">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#252735] font-display">
                Subscription Lifecycle Kanban
              </h3>
              <p className="text-xs text-[#697386] leading-relaxed">
                Visual pipeline moving licenses smoothly across Draft, Quotation, Confirmed, Active, Paused, and Closed states without spreadsheet chaos.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#6254E8]">
                <span>State machine automation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/90 border border-[#E3E8EE] hover:border-[#7A8CE8]/40 shadow-[0_10px_30px_rgba(41,42,58,0.03)] hover:shadow-[0_14px_34px_rgba(41,42,58,0.06)] transition-all space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F0EDFA] text-[#6254E8] flex items-center justify-center border border-[#7A8CE8]/30">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#252735] font-display">
                Batch Billing Day Engine
              </h3>
              <p className="text-xs text-[#697386] leading-relaxed">
                Automated monthly bulk billing with cryptographic idempotency key hashes, ensuring no subscription is ever skipped or duplicate-invoiced.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#6254E8]">
                <span>Zero double-billing guarantee</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/90 border border-[#E3E8EE] hover:border-[#7A8CE8]/40 shadow-[0_10px_30px_rgba(41,42,58,0.03)] hover:shadow-[0_14px_34px_rgba(41,42,58,0.06)] transition-all space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-[#E1F3EB] text-[#55C9A2] flex items-center justify-center border border-[#55C9A2]/30">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#252735] font-display">
                Rule 46 GST Invoicing & Receipts
              </h3>
              <p className="text-xs text-[#697386] leading-relaxed">
                Dynamic 18% GST taxation calculation (CGST 9% + SGST 9% or IGST 18%), multi-method payment receipt recording, and balance reconciliation.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#55C9A2]">
                <span>Compliant tax invoices & receipts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Perspectives */}
      <section id="roles" className="py-20 border-b border-[#E3E8EE]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6254E8] font-mono bg-[#E9E6FF] px-3 py-1 rounded-full border border-[#7A8CE8]/20">
              UNIFIED COLLABORATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252735] font-display">
              Four Tailored Role Perspectives
            </h2>
            <p className="text-xs sm:text-sm text-[#697386]">
              Every department has its dedicated cockpit with strict role-based access control and live synchronized data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl card-lavender shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#6254E8] flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#252735]">Administrator</h4>
              <p className="text-xs text-[#697386] leading-relaxed">
                Full authority over master catalog, IAM staff provisioning, discount rules, and system configurations.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6254E8]">
                <span>Admin Console</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl card-mint shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#55C9A2] flex items-center justify-center shadow-xs">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#252735]">Finance Lead</h4>
              <p className="text-xs text-[#697386] leading-relaxed">
                Executive MRR analytics, ASC 606 revenue recognition, overdue aging matrix, and tax ledgering.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#55C9A2]">
                <span>Finance Portal</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl card-blue shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#6254E8] flex items-center justify-center shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#252735]">Sales Staff</h4>
              <p className="text-xs text-[#697386] leading-relaxed">
                Multi-seat quotation builder, Kanban milestone board, customer contract logging, and lifecycle updates.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6254E8]">
                <span>Sales Kanban</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl card-peach shadow-[0_8px_20px_rgba(41,42,58,0.03)] border border-[#E3E8EE] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#292A3A] flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#252735]">Customer Portal</h4>
              <p className="text-xs text-[#697386] leading-relaxed">
                Self-service quotation review, one-click contract acceptance, payment receipt logs, and active licenses.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#292A3A]">
                <span>Client Portal</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Preview */}
      <section id="catalog" className="py-20 border-b border-[#E3E8EE]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6254E8] font-mono bg-[#E9E6FF] px-3 py-1 rounded-full border border-[#7A8CE8]/20">
                PRODUCT & PLAN CATALOG
              </span>
              <h2 className="text-2xl font-bold text-[#252735] mt-2 font-display">
                Available Software Licenses & Modules
              </h2>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-[#6254E8] hover:text-[#5244d4] flex items-center gap-1"
            >
              <span>Sign In to Configure Plans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white border border-[#E3E8EE] shadow-[0_6px_18px_rgba(41,42,58,0.03)] space-y-3 transition-all hover:shadow-[0_10px_26px_rgba(41,42,58,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0EDFA] text-[#6254E8] border border-[#7A8CE8]/30 font-mono">
                    {p.type}
                  </span>
                  <span className="text-xs font-bold text-[#55C9A2] font-mono">
                    ₹{p.salesPrice.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#252735]">{p.name}</h4>
                <p className="text-xs text-[#697386] line-clamp-2">{p.notes}</p>
                <div className="pt-2 border-t border-[#E3E8EE] text-[11px] text-[#697386] flex items-center justify-between">
                  <span>SAC: {p.hsnSacCode}</span>
                  <span className="font-semibold text-[#6254E8]">GST 18%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GST Compliance & Architecture */}
      <section id="compliance" className="py-16 border-b border-[#E3E8EE]/80 relative z-10 bg-white/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6254E8] font-mono">
              FINANCIAL AUDITABILITY & STATUTORY INTEGRITY
            </span>
            <h2 className="text-2xl font-bold text-[#252735] font-display">
              GST India Rule 46 & ASC 606 Ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E3E8EE] shadow-xs space-y-2">
              <div className="font-bold text-sm text-[#252735] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#55C9A2]" />
                <span>Statutory Tax Breakdown</span>
              </div>
              <p className="text-xs text-[#697386] leading-relaxed">
                Automatic split of 18% GST into CGST (9%) + SGST (9%) for intra-state and IGST (18%) for inter-state deliveries with state codes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E8EE] shadow-xs space-y-2">
              <div className="font-bold text-sm text-[#252735] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#55C9A2]" />
                <span>ASC 606 Revenue Recognition</span>
              </div>
              <p className="text-xs text-[#697386] leading-relaxed">
                Earned vs deferred revenue split across contract tenure with daily amortization and automated journal voucher entries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E8EE] shadow-xs space-y-2">
              <div className="font-bold text-sm text-[#252735] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#55C9A2]" />
                <span>Cryptographic Idempotency</span>
              </div>
              <p className="text-xs text-[#697386] leading-relaxed">
                SHA-256 batch key hashes eliminate duplicate invoice generation even under concurrent worker node execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Social Proof */}
      <section id="clients" className="py-14 border-b border-[#E3E8EE]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9299A8]">
            Trusted by Enterprise Software & Retail Clients
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-bold text-[#697386] font-display">
            <span className="hover:text-[#252735] transition-colors">Infosys Tech Solutions</span>
            <span className="hover:text-[#252735] transition-colors">Wipro Digital Systems</span>
            <span className="hover:text-[#252735] transition-colors">TCS Enterprise Services</span>
            <span className="hover:text-[#252735] transition-colors">Shree Ram Enterprises</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white/70 backdrop-blur-md text-[#697386] text-xs border-t border-[#E3E8EE] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#6254E8] flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="text-[#252735] font-bold font-display">Brightloop Software Pvt Ltd</span>
          </div>
          <div>Embassy TechVillage, Outer Ring Road, Bengaluru, Karnataka 560103</div>
          <div>© 2026 Brightloop Software. GST India Rule 46 Compliant.</div>
        </div>
      </footer>
    </div>
  );
};
