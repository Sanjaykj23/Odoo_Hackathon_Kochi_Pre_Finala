import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, PaymentMethod } from '../types';
import {
  Receipt,
  Search,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Calendar,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { invoices, payments, recordPayment, confirmInvoice, cancelInvoice } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'INVOICES' | 'PAYMENTS'>('INVOICES');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'OVERDUE') {
      return inv.status === 'CONFIRMED' && inv.dueDate < todayStr;
    }
    return inv.status === statusFilter;
  });

  const filteredPayments = payments.filter((p) => {
    return (
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenPaymentModal = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(inv.balanceDue);
    setTransactionRef(`UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}/AXIS`);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    recordPayment({
      invoiceId: selectedInvoiceForPayment.id,
      amount: paymentAmount,
      method: paymentMethod,
      transactionRef,
      notes: paymentNotes
    });

    setSelectedInvoiceForPayment(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Invoices Ledger & GST Billing</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track generated GST tax invoices, log customer payments, and print official tax invoices.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('INVOICES')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeSubTab === 'INVOICES'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          GST Invoices Ledger ({invoices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('PAYMENTS')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'PAYMENTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Payment Receipts Ledger ({payments.length})</span>
        </button>
      </div>

      {activeSubTab === 'INVOICES' ? (
        <>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Sub Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Issue / Due Date</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">GST (18%)</th>
                    <th className="py-3 px-4 text-right">Total Payable</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                        No invoices matching query filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isOverdue = inv.status === 'CONFIRMED' && inv.dueDate < todayStr;

                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{inv.subscriptionNumber}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {inv.customerName}
                            </div>
                            {inv.customerGstin && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                GSTIN: {inv.customerGstin}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                            <div>Iss: {inv.issueDate}</div>
                            <div className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                              Due: {inv.dueDate}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            ₹{inv.subtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            ₹{inv.taxTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold font-mono">
                            {inv.balanceDue > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">
                                ₹{inv.balanceDue.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">₹0</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {inv.status === 'PAID' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                PAID
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                OVERDUE
                              </span>
                            ) : inv.status === 'CONFIRMED' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                OUTSTANDING
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                {inv.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedInvoiceForPrint(inv)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                              title="Print Official GST Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {inv.balanceDue > 0 && inv.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenPaymentModal(inv)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                              >
                                Record Payment
                              </button>
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
        </>
      ) : (
        /* Payments & Cash Receipts Ledger */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payment UTR, customer, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total Recorded Payments:{' '}
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ₹{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Method / Channel</th>
                    <th className="py-3 px-4">Transaction UTR / Ref</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No payment receipts logged matching search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pmt) => (
                      <tr
                        key={pmt.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {pmt.paymentDate}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {pmt.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {pmt.customerName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {pmt.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {pmt.transactionRef}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          +₹{pmt.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{pmt.recordedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Record Incoming Payment
                </h3>
                <div className="text-xs text-indigo-600 font-mono">
                  {selectedInvoiceForPayment.invoiceNumber} · {selectedInvoiceForPayment.customerName}
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Channel / Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
                  <option value="NET_BANKING">NetBanking (IMPS/NEFT)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="NEFT_RTGS">Bank Wire Transfer (NEFT/RTGS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared via HDFC Bank NEFT"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Confirm Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable GST Tax Invoice Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Top Toolbar (No-Print) */}
            <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official GST Tax Invoice Preview
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tax Invoice Document Content */}
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                    TAX INVOICE
                  </h1>
                  <p className="text-xs text-slate-600">Issued under Rule 46 of CGST Rules, 2017</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-indigo-700">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-600">Sub: {selectedInvoiceForPrint.subscriptionNumber}</div>
                </div>
              </div>

              {/* Biller & Customer Details */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-4">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Issued By (Supplier):
                  </div>
                  <div className="font-bold text-slate-900">Brightloop Software Pvt Ltd</div>
                  <div className="text-slate-600">Embassy TechVillage, Outer Ring Road</div>
                  <div className="text-slate-600">Bengaluru, Karnataka - 560103</div>
                  <div className="font-mono text-indigo-700 font-semibold mt-1">
                    GSTIN: 29AAACB9999A1Z1
                  </div>
                  <div className="font-mono text-slate-600">PAN: AAACB9999A</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Billed To (Customer):
                  </div>
                  <div className="font-bold text-slate-900">{selectedInvoiceForPrint.customerName}</div>
                  <div className="text-slate-600">
                    {selectedInvoiceForPrint.billingAddress || 'Electronics City Phase I, Bengaluru'}
                  </div>
                  <div className="font-mono text-indigo-700 font-semibold mt-1">
                    GSTIN: {selectedInvoiceForPrint.customerGstin || 'Unregistered'}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div>
                      Invoice Date: <span className="font-mono font-bold">{selectedInvoiceForPrint.issueDate}</span>
                    </div>
                    <div>
                      Due Date: <span className="font-mono font-bold text-rose-600">{selectedInvoiceForPrint.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Description / HSN</th>
                      <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right">Rate (₹)</th>
                      <th className="p-2 border-r border-slate-300 text-right">Taxable (₹)</th>
                      <th className="p-2 border-r border-slate-300 text-right">CGST (9%)</th>
                      <th className="p-2 border-r border-slate-300 text-right">SGST (9%)</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoiceForPrint.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="p-2 border-r border-slate-300 font-medium">
                          {line.productName}
                          <div className="text-[10px] text-slate-500 font-mono">SAC: 998313</div>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">{line.quantity}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">
                          ₹{line.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">
                          ₹{line.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">
                          ₹{line.cgstAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">
                          ₹{line.sgstAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-bold font-mono">
                          ₹{(line.totalAmount + line.cgstAmount + line.sgstAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-between items-start pt-2 text-xs">
                <div className="max-w-xs space-y-1">
                  <div className="font-bold text-slate-700">Payment Instructions:</div>
                  <div className="text-slate-600 text-[11px]">
                    Beneficiary: Brightloop Software Pvt Ltd<br />
                    Bank: HDFC Bank Ltd (Indiranagar, Bengaluru)<br />
                    A/C No: 50200012345678<br />
                    IFSC: HDFC0001234
                  </div>
                </div>

                <div className="w-64 space-y-1.5 text-right font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoiceForPrint.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoiceForPrint.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-₹{selectedInvoiceForPrint.discountTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span>₹{selectedInvoiceForPrint.cgstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span>₹{selectedInvoiceForPrint.sgstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-1.5">
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoiceForPrint.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Footer Signature */}
              <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
                <div className="text-slate-500">
                  This is a computer generated invoice and requires no physical signature.
                </div>
                <div className="text-center font-bold text-slate-900">
                  For Brightloop Software Pvt Ltd<br />
                  <span className="text-[10px] text-slate-500 font-normal">Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
