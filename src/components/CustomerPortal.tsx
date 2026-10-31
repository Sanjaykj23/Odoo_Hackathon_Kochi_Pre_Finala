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
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Zap,
  Play,
  Pause,
  XCircle,
  RefreshCw,
  QrCode,
  Check,
  Loader2,
  IndianRupee
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    subscriptions,
    invoices,
    billingPlans,
    recordPayment,
    upgradeSubscriptionPlan,
    requestSubscriptionAction,
    renewSubscriptionContract,
    acceptQuotationAndActivate,
    negotiateQuotation
  } = useApp();

  const [negotiateSubId, setNegotiateSubId] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  // Razorpay Gateway Simulation State
  const [razorpayInvoice, setRazorpayInvoice] = useState<any | null>(null);
  const [razorpayMethod, setRazorpayMethod] = useState<'UPI' | 'NET_BANKING' | 'CREDIT_CARD'>('UPI');
  const [razorpayUpiId, setRazorpayUpiId] = useState('billing@okhdfcbank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessRef, setPaymentSuccessRef] = useState<string | null>(null);

  // Plan Upgrade Modal State
  const [upgradeSub, setUpgradeSub] = useState<any | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

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

  const handleOpenRazorpayModal = (inv: any) => {
    setRazorpayInvoice(inv);
    setPaymentSuccessRef(null);
    setIsProcessingPayment(false);
  };

  const handleExecuteRazorpayPayment = () => {
    if (!razorpayInvoice) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const txRef = `rzp_live_${Date.now().toString(36).toUpperCase()}`;
      recordPayment({
        invoiceId: razorpayInvoice.id,
        amount: razorpayInvoice.balanceDue,
        method: razorpayMethod,
        transactionRef: txRef,
        notes: `Instant checkout via Razorpay Gateway (${razorpayMethod})`
      });

      setIsProcessingPayment(false);
      setPaymentSuccessRef(txRef);
    }, 1200);
  };

  const handleOpenUpgradeModal = (sub: any) => {
    setUpgradeSub(sub);
    setSelectedPlanId(billingPlans[0]?.id || '');
  };

  const handleExecutePlanUpgrade = () => {
    if (!upgradeSub || !selectedPlanId) return;
    upgradeSubscriptionPlan(upgradeSub.id, selectedPlanId);
    setUpgradeSub(null);
  };

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
      <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-3xl border border-[#E3E8EE] shadow-[0_4px_20px_rgba(41,42,58,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-[#6254E8]" />
          <span className="font-bold text-[#252735]">Tenant Workspace:</span>
          <span className="font-mono text-[#6254E8] font-bold px-2.5 py-0.5 rounded-full bg-[#F0EDFA] border border-[#E3DCF7]">
            {activeCustomerUser.companyName || activeCustomerUser.name}
          </span>
        </div>

        {currentUser.role !== 'CUSTOMER' && (
          <div className="flex items-center gap-2">
            <span className="text-[#697386]">Switch Client Persona:</span>
            <select
              value={activeCustomerUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className="p-1.5 px-3 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-medium outline-hidden"
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

      {/* Customer Header Hero (Pastel Mint & Lavender Surface) */}
      <div className="bg-gradient-to-br from-[#E1F3EB]/90 via-[#EAF3F8] to-[#F0EDFA]/90 text-[#252735] p-6 rounded-3xl border border-[#CEEBDD] shadow-[0_10px_30px_rgba(85,201,162,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#2E7D5D] border border-[#CEEBDD] font-mono">
              CLIENT WORKSPACE
            </span>
            <span className="text-[11px] text-[#697386] font-mono">ID: {activeCustomerUser.id}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {activeCustomerUser.companyName || activeCustomerUser.name}
          </h1>
          <p className="text-xs text-[#697386] mt-1 max-w-xl leading-relaxed">
            Tenant portal for <strong className="text-[#252735]">{activeCustomerUser.email}</strong>. Review offers, accept quotations into active subscriptions, inspect renewal schedules, and download GST tax invoices.
          </p>
        </div>

        <div className="bg-white/80 p-4 rounded-2xl border border-[#DCE5ED] text-xs space-y-1 font-mono shrink-0 shadow-2xs">
          <div>GSTIN: <span className="text-[#6254E8] font-bold">{activeCustomerUser.gstin || '29AAACI1234H1Z5'}</span></div>
          <div>PAN: <span className="text-[#252735]">{activeCustomerUser.pan || 'AAACI1234H'}</span></div>
          <div>Data Isolation: <span className="text-[#2E7D5D] font-bold">100% Tenant Locked</span></div>
        </div>
      </div>

      {/* Pending Quotations Needing Action */}
      {pendingQuotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6254E8] uppercase tracking-wider px-1">
            <Clock className="w-4 h-4" />
            <span>Pending Sales Offers & Quotations ({pendingQuotes.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQuotes.map((quote) => {
              const total = quote.lines.reduce((acc, l) => acc + l.totalAmount, 0);

              return (
                <div
                  key={quote.id}
                  className="bg-white rounded-3xl border-2 border-[#D5E6F5] p-5 shadow-[0_6px_20px_rgba(41,42,58,0.03)] space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#6254E8]">
                      {quote.number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]">
                      QUOTATION OFFER
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#252735]">{quote.planName}</h3>
                    <div className="text-xs text-[#697386] mt-0.5">
                      Valid through <span className="font-mono font-bold text-[#252735]">{quote.expiryDate || '2026-11-30'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E3E8EE]/70 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-[#9299A8] uppercase tracking-wider">
                      Offered Line Items:
                    </div>
                    {quote.lines.map((l) => (
                      <div key={l.id} className="flex justify-between text-[#252735] font-medium">
                        <span>{l.productName} ({l.quantity} seats)</span>
                        <span className="font-mono font-bold">₹{l.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#E3E8EE]/70 flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      onClick={() => acceptQuotationAndActivate(quote.id)}
                      className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white text-xs font-bold shadow-[0_4px_14px_rgba(98,84,232,0.25)] transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Activate</span>
                    </button>

                    <button
                      onClick={() => setNegotiateSubId(quote.id)}
                      className="w-full sm:w-1/2 py-2.5 rounded-xl border border-[#DCE5ED] hover:bg-[#F0EDFA]/50 text-[#697386] hover:text-[#252735] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-[#7A8CE8]" />
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
        <h2 className="text-base font-bold text-[#252735] flex items-center gap-2 px-1">
          <Package className="w-4 h-4 text-[#6254E8]" />
          <span>Active Subscriptions & Licenses ({activeSubs.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSubs.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-[#E3E8EE] text-center text-xs text-[#9299A8] col-span-2 space-y-1">
              <div className="font-bold text-[#252735]">No active subscriptions for {activeCustomerUser.name}</div>
              <div>Contact your Brightloop account manager to launch a new software license.</div>
            </div>
          ) : (
            activeSubs.map((sub) => {
              const total = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-3xl border border-[#E3E8EE] p-5 shadow-[0_6px_20px_rgba(41,42,58,0.03)] space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#6254E8]">
                      {sub.number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
                      {sub.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#252735]">{sub.planName}</h3>
                    <div className="text-xs text-[#697386]">{sub.billingFrequency} billing schedule</div>
                  </div>

                  <div className="pt-2 border-t border-[#E3E8EE]/70 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-[#9299A8] uppercase tracking-wider">
                      Included Licenses:
                    </div>
                    {sub.lines.map((l) => (
                      <div key={l.id} className="flex justify-between text-[#252735]">
                        <span>{l.productName} ({l.quantity} seats)</span>
                        <span className="font-mono font-bold">₹{l.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Retention Proposal Banner if Dispatched */}
                  {sub.retentionOfferSent && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E1F3EB] to-[#F0EDFA] border border-[#CEEBDD] text-[#252735] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-[#2E7D5D] font-bold font-mono text-[10px] border border-[#CEEBDD]">
                          EXCLUSIVE RETENTION OFFER ({sub.retentionOfferSent.discountPct}% OFF)
                        </span>
                        <span className="text-[10px] text-[#697386] font-mono">
                          Valid until {sub.retentionOfferSent.validUntil}
                        </span>
                      </div>
                      <div className="text-xs text-[#252735]">
                        {sub.retentionOfferSent.notes}
                      </div>
                      <button
                        onClick={() => acceptQuotationAndActivate(sub.id)}
                        className="w-full py-2 rounded-xl bg-[#2E7D5D] hover:bg-[#25684D] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept & Apply {sub.retentionOfferSent.discountPct}% Retention Renewal</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E3E8EE]/70 flex items-center justify-between text-xs">
                    <span className="text-[#697386]">Next Automatic Billing:</span>
                    <span className="font-mono font-bold text-[#252735]">
                      {sub.nextBillingDate}
                    </span>
                  </div>

                  {/* Customer Self-Service Lifecycle Controls */}
                  <div className="pt-2.5 border-t border-[#E3E8EE]/70 flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenUpgradeModal(sub)}
                      className="px-2.5 py-1 rounded-xl bg-[#F0EDFA] hover:bg-[#E3DCF7] text-[#6254E8] font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-[#6254E8]" />
                      <span>Upgrade Plan</span>
                    </button>

                    {sub.status === 'ACTIVE' && sub.closureRules.allowPause && (
                      <button
                        type="button"
                        onClick={() => requestSubscriptionAction(sub.id, 'PAUSE')}
                        className="px-2.5 py-1 rounded-xl border border-[#FFE1D1] bg-[#FFF1E8] hover:bg-[#FFE1D1] text-[#B86221] font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </button>
                    )}

                    {sub.status === 'PAUSED' && (
                      <button
                        type="button"
                        onClick={() => requestSubscriptionAction(sub.id, 'RESUME')}
                        className="px-2.5 py-1 rounded-xl border border-[#CEEBDD] bg-[#E1F3EB] hover:bg-[#CEEBDD] text-[#2E7D5D] font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Resume</span>
                      </button>
                    )}

                    {sub.closureRules.allowRenew && (
                      <button
                        type="button"
                        onClick={() => renewSubscriptionContract(sub.id, 12)}
                        className="px-2.5 py-1 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#EAF3F8] text-[#252735] font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#6254E8]" />
                        <span>Renew (1 Yr)</span>
                      </button>
                    )}

                    {sub.closureRules.allowEarlyClose && sub.status !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel subscription ${sub.number}?`)) {
                            requestSubscriptionAction(sub.id, 'CANCEL');
                          }
                        }}
                        className="px-2 py-1 rounded-xl text-[#9299A8] hover:text-[#D34545] hover:bg-[#FFEBEB] text-[11px] transition-all cursor-pointer ml-auto"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Invoices & Receipts View */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#252735] flex items-center gap-2 px-1">
          <Receipt className="w-4 h-4 text-[#6254E8]" />
          <span>Billing History & GST Tax Receipts ({myInvoices.length})</span>
        </h2>

        <div className="bg-white rounded-3xl border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F0EDFA]/40 font-bold text-[#697386] uppercase tracking-wider text-[11px] border-b border-[#E3E8EE]">
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-5">Issue Date</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5 text-right">Total Payable</th>
                <th className="py-3.5 px-5 text-right">Balance Due</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Payment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70">
              {myInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9299A8]">
                    No billing receipts available for this client.
                  </td>
                </tr>
              ) : (
                myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F0EDFA]/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#6254E8] font-mono">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#697386]">{inv.issueDate}</td>
                    <td className="py-3.5 px-5 font-mono text-[#697386]">{inv.dueDate}</td>
                    <td className="py-3.5 px-5 text-right font-bold font-mono text-[#252735] tabular-nums">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold font-mono tabular-nums">
                      {inv.balanceDue > 0 ? (
                        <span className="text-[#D34545]">₹{inv.balanceDue.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#2E7D5D]">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {inv.balanceDue > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenRazorpayModal(inv)}
                          className="px-3 py-1 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-[#F3C77B]" />
                          <span>Pay via Razorpay</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#2E7D5D] flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#55C9A2]" />
                          <span>Settled</span>
                        </span>
                      )}
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
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <h3 className="text-base font-bold text-[#252735]">
                Negotiate / Contact Sales Team
              </h3>
              <button
                onClick={() => setNegotiateSubId(null)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNegotiateSubmit} className="space-y-3.5 text-xs">
              <p className="text-[#697386] leading-relaxed">
                Send a custom message or request terms adjustment directly to Brightloop Sales Representatives.
              </p>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Negotiation Notes / Price Requests
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. We would like a 15% discount for taking 20 additional seats on annual billing..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setNegotiateSubId(null)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Sales Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Payment Gateway Modal */}
      {razorpayInvoice && (
        <div className="fixed inset-0 z-50 bg-[#252735]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0C2340] text-white font-bold text-xs flex items-center justify-center font-mono">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252735]">Razorpay Checkout</h3>
                  <div className="text-[10px] text-[#697386]">Direct Merchant Integration</div>
                </div>
              </div>
              <button
                onClick={() => setRazorpayInvoice(null)}
                className="text-[#9299A8] hover:text-[#252735] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentSuccessRef ? (
              <div className="p-4 rounded-2xl bg-[#E1F3EB] border border-[#55C9A2]/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#55C9A2] mx-auto" />
                <div className="font-bold text-sm text-[#252735]">Payment Authorized!</div>
                <div className="text-xs text-[#697386]">
                  Invoice <strong>{razorpayInvoice.invoiceNumber}</strong> settled in full.
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#CEEBDD] font-mono text-[11px] text-[#2E7D5D]">
                  Txn ID: {paymentSuccessRef}
                </div>
                <button
                  type="button"
                  onClick={() => setRazorpayInvoice(null)}
                  className="w-full py-2 rounded-xl bg-[#55C9A2] text-white font-bold text-xs shadow-xs hover:bg-[#45b791] cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F0EDFA]/50 border border-[#E3DCF7] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#697386]">Payable against {razorpayInvoice.invoiceNumber}</div>
                    <div className="text-xs font-bold text-[#252735]">{activeCustomerUser.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#697386]">Amount:</div>
                    <div className="text-lg font-black font-mono text-[#6254E8]">
                      ₹{razorpayInvoice.balanceDue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRazorpayMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      razorpayMethod === 'UPI'
                        ? 'border-[#6254E8] bg-[#F0EDFA] text-[#6254E8] font-bold'
                        : 'border-[#E3E8EE] text-[#697386]'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setRazorpayMethod('CREDIT_CARD')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      razorpayMethod === 'CREDIT_CARD'
                        ? 'border-[#6254E8] bg-[#F0EDFA] text-[#6254E8] font-bold'
                        : 'border-[#E3E8EE] text-[#697386]'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setRazorpayMethod('NET_BANKING')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      razorpayMethod === 'NET_BANKING'
                        ? 'border-[#6254E8] bg-[#F0EDFA] text-[#6254E8] font-bold'
                        : 'border-[#E3E8EE] text-[#697386]'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>

                {razorpayMethod === 'UPI' && (
                  <div className="p-3 rounded-2xl border border-[#E3E8EE] bg-white space-y-2 text-center">
                    <div className="w-24 h-24 mx-auto bg-[#F0EDFA] border border-[#E3DCF7] rounded-xl flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-[#6254E8]" />
                    </div>
                    <div className="text-[10px] text-[#697386]">Scan QR with any UPI App or enter VPA:</div>
                    <input
                      type="text"
                      value={razorpayUpiId}
                      onChange={(e) => setRazorpayUpiId(e.target.value)}
                      className="w-full p-2 text-center font-mono rounded-lg border border-[#E3E8EE] text-xs"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecuteRazorpayPayment}
                  className="w-full py-3 rounded-xl bg-[#0C2340] hover:bg-[#1a365d] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#55C9A2]" />
                      <span>Processing Razorpay Authorization...</span>
                    </>
                  ) : (
                    <span>Pay ₹{razorpayInvoice.balanceDue.toLocaleString('en-IN')} with Razorpay</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal */}
      {upgradeSub && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <h3 className="text-sm font-bold text-[#252735] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#6254E8]" />
                <span>Upgrade / Switch Subscription Plan</span>
              </h3>
              <button
                onClick={() => setUpgradeSub(null)}
                className="text-[#9299A8] hover:text-[#252735] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#EAF3F8]/50 border border-[#DCE5ED]">
                <div className="text-[10px] text-[#697386]">Current Contract:</div>
                <div className="font-bold text-[#252735]">{upgradeSub.number} — {upgradeSub.planName}</div>
                <div className="text-[11px] text-[#6254E8] font-mono">{upgradeSub.billingFrequency} cycle</div>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">Target Upgrade Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white font-semibold text-xs"
                >
                  {billingPlans.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.frequency}) — ₹{pl.basePrice.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-[#E1F3EB]/50 border border-[#CEEBDD] space-y-1">
                <div className="text-[10px] font-bold text-[#2E7D5D] uppercase tracking-wider">
                  Prorated Billing Policy (Scene 2):
                </div>
                <p className="text-[11px] text-[#697386] leading-relaxed">
                  Remaining unused value of current cycle is credited against the upgrade tier. Prorated difference will be calculated on the next invoice.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setUpgradeSub(null)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecutePlanUpgrade}
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5244d4] text-white font-bold cursor-pointer shadow-xs"
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
