import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subscription, SubscriptionStatus } from '../types';
import {
  Table,
  Search,
  Plus,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  Eye,
  X,
  FileSpreadsheet,
  Download,
  Filter,
  IndianRupee,
  Layers,
  ArrowRight
} from 'lucide-react';

export const SubscriptionList: React.FC = () => {
  const { subscriptions, users, billingPlans, products, createSubscription, updateSubscriptionStatus, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingSub, setViewingSub] = useState<Subscription | null>(null);

  // New Subscription Form State
  const [customerId, setCustomerId] = useState(users.find((u) => u.role === 'CUSTOMER')?.id || users[0]?.id || '');
  const [planId, setPlanId] = useState(billingPlans[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || sub.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = users.find((u) => u.id === customerId);
    const plan = billingPlans.find((p) => p.id === planId);
    const prod = products.find((p) => p.id === selectedProductId);

    if (!cust || !plan || !prod) return;

    let unitPrice = prod.salesPrice;
    let variantName = undefined;

    if (selectedVariantId) {
      const v = prod.variants.find((varItem) => varItem.id === selectedVariantId);
      if (v) {
        unitPrice += v.priceAdjustment;
        variantName = `${v.name} (+₹${v.priceAdjustment})`;
      }
    }

    const lineTotal = unitPrice * quantity;

    createSubscription({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerGstin: cust.gstin,
      planId: plan.id,
      planName: plan.name,
      billingFrequency: plan.frequency,
      startDate,
      nextBillingDate: startDate,
      paymentTerms,
      status: 'DRAFT',
      lines: [
        {
          id: `line_${Date.now()}`,
          productId: prod.id,
          productName: prod.name,
          variantId: selectedVariantId || undefined,
          variantName,
          quantity,
          unitPrice,
          taxPercent: 18,
          discountAmount: 0,
          totalAmount: lineTotal
        }
      ],
      closureRules: plan.closureRules,
      notes
    });

    setModalOpen(false);
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]';
      case 'CONFIRMED':
        return 'bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]';
      case 'QUOTATION':
        return 'bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1]';
      case 'DRAFT':
        return 'bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]';
      case 'PAUSED':
        return 'bg-[#FFEBEB] text-[#D34545] border border-[#FFD5D5]';
      case 'CLOSED':
        return 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]';
    }
  };

  const handleExportCSV = () => {
    let csv = 'Subscription,Customer,Plan,Cadence,Start Date,Next Billing,Subtotal,Status\n';
    filteredSubs.forEach((sub) => {
      const total = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);
      csv += `${sub.number},"${sub.customerName}",${sub.planName},${sub.billingFrequency},${sub.startDate},${sub.nextBillingDate},${total},${sub.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brightloop_Subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Subscription contracts exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Subscriptions
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Manage recurring client agreements, line-item configurations, and automated billing schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/50 text-xs font-semibold text-[#697386] hover:text-[#252735] transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7A8CE8]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] active:scale-[0.98] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(98,84,232,0.25)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_4px_20px_rgba(41,42,58,0.02)]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9299A8]" />
          <input
            type="text"
            placeholder="Search by contract #, customer or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#F0EDFA]/40 hover:bg-[#F0EDFA]/60 focus:bg-white border border-[#E3E8EE] focus:border-[#6254E8] text-[#252735] placeholder-[#9299A8] transition-all outline-hidden"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'ACTIVE', 'CONFIRMED', 'QUOTATION', 'DRAFT', 'PAUSED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-[#6254E8] text-white shadow-2xs'
                  : 'bg-[#F0EDFA]/50 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Subscriptions Table */}
      <div className="bg-white rounded-3xl border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0EDFA]/40 text-[11px] font-bold text-[#697386] uppercase tracking-wider border-b border-[#E3E8EE]">
                <th className="py-3.5 px-5">Subscription #</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Plan & Cadence</th>
                <th className="py-3.5 px-5">Start Date</th>
                <th className="py-3.5 px-5">Next Billing</th>
                <th className="py-3.5 px-5 text-right">Lines Subtotal</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70 text-xs">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#9299A8]">
                    No subscriptions match your query criteria.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const total = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#F0EDFA]/30 transition-colors group"
                    >
                      {/* Subscription Number */}
                      <td className="py-3.5 px-5 font-bold text-[#6254E8] font-mono">
                        {sub.number}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#252735]">
                          {sub.customerName}
                        </div>
                        <div className="text-[11px] text-[#697386] truncate max-w-[180px]">
                          {sub.customerEmail}
                        </div>
                      </td>

                      {/* Plan & Cadence */}
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-[#252735]">
                          {sub.planName}
                        </div>
                        <div className="text-[11px] text-[#697386] font-mono">
                          {sub.billingFrequency} · {sub.paymentTerms}
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="py-3.5 px-5 font-mono text-[#697386]">
                        {sub.startDate}
                      </td>

                      {/* Next Billing */}
                      <td className="py-3.5 px-5 font-mono font-medium text-[#252735]">
                        {sub.nextBillingDate}
                      </td>

                      {/* Lines Subtotal (Right-aligned, Tabular Numbers) */}
                      <td className="py-3.5 px-5 text-right font-bold text-[#252735] font-mono tabular-nums">
                        ₹{total.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === 'ACTIVE' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'PAUSED')}
                              className="p-1.5 rounded-xl border border-[#FFE1D1] bg-[#FFF1E8]/70 text-[#B86221] hover:bg-[#FFF1E8] transition-colors"
                              title="Pause subscription"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {sub.status === 'PAUSED' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'ACTIVE')}
                              className="p-1.5 rounded-xl border border-[#CEEBDD] bg-[#E1F3EB]/70 text-[#2E7D5D] hover:bg-[#E1F3EB] transition-colors"
                              title="Resume subscription"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewingSub(sub)}
                            className="p-1.5 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/70 text-[#697386] hover:text-[#252735] transition-colors shadow-2xs"
                            title="View contract details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Detail View Modal (Clean 2-Column Layout) */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-[#E3E8EE] shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
              <div>
                <span className="text-xs font-bold text-[#6254E8] font-mono">
                  {viewingSub.number}
                </span>
                <h3 className="text-lg font-bold text-[#252735]">
                  {viewingSub.customerName}
                </h3>
              </div>
              <button
                onClick={() => setViewingSub(null)}
                className="p-1.5 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Metadata Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7]">
                <div className="text-[10px] text-[#697386] uppercase font-semibold">Plan</div>
                <div className="font-bold text-[#252735] mt-0.5">{viewingSub.planName}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#E1F3EB]/60 border border-[#CEEBDD]">
                <div className="text-[10px] text-[#697386] uppercase font-semibold">Cadence</div>
                <div className="font-bold text-[#2E7D5D] mt-0.5">{viewingSub.billingFrequency}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#E5F0FA]/60 border border-[#D5E6F5]">
                <div className="text-[10px] text-[#697386] uppercase font-semibold">Next Billing</div>
                <div className="font-bold text-[#2C6EA6] font-mono mt-0.5">{viewingSub.nextBillingDate}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF1E8]/60 border border-[#FFE1D1]">
                <div className="text-[10px] text-[#697386] uppercase font-semibold">Status</div>
                <div className="font-bold text-[#B86221] mt-0.5">{viewingSub.status}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#252735]">Contract Line Items:</div>
              <div className="border border-[#E3E8EE] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0EDFA]/40 text-[#697386] font-semibold">
                    <tr>
                      <th className="py-2 px-3">Item / Variant</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8EE]/70">
                    {viewingSub.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#252735]">{line.productName}</div>
                          {line.variantName && (
                            <div className="text-[10px] text-[#6254E8] font-mono">
                              {line.variantName}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{line.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{line.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-[#252735]">
                          ₹{line.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E3E8EE] text-xs">
              <div className="text-[#697386]">
                Customer GSTIN: <span className="font-mono font-semibold text-[#252735]">{viewingSub.customerGstin || 'Unregistered'}</span>
              </div>
              <button
                onClick={() => setViewingSub(null)}
                className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Subscription Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-xl w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#252735]">
                  Create New Subscription Offer
                </h3>
                <p className="text-xs text-[#697386]">Setup recurring cadence and product lines</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSub} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Select Customer
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.companyName || u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Select Billing Plan
                  </label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden"
                  >
                    {billingPlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.frequency} - ₹{p.basePrice.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Primary Software Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setSelectedVariantId('');
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Base ₹{p.salesPrice.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Product Variant (Optional)
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden"
                  >
                    <option value="">No Variant Add-on</option>
                    {products
                      .find((p) => p.id === selectedProductId)
                      ?.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (+₹{v.priceAdjustment})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Quantity / Seats
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Contract Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions or contract terms..."
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] focus:border-[#6254E8] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold shadow-xs"
                >
                  Create Draft Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
