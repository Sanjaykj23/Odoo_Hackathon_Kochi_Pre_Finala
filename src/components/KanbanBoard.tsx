import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subscription, SubscriptionStatus } from '../types';
import {
  Layers,
  Calendar,
  IndianRupee,
  Building2,
  ArrowRight,
  Plus,
  Play,
  Pause,
  XCircle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { subscriptions, updateSubscriptionStatus, setActiveView } = useApp();
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const columns: { status: SubscriptionStatus; title: string; color: string; border: string }[] = [
    { status: 'DRAFT', title: 'Draft Offers', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
    { status: 'QUOTATION', title: 'Quotation Sent', color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800' },
    { status: 'CONFIRMED', title: 'Confirmed / Pending Billing', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800' },
    { status: 'ACTIVE', title: 'Active Recurring', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
    { status: 'PAUSED', title: 'Paused / On Hold', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
    { status: 'CLOSED', title: 'Closed / Expired', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' }
  ];

  const getNextPossibleStates = (status: SubscriptionStatus): SubscriptionStatus[] => {
    switch (status) {
      case 'DRAFT':
        return ['QUOTATION', 'CONFIRMED'];
      case 'QUOTATION':
        return ['CONFIRMED', 'DRAFT'];
      case 'CONFIRMED':
        return ['ACTIVE', 'PAUSED', 'CLOSED'];
      case 'ACTIVE':
        return ['PAUSED', 'CLOSED'];
      case 'PAUSED':
        return ['ACTIVE', 'CLOSED'];
      case 'CLOSED':
        return ['ACTIVE'];
      default:
        return [];
    }
  };

  const calculateSubTotal = (sub: Subscription) => {
    return sub.lines.reduce((acc, curr) => acc + curr.totalAmount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Subscription Lifecycle Kanban</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track and transition subscription offers through state milestones (Draft $\rightarrow$ Quotation $\rightarrow$ Confirmed $\rightarrow$ Active $\rightarrow$ Closed).
          </p>
        </div>

        <button
          onClick={() => setActiveView('subscriptions_list')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <span>Switch to Table View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const columnSubs = subscriptions.filter((s) => s.status === col.status);
          const columnTotal = columnSubs.reduce((acc, sub) => acc + calculateSubTotal(sub), 0);

          return (
            <div
              key={col.status}
              className={`flex flex-col rounded-xl border ${col.border} bg-slate-50/50 dark:bg-slate-900/50 p-3 min-w-[260px] min-h-[500px] shadow-sm`}
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-lg ${col.color} flex items-center justify-between mb-3 shadow-2xs`}>
                <div className="text-xs font-bold font-display">{col.title}</div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                  {columnSubs.length}
                </span>
              </div>

              {/* Column Value Summary */}
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1 mb-3 flex items-center justify-between">
                <span>Value:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">
                  ₹{columnTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1">
                {columnSubs.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400 dark:text-slate-600">
                    No subscriptions
                  </div>
                ) : (
                  columnSubs.map((sub) => {
                    const subVal = calculateSubTotal(sub);
                    const nextStates = getNextPossibleStates(sub.status);

                    return (
                      <div
                        key={sub.id}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 shadow-sm hover:shadow-md transition-all group"
                      >
                        {/* Sub Number & Customer */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {sub.number}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {sub.billingFrequency}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate mb-1">
                          {sub.customerName}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                          Plan: {sub.planName}
                        </div>

                        {/* Amount & Date */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs mb-3">
                          <span className="font-bold text-slate-900 dark:text-emerald-400 font-mono">
                            ₹{subVal.toLocaleString('en-IN')}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>Due {sub.nextBillingDate}</span>
                          </div>
                        </div>

                        {/* Stage Transition Action Buttons */}
                        {nextStates.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                              Move Stage:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {nextStates.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => updateSubscriptionStatus(sub.id, st)}
                                  className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold transition-colors flex items-center gap-1"
                                >
                                  {st === 'ACTIVE' && <Play className="w-2.5 h-2.5 text-emerald-500" />}
                                  {st === 'PAUSED' && <Pause className="w-2.5 h-2.5 text-amber-500" />}
                                  {st === 'CLOSED' && <XCircle className="w-2.5 h-2.5 text-rose-500" />}
                                  {st === 'CONFIRMED' && <CheckCircle2 className="w-2.5 h-2.5 text-indigo-500" />}
                                  <span>{st}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
