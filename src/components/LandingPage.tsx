import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
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
  Info,
  ShieldAlert,
  SlidersHorizontal,
  Calculator,
  Lock,
  UserCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setScreenMode, products, billingPlans } = useApp();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const demoRoles: { role: UserRole; title: string; icon: React.ReactNode; desc: string; badgeColor: string }[] = [
    {
      role: 'ADMIN',
      title: 'Administrator',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      desc: 'Master catalog, 18% GST rules, Staff IAM, and system configuration.',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800'
    },
    {
      role: 'STAFF',
      title: 'Sales Rep / Internal Staff',
      icon: <UserCheck className="w-5 h-5 text-blue-400" />,
      desc: 'Multi-product quotation builder, Kanban milestone board, payment logging.',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800'
    },
    {
      role: 'FINANCE_LEAD',
      title: 'Finance Lead Executive',
      icon: <PieChart className="w-5 h-5 text-emerald-400" />,
      desc: 'MRR/ARR revenue reports, ASC 606 revenue waterfall, overdue aging matrix.',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
    },
    {
      role: 'CUSTOMER',
      title: 'Customer Self-Service Portal',
      icon: <Building2 className="w-5 h-5 text-amber-400" />,
      desc: 'Isolated client portal to review quotes, accept plans, and download GST receipts.',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Top Navigation */}
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
                Enterprise Subscription & Billing Management Platform
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Platform Capabilities</a>
            <a href="#innovations" className="hover:text-white transition-colors">Product Innovations</a>
            <a href="#personas" className="hover:text-white transition-colors">Demo Personas</a>
            <a href="#catalog" className="hover:text-white transition-colors">Software Catalog</a>
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
            <span>Next-Gen Subscription Backbone · Odoo Hackathon Flagship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto font-display leading-tight">
            Run B2B Subscriptions on One Unified Digital Backbone
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automating the full lifecycle of recurring software: master catalog licensing, predictive churn AI, human-approved retention offers, idempotent 18% GST billing, and ASC 606 revenue recognition.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setScreenMode('LOGIN')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#personas"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Role Personas</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
          </div>

          {/* Interactive Hero Showcase Widget */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 text-left relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-bold text-slate-400 font-mono ml-2">Brightloop Control Console · Live Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    GST 18% COMPLIANT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 relative">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>MRR Analytics</span>
                    <Info
                      onClick={() => setActiveTooltip(activeTooltip === 'mrr' ? null : 'mrr')}
                      className="w-3.5 h-3.5 text-indigo-400 cursor-pointer hover:text-white"
                    />
                  </div>
                  {activeTooltip === 'mrr' && (
                    <div className="absolute top-8 left-0 right-0 p-2.5 bg-slate-900 border border-indigo-500/50 rounded-lg text-[10px] text-slate-200 z-50 shadow-2xl">
                      Dynamic MRR calculated by normalizing Monthly, Yearly (/12), and Weekly (x4.33) subscriptions.
                    </div>
                  )}
                  <div className="text-lg font-bold text-emerald-400 font-mono">₹11,145</div>
                  <div className="text-[10px] text-slate-500">ARR Run-Rate: ₹1.34 Lakhs</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 relative">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Churn Risk Score</span>
                    <Info
                      onClick={() => setActiveTooltip(activeTooltip === 'churn' ? null : 'churn')}
                      className="w-3.5 h-3.5 text-rose-400 cursor-pointer hover:text-white"
                    />
                  </div>
                  {activeTooltip === 'churn' && (
                    <div className="absolute top-8 left-0 right-0 p-2.5 bg-slate-900 border border-rose-500/50 rounded-lg text-[10px] text-slate-200 z-50 shadow-2xl">
                      Predicts renewal likelihood based on overdue days and customer feedback. Triggers human-approved retention offers.
                    </div>
                  )}
                  <div className="text-lg font-bold text-rose-400 font-mono">38% (High Risk)</div>
                  <div className="text-[10px] text-rose-400 font-medium">Human Retention Review Ready</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Bulk Billing Engine</div>
                  <div className="text-lg font-bold text-indigo-400 font-mono">Idempotent Runs</div>
                  <div className="text-[10px] text-slate-500">Hash key locks prevent duplicate bills</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">ASC 606 Revenue</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">72% Recognized</div>
                  <div className="text-[10px] text-slate-500">Earned GAAP vs Deferred Liability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click Demo Personas Launcher */}
      <section id="personas" className="py-20 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Instant Evaluator Launch</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
              1-Click Role Persona Previews
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Test the platform from any user perspective right away. Strict RBAC controls prevent role escalation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoRoles.map((demo) => (
              <button
                key={demo.role}
                onClick={() => loginAsRole(demo.role)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 text-left transition-all duration-200 hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {demo.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${demo.badgeColor}`}>
                    {demo.role}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {demo.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{demo.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                  <span>Launch Perspective</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship Product Innovations */}
      <section id="innovations" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Standout Innovations</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
              Built Beyond Standard Billing CRUD
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Introducing proactive retention intelligence, customer self-service expansion, and ASC 606 revenue compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-indigo-500/50 transition-colors relative">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  PROACTIVE AI
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Smart Churn Prediction & Human Retention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes 0-100% Renewal Health Scores. Allows sales reps to open a human approval review modal, adjust custom discount rates (5-40%), and sign off on retention offers.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-indigo-500/50 transition-colors relative">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  SELF-SERVICE
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Self-Service License Expansion Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowers customers in their portal to scale seat quantities, toggle add-on modules, or switch cadence from Monthly to Yearly with live pro-rata delta pricing.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-indigo-500/50 transition-colors relative">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  ASC 606 GAAP
                </span>
              </div>
              <h3 className="text-base font-bold text-white">ASC 606 / Ind AS 115 Revenue Waterfall</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separates upfront cash collected into Recognized Earned GAAP Revenue vs Deferred Revenue Liability, providing an executive 12-month cash flow simulation.
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
              Software Offerings, Add-ons & SLAs
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
          <div>© 2026 Brightloop Software. Certified ISO 27001 & GST India Compliant.</div>
        </div>
      </footer>
    </div>
  );
};
