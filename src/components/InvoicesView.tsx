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
  ShieldCheck,
  Download,
  IndianRupee,
  ChevronRight
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { invoices, payments, recordPayment, confirmInvoice, cancelInvoice, addToast } = useApp();

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

  const handleExportCSV = () => {
    let csv = 'Invoice #,Sub Ref,Customer,Issue Date,Due Date,Subtotal,Tax,Total,Balance,Status\n';
    filteredInvoices.forEach((inv) => {
      csv += `${inv.invoiceNumber},${inv.subscriptionNumber},"${inv.customerName}",${inv.issueDate},${inv.dueDate},${inv.subtotal},${inv.taxTotal},${inv.totalAmount},${inv.balanceDue},${inv.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brightloop_Invoices_${todayStr}.csv`;
    a.click();
    addToast('Invoice ledger exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Invoices & Ledger
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Audit trail of B2B GST tax invoices, payment settlement reconciliations, and formal tax receipts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/50 text-xs font-semibold text-[#697386] hover:text-[#252735] transition-all shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#7A8CE8]" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Sub-Tab Navigation Header (Soft Pastel Pills) */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F0EDFA]/60 border border-[#E3DCF7] rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('INVOICES')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'INVOICES'
              ? 'bg-[#6254E8] text-white shadow-xs'
              : 'text-[#697386] hover:text-[#252735]'
          }`}
        >
          Invoices Ledger ({invoices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('PAYMENTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'PAYMENTS'
              ? 'bg-[#6254E8] text-white shadow-xs'
              : 'text-[#697386] hover:text-[#252735]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#55C9A2]" />
          <span>Receipts & Collections ({payments.length})</span>
        </button>
      </div>

      {activeSubTab === 'INVOICES' ? (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_4px_20px_rgba(41,42,58,0.02)]">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9299A8]" />
              <input
                type="text"
                placeholder="Search invoice #, customer or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#F0EDFA]/40 hover:bg-[#F0EDFA]/60 focus:bg-white border border-[#E3E8EE] focus:border-[#6254E8] text-[#252735] placeholder-[#9299A8] transition-all outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['ALL', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[#6254E8] text-white shadow-2xs'
                      : 'bg-[#F0EDFA]/50 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Invoice Table */}
          <div className="bg-white rounded-3xl border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0EDFA]/40 font-bold text-[#697386] uppercase tracking-wider text-[11px] border-b border-[#E3E8EE]">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Sub Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Issue / Due Date</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                    <th className="py-3.5 px-4 text-right">GST (18%)</th>
                    <th className="py-3.5 px-4 text-right">Total Payable</th>
                    <th className="py-3.5 px-4 text-right">Balance Due</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EE]/70">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-[#9299A8]">
                        No invoices match current search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isOverdue = inv.status === 'CONFIRMED' && inv.dueDate < todayStr;

                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-[#F0EDFA]/30 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-bold text-[#6254E8] font-mono">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#697386]">{inv.subscriptionNumber}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#252735]">
                              {inv.customerName}
                            </div>
                            {inv.customerGstin && (
                              <div className="text-[10px] text-[#9299A8] font-mono">
                                GSTIN: {inv.customerGstin}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#697386]">
                            <div>Iss: {inv.issueDate}</div>
                            <div className={isOverdue ? 'text-[#D34545] font-bold' : ''}>
                              Due: {inv.dueDate}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#252735] tabular-nums">
                            ₹{inv.subtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#697386] tabular-nums">
                            ₹{inv.taxTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#252735] font-mono tabular-nums">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono tabular-nums">
                            {inv.balanceDue > 0 ? (
                              <span className="text-[#D34545]">
                                ₹{inv.balanceDue.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-[#2E7D5D]">₹0</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {inv.status === 'PAID' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
                                PAID
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFEBEB] text-[#D34545] border border-[#FFD5D5]">
                                OVERDUE
                              </span>
                            ) : inv.status === 'CONFIRMED' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]">
                                OUTSTANDING
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                                {inv.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="p-1.5 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/60 text-[#697386] hover:text-[#252735] transition-colors shadow-2xs"
                                title="Print Official GST Tax Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {inv.status === 'DRAFT' && (
                                <button
                                  onClick={() => confirmInvoice(inv.id)}
                                  className="px-2.5 py-1 rounded-xl bg-[#E5F0FA] hover:bg-[#D5E6F5] text-[#2C6EA6] border border-[#D5E6F5] text-[11px] font-semibold transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                                <button
                                  onClick={() => cancelInvoice(inv.id)}
                                  className="px-2 py-1 rounded-xl hover:bg-[#FFEBEB] text-[#D34545] border border-transparent hover:border-[#FFD5D5] text-[10px] font-semibold transition-colors"
                                  title="Cancel Invoice"
                                >
                                  Cancel
                                </button>
                              )}
                              {inv.balanceDue > 0 && inv.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleOpenPaymentModal(inv)}
                                  className="px-3 py-1.5 rounded-xl bg-[#E1F3EB] hover:bg-[#D4EFE3] text-[#2E7D5D] border border-[#CEEBDD] text-[11px] font-semibold transition-colors"
                                >
                                  Record Payment
                                </button>
                              )}
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
        </>
      ) : (
        /* Payments & Cash Receipts Ledger */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_4px_20px_rgba(41,42,58,0.02)]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9299A8]" />
              <input
                type="text"
                placeholder="Search payment UTR, customer, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#F0EDFA]/40 hover:bg-[#F0EDFA]/60 focus:bg-white border border-[#E3E8EE] text-[#252735] placeholder-[#9299A8] transition-all outline-hidden"
              />
            </div>
            <div className="text-xs text-[#697386]">
              Total Collections Settled:{' '}
              <span className="font-mono font-bold text-[#2E7D5D]">
                ₹{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3E8EE] shadow-[0_10px_30px_rgba(41,42,58,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0EDFA]/40 font-bold text-[#697386] uppercase tracking-wider text-[11px] border-b border-[#E3E8EE]">
                    <th className="py-3.5 px-5">Payment Date</th>
                    <th className="py-3.5 px-5">Invoice #</th>
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Method / Channel</th>
                    <th className="py-3.5 px-5">Transaction UTR / Ref</th>
                    <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                    <th className="py-3.5 px-5">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EE]/70">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#9299A8]">
                        No payment receipts logged matching search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pmt) => (
                      <tr
                        key={pmt.id}
                        className="hover:bg-[#F0EDFA]/30 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-mono text-[#697386]">
                          {pmt.paymentDate}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-[#6254E8] font-mono">
                          {pmt.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#252735]">
                          {pmt.customerName}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]">
                            {pmt.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[#697386]">
                          {pmt.transactionRef}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-[#2E7D5D] font-mono tabular-nums">
                          +₹{pmt.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-5 text-[#697386] text-[11px]">{pmt.recordedBy}</td>
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
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#252735]">
                  Record Incoming Settlement
                </h3>
                <div className="text-xs text-[#6254E8] font-mono">
                  {selectedInvoiceForPayment.invoiceNumber} · {selectedInvoiceForPayment.customerName}
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Settlement Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-bold font-mono text-sm outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Payment Gateway / Channel
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
                  <option value="NET_BANKING">NetBanking (IMPS/NEFT)</option>
                  <option value="CREDIT_CARD">Credit / Corporate Card</option>
                  <option value="NEFT_RTGS">Bank Wire Transfer (NEFT/RTGS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Transaction UTR / Bank Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared via HDFC Bank Wire"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-[#252735] rounded-3xl max-w-3xl w-full p-8 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-6 max-h-[90vh] overflow-y-auto border border-[#E3E8EE]">
            
            {/* Top Toolbar (No-Print) */}
            <div className="no-print flex items-center justify-between border-b border-[#E3E8EE] pb-4">
              <span className="text-xs font-bold text-[#697386] uppercase tracking-wider">
                Official GST Tax Invoice Preview
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6254E8] text-white text-xs font-semibold shadow-xs hover:bg-[#5245D0]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-1.5 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tax Invoice Document Content */}
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b-2 border-[#252735] pb-4">
                <div>
                  <h1 className="text-2xl font-bold font-display text-[#252735] tracking-tight">
                    TAX INVOICE
                  </h1>
                  <p className="text-xs text-[#697386]">Issued under Rule 46 of CGST Rules, 2017</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-[#6254E8]">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </div>
                  <div className="text-xs text-[#697386]">Sub Ref: {selectedInvoiceForPrint.subscriptionNumber}</div>
                </div>
              </div>

              {/* Biller & Customer Details */}
              <div className="grid grid-cols-2 gap-6 border-b border-[#E3E8EE] pb-4">
                <div>
                  <div className="font-bold text-[#9299A8] uppercase tracking-wider mb-1 text-[10px]">
                    Issued By (Supplier):
                  </div>
                  <div className="font-bold text-[#252735]">Brightloop Software Pvt Ltd</div>
                  <div className="text-[#697386]">Embassy TechVillage, Outer Ring Road</div>
                  <div className="text-[#697386]">Bengaluru, Karnataka - 560103</div>
                  <div className="font-mono text-[#6254E8] font-semibold mt-1">
                    GSTIN: 29AAACB9999A1Z1
                  </div>
                  <div className="font-mono text-[#697386]">PAN: AAACB9999A</div>
                </div>

                <div>
                  <div className="font-bold text-[#9299A8] uppercase tracking-wider mb-1 text-[10px]">
                    Billed To (Customer):
                  </div>
                  <div className="font-bold text-[#252735]">{selectedInvoiceForPrint.customerName}</div>
                  <div className="text-[#697386]">
                    {selectedInvoiceForPrint.billingAddress || 'Electronics City Phase I, Bengaluru'}
                  </div>
                  <div className="font-mono text-[#6254E8] font-semibold mt-1">
                    GSTIN: {selectedInvoiceForPrint.customerGstin || 'Unregistered'}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div>
                      Invoice Date: <span className="font-mono font-bold">{selectedInvoiceForPrint.issueDate}</span>
                    </div>
                    <div>
                      Due Date: <span className="font-mono font-bold text-[#D34545]">{selectedInvoiceForPrint.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-xs border border-[#E3E8EE] rounded-xl overflow-hidden">
                  <thead className="bg-[#F0EDFA]/40 font-bold text-[#697386] border-b border-[#E3E8EE]">
                    <tr>
                      <th className="p-2.5 border-r border-[#E3E8EE]">Description / HSN</th>
                      <th className="p-2.5 border-r border-[#E3E8EE] text-center">Qty</th>
                      <th className="p-2.5 border-r border-[#E3E8EE] text-right">Rate (₹)</th>
                      <th className="p-2.5 border-r border-[#E3E8EE] text-right">Taxable (₹)</th>
                      {selectedInvoiceForPrint.isInterState ? (
                        <th className="p-2.5 border-r border-[#E3E8EE] text-right">IGST (18%)</th>
                      ) : (
                        <>
                          <th className="p-2.5 border-r border-[#E3E8EE] text-right">CGST (9%)</th>
                          <th className="p-2.5 border-r border-[#E3E8EE] text-right">SGST (9%)</th>
                        </>
                      )}
                      <th className="p-2.5 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8EE]">
                    {selectedInvoiceForPrint.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="p-2.5 border-r border-[#E3E8EE] font-medium">
                          {line.productName}
                          <div className="text-[10px] text-[#9299A8] font-mono">SAC: 998313</div>
                        </td>
                        <td className="p-2.5 border-r border-[#E3E8EE] text-center font-mono">{line.quantity}</td>
                        <td className="p-2.5 border-r border-[#E3E8EE] text-right font-mono">
                          ₹{line.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 border-r border-[#E3E8EE] text-right font-mono">
                          ₹{line.totalAmount.toLocaleString('en-IN')}
                        </td>
                        {selectedInvoiceForPrint.isInterState ? (
                          <td className="p-2.5 border-r border-[#E3E8EE] text-right font-mono">
                            ₹{(line.igstAmount || line.cgstAmount + line.sgstAmount).toLocaleString('en-IN')}
                          </td>
                        ) : (
                          <>
                            <td className="p-2.5 border-r border-[#E3E8EE] text-right font-mono">
                              ₹{line.cgstAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 border-r border-[#E3E8EE] text-right font-mono">
                              ₹{line.sgstAmount.toLocaleString('en-IN')}
                            </td>
                          </>
                        )}
                        <td className="p-2.5 text-right font-bold font-mono">
                          ₹{(line.totalAmount + line.cgstAmount + line.sgstAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-between items-start pt-2">
                <div className="max-w-xs space-y-1">
                  <div className="font-bold text-[#252735]">Payment Instructions:</div>
                  <div className="text-[#697386] text-[11px] leading-relaxed">
                    Beneficiary: Brightloop Software Pvt Ltd<br />
                    Bank: HDFC Bank Ltd (Indiranagar, Bengaluru)<br />
                    A/C No: 50200012345678<br />
                    IFSC: HDFC0001234
                  </div>
                </div>

                <div className="w-64 space-y-1 text-right font-mono">
                  <div className="flex justify-between text-[#697386]">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoiceForPrint.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoiceForPrint.discountTotal > 0 && (
                    <div className="flex justify-between text-[#2E7D5D]">
                      <span>Discount:</span>
                      <span>-₹{selectedInvoiceForPrint.discountTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedInvoiceForPrint.isInterState ? (
                    <div className="flex justify-between text-[#697386]">
                      <span>IGST (18% - Inter-State):</span>
                      <span>₹{(selectedInvoiceForPrint.igstTotal || selectedInvoiceForPrint.taxTotal).toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-[#697386]">
                        <span>CGST (9%):</span>
                        <span>₹{selectedInvoiceForPrint.cgstTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[#697386]">
                        <span>SGST (9%):</span>
                        <span>₹{selectedInvoiceForPrint.sgstTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-base font-bold text-[#252735] border-t-2 border-[#252735] pt-1">
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoiceForPrint.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-8 border-t border-[#E3E8EE] text-[11px] text-[#9299A8]">
                <div>Computer generated invoice · No physical signature required.</div>
                <div className="text-center font-bold text-[#252735]">
                  For Brightloop Software Pvt Ltd<br />
                  <span className="text-[10px] text-[#9299A8] font-normal">Authorized Signatory</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
