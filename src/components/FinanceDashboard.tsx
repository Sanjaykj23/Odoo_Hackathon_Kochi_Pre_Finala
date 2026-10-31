import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PieChart,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Download,
  Calendar,
  Building2,
  Send,
  IndianRupee,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Info
} from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const { subscriptions, invoices, payments, addToast } = useApp();

  const [agingFilter, setAgingFilter] = useState<'ALL' | 'UNDER_30' | '30_60' | 'OVER_60'>('ALL');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

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

  // Payments collected total
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Executive Finance & Revenue Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time MRR/ARR analytics, cash collection velocity, and overdue invoice aging matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>{showFormulaInfo ? 'Hide Math Formula' : 'How Metrics are Calculated?'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Formula Breakdown Box */}
      {showFormulaInfo && (
        <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2 border border-slate-800 animate-in fade-in">
          <div className="font-bold text-amber-400 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span>Executive Metrics Calculation Methodology</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-300 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white mb-0.5">1. MRR (Monthly Recurring)</div>
              <div>sum(Active Subs normalized to Monthly cadence)</div>
              <div className="text-slate-400 text-[10px] mt-1">Yearly / 12, Weekly × 4.33</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white mb-0.5">2. ARR (Annual Run-Rate)</div>
              <div>MRR × 12</div>
              <div className="text-slate-400 text-[10px] mt-1">Projected annualized ARR</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white mb-0.5">3. Total Revenue Collected</div>
              <div>sum(Payment Entries Recorded)</div>
              <div className="text-slate-400 text-[10px] mt-1">UPI, NetBanking, Card, NEFT</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white mb-0.5">4. Outstanding & Overdue</div>
              <div>sum(Balance Due on Confirmed Invoices)</div>
              <div className="text-slate-400 text-[10px] mt-1">Overdue if DueDate &lt; Today</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Recurring (MRR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            ₹{mrr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-500">
            ARR Run-Rate: <span className="font-mono font-bold">₹{(arr / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Revenue Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-emerald-400 font-mono">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Reconciled against payment receipts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Outstanding Dues</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Across {confirmedInvoices.length} published invoices
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overdue Balance</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">
            ₹
            {overdueInvoices
              .reduce((acc, i) => acc + i.balanceDue, 0)
              .toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-500 font-medium">
            {overdueInvoices.length} overdue invoices requiring action
          </div>
        </div>
      </div>

      {/* Overdue Invoices Aging Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Overdue Invoice Aging & Collections Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chasing overdue invoices before they turn into bad debt losses.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Overdue' },
              { id: 'UNDER_30', label: '< 30 Days' },
              { id: '30_60', label: '30 - 60 Days' },
              { id: 'OVER_60', label: '> 60 Days' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAgingFilter(tab.id as any)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  agingFilter === tab.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 font-mono text-right">Balance Due</th>
                <th className="p-3">Days Overdue</th>
                <th className="p-3 text-right">Collections Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOverdue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    No overdue invoices matching selected aging criteria.
                  </td>
                </tr>
              ) : (
                filteredOverdue.map((inv) => {
                  const diffDays = Math.floor(
                    (new Date(todayStr).getTime() - new Date(inv.dueDate).getTime()) /
                      (1000 * 3600 * 24)
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        {inv.customerName}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                        {inv.dueDate}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        ₹{inv.balanceDue.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-600">
                        {diffDays} Days Late
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSendReminder(inv.customerName, inv.invoiceNumber)}
                          className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send GST Reminder</span>
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

      {/* Upcoming Subscription Renewals Schedule */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Upcoming Subscription Renewals & Contract Expirations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Subscriptions scheduled to recur or expire, avoiding forgotten manual renewals.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Sub #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Billing Cadence</th>
                <th className="p-3">Next Billing Date</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3 font-mono text-right">Recurring Value</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {subscriptions.filter((s) => s.status === 'ACTIVE' || s.status === 'CONFIRMED').length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    No active subscriptions scheduled for renewal.
                  </td>
                </tr>
              ) : (
                subscriptions
                  .filter((s) => s.status === 'ACTIVE' || s.status === 'CONFIRMED')
                  .map((sub) => {
                    const subVal = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {sub.number}
                        </td>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">
                          {sub.customerName}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                            {sub.billingFrequency}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                          {sub.nextBillingDate}
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          {sub.expiryDate || 'Continuous / Auto-renew'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                          ₹{subVal.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
