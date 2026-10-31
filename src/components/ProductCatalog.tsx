import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, BillingPlan, BillingFrequency } from '../types';
import {
  Package,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Lock,
  Tag,
  IndianRupee,
  X,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  Check,
  Cpu,
  Boxes,
  Wrench
} from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    billingPlans,
    addProduct,
    updateProduct,
    addBillingPlan,
    updateBillingPlan,
    canManageCatalog,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'plans'>('products');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'ALL' | 'SOFTWARE' | 'ADDON' | 'SERVICE'>('ALL');

  // Product Modals State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<'SOFTWARE' | 'ADDON' | 'SERVICE'>('SOFTWARE');
  const [salesPrice, setSalesPrice] = useState(12500);
  const [costPrice, setCostPrice] = useState(3200);
  const [notes, setNotes] = useState('');
  const [supportedFreqs, setSupportedFreqs] = useState<BillingFrequency[]>(['MONTHLY', 'YEARLY']);
  const [varName, setVarName] = useState('');
  const [varPrice, setVarPrice] = useState(560);

  // Plan Modals State
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);

  // Plan Form State
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [frequency, setFrequency] = useState<BillingFrequency>('MONTHLY');
  const [basePrice, setBasePrice] = useState(12500);
  const [minQty, setMinQty] = useState(1);
  const [allowedProds, setAllowedProds] = useState<string[]>([]);
  const [allowPause, setAllowPause] = useState(true);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);

  // Open Edit Product
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdType(p.type);
    setSalesPrice(p.salesPrice);
    setCostPrice(p.costPrice);
    setNotes(p.notes || '');
    setSupportedFreqs(p.supportedFrequencies || ['MONTHLY', 'YEARLY']);
    setVarName('');
    setVarPrice(560);
    setProductModalOpen(true);
  };

  // Open New Product
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdType('SOFTWARE');
    setSalesPrice(12500);
    setCostPrice(3200);
    setNotes('');
    setSupportedFreqs(['MONTHLY', 'YEARLY']);
    setVarName('');
    setVarPrice(560);
    setProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;

    const existingVars = editingProduct ? editingProduct.variants : [];
    const newVars = varName
      ? [
          ...existingVars,
          {
            id: `var_${Date.now()}`,
            name: varName,
            attributeName: 'Brand/Addon',
            priceAdjustment: varPrice
          }
        ]
      : existingVars;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: prodName,
        type: prodType,
        salesPrice,
        costPrice,
        notes,
        supportedFrequencies: supportedFreqs,
        variants: newVars
      });
    } else {
      addProduct({
        name: prodName,
        type: prodType,
        salesPrice,
        costPrice,
        notes,
        hsnSacCode: prodType === 'SOFTWARE' ? '998313' : prodType === 'ADDON' ? '998316' : '998315',
        supportedFrequencies: supportedFreqs,
        variants: newVars
      });
    }

    setProductModalOpen(false);
  };

  // Open Edit Plan
  const handleOpenEditPlan = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDesc(plan.description);
    setFrequency(plan.frequency);
    setBasePrice(plan.basePrice);
    setMinQty(plan.minQuantity);
    setAllowedProds(plan.allowedProductIds || products.map((p) => p.id));
    setAllowPause(plan.closureRules.allowPause);
    setAllowEarlyClose(plan.closureRules.allowEarlyClose);
    setPlanModalOpen(true);
  };

  // Open New Plan
  const handleOpenNewPlan = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanDesc('');
    setFrequency('MONTHLY');
    setBasePrice(12500);
    setMinQty(1);
    setAllowedProds(products.map((p) => p.id));
    setAllowPause(true);
    setAllowEarlyClose(true);
    setPlanModalOpen(true);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    if (editingPlan) {
      updateBillingPlan({
        ...editingPlan,
        name: planName,
        description: planDesc,
        frequency,
        basePrice,
        minQuantity: minQty,
        allowedProductIds: allowedProds,
        closureRules: {
          ...editingPlan.closureRules,
          allowPause,
          allowEarlyClose
        }
      });
    } else {
      addBillingPlan({
        name: planName,
        description: planDesc,
        frequency,
        basePrice,
        minQuantity: minQty,
        startDate: new Date().toISOString().split('T')[0],
        allowedProductIds: allowedProds,
        closureRules: {
          autoCloseOnEnd: false,
          allowEarlyClose,
          allowPause,
          allowRenew: true
        }
      });
    }

    setPlanModalOpen(false);
  };

  const toggleFreq = (freq: BillingFrequency) => {
    setSupportedFreqs((prev) =>
      prev.includes(freq) ? prev.filter((f) => f !== freq) : [...prev, freq]
    );
  };

  const toggleAllowedProd = (pId: string) => {
    setAllowedProds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter === 'ALL') return true;
    return p.type === productCategoryFilter;
  });

  const softwareProducts = products.filter((p) => p.type === 'SOFTWARE');
  const addonProducts = products.filter((p) => p.type === 'ADDON');
  const serviceProducts = products.filter((p) => p.type === 'SERVICE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Master Catalog & Billing Cadence Rules</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Separates <strong>Software Applications</strong>, <strong>Add-on Modules</strong>, and <strong>Professional SLA Services</strong> from <strong>Billing Cadence Plans</strong>.
          </p>
        </div>

        {/* Tab Switcher & Mode Indicator */}
        <div className="flex items-center gap-3">
          {!canManageCatalog && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Read-Only Mode ({currentUser.role})</span>
            </span>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'products'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1. Offerings Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'plans'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2. Billing Plans ({billingPlans.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          {/* Category Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setProductCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  productCategoryFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Offerings ({products.length})
              </button>

              <button
                onClick={() => setProductCategoryFilter('SOFTWARE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  productCategoryFilter === 'SOFTWARE'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Software Apps ({softwareProducts.length})</span>
              </button>

              <button
                onClick={() => setProductCategoryFilter('ADDON')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  productCategoryFilter === 'ADDON'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-sky-400" />
                <span>Add-on Modules ({addonProducts.length})</span>
              </button>

              <button
                onClick={() => setProductCategoryFilter('SERVICE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  productCategoryFilter === 'SERVICE'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Services & SLAs ({serviceProducts.length})</span>
              </button>
            </div>

            {canManageCatalog && (
              <button
                onClick={handleOpenNewProduct}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Offering</span>
              </button>
            )}
          </div>

          {/* Categorized Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const margin = p.salesPrice - p.costPrice;
              const marginPercent = p.salesPrice > 0 ? ((margin / p.salesPrice) * 100).toFixed(1) : '0';

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          p.type === 'SOFTWARE'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            : p.type === 'ADDON'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {p.type === 'SOFTWARE' ? 'SOFTWARE APP' : p.type === 'ADDON' ? 'ADD-ON MODULE' : 'PROFESSIONAL SERVICE'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {p.name}
                      </h3>
                    </div>

                    {canManageCatalog && (
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {p.notes || 'Product offering description.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Allowed License Durations:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(p.supportedFrequencies || ['MONTHLY', 'YEARLY']).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Base Rate:</div>
                      <div className="font-bold text-slate-900 dark:text-emerald-400 font-mono text-sm">
                        ₹{p.salesPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Margin:</div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        ₹{margin.toLocaleString('en-IN')} ({marginPercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Variants list */}
                  {p.variants.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Attribute Variants ({p.variants.length})
                      </div>
                      <div className="space-y-1">
                        {p.variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700/60"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-300">{v.name}</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                              +₹{v.priceAdjustment}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Billing Duration Schedules & Allowed Offerings
            </span>
            {canManageCatalog ? (
              <button
                onClick={handleOpenNewPlan}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Billing Plan</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Read-only view for non-admins</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billingPlans.map((plan) => {
              const allowedProductNames = (plan.allowedProductIds || [])
                .map((id) => products.find((p) => p.id === id)?.name)
                .filter(Boolean);

              return (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                      DURATION: {plan.frequency}
                    </span>

                    {canManageCatalog && (
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Edit Billing Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Compatible Offerings:
                    </div>
                    {allowedProductNames.length === 0 ? (
                      <div className="text-slate-400 italic">All Software Products Allowed</div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {allowedProductNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Base Schedule Rate:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      ₹{plan.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && canManageCatalog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                {editingProduct ? 'Edit Catalog Item' : 'Add Catalog Item'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Offering Category Type
                </label>
                <select
                  value={prodType}
                  onChange={(e) => setProdType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="SOFTWARE">SOFTWARE APP (Core Licensed App)</option>
                  <option value="ADDON">ADD-ON MODULE (Feature Upgrade)</option>
                  <option value="SERVICE">PROFESSIONAL SERVICE (Deployment/SLA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Offering Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop AI Engine"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Base Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supported Billing Durations
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'] as BillingFrequency[]).map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => toggleFreq(f)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                        supportedFreqs.includes(f)
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{f}</span>
                      {supportedFreqs.includes(f) && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 text-white font-semibold"
                >
                  {editingProduct ? 'Update Offering' : 'Save Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
