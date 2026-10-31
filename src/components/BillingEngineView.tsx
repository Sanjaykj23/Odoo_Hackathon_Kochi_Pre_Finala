import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
  Layers
} from 'lucide-react';

export const BillingEngineView: React.FC = () => {
  const { subscriptions, invoices, triggerBillingDayRun, setActiveView } = useApp();

  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [executionResult, setExecutionResult] = useState<{ createdCount: number; skippedCount: number } | null>(null);

  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const dueSubs = activeSubs.filter((s) => s.nextBillingDate <= targetDate);

  const handleRunBillingEngine = () => {
    const res = triggerBillingDayRun(targetDate);
    setExecutionResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Automated Bulk Billing Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scan active recurring subscriptions due on or before billing day, enforce idempotency locks, compute 18% GST, and issue draft/confirmed invoices.
        </p>
      </div>

      {/* Main Execution Control Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Idempotent Engine v2.4
            </span>
            <h2 className="text-lg font-bold mt-2 font-display">
              Run Billing Cycle Execution
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Guarantees zero double-billing by generating unique hash locks (<code className="bg-slate-800 px-1 py-0.5 rounded font-mono text-amber-300">SUB_ID + PERIOD_START_DATE</code>).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Target Billing Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleRunBillingEngine}
              className="mt-4 sm:mt-0 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              <span>Execute Billing Run</span>
            </button>
          </div>
        </div>

        {executionResult && (
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-white">Billing Run Execution Completed!</div>
                <div className="text-slate-300">
                  Issued <span className="font-bold text-emerald-400">{executionResult.createdCount}</span> new GST tax invoices.{' '}
                  {executionResult.skippedCount > 0 && (
                    <span>({executionResult.skippedCount} skipped by idempotency check)</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('invoices')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold flex items-center gap-1 hover:bg-indigo-500"
            >
              <span>View Invoices Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Due Subscriptions Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Subscriptions Due for Billing on/before {targetDate} ({dueSubs.length})</span>
          <span>Total Active: {activeSubs.length}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Sub Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Next Billing Date</th>
                <th className="p-3">Estimated Total (incl. 18% GST)</th>
                <th className="p-3">Idempotency Lock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {dueSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    No active subscriptions due on or before selected billing date.
                  </td>
                </tr>
              ) : (
                dueSubs.map((sub) => {
                  const lineSum = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);
                  const estGst = lineSum * 0.18;
                  const estTotal = lineSum + estGst;
                  const key = `${sub.id}_${sub.nextBillingDate}`;
                  const alreadyBilled = invoices.some((i) => i.idempotencyKey === key);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        {sub.number}
                      </td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        {sub.customerName}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{sub.planName}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                        {sub.nextBillingDate}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-emerald-400 font-mono">
                        ₹{estTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        {alreadyBilled ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Already Billed (Skipped)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Ready for Invoice Run
                          </span>
                        )}
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
