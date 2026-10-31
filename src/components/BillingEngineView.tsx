import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '../router/Router';
import {
  Zap,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
  Layers,
  Lock,
  Sparkles,
  Building2,
  AlertTriangle
} from 'lucide-react';

export const BillingEngineView: React.FC = () => {
  const { subscriptions, invoices, triggerBillingDayRun, authenticatedUser } = useApp();
  const navigate = useNavigate();

  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [executionResult, setExecutionResult] = useState<{ createdCount: number; skippedCount: number } | null>(null);

  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const dueSubs = activeSubs.filter((s) => s.nextBillingDate <= targetDate);

  const handleRunBillingEngine = () => {
    const res = triggerBillingDayRun(targetDate);
    setExecutionResult(res);
  };

  const handleNavigateInvoices = () => {
    if (authenticatedUser.role === 'ADMIN') navigate('/admin/invoices');
    else navigate('/finance/invoices');
  };

  const isInterState = (gstin?: string, name?: string) => {
    if (gstin && gstin.trim().length >= 2) {
      return !gstin.trim().startsWith('29'); // Karnataka code is 29
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Bulk Billing Engine
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
            Phase 4: Scenes 4 & 5
          </span>
        </div>
        <p className="text-xs text-[#697386] mt-0.5">
          Scan active recurring subscriptions due on billing day, enforce idempotency SHA locks, compute 18% GST, and issue invoices.
        </p>
      </div>

      {/* Main Execution Control Box */}
      <div className="bg-gradient-to-r from-[#E1F3EB]/90 via-[#EAF3F8] to-[#F0EDFA]/90 rounded-3xl p-6 border border-[#CEEBDD] shadow-[0_10px_30px_rgba(85,201,162,0.06)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#2E7D5D] border border-[#CEEBDD] font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2E7D5D]" />
                <span>Zero Double-Billing Safeguard</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#6254E8] border border-[#E3DCF7]">
                Live Batch Processing
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#252735] mt-2">
              Execute Automated Billing Run
            </h2>
            <p className="text-xs text-[#697386] max-w-xl mt-0.5 leading-relaxed">
              Guarantees zero duplicate billing using unique PostgreSQL idempotency hashes (<code className="bg-white/80 px-1.5 py-0.5 rounded text-[#6254E8] font-mono text-[10px] border border-[#E3DCF7]">IDEM + SUB_ID + BILLING_DATE</code>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/80 p-3 rounded-2xl border border-[#DCE5ED] shadow-2xs">
            <div>
              <label className="block text-[10px] font-bold text-[#9299A8] uppercase tracking-wider mb-1">
                Target Billing Cutoff Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-white border border-[#E3E8EE] rounded-xl px-3 py-1.5 text-xs text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
              />
            </div>
            <button
              onClick={handleRunBillingEngine}
              className="mt-2 sm:mt-4 px-5 py-2.5 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] active:scale-[0.98] text-white font-bold text-xs shadow-[0_4px_14px_rgba(98,84,232,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-[#F3C77B]" />
              <span>Execute Billing Run</span>
            </button>
          </div>
        </div>

        {/* Execution Result Banner */}
        {executionResult && (
          <div className="p-4 rounded-2xl bg-white border border-[#CEEBDD] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E1F3EB] text-[#2E7D5D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#252735]">Billing Run Execution Completed Successfully!</div>
                <div className="text-[#697386]">
                  Issued <strong className="text-[#2E7D5D]">{executionResult.createdCount}</strong> new GST tax invoices.{' '}
                  {executionResult.skippedCount > 0 && (
                    <span className="text-[#B86221] font-semibold">({executionResult.skippedCount} skipped by Idempotency Lock)</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleNavigateInvoices}
              className="px-4 py-2 rounded-xl bg-[#6254E8] text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#5245D0] shadow-xs shrink-0"
            >
              <span>View Invoices Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Due Subscriptions Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#697386] uppercase tracking-wider px-1">
          <span>Subscriptions Due on or before {targetDate} ({dueSubs.length})</span>
          <span>Active Contracts: {activeSubs.length}</span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F0EDFA]/40 font-bold text-[#697386] uppercase tracking-wider text-[11px] border-b border-[#E3E8EE]">
                <th className="py-3.5 px-5">Sub Number</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Tax Type</th>
                <th className="py-3.5 px-5">Cadence</th>
                <th className="py-3.5 px-5">Next Billing</th>
                <th className="py-3.5 px-5 text-right">Estimated Amount (incl. GST)</th>
                <th className="py-3.5 px-5">Idempotency Lock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70">
              {dueSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9299A8]">
                    No active subscriptions due on or before selected billing cutoff date.
                  </td>
                </tr>
              ) : (
                dueSubs.map((sub) => {
                  const lineSum = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);
                  const estGst = lineSum * 0.18;
                  const estTotal = lineSum + estGst;
                  const key1 = `IDEM_${sub.id}_${sub.nextBillingDate}`;
                  const key2 = `${sub.id}_${sub.nextBillingDate}`;
                  const alreadyBilled = invoices.some((i) => i.idempotencyKey === key1 || i.idempotencyKey === key2);
                  const interState = isInterState(sub.customerGstin, sub.customerName);

                  return (
                    <tr key={sub.id} className="hover:bg-[#F0EDFA]/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#6254E8] font-mono">
                        {sub.number}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#252735]">
                        <div>{sub.customerName}</div>
                        <div className="text-[10px] text-[#697386] font-mono">{sub.customerGstin || 'Unregistered'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        {interState ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#FFF1E8] border border-[#FFE1D1] text-[#B86221] text-[10px] font-bold">
                            IGST 18% (Inter-State)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#E1F3EB] border border-[#CEEBDD] text-[#2E7D5D] text-[10px] font-bold">
                            CGST 9% + SGST 9%
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-[#697386] font-mono">{sub.billingFrequency}</td>
                      <td className="py-3.5 px-5 font-mono text-[#697386]">
                        {sub.nextBillingDate}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-[#252735] font-mono tabular-nums">
                        ₹{estTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3.5 px-5">
                        {alreadyBilled ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1] flex items-center gap-1 w-fit">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Already Billed (Idempotent)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Ready for Batch Run</span>
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
