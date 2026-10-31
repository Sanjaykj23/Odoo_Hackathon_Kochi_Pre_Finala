import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QuotationTemplate, BillingFrequency, UserRole } from '../types';
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Building2,
  Tag,
  ArrowRight,
  Calculator,
  Percent,
  Layers,
  Sparkles,
  Trash2,
  UserPlus,
  HelpCircle,
  IndianRupee
} from 'lucide-react';

interface QuoteLineInput {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export const QuotationManager: React.FC = () => {
  const {
    billingPlans,
    products,
    users,
    discounts,
    templates,
    addTemplate,
    addUser,
    createSubscription,
    setActiveView
  } = useApp();

  // Customer Target Mode
  const [customerMode, setCustomerMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    users.find((u) => u.role === 'CUSTOMER')?.id || users[0]?.id || ''
  );

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');

  // Multiple Software Licenses Lines
  const [lineItems, setLineItems] = useState<QuoteLineInput[]>([
    { id: 'line_1', productId: products[0]?.id || '', variantId: '', quantity: 5 }
  ]);

  // General Offer Parameters
  const [selectedDuration, setSelectedDuration] = useState<BillingFrequency>('MONTHLY');
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<string>('');
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);
  const [offerValidityDays, setOfferValidityDays] = useState<number>(30);
  const [customOfferTitle, setCustomOfferTitle] = useState('Enterprise Multi-Seat License Agreement');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const handleApplyTemplate = (tplId: string) => {
    if (!tplId) return;
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setOfferValidityDays(tpl.validityDays || 30);
    const plan = billingPlans.find((p) => p.id === tpl.planId);
    if (plan) setSelectedDuration(plan.frequency);
    if (tpl.items && tpl.items.length > 0) {
      setLineItems(
        tpl.items.map((it, idx) => ({
          id: `line_${Date.now()}_${idx}`,
          productId: it.productId,
          variantId: '',
          quantity: it.quantity
        }))
      );
    }
    setCustomOfferTitle(tpl.name);
  };

  // Add line item
  const handleAddLine = () => {
    setLineItems((prev) => [
      ...prev,
      { id: `line_${Date.now()}`, productId: products[0]?.id || '', variantId: '', quantity: 1 }
    ]);
  };

  // Remove line item
  const handleRemoveLine = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update line item
  const handleUpdateLine = (id: string, field: keyof QuoteLineInput, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const selectedDiscount = discounts.find((d) => d.code === selectedDiscountCode);
  const matchedPlan =
    billingPlans.find((p) => p.frequency === selectedDuration) || billingPlans[0];

  // Duration Multiplier
  let durationMultiplier = 1;
  if (selectedDuration === 'YEARLY') {
    durationMultiplier = 12 * 0.8; // 20% annual commitment discount
  } else if (selectedDuration === 'WEEKLY') {
    durationMultiplier = 0.25;
  } else if (selectedDuration === 'DAILY') {
    durationMultiplier = 0.05;
  }

  // Calculate gross total across all software lines
  let grossTotal = 0;
  const processedLines = lineItems.map((line) => {
    const prod = products.find((p) => p.id === line.productId) || products[0];
    const variant = prod?.variants.find((v) => v.id === line.variantId);

    let unitPrice = prod?.salesPrice || 0;
    let variantName = undefined;

    if (variant) {
      unitPrice += variant.priceAdjustment;
      variantName = `${variant.name} (+₹${variant.priceAdjustment})`;
    }

    const lineGross = unitPrice * line.quantity * durationMultiplier;
    grossTotal += lineGross;

    return {
      prod,
      variantName,
      quantity: line.quantity,
      unitPrice,
      lineGross
    };
  });

  // Calculate Discount
  let discountDeduction = 0;
  if (selectedDiscount) {
    if (selectedDiscount.type === 'PERCENTAGE') {
      discountDeduction = (grossTotal * selectedDiscount.value) / 100;
    } else {
      discountDeduction = selectedDiscount.value;
    }
  } else if (customDiscountPercent > 0) {
    discountDeduction = (grossTotal * customDiscountPercent) / 100;
  }

  const netTaxable = Math.max(0, grossTotal - discountDeduction);
  const cgst = netTaxable * 0.09;
  const sgst = netTaxable * 0.09;
  const totalGst = cgst + sgst;
  const grandTotal = netTaxable + totalGst;

  const handleIssueQuotation = () => {
    let customerId = selectedCustomerId;
    let customerName = '';
    let customerEmail = '';
    let customerGstin = undefined;

    if (customerMode === 'NEW') {
      if (!newCustName || !newCustEmail) {
        alert('Please fill in Name and Email for the new customer.');
        return;
      }

      const newId = `usr_cust_${Date.now().toString(36)}`;
      addUser({
        name: newCustName,
        email: newCustEmail,
        role: 'CUSTOMER',
        companyName: newCustCompany || newCustName,
        gstin: newCustGstin || undefined
      });

      customerId = newId;
      customerName = newCustName;
      customerEmail = newCustEmail;
      customerGstin = newCustGstin;
    } else {
      const cust = users.find((u) => u.id === selectedCustomerId) || users[0];
      customerId = cust.id;
      customerName = cust.name;
      customerEmail = cust.email;
      customerGstin = cust.gstin;
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + offerValidityDays);

    const subLines = processedLines.map((line, idx) => {
      const lineProportion = grossTotal > 0 ? line.lineGross / grossTotal : 0;
      const lineDiscount = discountDeduction * lineProportion;
      const lineNet = Math.max(0, line.lineGross - lineDiscount);

      return {
        id: `line_${Date.now()}_${idx}`,
        productId: line.prod.id,
        productName: line.prod.name,
        variantId: line.prod.variants.find((v) => v.name.includes(line.variantName || ''))?.id,
        variantName: line.variantName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxPercent: 18,
        discountAmount: Number(lineDiscount.toFixed(2)),
        totalAmount: Number(lineNet.toFixed(2))
      };
    });

    createSubscription({
      customerId,
      customerName,
      customerEmail,
      customerGstin,
      planId: matchedPlan.id,
      planName: `${customOfferTitle} (${selectedDuration})`,
      billingFrequency: selectedDuration,
      startDate: today.toISOString().split('T')[0],
      nextBillingDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      paymentTerms: 'Net 15',
      status: 'QUOTATION',
      appliedDiscountCode: selectedDiscountCode || undefined,
      discountAmount: discountDeduction,
      lines: subLines,
      closureRules: matchedPlan.closureRules,
      notes: `Quotation offer issued for ${selectedDuration} license duration with ${subLines.length} line(s). Valid for ${offerValidityDays} days.`
    });

    setActiveView('subscriptions_kanban');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Quotation Offers
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Configure multi-seat software quotes, apply promotional coupons, and compute GST tax lines in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/50 text-xs font-semibold text-[#697386] hover:text-[#252735] transition-all shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#6254E8]" />
          <span>{showFormulaInfo ? 'Hide Math Formula' : 'Pricing Formula Details'}</span>
        </button>
      </div>

      {/* Explanatory Math Drawer */}
      {showFormulaInfo && (
        <div className="p-4 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_8px_30px_rgba(41,42,58,0.04)] text-xs space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-[#6254E8] flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span>Multi-Seat Pricing & Taxation Rules</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#252735] font-mono text-[11px]">
            <div className="p-3 rounded-2xl bg-[#F0EDFA]/60 border border-[#E3DCF7]">
              <div className="font-bold text-[#6254E8]">1. Line Total:</div>
              <div className="text-[10px] text-[#697386] mt-1">(Base Price + Variant) × Quantity × Cadence Factor</div>
              <div className="text-[10px] text-[#6254E8] mt-0.5">Annual = 12 × 0.8 (20% commitment incentive)</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#E1F3EB]/60 border border-[#CEEBDD]">
              <div className="font-bold text-[#2E7D5D]">2. GST Ledger:</div>
              <div className="text-[10px] text-[#697386] mt-1">Taxable = Gross - Coupon; GST 18% = 9% CGST + 9% SGST</div>
              <div className="text-[10px] text-[#2E7D5D] mt-0.5 font-bold">Total = Taxable + CGST + SGST</div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Template Selector Bar (Scene 3) */}
      <div className="bg-gradient-to-r from-[#F0EDFA] via-white to-[#E1F3EB] p-4 rounded-3xl border border-[#E3DCF7] shadow-[0_4px_20px_rgba(41,42,58,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#6254E8]" />
          <div>
            <div className="font-bold text-[#252735]">Quotation Template Builder (Scene 3)</div>
            <div className="text-[11px] text-[#697386]">Pre-fill software bundles, seat quotas, and validity terms with 1-click.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#697386]">Select Template:</span>
          <select
            onChange={(e) => handleApplyTemplate(e.target.value)}
            className="p-2 rounded-xl bg-white border border-[#DCE5ED] font-semibold text-[#252735] text-xs focus:ring-2 focus:ring-[#6254E8] cursor-pointer"
          >
            <option value="">-- Apply Quotation Template --</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.validityDays} Days Validity)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Customer & Bundle Setup (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3E8EE] p-6 shadow-[0_6px_20px_rgba(41,42,58,0.03)] space-y-5">
          
          {/* 1. Target Customer */}
          <div className="space-y-3 pb-4 border-b border-[#E3E8EE]/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#252735] uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6254E8]" />
                <span>1. Target Customer Account</span>
              </label>

              <div className="flex items-center gap-1 p-1 bg-[#F0EDFA]/60 border border-[#E3DCF7] rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setCustomerMode('EXISTING')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    customerMode === 'EXISTING'
                      ? 'bg-white text-[#252735] shadow-2xs'
                      : 'text-[#697386]'
                  }`}
                >
                  Existing
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('NEW')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    customerMode === 'NEW'
                      ? 'bg-[#6254E8] text-white shadow-2xs'
                      : 'text-[#697386]'
                  }`}
                >
                  + New Client
                </button>
              </div>
            </div>

            {customerMode === 'EXISTING' ? (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] text-xs font-medium outline-hidden focus:border-[#6254E8]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.companyName || u.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3.5 bg-[#F0EDFA]/40 rounded-2xl border border-[#E3DCF7] space-y-2 text-xs">
                <div className="font-bold text-[#6254E8] flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision New Client Record</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="p-2 rounded-xl bg-white border border-[#E3E8EE] outline-hidden focus:border-[#6254E8]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Billing Email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="p-2 rounded-xl bg-white border border-[#E3E8EE] font-mono outline-hidden focus:border-[#6254E8]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    className="p-2 rounded-xl bg-white border border-[#E3E8EE] outline-hidden focus:border-[#6254E8]"
                  />
                  <input
                    type="text"
                    placeholder="GSTIN (e.g. 29AAAAA0000A1Z5)"
                    value={newCustGstin}
                    onChange={(e) => setNewCustGstin(e.target.value)}
                    className="p-2 rounded-xl bg-white border border-[#E3E8EE] font-mono outline-hidden focus:border-[#6254E8]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Bundle Software Licenses */}
          <div className="space-y-3 pb-4 border-b border-[#E3E8EE]/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#252735] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6254E8]" />
                <span>2. Software Licenses Bundle ({lineItems.length})</span>
              </label>

              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1 rounded-xl bg-[#E1F3EB] border border-[#CEEBDD] text-[#2E7D5D] font-semibold text-xs hover:bg-[#D4EFE3] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Software Line</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {lineItems.map((line, index) => {
                const prod = products.find((p) => p.id === line.productId) || products[0];

                return (
                  <div
                    key={line.id}
                    className="p-3 bg-[#EAF3F8]/40 rounded-2xl border border-[#DCE5ED] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-[#9299A8] mb-0.5">
                        Product #{index + 1}
                      </label>
                      <select
                        value={line.productId}
                        onChange={(e) => handleUpdateLine(line.id, 'productId', e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-[#E3E8EE] text-[#252735] font-medium outline-hidden"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.salesPrice.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-[#9299A8] mb-0.5">
                        Attribute Variant
                      </label>
                      <select
                        value={line.variantId}
                        onChange={(e) => handleUpdateLine(line.id, 'variantId', e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-[#E3E8EE] text-[#252735] outline-hidden"
                      >
                        <option value="">No Variant</option>
                        {prod?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} (+₹{v.priceAdjustment})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-[#9299A8] mb-0.5">
                        Seats / Qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateLine(line.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full p-2 rounded-xl bg-white border border-[#E3E8EE] font-mono font-bold outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-1 text-right flex sm:justify-end items-end h-full pt-3">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1.5 rounded-xl text-[#E99B9B] hover:bg-[#FFEBEB] transition-colors"
                          title="Remove Line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Duration & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252735] mb-1">
                3. License Cadence Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value as BillingFrequency)}
                className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#6254E8] font-bold font-mono outline-hidden focus:border-[#6254E8]"
              >
                <option value="MONTHLY">MONTHLY (Standard Recurring)</option>
                <option value="YEARLY">YEARLY (20% Annual Savings)</option>
                <option value="WEEKLY">WEEKLY (Short-term Sprint)</option>
                <option value="DAILY">DAILY (On-Demand Trial)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#252735] mb-1">
                4. Promotional Coupon
              </label>
              <select
                value={selectedDiscountCode}
                onChange={(e) => {
                  setSelectedDiscountCode(e.target.value);
                  setCustomDiscountPercent(0);
                }}
                className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
              >
                <option value="">No Promotional Code</option>
                {discounts.filter((d) => d.isActive).map((d) => (
                  <option key={d.id} value={d.code}>
                    {d.code} - {d.title} ({d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Card: Live Pastel Quotation Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#F0EDFA]/90 to-[#E8F5F1]/80 rounded-3xl p-6 border border-[#E3DCF7] shadow-[0_10px_30px_rgba(98,84,232,0.05)] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCF7]">
              <span className="text-xs font-bold font-mono text-[#6254E8] uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>Live Quote Calculation</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#2E7D5D] border border-[#CEEBDD]">
                GST 18% Compliant
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">
                  Bundled Offerings ({processedLines.length}):
                </div>
                {processedLines.map((line, idx) => (
                  <div key={idx} className="flex justify-between text-[#252735] text-[11px] py-1 border-b border-[#E3DCF7]/50">
                    <div>
                      <span className="font-bold">{line.prod.name}</span>
                      <span className="text-[#697386]"> × {line.quantity} seats</span>
                      {line.variantName && (
                        <div className="text-[10px] text-[#6254E8] font-mono">{line.variantName}</div>
                      )}
                    </div>
                    <span className="font-mono font-bold">
                      ₹{line.lineGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[#697386]">
                <span>Cadence Schedule:</span>
                <span className="font-mono font-bold text-[#6254E8]">{selectedDuration}</span>
              </div>

              <div className="pt-2 border-t border-[#E3DCF7] space-y-1.5">
                <div className="flex justify-between text-[#697386]">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono font-bold text-[#252735]">
                    ₹{grossTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {discountDeduction > 0 && (
                  <div className="flex justify-between text-[#2E7D5D] font-semibold">
                    <span>Discount Deduction:</span>
                    <span className="font-mono">-₹{discountDeduction.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#697386]">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span className="font-mono text-[#252735]">
                    +₹{totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#E3DCF7] text-base font-bold text-[#252735] font-mono">
                  <span>Grand Total Payable:</span>
                  <span className="text-2xl text-[#6254E8] tabular-nums">
                    ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleIssueQuotation}
            className="w-full py-3 rounded-2xl bg-[#6254E8] hover:bg-[#5245D0] active:scale-[0.98] text-white font-bold text-xs shadow-[0_4px_16px_rgba(98,84,232,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Issue Quotation Offer & Save</span>
          </button>
        </div>

      </div>

    </div>
  );
};
