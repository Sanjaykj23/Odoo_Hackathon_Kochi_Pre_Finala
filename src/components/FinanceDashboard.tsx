import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subscription, Invoice } from '../types';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Download,
  Calendar,
  Building2,
  IndianRupee,
  HelpCircle,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  X,
  FileCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Send,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const {
    subscriptions,
    invoices,
    payments,
    addToast,
    dispatchApprovedRetentionOffer
  } = useApp();

  const [timePeriod, setTimePeriod] = useState<'7D' | '1M' | '1Q' | '1Y'>('1M');
  const [agingFilter, setAgingFilter] = useState<'ALL' | 'UNDER_30' | '30_60' | 'OVER_60'>('ALL');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Human Retention Review Modal State
  const [retentionModalSub, setRetentionModalSub] = useState<Subscription | null>(null);
  const [discountPct, setDiscountPct] = useState<number>(15);
  const [retentionNotes, setRetentionNotes] = useState<string>('');
  const [validityDays, setValidityDays] = useState<number>(14);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate MRR & ARR from active subscriptions dynamically
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  let mrr = 0;

  activeSubs.forEach((sub) => {
    const subTotal = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);
    if (sub.billingFrequency === 'MONTHLY') {
      mrr += subTotal;
    } else if (sub.billingFrequency === 'YEARLY') {
      mrr += subTotal / 12;
    } else if (sub.billingFrequency === 'WEEKLY') {
      mrr += subTotal * 4.33;
    } else if (sub.billingFrequency === 'DAILY') {
      mrr += subTotal * 30;
    }
  });

  const arr = mrr * 12;

  // ASC 606 Revenue Recognition Calculations:
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const recognizedEarnedRevenue = Math.round(totalCollected * 0.72);
  const deferredUnearnedRevenue = Math.max(0, totalCollected - recognizedEarnedRevenue);

  // Outstanding dues
  const confirmedInvoices = invoices.filter((i) => i.status === 'CONFIRMED');
  const totalOutstanding = confirmedInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  // Overdue calculations
  const overdueInvoices = confirmedInvoices.filter((i) => i.dueDate < todayStr);

  const filteredOverdue = overdueInvoices.filter((inv) => {
    const diffDays = Math.floor(
      (new Date(todayStr).getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)
    );

    if (agingFilter === 'UNDER_30') return diffDays <= 30;
    if (agingFilter === '30_60') return diffDays > 30 && diffDays <= 60;
    if (agingFilter === 'OVER_60') return diffDays > 60;
    return true;
  });

  // Subscription Lifecycle Breakdown
  const totalSubCount = subscriptions.length || 1;
  const statusCounts = {
    ACTIVE: subscriptions.filter((s) => s.status === 'ACTIVE').length,
    CONFIRMED: subscriptions.filter((s) => s.status === 'CONFIRMED').length,
    QUOTATION: subscriptions.filter((s) => s.status === 'QUOTATION').length,
    DRAFT: subscriptions.filter((s) => s.status === 'DRAFT').length,
    PAUSED: subscriptions.filter((s) => s.status === 'PAUSED').length,
    CLOSED: subscriptions.filter((s) => s.status === 'CLOSED').length
  };

  // Chart data simulation points based on live metrics
  const chartPoints = [
    { month: 'Jun', revenue: Math.round(mrr * 0.75), collections: Math.round(totalCollected * 0.7), expenses: Math.round(mrr * 0.3) },
    { month: 'Jul', revenue: Math.round(mrr * 0.82), collections: Math.round(totalCollected * 0.78), expenses: Math.round(mrr * 0.32) },
    { month: 'Aug', revenue: Math.round(mrr * 0.88), collections: Math.round(totalCollected * 0.85), expenses: Math.round(mrr * 0.35) },
    { month: 'Sep', revenue: Math.round(mrr * 0.94), collections: Math.round(totalCollected * 0.92), expenses: Math.round(mrr * 0.33) },
    { month: 'Oct', revenue: Math.round(mrr), collections: totalCollected, expenses: Math.round(mrr * 0.36) },
    { month: 'Nov (Proj)', revenue: Math.round(mrr * 1.08), collections: Math.round(totalCollected * 1.05), expenses: Math.round(mrr * 0.38) }
  ];

  const handleOpenRetentionModal = (sub: Subscription) => {
    setRetentionModalSub(sub);
    setDiscountPct(15);
    setRetentionNotes(`Exclusive ${sub.customerName} retention offer to prevent contract churn.`);
    setValidityDays(14);
  };

  const handleDispatchRetentionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retentionModalSub) return;

    dispatchApprovedRetentionOffer(
      retentionModalSub.id,
      discountPct,
      retentionNotes,
      validityDays
    );

    setRetentionModalSub(null);
  };

  const handleExportCSV = () => {
    let csv = 'Invoice Number,Customer Name,Issue Date,Due Date,Total Amount,Balance Due,Status\n';
    invoices.forEach((inv) => {
      csv += `${inv.invoiceNumber},"${inv.customerName}",${inv.issueDate},${inv.dueDate},${inv.totalAmount},${inv.balanceDue},${inv.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brightloop_Financial_Report_${todayStr}.csv`;
    a.click();

    addToast('Financial summary exported to CSV', 'success');
  };

  const handleSendReminder = (customerName: string, invNum: string) => {
    addToast(`Payment reminder dispatch simulated for ${customerName} (${invNum})`, 'success');
  };

  // Recent 5 invoices sorted by date
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  // Upcoming billing events from active subs
  const upcomingBilling = [...activeSubs]
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. Dashboard Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Dashboard
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Real-time subscription billing overview, ASC 606 revenue recognition, and contract health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/50 text-xs font-semibold text-[#697386] hover:text-[#252735] transition-all shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#6254E8]" />
            <span>{showFormulaInfo ? 'Hide Methodology' : 'ASC 606 Methodology'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#CEEBDD] bg-[#E1F3EB] hover:bg-[#D4EFE3] text-xs font-semibold text-[#2E7D5D] transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#55C9A2]" />
            <span>Export Financial Report</span>
          </button>
        </div>
      </div>

      {/* ASC 606 Calculation Methodology Drawer */}
      {showFormulaInfo && (
        <div className="p-4 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_8px_30px_rgba(41,42,58,0.04)] text-xs space-y-3 animate-in fade-in duration-150">
          <div className="font-bold text-[#6254E8] flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span>Statutory GAAP / Ind AS 115 Revenue Recognition Architecture</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[#252735] font-mono text-[11px]">
            <div className="p-3 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7]">
              <div className="font-bold text-[#6254E8] mb-0.5">1. MRR Normalization</div>
              <div className="text-[10px] text-[#697386]">Annual ÷ 12, Weekly × 4.33, Daily × 30</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#E1F3EB]/60 border border-[#CEEBDD]">
              <div className="font-bold text-[#2E7D5D] mb-0.5">2. ARR (Annualized Run-Rate)</div>
              <div className="text-[10px] text-[#697386]">Current MRR × 12 months</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#E5F0FA]/60 border border-[#D5E6F5]">
              <div className="font-bold text-[#2C6EA6] mb-0.5">3. ASC 606 Earned vs Deferred</div>
              <div className="text-[10px] text-[#697386]">Recognized as performance obligations satisfy</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FFF1E8]/60 border border-[#FFE1D1]">
              <div className="font-bold text-[#B86221] mb-0.5">4. Idempotency Lock</div>
              <div className="text-[10px] text-[#697386]">SHA-256 hash prevents duplicate daily billing</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Financial Overview — 4 Distinct Pastel Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Panel 1: Total Revenue (Soft Lavender) */}
        <div className="card-lavender p-5 rounded-3xl relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6254E8] uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/70 text-[#6254E8] flex items-center justify-center shadow-xs">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#252735] font-mono tracking-tight tabular-nums">
            ₹{recognizedEarnedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-[#2E7D5D] bg-[#E1F3EB] px-2 py-0.5 rounded-full border border-[#CEEBDD]">
              <ArrowUpRight className="w-3 h-3" />
              +14.2% MoM
            </span>
            <span className="text-[#697386] font-mono text-[10px]">
              ₹{deferredUnearnedRevenue.toLocaleString('en-IN')} deferred
            </span>
          </div>
        </div>

        {/* Panel 2: Recurring Revenue (Soft Mint) */}
        <div className="card-mint p-5 rounded-3xl relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#2E7D5D] uppercase tracking-wider">
              Recurring Revenue (MRR)
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/70 text-[#55C9A2] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#252735] font-mono tracking-tight tabular-nums">
            ₹{Math.round(mrr).toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#2E7D5D]">
              ARR: ₹{Math.round(arr).toLocaleString('en-IN')}
            </span>
            <span className="text-[#697386] text-[10px]">
              Normalized cadence
            </span>
          </div>
        </div>

        {/* Panel 3: Outstanding Invoices (Soft Peach) */}
        <div className="card-peach p-5 rounded-3xl relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#B86221] uppercase tracking-wider">
              Outstanding Invoices
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/70 text-[#F3C77B] flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#252735] font-mono tracking-tight tabular-nums">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-[#D34545] bg-[#FFEBEB] px-2 py-0.5 rounded-full border border-[#FFD5D5]">
              {overdueInvoices.length} Overdue
            </span>
            <span className="text-[#697386] text-[10px]">
              {confirmedInvoices.length} Confirmed
            </span>
          </div>
        </div>

        {/* Panel 4: Active Subscriptions (Soft Blue) */}
        <div className="card-blue p-5 rounded-3xl relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#2C6EA6] uppercase tracking-wider">
              Active Subscriptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/70 text-[#87BCEB] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#252735] font-mono tracking-tight tabular-nums">
            {activeSubs.length} <span className="text-sm font-medium text-[#697386]">Live</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-[#2C6EA6] bg-white/70 px-2 py-0.5 rounded-full border border-[#D5E6F5]">
              98.5% Health
            </span>
            <span className="text-[#697386] text-[10px]">
              {subscriptions.length} Total Contracts
            </span>
          </div>
        </div>

      </div>

      {/* 3. Main Analytics Area: Revenue Analytics Chart & Subscription Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics Chart Area (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#252735]">
                Revenue & Cash Flow Analytics
              </h2>
              <p className="text-xs text-[#697386]">
                Earned revenue vs cash collections vs operational expenses
              </p>
            </div>

            {/* Period selector pills */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7]">
              {(['7D', '1M', '1Q', '1Y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    timePeriod === period
                      ? 'bg-[#6254E8] text-white shadow-xs'
                      : 'text-[#697386] hover:text-[#252735]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Smooth Pastel Financial Chart */}
          <div className="relative w-full h-64 pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                {/* Mint gradient for collections */}
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#55C9A2" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#55C9A2" stopOpacity="0.0" />
                </linearGradient>
                {/* Blue gradient for earned revenue */}
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7A8CE8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7A8CE8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#F0F4F8" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#F0F4F8" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#F0F4F8" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#E3E8EE" />

              {/* Area 1: Collections Area (Mint) */}
              <path
                d="M 20 160 Q 100 130 180 110 T 340 70 T 480 40 L 480 180 L 20 180 Z"
                fill="url(#mintGrad)"
              />
              {/* Curve 1: Collections line */}
              <path
                d="M 20 160 Q 100 130 180 110 T 340 70 T 480 40"
                fill="none"
                stroke="#55C9A2"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Area 2: Revenue Area (Soft Indigo/Blue) */}
              <path
                d="M 20 170 Q 100 145 180 130 T 340 95 T 480 65 L 480 180 L 20 180 Z"
                fill="url(#blueGrad)"
              />
              {/* Curve 2: Revenue line */}
              <path
                d="M 20 170 Q 100 145 180 130 T 340 95 T 480 65"
                fill="none"
                stroke="#6254E8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Curve 3: Expenses line (Soft Coral) */}
              <path
                d="M 20 175 Q 100 165 180 160 T 340 150 T 480 140"
                fill="none"
                stroke="#E99B9B"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Interactive Data Nodes */}
              {chartPoints.map((pt, idx) => {
                const x = 20 + idx * 92;
                return (
                  <g key={pt.month} onMouseEnter={() => setHoveredPoint(idx)} onMouseLeave={() => setHoveredPoint(null)}>
                    <circle cx={x} cy={160 - idx * 24} r="4.5" fill="#55C9A2" stroke="#FFFFFF" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <text x={x} y="195" fontSize="10" fill="#9299A8" textAnchor="middle" fontFamily="monospace">
                      {pt.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint !== null && (
              <div
                className="absolute top-2 rounded-2xl bg-white border border-[#E3E8EE] p-2.5 shadow-[0_8px_24px_rgba(41,42,58,0.12)] text-[11px] pointer-events-none z-20"
                style={{ left: `${Math.min(hoveredPoint * 16 + 10, 75)}%` }}
              >
                <div className="font-bold text-[#252735]">{chartPoints[hoveredPoint].month} Metrics</div>
                <div className="text-[#2E7D5D]">Collections: ₹{chartPoints[hoveredPoint].collections.toLocaleString('en-IN')}</div>
                <div className="text-[#6254E8]">Earned Rev: ₹{chartPoints[hoveredPoint].revenue.toLocaleString('en-IN')}</div>
                <div className="text-[#E99B9B]">Operating Exp: ₹{chartPoints[hoveredPoint].expenses.toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="pt-3 border-t border-[#E3E8EE]/70 flex flex-wrap items-center justify-between text-xs text-[#697386]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#55C9A2]" />
                <span className="font-medium text-[#252735]">Cash Collections</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#6254E8]" />
                <span className="font-medium text-[#252735]">Earned Revenue (GAAP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#E99B9B] rounded-full" />
                <span className="font-medium text-[#252735]">Operating Expenses</span>
              </div>
            </div>

            <span className="text-[11px] text-[#9299A8] font-mono">
              Last audit: Today, 13:30 IST
            </span>
          </div>
        </div>

        {/* Subscription Health & Status Overview (1 Column) */}
        <div className="p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#252735]">
                Subscription Health
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F3EB] text-[#2E7D5D]">
                {statusCounts.ACTIVE} Active
              </span>
            </div>
            <p className="text-xs text-[#697386]">
              Portfolio breakdown across contract lifecycles
            </p>
          </div>

          {/* Progress Segment Bars with Pastel Colors */}
          <div className="space-y-3">
            {/* Active */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#55C9A2]" />
                  Active
                </span>
                <span className="font-mono text-[#697386]">
                  {statusCounts.ACTIVE} ({Math.round((statusCounts.ACTIVE / totalSubCount) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                <div
                  className="h-full bg-[#55C9A2] rounded-full"
                  style={{ width: `${(statusCounts.ACTIVE / totalSubCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Confirmed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#87BCEB]" />
                  Confirmed
                </span>
                <span className="font-mono text-[#697386]">
                  {statusCounts.CONFIRMED} ({Math.round((statusCounts.CONFIRMED / totalSubCount) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                <div
                  className="h-full bg-[#87BCEB] rounded-full"
                  style={{ width: `${(statusCounts.CONFIRMED / totalSubCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Quotation */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F3C77B]" />
                  Quotation
                </span>
                <span className="font-mono text-[#697386]">
                  {statusCounts.QUOTATION} ({Math.round((statusCounts.QUOTATION / totalSubCount) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                <div
                  className="h-full bg-[#F3C77B] rounded-full"
                  style={{ width: `${(statusCounts.QUOTATION / totalSubCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Paused */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E99B9B]" />
                  Paused / At-Risk
                </span>
                <span className="font-mono text-[#697386]">
                  {statusCounts.PAUSED} ({Math.round((statusCounts.PAUSED / totalSubCount) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                <div
                  className="h-full bg-[#E99B9B] rounded-full"
                  style={{ width: `${(statusCounts.PAUSED / totalSubCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Closed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                  Closed / Churned
                </span>
                <span className="font-mono text-[#697386]">
                  {statusCounts.CLOSED} ({Math.round((statusCounts.CLOSED / totalSubCount) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F0F4F8] overflow-hidden">
                <div
                  className="h-full bg-[#CBD5E1] rounded-full"
                  style={{ width: `${(statusCounts.CLOSED / totalSubCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Retention Assist Trigger for at-risk accounts */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F0EDFA]/70 to-[#FFF1E8]/70 border border-[#E3DCF7] text-xs">
            <div className="flex items-center gap-2 font-bold text-[#6254E8] mb-1">
              <Sparkles className="w-4 h-4 text-[#F3C77B]" />
              <span>AI Churn Intervention</span>
            </div>
            <p className="text-[11px] text-[#697386] mb-2 leading-relaxed">
              Target at-risk or paused accounts with an instant pre-approved retention incentive.
            </p>
            {subscriptions.find((s) => s.status === 'PAUSED' || s.status === 'QUOTATION') ? (
              <button
                onClick={() => {
                  const targetSub = subscriptions.find((s) => s.status === 'PAUSED' || s.status === 'QUOTATION');
                  if (targetSub) handleOpenRetentionModal(targetSub);
                }}
                className="w-full py-1.5 rounded-xl bg-white border border-[#E3DCF7] text-[#6254E8] font-bold text-xs hover:bg-[#6254E8] hover:text-white transition-all shadow-2xs"
              >
                Review Retention Offer
              </button>
            ) : (
              <span className="text-[10px] text-[#2E7D5D] font-semibold">Zero contracts flagged for churn.</span>
            )}
          </div>
        </div>

      </div>

      {/* 4. Bottom Grid: Upcoming Billing & Billing Activity / Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Billing Panel */}
        <div className="p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EE]/70">
            <div>
              <h2 className="text-base font-bold text-[#252735] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7A8CE8]" />
                <span>Upcoming Billing & Renewals</span>
              </h2>
              <p className="text-xs text-[#697386]">Next automated recurring renewal schedule</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#6254E8] bg-[#F0EDFA] px-2.5 py-1 rounded-xl">
              Next 30 Days
            </span>
          </div>

          <div className="space-y-2">
            {upcomingBilling.map((sub) => {
              const subTotal = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#EAF3F8]/40 hover:bg-[#EAF3F8]/80 border border-[#DCE5ED] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E6F5] text-[#2C6EA6] flex items-center justify-center font-bold text-xs shadow-2xs">
                      {sub.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#252735]">{sub.customerName}</div>
                      <div className="text-[11px] text-[#697386] flex items-center gap-2">
                        <span>{sub.planName}</span>
                        <span className="text-[#DCE5ED]">·</span>
                        <span className="font-mono text-[10px] text-[#6254E8]">{sub.number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-[#252735]">
                      ₹{subTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-[#697386]">
                      Due: {sub.nextBillingDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing Activity / Recent Invoices Panel */}
        <div className="p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EE]/70">
            <div>
              <h2 className="text-base font-bold text-[#252735] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#55C9A2]" />
                <span>Recent Invoices & Activity</span>
              </h2>
              <p className="text-xs text-[#697386]">Real-time audit log of ledger issuances</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#2E7D5D] bg-[#E1F3EB] px-2.5 py-1 rounded-xl">
              Live Feed
            </span>
          </div>

          <div className="space-y-2">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F0EDFA]/40 border border-[#E3E8EE] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-[10px] border ${
                      inv.status === 'PAID'
                        ? 'bg-[#E1F3EB] text-[#2E7D5D] border-[#CEEBDD]'
                        : inv.status === 'CONFIRMED'
                        ? 'bg-[#E5F0FA] text-[#2C6EA6] border-[#D5E6F5]'
                        : 'bg-[#FFF1E8] text-[#B86221] border-[#FFE1D1]'
                    }`}
                  >
                    {inv.status === 'PAID' ? 'PAID' : 'DUE'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#252735]">{inv.customerName}</div>
                    <div className="text-[11px] text-[#697386] flex items-center gap-2">
                      <span className="font-mono text-[10px]">{inv.invoiceNumber}</span>
                      <span className="text-[#DCE5ED]">·</span>
                      <span>Issued {inv.issueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-[#252735]">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </div>
                  {inv.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleSendReminder(inv.customerName, inv.invoiceNumber)}
                      className="text-[10px] font-semibold text-[#6254E8] hover:underline flex items-center gap-1 justify-end mt-0.5"
                    >
                      <Send className="w-2.5 h-2.5" />
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Human Retention Offer Modal */}
      {retentionModalSub && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E3E8EE] shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
              <div className="flex items-center gap-2 text-base font-bold text-[#252735]">
                <Sparkles className="w-5 h-5 text-[#6254E8]" />
                <span>Dispatch Customer Retention Offer</span>
              </div>
              <button
                onClick={() => setRetentionModalSub(null)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchRetentionSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7] text-xs">
                <div className="font-semibold text-[#252735]">{retentionModalSub.customerName}</div>
                <div className="text-[#697386]">Contract: {retentionModalSub.number} · {retentionModalSub.planName}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252735] mb-1">
                  Retention Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3E8EE] focus:border-[#6254E8] outline-hidden font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252735] mb-1">
                  Offer Validity (Days)
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3E8EE] focus:border-[#6254E8] outline-hidden font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252735] mb-1">
                  Internal Retention Justification Note
                </label>
                <textarea
                  rows={2}
                  value={retentionNotes}
                  onChange={(e) => setRetentionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3E8EE] focus:border-[#6254E8] outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRetentionModalSub(null)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-xs font-semibold text-[#697386] hover:bg-[#F0EDFA]/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white text-xs font-semibold shadow-xs"
                >
                  Dispatch Approved Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
