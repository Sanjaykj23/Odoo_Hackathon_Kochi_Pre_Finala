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
  TrendingUp,
  Cpu,
  Boxes,
  Wrench,
  Check
} from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    billingPlans,
    addProduct,
    updateProduct,
    deleteProduct,
    addBillingPlan,
    updateBillingPlan,
    deleteBillingPlan,
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
  const [variantsList, setVariantsList] = useState<Array<{ id: string; name: string; attributeName: string; priceAdjustment: number }>>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarAttr, setNewVarAttr] = useState('Brand Integration');
  const [newVarPrice, setNewVarPrice] = useState(560);

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
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [allowRenew, setAllowRenew] = useState(true);

  // Open Edit Product
  const handleOpenEditProduct = (p: Product) => {
    if (!canManageCatalog) return;
    setEditingProduct(p);
    setProdName(p.name);
    setProdType(p.type);
    setSalesPrice(p.salesPrice);
    setCostPrice(p.costPrice);
    setNotes(p.notes || '');
    setSupportedFreqs(p.supportedFrequencies || ['MONTHLY', 'YEARLY']);
    setVariantsList(p.variants || []);
    setNewVarName('');
    setNewVarPrice(560);
    setProductModalOpen(true);
  };

  // Open New Product
  const handleOpenNewProduct = () => {
    if (!canManageCatalog) return;
    setEditingProduct(null);
    setProdName('');
    setProdType('SOFTWARE');
    setSalesPrice(12500);
    setCostPrice(3200);
    setNotes('');
    setSupportedFreqs(['MONTHLY', 'YEARLY']);
    setVariantsList([]);
    setNewVarName('');
    setNewVarPrice(560);
    setProductModalOpen(true);
  };

  const handleAddVariantItem = () => {
    if (!newVarName) return;
    const item = {
      id: `var_${Date.now()}`,
      name: newVarName.trim(),
      attributeName: newVarAttr.trim() || 'Custom Variant',
      priceAdjustment: Number(newVarPrice) || 0
    };
    setVariantsList((prev) => [...prev, item]);
    setNewVarName('');
  };

  const handleRemoveVariantItem = (varId: string) => {
    setVariantsList((prev) => prev.filter((v) => v.id !== varId));
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: prodName,
        type: prodType,
        salesPrice,
        costPrice,
        notes,
        supportedFrequencies: supportedFreqs,
        variants: variantsList
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
        variants: variantsList
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
    setMinQty(plan.minQuantity || 1);
    setAllowedProds(plan.allowedProductIds || products.map((p) => p.id));
    setAllowPause(plan.closureRules.allowPause ?? true);
    setAllowEarlyClose(plan.closureRules.allowEarlyClose ?? true);
    setAutoCloseOnEnd(plan.closureRules.autoCloseOnEnd ?? false);
    setAllowRenew(plan.closureRules.allowRenew ?? true);
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
    setAutoCloseOnEnd(false);
    setAllowRenew(true);
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
          autoCloseOnEnd,
          allowEarlyClose,
          allowPause,
          allowRenew
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
          autoCloseOnEnd,
          allowEarlyClose,
          allowPause,
          allowRenew
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

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter === 'ALL') return true;
    return p.type === productCategoryFilter;
  });

  const softwareProducts = products.filter((p) => p.type === 'SOFTWARE');
  const addonProducts = products.filter((p) => p.type === 'ADDON');
  const serviceProducts = products.filter((p) => p.type === 'SERVICE');

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
            Products & Plans
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Decoupled architecture: Configure catalog items separately from recurring cadence schedules.
          </p>
        </div>

        {/* Tab Switcher & Status */}
        <div className="flex items-center gap-3">
          {!canManageCatalog && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF1E8] border border-[#FFE1D1] text-[11px] font-semibold text-[#B86221]">
              <Lock className="w-3 h-3 text-[#F3C77B]" />
              <span>Read-Only ({currentUser.role})</span>
            </span>
          )}

          <div className="flex items-center gap-1 p-1 bg-[#F0EDFA]/60 border border-[#E3DCF7] rounded-2xl">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-[#6254E8] text-white shadow-2xs'
                  : 'text-[#697386] hover:text-[#252735]'
              }`}
            >
              Offerings ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'plans'
                  ? 'bg-[#6254E8] text-white shadow-2xs'
                  : 'text-[#697386] hover:text-[#252735]'
              }`}
            >
              Billing Plans ({billingPlans.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          
          {/* Category Filter Controls & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-3xl bg-white border border-[#E3E8EE] shadow-[0_4px_20px_rgba(41,42,58,0.02)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setProductCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  productCategoryFilter === 'ALL'
                    ? 'bg-[#6254E8] text-white shadow-2xs'
                    : 'bg-[#F0EDFA]/50 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
                }`}
              >
                All Offerings ({products.length})
              </button>

              <button
                onClick={() => setProductCategoryFilter('SOFTWARE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  productCategoryFilter === 'SOFTWARE'
                    ? 'bg-[#6254E8] text-white shadow-2xs'
                    : 'bg-[#F0EDFA]/50 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-[#7A8CE8]" />
                <span>Apps ({softwareProducts.length})</span>
              </button>

              <button
                onClick={() => setProductCategoryFilter('ADDON')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  productCategoryFilter === 'ADDON'
                    ? 'bg-[#6254E8] text-white shadow-2xs'
                    : 'bg-[#F0EDFA]/50 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-[#87BCEB]" />
                <span>Add-ons ({addonProducts.length})</span>
              </button>

              <button
                onClick={() => setProductCategoryFilter('SERVICE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  productCategoryFilter === 'SERVICE'
                    ? 'bg-[#6254E8] text-white shadow-2xs'
                    : 'bg-[#F0EDFA]/50 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-[#F3C77B]" />
                <span>Services ({serviceProducts.length})</span>
              </button>
            </div>

            {canManageCatalog && (
              <button
                onClick={handleOpenNewProduct}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(98,84,232,0.25)] shrink-0 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Offering</span>
              </button>
            )}
          </div>

          {/* Product Offerings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const margin = p.salesPrice - p.costPrice;
              const marginPercent = p.salesPrice > 0 ? ((margin / p.salesPrice) * 100).toFixed(1) : '0';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-[#E3E8EE] p-5 shadow-[0_6px_20px_rgba(41,42,58,0.03)] hover:shadow-md transition-all space-y-3.5 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                          p.type === 'SOFTWARE'
                            ? 'bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]'
                            : p.type === 'ADDON'
                            ? 'bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]'
                            : 'bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1]'
                        }`}
                      >
                        {p.type === 'SOFTWARE' ? 'SOFTWARE APP' : p.type === 'ADDON' ? 'ADD-ON MODULE' : 'SLA SERVICE'}
                      </span>
                      <h3 className="text-base font-bold text-[#252735] mt-1.5">
                        {p.name}
                      </h3>
                    </div>

                    {canManageCatalog && (
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 rounded-xl border border-[#DCE5ED] hover:bg-[#F0EDFA]/60 text-[#697386] hover:text-[#252735] transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[#697386] line-clamp-2 leading-relaxed">
                    {p.notes || 'Enterprise subscription catalog offering.'}
                  </p>

                  {/* License Durations */}
                  <div className="pt-2 border-t border-[#E3E8EE]/70 space-y-1">
                    <div className="text-[10px] font-bold text-[#9299A8] uppercase tracking-wider">
                      Allowed License Durations:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(p.supportedFrequencies || ['MONTHLY', 'YEARLY']).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md bg-[#E1F3EB] border border-[#CEEBDD] text-[#2E7D5D] font-mono font-bold text-[10px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="pt-2 border-t border-[#E3E8EE]/70 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-[#9299A8]">Selling Price:</div>
                      <div className="font-extrabold text-[#252735] font-mono text-base tabular-nums">
                        ₹{p.salesPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#9299A8]">Net Margin:</div>
                      <div className="font-bold text-[#2E7D5D] font-mono">
                        ₹{margin.toLocaleString('en-IN')} ({marginPercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Variants List */}
                  {p.variants.length > 0 && (
                    <div className="pt-2 border-t border-[#E3E8EE]/70">
                      <div className="text-[10px] font-bold text-[#9299A8] uppercase tracking-wider mb-1.5">
                        Attribute Variants ({p.variants.length})
                      </div>
                      <div className="space-y-1">
                        {p.variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between text-xs bg-[#EAF3F8]/50 px-2.5 py-1 rounded-xl border border-[#DCE5ED]"
                          >
                            <span className="font-medium text-[#252735]">{v.name}</span>
                            <span className="font-bold text-[#6254E8] font-mono">
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
        /* Billing Plans Tab */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#697386] uppercase tracking-wider">
              Billing Duration Schedules & Allowed Offerings
            </span>
            {canManageCatalog && (
              <button
                onClick={handleOpenNewPlan}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Billing Plan</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {billingPlans.map((plan) => {
              const allowedProductNames = (plan.allowedProductIds || [])
                .map((id) => products.find((p) => p.id === id)?.name)
                .filter(Boolean);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border border-[#E3E8EE] p-5 shadow-[0_6px_20px_rgba(41,42,58,0.03)] space-y-3.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD] font-mono">
                      CADENCE: {plan.frequency}
                    </span>

                    {canManageCatalog && (
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="p-1.5 rounded-xl border border-[#DCE5ED] hover:bg-[#F0EDFA]/60 text-[#697386] hover:text-[#252735] transition-colors"
                        title="Edit Billing Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#252735]">{plan.name}</h3>
                  <p className="text-xs text-[#697386] leading-relaxed">{plan.description}</p>

                  <div className="pt-2 border-t border-[#E3E8EE]/70 space-y-1">
                    <div className="text-[10px] font-bold text-[#9299A8] uppercase tracking-wider">
                      Compatible Offerings:
                    </div>
                    {allowedProductNames.length === 0 ? (
                      <div className="text-[#9299A8] text-xs italic">All Software Offerings Compatible</div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {allowedProductNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F0EDFA]/60 text-[#6254E8] border border-[#E3DCF7] text-[10px] font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E3E8EE]/70 flex items-center justify-between">
                    <span className="text-xs text-[#697386]">Base Cadence Rate:</span>
                    <span className="text-base font-extrabold text-[#252735] font-mono tabular-nums">
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
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <h3 className="text-base font-bold text-[#252735]">
                {editingProduct ? 'Edit Catalog Offering' : 'Add New Catalog Offering'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Offering Category
                </label>
                <select
                  value={prodType}
                  onChange={(e) => setProdType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-semibold outline-hidden focus:border-[#6254E8]"
                >
                  <option value="SOFTWARE">SOFTWARE APP (Core Licensed App)</option>
                  <option value="ADDON">ADD-ON MODULE (Feature Upgrade)</option>
                  <option value="SERVICE">PROFESSIONAL SERVICE (Deployment/SLA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Offering Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop AI Engine"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono font-bold outline-hidden focus:border-[#6254E8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252735] mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">
                  Supported Billing Durations
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'] as BillingFrequency[]).map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => toggleFreq(f)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        supportedFreqs.includes(f)
                          ? 'bg-[#E1F3EB] border-[#CEEBDD] text-[#2E7D5D]'
                          : 'border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/40'
                      }`}
                    >
                      <span>{f}</span>
                      {supportedFreqs.includes(f) && <Check className="w-3.5 h-3.5 text-[#55C9A2]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Attribute Variants Section (Scene 2) */}
              <div className="pt-2 border-t border-[#E3E8EE] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[#252735]">
                    Attribute Variants & Add-on Pricing (Scene 2)
                  </label>
                  <span className="text-[10px] text-[#6254E8] font-bold">
                    {variantsList.length} defined
                  </span>
                </div>

                {variantsList.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {variantsList.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#F0EDFA]/40 border border-[#E3DCF7] text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#252735]">{v.name}</div>
                          <div className="text-[10px] text-[#697386]">{v.attributeName}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#6254E8]">
                            +₹{v.priceAdjustment.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantItem(v.id)}
                            className="text-[#D34545] hover:bg-[#FFEBEB] p-1 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 rounded-2xl bg-[#EAF3F8]/50 border border-[#DCE5ED] space-y-2">
                  <div className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">
                    Add Product Variant (e.g. Odoo Integration):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Variant name"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="p-1.5 rounded-lg border border-[#E3E8EE] bg-white text-xs text-[#252735]"
                    />
                    <input
                      type="number"
                      placeholder="Add-on Price (+₹)"
                      value={newVarPrice}
                      onChange={(e) => setNewVarPrice(parseInt(e.target.value) || 0)}
                      className="p-1.5 rounded-lg border border-[#E3E8EE] bg-white text-xs font-mono text-[#252735]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantItem}
                    className="w-full py-1.5 rounded-lg bg-white hover:bg-[#F0EDFA] border border-[#7A8CE8]/40 text-[#6254E8] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variant (+₹{newVarPrice})</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold shadow-xs"
                >
                  {editingProduct ? 'Update Offering' : 'Save Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Plan Modal */}
      {planModalOpen && canManageCatalog && (
        <div className="fixed inset-0 z-50 bg-[#252735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E8EE] rounded-3xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(41,42,58,0.15)] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E3E8EE] pb-3">
              <h3 className="text-base font-bold text-[#252735]">
                {editingPlan ? 'Edit Billing Plan' : 'Create Billing Plan'}
              </h3>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="p-1 rounded-xl text-[#9299A8] hover:text-[#252735] hover:bg-[#F0EDFA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#252735] mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Standard"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">Cadence Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                >
                  <option value="DAILY">Daily Billing</option>
                  <option value="WEEKLY">Weekly Billing</option>
                  <option value="MONTHLY">Monthly Recurring</option>
                  <option value="YEARLY">Yearly Annual Contract</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] outline-hidden focus:border-[#6254E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252735] mb-1">Minimum License Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={minQty}
                  onChange={(e) => setMinQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-[#E3E8EE] bg-white text-[#252735] font-mono outline-hidden focus:border-[#6254E8]"
                />
              </div>

              {/* Plan Closure & Policy Rules */}
              <div className="pt-2 border-t border-[#E3E8EE] space-y-2">
                <label className="block font-semibold text-[#252735]">
                  Plan Closure & Policy Rules (Scene 2)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowPause}
                      onChange={(e) => setAllowPause(e.target.checked)}
                      className="rounded text-[#6254E8] focus:ring-[#6254E8]"
                    />
                    <span className="font-medium text-[#252735]">Allow Pause</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowEarlyClose}
                      onChange={(e) => setAllowEarlyClose(e.target.checked)}
                      className="rounded text-[#6254E8] focus:ring-[#6254E8]"
                    />
                    <span className="font-medium text-[#252735]">Allow Early Close</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCloseOnEnd}
                      onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                      className="rounded text-[#6254E8] focus:ring-[#6254E8]"
                    />
                    <span className="font-medium text-[#252735]">Auto-Close on End</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E3E8EE] bg-[#EAF3F8]/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowRenew}
                      onChange={(e) => setAllowRenew(e.target.checked)}
                      className="rounded text-[#6254E8] focus:ring-[#6254E8]"
                    />
                    <span className="font-medium text-[#252735]">Allow Renew</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3E8EE] text-[#697386] hover:bg-[#F0EDFA]/50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6254E8] hover:bg-[#5245D0] text-white font-semibold shadow-xs"
                >
                  {editingPlan ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
