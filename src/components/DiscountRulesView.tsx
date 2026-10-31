import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiscountRule } from '../types';
import { Percent, Plus, Tag, Calendar, CheckCircle2, XCircle, X, Sparkles } from 'lucide-react';

export const DiscountRulesView: React.FC = () => {
  const { discounts, addDiscountRule, toggleDiscountRule, canManageDiscounts } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'FIXED' | 'PERCENTAGE'>('PERCENTAGE');
  const [value, setValue] = useState(10);
  const [minSpend, setMinSpend] = useState(50000);
  const [maxUsageLimit, setMaxUsageLimit] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageDiscounts) return;
    if (!code || !title) return;

    addDiscountRule({
      code: code.toUpperCase(),
      title,
      type,
      value,
      minSpend,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      maxUsageLimit,
      isActive: true
    });

    setCode('');
    setTitle('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Discount Rules
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Configure automated promotional rules (percentage or flat credits) with minimum threshold limits.
          </p>
        </div>

        {canManageDiscounts ? (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] active:scale-[0.98] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(98,84,232,0.25)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discount Rule</span>
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-[#FFF1E8] border border-[#FFE1D1] text-xs font-semibold text-[#B86221]">
            Read-Only (Admin Restricted)
          </span>
        )}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((rule) => {
          const usagePercent = Math.min(100, Math.round((rule.usedCount / rule.maxUsageLimit) * 100));

          return (
            <div
              key={rule.id}
              className="bg-white rounded-3xl border border-[#E3E8EE] p-5 shadow-[0_6px_20px_rgba(41,42,58,0.03)] hover:shadow-md transition-all space-y-3.5 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]">
                  {rule.code}
                </span>
                <button
                  onClick={() => toggleDiscountRule(rule.id)}
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    rule.isActive
                      ? 'bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]'
                      : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                  }`}
                >
                  {rule.isActive ? 'Active Rule' : 'Disabled'}
                </button>
              </div>

              <h3 className="text-base font-bold text-[#252735]">{rule.title}</h3>

              <div className="text-sm font-extrabold text-[#2E7D5D] font-mono">
                {rule.type === 'PERCENTAGE' ? `${rule.value}% Off Subscription` : `Flat ₹${rule.value.toLocaleString('en-IN')} Off`}
              </div>

              {/* Threshold & Usage Details */}
              <div className="pt-2 border-t border-[#E3E8EE]/70 space-y-2 text-xs text-[#697386]">
                <div className="flex justify-between">
                  <span>Min Spend Threshold:</span>
                  <span className="font-semibold text-[#252735] font-mono">
                    ₹{rule.minSpend?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Usage Consumption:</span>
                    <span className="font-semibold text-[#6254E8] font-mono">
                      {rule.usedCount} / {rule.maxUsageLimit} ({usagePercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F0F4F8] overflow-hidden">
                    <div
                      className="h-full bg-[#6254E8] rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Discount Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <h3 className="text-base font-bold text-[#252735]">
                Create Discount Rule
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Promotional Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono uppercase font-bold outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Rule Description Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Seasonal Special"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono font-bold outline-hidden focus:border-[#6254E8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Min Spend (₹)
                  </label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Max Usage Limit
                  </label>
                  <input
                    type="number"
                    value={maxUsageLimit}
                    onChange={(e) => setMaxUsageLimit(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
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
                  Save Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
