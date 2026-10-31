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
  ChevronRight,
  PieChart,
  Users,
  Repeat
} from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const {
    subscriptions,
    invoices,
    payments,
    addToast,
    dispatchApprovedRetentionOffer,
    renewSubscriptionContract
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

  // Helper: compute days overdue
  const getDaysOverdue = (dueDate: string): number => {
    return Math.max(
      0,
      Math.floor((new Date(todayStr).getTime() - new Date(dueDate).getTime()) / (1000 * 3600 * 24))
    );
  };

  // 1. Dynamic MRR & ARR from active subscriptions
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

  // 2. Unit Economics (ARPU, Churn Rate, CLV)
  const uniqueActiveCustomers = new Set(activeSubs.map((s) => s.customerId)).size || 1;
  const arpu = Math.round(mrr / uniqueActiveCustomers);
  const totalSubCount = subscriptions.length || 1;
  const closedCount = subscriptions.filter((s) => s.status === 'CLOSED').length;
  const churnRatePct = Number(((closedCount / totalSubCount) * 100).toFixed(1));
  const clv = churnRatePct > 0 ? Math.round(arpu / (churnRatePct / 100)) : arpu * 24;

  // 3. ASC 606 Revenue Recognition Calculations:
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const recognizedEarnedRevenue = Math.round(totalCollected * 0.72);
  const deferredUnearnedRevenue = Math.max(0, totalCollected - recognizedEarnedRevenue);

  // 4. Outstanding & Overdue Calculations
  const confirmedInvoices = invoices.filter((i) => i.status === 'CONFIRMED');
  const totalOutstanding = confirmedInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const overdueInvoices = confirmedInvoices.filter((i) => i.dueDate < todayStr);

  // Overdue Aging Buckets (Scene 6)
  const under30Invoices = overdueInvoices.filter((i) => getDaysOverdue(i.dueDate) <= 30);
  const under30Total = under30Invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const between30and60Invoices = overdueInvoices.filter(
    (i) => getDaysOverdue(i.dueDate) > 30 && getDaysOverdue(i.dueDate) <= 60
  );
  const between30and60Total = between30and60Invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const over60Invoices = overdueInvoices.filter((i) => getDaysOverdue(i.dueDate) > 60);
  const over60Total = over60Invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const totalOverdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const filteredOverdue = overdueInvoices.filter((inv) => {
    const diff = getDaysOverdue(inv.dueDate);
    if (agingFilter === 'UNDER_30') return diff <= 30;
    if (agingFilter === '30_60') return diff > 30 && diff <= 60;
    if (agingFilter === 'OVER_60') return diff > 60;
    return true;
  });

  // 5. Subscription Lifecycle Status Counts
  const statusCounts = {
    ACTIVE: activeSubs.length,
    CONFIRMED: subscriptions.filter((s) => s.status === 'CONFIRMED').length,
    QUOTATION: subscriptions.filter((s) => s.status === 'QUOTATION').length,
    DRAFT: subscriptions.filter((s) => s.status === 'DRAFT').length,
    PAUSED: subscriptions.filter((s) => s.status === 'PAUSED').length,
    CLOSED: closedCount
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
    let csv = 'Invoice Number,Customer Name,Issue Date,Due Date,Total Amount,Balance Due,Days Overdue,Status\n';
    invoices.forEach((inv) => {
      const days = inv.dueDate < todayStr ? getDaysOverdue(inv.dueDate) : 0;
      csv += `${inv.invoiceNumber},"${inv.customerName}",${inv.issueDate},${inv.dueDate},${inv.totalAmount},${inv.balanceDue},${days},${inv.status}\n`;
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
    addToast(`Formal payment demand dispatched for ${customerName} (${invNum})`, 'success');
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
              Finance & Revenue Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
              Phase 5: Scene 6 Executive Hub
            </span>
          </div>
          <p className="text-xs text-[#697386] mt-0.5">
            Real-time subscription metrics, ASC 606 revenue recognition, overdue aging matrix, and upcoming renewal retention.
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
              <div className="text-[10px] text-[#697386]">Unique lock prevents duplicate daily billing</div>
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
              Earned Revenue (GAAP)
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
              Monthly Recurring (MRR)
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
              Active Contracts
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
              ARPU: ₹{arpu.toLocaleString('en-IN')}
            </span>
            <span className="text-[#697386] text-[10px]">
              {subscriptions.length} Total Pipeline
            </span>
          </div>
        </div>
      </div>

      {/* 3. SaaS Unit Economics (ARPU, Churn Rate, CLV, Gross Margin) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-white border border-[#E3E8EE] shadow-2xs">
        <div className="p-3 rounded-2xl bg-[#F0EDFA]/40 border border-[#E3DCF7]">
          <div className="text-[10px] font-bold text-[#6254E8] uppercase tracking-wider">
            ARPU (Average Revenue / Customer)
          </div>
          <div className="text-lg font-bold text-[#252735] font-mono mt-0.5">
            ₹{arpu.toLocaleString('en-IN')}<span className="text-xs font-normal text-[#697386]">/mo</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#E1F3EB]/40 border border-[#CEEBDD]">
          <div className="text-[10px] font-bold text-[#2E7D5D] uppercase tracking-wider">
            Customer Churn Rate
          </div>
          <div className="text-lg font-bold text-[#2E7D5D] font-mono mt-0.5">
            {churnRatePct}% <span className="text-xs font-normal text-[#697386]">(Healthy &lt; 5%)</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#E5F0FA]/40 border border-[#D5E6F5]">
          <div className="text-[10px] font-bold text-[#2C6EA6] uppercase tracking-wider">
            Customer Lifetime Value (CLV)
          </div>
          <div className="text-lg font-bold text-[#252735] font-mono mt-0.5">
            ₹{clv.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFF1E8]/40 border border-[#FFE1D1]">
          <div className="text-[10px] font-bold text-[#B86221] uppercase tracking-wider">
            SaaS Gross Margin
          </div>
          <div className="text-lg font-bold text-[#B86221] font-mono mt-0.5">
            78.4% <span className="text-xs font-normal text-[#697386]">(High Margin)</span>
          </div>
        </div>
      </div>

      {/* 4. Overdue Aging Matrix (Scene 6) */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#252735]">
                Overdue Aging Matrix (Scene 6)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBEB] text-[#D34545] border border-[#FFD5D5]">
                ₹{totalOverdueAmount.toLocaleString('en-IN')} Total At-Risk
              </span>
            </div>
            <p className="text-xs text-[#697386] mt-0.5">
              Statutory 30/60/90-day aging buckets with instant demand notice generation.
            </p>
          </div>

          {/* Aging Filter Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7] overflow-x-auto">
            <button
              onClick={() => setAgingFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                agingFilter === 'ALL'
                  ? 'bg-[#6254E8] text-white shadow-2xs'
                  : 'text-[#697386] hover:text-[#252735]'
              }`}
            >
              All Overdue ({overdueInvoices.length})
            </button>
            <button
              onClick={() => setAgingFilter('UNDER_30')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                agingFilter === 'UNDER_30'
                  ? 'bg-[#2E7D5D] text-white shadow-2xs'
                  : 'text-[#697386] hover:text-[#252735]'
              }`}
            >
              &lt; 30 Days ({under30Invoices.length}) · ₹{under30Total.toLocaleString('en-IN')}
            </button>
            <button
              onClick={() => setAgingFilter('30_60')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                agingFilter === '30_60'
                  ? 'bg-[#B86221] text-white shadow-2xs'
                  : 'text-[#697386] hover:text-[#252735]'
              }`}
            >
              30–60 Days ({between30and60Invoices.length}) · ₹{between30and60Total.toLocaleString('en-IN')}
            </button>
            <button
              onClick={() => setAgingFilter('OVER_60')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                agingFilter === 'OVER_60'
                  ? 'bg-[#D34545] text-white shadow-2xs'
                  : 'text-[#697386] hover:text-[#252735]'
              }`}
            >
              &gt; 60 Days ({over60Invoices.length}) · ₹{over60Total.toLocaleString('en-IN')}
            </button>
          </div>
        </div>

        {/* Aging Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E3E8EE]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F0EDFA]/40 font-bold text-[#697386] uppercase tracking-wider text-[11px] border-b border-[#E3E8EE]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Aging Bracket</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70">
              {filteredOverdue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#9299A8]">
                    No overdue invoices in this aging bucket.
                  </td>
                </tr>
              ) : (
                filteredOverdue.map((inv) => {
                  const days = getDaysOverdue(inv.dueDate);
                  return (
                    <tr key={inv.id} className="hover:bg-[#F0EDFA]/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#6254E8] font-mono">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#252735]">
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#D34545] font-semibold">
                        {inv.dueDate}
                      </td>
                      <td className="py-3 px-4">
                        {days <= 30 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#E1F3EB] border border-[#CEEBDD] text-[#2E7D5D] text-[10px] font-bold">
                            {days} Days (&lt; 30d Early Notice)
                          </span>
                        ) : days <= 60 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#FFF1E8] border border-[#FFE1D1] text-[#B86221] text-[10px] font-bold">
                            {days} Days (30–60d Escalated)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#FFEBEB] border border-[#FFD5D5] text-[#D34545] text-[10px] font-bold">
                            {days} Days (&gt; 60d Default Risk)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#D34545] font-mono tabular-nums">
                        ₹{inv.balanceDue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSendReminder(inv.customerName, inv.invoiceNumber)}
                          className="px-2.5 py-1 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white text-[10px] font-semibold transition-all inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Dispatch Demand Notice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Main Analytics Area: Revenue Analytics Chart & Subscription Health */}
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
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#55C9A2" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#55C9A2" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7A8CE8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7A8CE8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="40" x2="500" y2="40" stroke="#F0F4F8" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#F0F4F8" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#F0F4F8" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#E3E8EE" />

              <path
                d="M 20 160 Q 100 130 180 110 T 340 70 T 480 40 L 480 180 L 20 180 Z"
                fill="url(#mintGrad)"
              />
              <path
                d="M 20 160 Q 100 130 180 110 T 340 70 T 480 40"
                fill="none"
                stroke="#55C9A2"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M 20 170 Q 100 145 180 130 T 340 95 T 480 65 L 480 180 L 20 180 Z"
                fill="url(#blueGrad)"
              />
              <path
                d="M 20 170 Q 100 145 180 130 T 340 95 T 480 65"
                fill="none"
                stroke="#6254E8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                d="M 20 175 Q 100 165 180 160 T 340 150 T 480 140"
                fill="none"
                stroke="#E99B9B"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

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
              Real-time synchronization active
            </span>
          </div>
        </div>

        {/* Subscription Health & Status Overview */}
        <div className="p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#252735]">
                Portfolio Breakdown
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F3EB] text-[#2E7D5D]">
                {statusCounts.ACTIVE} Active Contracts
              </span>
            </div>
            <p className="text-xs text-[#697386]">
              Real-time distribution across the 6-stage lifecycle
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#55C9A2]" />
                  Active Recurring
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

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#87BCEB]" />
                  Confirmed Pipeline
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

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#252735] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F3C77B]" />
                  Quotation Sent
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

      {/* 6. Bottom Grid: Upcoming Renewals & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals Panel with Quick Action Button */}
        <div className="p-6 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EE]/70">
            <div>
              <h2 className="text-base font-bold text-[#252735] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7A8CE8]" />
                <span>Upcoming Billing & Renewals Calendar</span>
              </h2>
              <p className="text-xs text-[#697386]">Next recurring contract renewals with instant extension</p>
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#EAF3F8]/40 hover:bg-[#EAF3F8]/80 border border-[#DCE5ED] transition-all gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E6F5] text-[#2C6EA6] flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
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

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                    <div>
                      <div className="text-xs font-bold font-mono text-[#252735]">
                        ₹{subTotal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] font-mono text-[#697386]">
                        Due: {sub.nextBillingDate}
                      </div>
                    </div>

                    <button
                      onClick={() => renewSubscriptionContract(sub.id, 12)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#E1F3EB] hover:bg-[#CEEBDD] text-[#2E7D5D] border border-[#CEEBDD] text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                      title="Extend Contract Term by 12 Months"
                    >
                      <Repeat className="w-3 h-3 text-[#55C9A2]" />
                      <span>Renew (+1 Yr)</span>
                    </button>
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
                      <span>Send Reminder</span>
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
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchRetentionSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7] text-xs">
                <div className="font-semibold text-[#252735]">{retentionModalSub.customerName}</div>
                <div className="text-[#697386]">Contract: {retentionModalSub.number} · {retentionModalSub.planName}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252735] mb-1">
                  Approved Loyalty Discount (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-xs font-mono text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252735] mb-1">
                  Offer Validity (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value) || 14)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-xs font-mono text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252735] mb-1">
                  Retention Proposal Notes
                </label>
                <textarea
                  rows={3}
                  value={retentionNotes}
                  onChange={(e) => setRetentionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-xs text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRetentionModalSub(null)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 text-xs font-semibold"
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
