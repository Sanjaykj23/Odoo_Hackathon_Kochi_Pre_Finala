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
  Info,
  HelpCircle
} from 'lucide-react';

interface QuoteLineInput {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export const QuotationManager: React.FC = () => {
  const {
    templates,
    billingPlans,
    products,
    users,
    discounts,
    addUser,
    createSubscription,
    addTemplate,
    setActiveView
  } = useApp();

  // Customer Target Mode
  const [customerMode, setCustomerMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    users.find((u) => u.role === 'CUSTOMER')?.id || users[0].id
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
  const [customOfferTitle, setCustomOfferTitle] = useState('Multi-Product Enterprise Suite Offer');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

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
      const created = addUser({
        name: newCustName,
        email: newCustEmail,
        role: 'CUSTOMER',
        companyName: newCustCompany || newCustName,
        gstin: newCustGstin || undefined
      });

      if (!created) return;

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

    // Build subscription lines with proportional discount allocation
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
      planName: `${customOfferTitle} (${selectedDuration} Duration)`,
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
      notes: `Quotation offer issued for ${selectedDuration} license duration containing ${subLines.length} software product(s). Valid for ${offerValidityDays} days.`
    });

    setActiveView('subscriptions_kanban');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Multi-Product Quotation Offer Builder</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bundle multiple software licenses, assign target customers (existing or new), apply duration cadences, and calculate itemized GST.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>{showFormulaInfo ? 'Hide Pricing Formula' : 'How Price is Calculated?'}</span>
        </button>
      </div>

      {/* Math Formula Explanatory Box */}
      {showFormulaInfo && (
        <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2 border border-slate-800 animate-in fade-in">
          <div className="font-bold text-amber-400 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span>Exact Pricing Calculation Formula</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="font-bold text-white">1. Line Item Price:</div>
              <div>Line Price = (Product Sales Price + Variant Adjustment) × Qty × Cadence Multiplier</div>
              <div className="text-slate-400">Cadence: Monthly = 1.0, Yearly = 12 × 0.8 (20% Off)</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="font-bold text-white">2. Discounts & Taxes:</div>
              <div>Net Taxable = Gross Total - Discount Deduction</div>
              <div>18% GST = Net Taxable × 0.18 (9% CGST + 9% SGST)</div>
              <div className="text-emerald-400 font-bold">Grand Total = Net Taxable + 18% GST</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step Quote Builder Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          {/* Step 1: Customer Selection or New Customer Provisioning */}
          <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Target Customer Account</span>
              </label>

              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomerMode('EXISTING')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    customerMode === 'EXISTING'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('NEW')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    customerMode === 'NEW'
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  + Target New Customer
                </button>
              </div>
            </div>

            {customerMode === 'EXISTING' ? (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.companyName || u.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision New Client Record</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Customer Name (e.g. Reliance Tech)"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Billing Email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="GSTIN (e.g. 29AAAAA0000A1Z5)"
                    value={newCustGstin}
                    onChange={(e) => setNewCustGstin(e.target.value)}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Multiple Software Licenses Table */}
          <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2. Software Licenses Bundle ({lineItems.length})</span>
              </label>

              <button
                type="button"
                onClick={handleAddLine}
                className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Software License</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((line, index) => {
                const prod = products.find((p) => p.id === line.productId) || products[0];

                return (
                  <div
                    key={line.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        Software Product #{index + 1}
                      </label>
                      <select
                        value={line.productId}
                        onChange={(e) => handleUpdateLine(line.id, 'productId', e.target.value)}
                        className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.salesPrice.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        Attribute Variant
                      </label>
                      <select
                        value={line.variantId}
                        onChange={(e) => handleUpdateLine(line.id, 'variantId', e.target.value)}
                        className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        Seats / Qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateLine(line.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-1 text-right flex sm:justify-end items-end h-full pt-4">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
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

          {/* Step 3: License Duration & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                3. License Duration (Cadence)
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value as BillingFrequency)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-indigo-600 dark:text-indigo-400 font-mono"
              >
                <option value="MONTHLY">MONTHLY (Standard Duration)</option>
                <option value="YEARLY">YEARLY (20% Commitment Savings)</option>
                <option value="WEEKLY">WEEKLY (Sprint Trial)</option>
                <option value="DAILY">DAILY (On-Demand)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                4. Apply Discount Rule
              </label>
              <select
                value={selectedDiscountCode}
                onChange={(e) => {
                  setSelectedDiscountCode(e.target.value);
                  setCustomDiscountPercent(0);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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

        {/* Live Calculation Preview Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>Live Quote Calculation</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                18% GST Applicable
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bundled License Lines ({processedLines.length}):
                </div>
                {processedLines.map((line, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 text-[11px] py-1 border-b border-slate-800/60">
                    <div>
                      <span className="font-bold text-white">{line.prod.name}</span>
                      <span className="text-slate-400"> × {line.quantity} seats</span>
                      {line.variantName && (
                        <div className="text-[10px] text-indigo-300 font-mono">{line.variantName}</div>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{line.lineGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-slate-300">
                <span>License Duration:</span>
                <span className="font-mono font-bold text-amber-300">{selectedDuration}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Total:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ₹{grossTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {discountDeduction > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Applied Discount:</span>
                    <span className="font-mono">-₹{discountDeduction.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>CGST 9% + SGST 9%:</span>
                  <span className="font-mono text-slate-300">
                    +₹{totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-700 text-base font-bold text-white font-mono">
                  <span>Grand Total Payable:</span>
                  <span className="text-xl text-emerald-400">
                    ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={handleIssueQuotation}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-slate-950 fill-current" />
              <span>Issue Multi-Product Quote & Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
