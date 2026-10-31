import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Package,
  Receipt,
  Calendar,
  CheckCircle2,
  Printer,
  FileCheck,
  Send,
  MessageSquare,
  ArrowRight,
  Clock,
  X,
  UserCheck,
  Lock,
  ChevronDown
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    subscriptions,
    invoices,
    acceptQuotationAndActivate,
    negotiateQuotation
  } = useApp();

  const [negotiateSubId, setNegotiateSubId] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  // Get all customer user accounts
  const customerAccounts = users.filter((u) => u.role === 'CUSTOMER');

  // Selected customer account (defaults to current user if customer role, or first customer if testing as admin)
  const activeCustomerUser =
    currentUser.role === 'CUSTOMER'
      ? currentUser
      : customerAccounts.find((u) => u.id === currentUser.id) || customerAccounts[0] || currentUser;

  // Strict tenant data isolation
  const mySubscriptions = subscriptions.filter(
    (s) =>
      s.customerId === activeCustomerUser.id ||
      s.customerEmail.toLowerCase() === activeCustomerUser.email.toLowerCase()
  );

  const pendingQuotes = mySubscriptions.filter((s) => s.status === 'QUOTATION');
  const activeSubs = mySubscriptions.filter(
    (s) => s.status === 'ACTIVE' || s.status === 'CONFIRMED' || s.status === 'PAUSED'
  );

  const myInvoices = invoices.filter(
    (i) =>
      i.customerId === activeCustomerUser.id ||
      mySubscriptions.some((s) => s.id === i.subscriptionId) ||
      i.customerName.toLowerCase().includes(activeCustomerUser.name.toLowerCase())
  );

  const handleNegotiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiateSubId || !feedbackNotes) return;

    negotiateQuotation(negotiateSubId, feedbackNotes);
    setNegotiateSubId(null);
    setFeedbackNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Client Profile Switcher Bar (For multi-tenant testing) */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-slate-900 dark:text-white">Active Tenant Workspace:</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            {activeCustomerUser.companyName || activeCustomerUser.name}
          </span>
        </div>

        {currentUser.role !== 'CUSTOMER' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Switch Preview Client Account:</span>
            <select
              value={activeCustomerUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {customerAccounts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.companyName || c.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Customer Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
              CLIENT WORKSPACE
            </span>
            <span className="text-xs text-indigo-300 font-mono">ID: {activeCustomerUser.id}</span>
          </div>
          <h1 className="text-2xl font-bold font-display">
            {activeCustomerUser.companyName || activeCustomerUser.name}
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            Isolated tenant view for <strong className="text-white">{activeCustomerUser.email}</strong>. Review offers, accept quotations into active subscriptions, inspect renewal schedules, and download GST tax invoices.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1 font-mono shrink-0">
          <div>GSTIN: <span className="text-indigo-400 font-bold">{activeCustomerUser.gstin || '29AAACI1234H1Z5'}</span></div>
          <div>PAN: <span className="text-slate-300">{activeCustomerUser.pan || 'AAACI1234H'}</span></div>
          <div>Data Isolation: <span className="text-emerald-400 font-bold">100% Tenant Locked</span></div>
        </div>
      </div>

      {/* Pending Quotations Needing Action */}
      {pendingQuotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Pending Sales Offers & Quotations ({pendingQuotes.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQuotes.map((quote) => {
              const total = quote.lines.reduce((acc, l) => acc + l.totalAmount, 0);

              return (
                <div
                  key={quote.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border-2 border-sky-300 dark:border-sky-800 p-5 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">
                      {quote.number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      QUOTATION OFFER
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{quote.planName}</h3>
                    <div className="text-xs text-slate-500">
                      Valid through <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{quote.expiryDate || '2026-11-30'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Offered Line Items:
                    </div>
                    {quote.lines.map((l) => (
                      <div key={l.id} className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                        <span>{l.productName} ({l.quantity} seats)</span>
                        <span className="font-mono font-bold">₹{l.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => acceptQuotationAndActivate(quote.id)}
                      className="w-full sm:w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Activate Right Away</span>
                    </button>

                    <button
                      onClick={() => setNegotiateSubId(quote.id)}
                      className="w-full sm:w-1/2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span>Negotiate / Email Sales</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Subscriptions View */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Active Subscriptions & Licenses ({activeSubs.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSubs.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 col-span-2 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">No active subscriptions for {activeCustomerUser.name}</div>
              <div>Contact your Brightloop account manager to launch a new software license.</div>
            </div>
          ) : (
            activeSubs.map((sub) => {
              const total = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);

              return (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {sub.number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {sub.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sub.planName}</h3>
                    <div className="text-xs text-slate-500">{sub.billingFrequency} billing</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Licenses:
                    </div>
                    {sub.lines.map((l) => (
                      <div key={l.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>{l.productName} ({l.quantity} seats)</span>
                        <span className="font-mono font-bold">₹{l.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Retention Proposal Banner if Human Operator Dispatched */}
                  {sub.retentionOfferSent && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/50 text-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px]">
                          EXCLUSIVE RETENTION OFFER ({sub.retentionOfferSent.discountPct}% OFF)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Valid until {sub.retentionOfferSent.validUntil}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200">
                        {sub.retentionOfferSent.notes}
                      </div>
                      <button
                        onClick={() => {
                          acceptQuotationAndActivate(sub.id);
                        }}
                        className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept & Apply {sub.retentionOfferSent.discountPct}% Retention Renewal</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Next Automatic Billing:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {sub.nextBillingDate}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Invoices & Receipts View */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Billing History & GST Tax Receipts ({myInvoices.length})</span>
        </h2>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Total Payable</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {myInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    No billing receipts available for this client.
                  </td>
                </tr>
              ) : (
                myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{inv.issueDate}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{inv.dueDate}</td>
                    <td className="p-3 text-right font-bold font-mono text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-bold font-mono">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600">₹{inv.balanceDue.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Negotiation Modal */}
      {negotiateSubId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Negotiate / Contact Sales Team
              </h3>
              <button
                onClick={() => setNegotiateSubId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNegotiateSubmit} className="space-y-3 text-xs">
              <p className="text-slate-500">
                Send a custom message or request terms adjustment directly to Brightloop Sales Representatives.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Negotiation Notes / Price Requests
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. We would like a 15% discount for taking 20 additional seats on annual billing..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNegotiateSubId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Sales Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
