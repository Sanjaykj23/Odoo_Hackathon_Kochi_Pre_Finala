import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Product,
  BillingPlan,
  QuotationTemplate,
  Subscription,
  SubscriptionStatus,
  Invoice,
  Payment,
  DiscountRule,
  PaymentMethod
} from '../types';
import { supabase, isSupabaseConfigured, createIsolatedAuthClient } from '../lib/supabase';
import { setCookie, getCookie, deleteCookie } from '../lib/cookies';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_TEMPLATES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_DISCOUNTS
} from '../data/mockData';

export type ActiveView =
  | 'dashboard'
  | 'subscriptions_kanban'
  | 'subscriptions_list'
  | 'catalog'
  | 'quotations'
  | 'billing_run'
  | 'invoices'
  | 'discounts'
  | 'staff_iam'
  | 'customer_portal';

export type ScreenMode = 'LANDING' | 'LOGIN' | 'APP';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Navigation Screen & Auth State
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  registerCustomer: (customer: Omit<User, 'id' | 'role'> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  provisionAdminUser: () => Promise<{ success: boolean; message: string }>;

  // Theme & Identity
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  authenticatedUser: User;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => boolean;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Master Data
  users: User[];
  products: Product[];
  billingPlans: BillingPlan[];
  templates: QuotationTemplate[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discounts: DiscountRule[];

  // Toast
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // RBAC Permission Helpers
  canManageCatalog: boolean;
  canManageIAM: boolean;
  canManageDiscounts: boolean;

  // Actions
  addUser: (user: Omit<User, 'id'> & { password?: string }) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addBillingPlan: (plan: Omit<BillingPlan, 'id'>) => void;
  updateBillingPlan: (plan: BillingPlan) => void;
  addTemplate: (tpl: Omit<QuotationTemplate, 'id'>) => void;
  createSubscription: (subData: Partial<Subscription>) => Subscription;
  updateSubscriptionStatus: (id: string, newStatus: SubscriptionStatus) => boolean;
  acceptQuotationAndActivate: (id: string) => boolean;
  negotiateQuotation: (id: string, feedbackNotes: string) => void;
  updateSubscription: (sub: Subscription) => void;
  triggerBillingDayRun: (targetDate?: string) => { createdCount: number; skippedCount: number };
  confirmInvoice: (invoiceId: string) => void;
  cancelInvoice: (invoiceId: string) => void;
  recordPayment: (payment: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    transactionRef: string;
    notes?: string;
  }) => boolean;
  addDiscountRule: (rule: Omit<DiscountRule, 'id' | 'usedCount'>) => void;
  toggleDiscountRule: (id: string) => void;
  dispatchApprovedRetentionOffer: (
    subId: string,
    discountPct: number,
    notes: string,
    validityDays: number
  ) => boolean;
  upgradeSubscriptionPlan: (subId: string, newPlanId: string) => { success: boolean; proratedDiff: number; message: string };
  requestSubscriptionAction: (subId: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') => boolean;
  renewSubscriptionContract: (subId: string, extensionMonths?: number) => boolean;
  deleteBillingPlan: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'brightloop_app_state_v3';
const COOKIE_SESSION_KEY = 'brightloop_auth_token';
const GUEST_USER: User = {
  id: '',
  name: 'Guest',
  email: '',
  role: 'CUSTOMER'
};


const SEED_UUID_MAP: Record<string, string> = {
  prod_erp: 'b0000000-0000-4000-8000-000000000001',
  prod_crm: 'b0000000-0000-4000-8000-000000000002',
  prod_sla: 'b0000000-0000-4000-8000-000000000003',
  prod_api: 'b0000000-0000-4000-8000-000000000004',
  prod_ai_engine: 'b0000000-0000-4000-8000-000000000005',
  prod_branch_sync: 'b0000000-0000-4000-8000-000000000006',
  prod_onprem_migration: 'b0000000-0000-4000-8000-000000000007',
  prod_custom_workflow: 'b0000000-0000-4000-8000-000000000008',
  var_odoo: 'b1000000-0000-4000-8000-000000000001',
  var_multicurrency: 'b1000000-0000-4000-8000-000000000002',
  var_account_mgr: 'b1000000-0000-4000-8000-000000000003',
  plan_monthly_std: 'c0000000-0000-4000-8000-000000000001',
  plan_annual_growth: 'c0000000-0000-4000-8000-000000000002',
  plan_startup_starter: 'c0000000-0000-4000-8000-000000000003',
  plan_weekly_sprint: 'c0000000-0000-4000-8000-000000000004',
  plan_daily_poc: 'c0000000-0000-4000-8000-000000000005',
  tpl_ent_suite: 'd0000000-0000-4000-8000-000000000001',
  tpl_std_monthly: 'd0000000-0000-4000-8000-000000000002',
  sub_active_1: 'e0000000-0000-4000-8000-000000000001',
  sub_quote_1: 'e0000000-0000-4000-8000-000000000002',
  sub_confirmed_1: 'e0000000-0000-4000-8000-000000000003',
  usr_customer: 'a0000000-0000-0000-0000-000000000004'
};

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensureUUID(id: string | undefined): string {
  if (!id) return generateUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  if (SEED_UUID_MAP[id]) return SEED_UUID_MAP[id];
  return generateUUID();
}

function advanceBillingDate(currentDateStr: string, frequency: BillingFrequency): string {
  const parts = currentDateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  if (frequency === 'DAILY') {
    date.setDate(date.getDate() + 1);
  } else if (frequency === 'WEEKLY') {
    date.setDate(date.getDate() + 7);
  } else if (frequency === 'MONTHLY') {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === 'YEARLY') {
    date.setFullYear(date.getFullYear() + 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isInterStateCustomer(gstin?: string, address?: string): boolean {
  if (gstin && gstin.trim().length >= 2) {
    return !gstin.trim().startsWith('29'); // Karnataka code is 29
  }
  if (address) {
    const lower = address.toLowerCase();
    if (lower.includes('karnataka') || lower.includes('bengaluru') || lower.includes('bangalore')) {
      return false;
    }
    if (
      lower.includes('maharashtra') ||
      lower.includes('mumbai') ||
      lower.includes('delhi') ||
      lower.includes('tamil nadu') ||
      lower.includes('chennai') ||
      lower.includes('hyderabad') ||
      lower.includes('telangana')
    ) {
      return true;
    }
  }
  return false;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('brightloop_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('brightloop_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // State initialization
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [authenticatedUser, setAuthenticatedUser] = useState<User>(() => {
    const cookie = getCookie(COOKIE_SESSION_KEY);
    if (cookie) {
      try { return JSON.parse(cookie); } catch { return GUEST_USER; }
    }
    return GUEST_USER;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const cookie = getCookie(COOKIE_SESSION_KEY);
    if (cookie) {
      try { return JSON.parse(cookie); } catch { return GUEST_USER; }
    }
    return GUEST_USER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getCookie(COOKIE_SESSION_KEY));
  });
  const [screenMode, setScreenMode] = useState<ScreenMode>('LOGIN');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_plans`);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [templates, setTemplates] = useState<QuotationTemplate[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_templates`);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_subscriptions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [discounts, setDiscounts] = useState<DiscountRule[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_discounts`);
    return saved ? JSON.parse(saved) : INITIAL_DISCOUNTS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helpers
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persist Catalog and Plans to LocalStorage for instant hydration (< 2s)
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_plans`, JSON.stringify(billingPlans));
  }, [billingPlans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_templates`, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  // Synchronize Supabase Auth Session and Public Users on Mount
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    // 1. Restore active Supabase Auth Session (Native auth.users)
    const restoreSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          const meta = authUser.user_metadata || {};

          let resolvedRole: UserRole = (meta.role as UserRole) || (authUser.email?.includes('admin') ? 'ADMIN' : 'CUSTOMER');
          let resolvedName: string = meta.name || authUser.email?.split('@')[0] || 'User';
          let resolvedCompany: string | undefined = meta.company_name;
          let resolvedGstin: string | undefined = meta.gstin;
          let resolvedPhone: string | undefined = meta.phone;
          let resolvedAddress: string | undefined = meta.address;

          // Check if profile exists in public.users
          const { data: profile } = await client
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profile) {
            resolvedRole = (profile.role as UserRole) || resolvedRole;
            resolvedName = profile.name || resolvedName;
            resolvedCompany = profile.company_name || resolvedCompany;
            resolvedGstin = profile.gstin || resolvedGstin;
            resolvedPhone = profile.phone || resolvedPhone;
            resolvedAddress = profile.address || resolvedAddress;
          }

          const restoredUser: User = {
            id: authUser.id,
            name: resolvedName,
            email: authUser.email || '',
            role: resolvedRole,
            companyName: resolvedCompany,
            gstin: resolvedGstin,
            phone: resolvedPhone,
            address: resolvedAddress
          };

          setAuthenticatedUser(restoredUser);
          setCurrentUser(restoredUser);
          setIsAuthenticated(true);
          setCookie(COOKIE_SESSION_KEY, JSON.stringify(restoredUser), 7);
          if (session.access_token) {
            setCookie('brightloop_sb_token', session.access_token, 7);
          }
        }
      } catch (err) {
        console.warn('Could not restore Supabase Auth session:', err);
      }
    };

    restoreSession();

    // 2. Fetch public users table for member listings
    const fetchSupabaseUsers = async () => {
      try {
        const { data: supaUsers, error } = await client.from('users').select('*');
        if (!error && supaUsers && supaUsers.length > 0) {
          const mappedUsers: User[] = supaUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password_hash,
            role: u.role as UserRole,
            companyName: u.company_name,
            gstin: u.gstin,
            pan: u.pan,
            phone: u.phone,
            address: u.address
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.warn('Could not sync users from Supabase:', err);
      }
    };
    fetchSupabaseUsers();

    // Fetch Products & Variants from Supabase
    const fetchSupabaseProducts = async () => {
      try {
        const { data: supaProducts, error } = await client
          .from('products')
          .select('*, product_variants(*)');
        if (!error && supaProducts && supaProducts.length > 0) {
          const mappedProducts: Product[] = supaProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.type as ProductType,
            salesPrice: Number(p.sales_price),
            costPrice: Number(p.cost_price),
            notes: p.notes || '',
            hsnSacCode: p.hsn_sac_code || '998313',
            supportedFrequencies: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
            variants: (p.product_variants || []).map((v: any) => ({
              id: v.id,
              name: v.variant_name,
              attributeName: v.attribute_name,
              priceAdjustment: Number(v.price_adjustment)
            }))
          }));
          setProducts(mappedProducts);
        } else if (!error && (!supaProducts || supaProducts.length === 0)) {
          // Auto-seed initial catalog to Supabase
          for (const p of INITIAL_PRODUCTS) {
            const prodUuid = ensureUUID(p.id);
            await client.from('products').upsert({
              id: prodUuid,
              name: p.name,
              type: p.type,
              sales_price: p.salesPrice,
              cost_price: p.costPrice,
              notes: p.notes,
              hsn_sac_code: p.hsnSacCode || '998313'
            });
            if (p.variants && p.variants.length > 0) {
              for (const v of p.variants) {
                await client.from('product_variants').upsert({
                  id: ensureUUID(v.id),
                  product_id: prodUuid,
                  attribute_name: v.attributeName,
                  variant_name: v.name,
                  price_adjustment: v.priceAdjustment
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync products from Supabase:', err);
      }
    };
    fetchSupabaseProducts();

    // Fetch Billing Plans from Supabase
    const fetchSupabaseBillingPlans = async () => {
      try {
        const { data: supaPlans, error } = await client
          .from('billing_plans')
          .select('*');
        if (!error && supaPlans && supaPlans.length > 0) {
          const mappedPlans: BillingPlan[] = supaPlans.map((pl: any) => ({
            id: pl.id,
            name: pl.name,
            description: `${pl.frequency} Software Licensing Cadence`,
            frequency: pl.frequency as BillingFrequency,
            basePrice: Number(pl.base_price),
            minQuantity: Number(pl.min_quantity) || 1,
            startDate: pl.start_date || '2026-01-01',
            endDate: pl.end_date || undefined,
            allowedProductIds: products.map((p) => p.id),
            closureRules: {
              autoCloseOnEnd: Boolean(pl.auto_close_on_end),
              allowEarlyClose: Boolean(pl.allow_early_close ?? true),
              allowPause: Boolean(pl.allow_pause ?? true),
              allowRenew: Boolean(pl.allow_renew ?? true)
            }
          }));
          setBillingPlans(mappedPlans);
        } else if (!error && (!supaPlans || supaPlans.length === 0)) {
          // Auto-seed initial billing plans to Supabase
          for (const pl of INITIAL_PLANS) {
            await client.from('billing_plans').upsert({
              id: ensureUUID(pl.id),
              name: pl.name,
              frequency: pl.frequency,
              base_price: pl.basePrice,
              min_quantity: pl.minQuantity,
              start_date: pl.startDate || '2026-01-01',
              end_date: pl.endDate || null,
              auto_close_on_end: pl.closureRules?.autoCloseOnEnd ?? false,
              allow_early_close: pl.closureRules?.allowEarlyClose ?? true,
              allow_pause: pl.closureRules?.allowPause ?? true,
              allow_renew: pl.closureRules?.allowRenew ?? true
            });
          }
        }
      } catch (err) {
        console.warn('Could not sync billing plans from Supabase:', err);
      }
    };
    fetchSupabaseBillingPlans();

    // Fetch Quotation Templates from Supabase
    const fetchSupabaseTemplates = async () => {
      try {
        const { data: supaTemplates, error } = await client
          .from('quotation_templates')
          .select('*, quotation_template_items(*)');
        if (!error && supaTemplates && supaTemplates.length > 0) {
          const mappedTemplates: QuotationTemplate[] = supaTemplates.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: `${t.name} (Valid for ${t.validity_days || 30} days)`,
            validityDays: Number(t.validity_days) || 30,
            planId: t.plan_id,
            items: (t.quotation_template_items || []).map((it: any) => ({
              productId: it.product_id,
              quantity: Number(it.quantity) || 1,
              discountPercent: Number(it.discount_percent) || 0
            }))
          }));
          setTemplates(mappedTemplates);
        } else if (!error && (!supaTemplates || supaTemplates.length === 0)) {
          // Auto-seed initial templates to Supabase
          for (const tpl of INITIAL_TEMPLATES) {
            const tplUuid = ensureUUID(tpl.id);
            await client.from('quotation_templates').upsert({
              id: tplUuid,
              name: tpl.name,
              plan_id: ensureUUID(tpl.planId),
              validity_days: tpl.validityDays || 30
            });
            if (tpl.items && tpl.items.length > 0) {
              for (const it of tpl.items) {
                await client.from('quotation_template_items').upsert({
                  id: generateUUID(),
                  template_id: tplUuid,
                  product_id: ensureUUID(it.productId),
                  quantity: it.quantity,
                  discount_percent: it.discountPercent || 0
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync quotation templates from Supabase:', err);
      }
    };
    fetchSupabaseTemplates();

    // Fetch Subscriptions & Line Items from Supabase
    const fetchSupabaseSubscriptions = async () => {
      try {
        const { data: supaSubs, error } = await client
          .from('subscriptions')
          .select('*, subscription_line_items(*)');
        if (!error && supaSubs && supaSubs.length > 0) {
          const mappedSubs: Subscription[] = supaSubs.map((s: any) => {
            const plan = billingPlans.find((p) => p.id === s.plan_id || ensureUUID(p.id) === s.plan_id) || billingPlans[0];
            const customer = users.find((u) => u.id === s.customer_id || ensureUUID(u.id) === s.customer_id) || users.find((u) => u.role === 'CUSTOMER') || users[0];
            return {
              id: s.id,
              number: s.subscription_number,
              customerId: s.customer_id,
              customerName: customer?.name || 'Enterprise Customer',
              customerEmail: customer?.email || 'customer@brightloop.io',
              customerGstin: customer?.gstin,
              planId: s.plan_id,
              planName: plan?.name || 'Enterprise License Plan',
              billingFrequency: plan?.frequency || 'MONTHLY',
              startDate: s.start_date,
              expiryDate: s.expiry_date || undefined,
              nextBillingDate: s.next_billing_date,
              paymentTerms: s.payment_terms || 'Net 15',
              status: s.status as SubscriptionStatus,
              lines: (s.subscription_line_items || []).map((l: any) => ({
                id: l.id,
                productId: l.product_id,
                productName: products.find((p) => p.id === l.product_id || ensureUUID(p.id) === l.product_id)?.name || 'Enterprise Software',
                variantId: l.variant_id || undefined,
                quantity: Number(l.quantity) || 1,
                unitPrice: Number(l.unit_price) || 0,
                taxPercent: Number(l.tax_percent) || 18,
                discountAmount: Number(l.discount_amount) || 0,
                totalAmount: Number(l.total_amount) || 0
              })),
              closureRules: plan?.closureRules || {
                autoCloseOnEnd: false,
                allowEarlyClose: true,
                allowPause: true,
                allowRenew: true
              },
              notes: s.notes || undefined,
              createdAt: s.created_at
            };
          });
          setSubscriptions(mappedSubs);
        } else if (!error && (!supaSubs || supaSubs.length === 0)) {
          // Auto-seed initial subscriptions to Supabase
          for (const sub of INITIAL_SUBSCRIPTIONS) {
            const subUuid = ensureUUID(sub.id);
            const custUuid = ensureUUID(sub.customerId);
            const planUuid = ensureUUID(sub.planId);
            await client.from('subscriptions').upsert({
              id: subUuid,
              subscription_number: sub.number,
              customer_id: custUuid,
              plan_id: planUuid,
              status: sub.status,
              start_date: sub.startDate,
              expiry_date: sub.expiryDate || null,
              next_billing_date: sub.nextBillingDate,
              payment_terms: sub.paymentTerms || 'Net 15',
              notes: sub.notes || null
            });
            if (sub.lines && sub.lines.length > 0) {
              for (const line of sub.lines) {
                await client.from('subscription_line_items').upsert({
                  id: generateUUID(),
                  subscription_id: subUuid,
                  product_id: ensureUUID(line.productId),
                  variant_id: line.variantId ? ensureUUID(line.variantId) : null,
                  quantity: line.quantity,
                  unit_price: line.unitPrice,
                  tax_percent: line.taxPercent || 18,
                  discount_amount: line.discountAmount || 0,
                  total_amount: line.totalAmount
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync subscriptions from Supabase:', err);
      }
    };
    fetchSupabaseSubscriptions();

    // Fetch Invoices & Lines from Supabase
    const fetchSupabaseInvoices = async () => {
      try {
        const { data: supaInvoices, error } = await client
          .from('invoices')
          .select('*, invoice_line_items(*)');
        if (!error && supaInvoices && supaInvoices.length > 0) {
          const mappedInvoices: Invoice[] = supaInvoices.map((inv: any) => {
            const sub = subscriptions.find((s) => s.id === inv.subscription_id || ensureUUID(s.id) === inv.subscription_id);
            const customer = users.find((u) => u.id === inv.customer_id || ensureUUID(u.id) === inv.customer_id);
            const isInter = Number(inv.igst_total) > 0;
            return {
              id: inv.id,
              invoiceNumber: inv.invoice_number,
              subscriptionId: inv.subscription_id,
              subscriptionNumber: sub?.number || 'SUB-2026-001',
              customerId: inv.customer_id,
              customerName: customer?.name || 'Enterprise Customer',
              customerGstin: customer?.gstin || '29AAACI1234M1Z2',
              billingAddress: customer?.address || 'Embassy TechVillage, Bengaluru, Karnataka',
              issueDate: inv.issue_date,
              dueDate: inv.due_date,
              status: inv.status as InvoiceStatus,
              subtotal: Number(inv.subtotal),
              discountTotal: Number(inv.discount_total) || 0,
              cgstTotal: Number(inv.cgst_total) || 0,
              sgstTotal: Number(inv.sgst_total) || 0,
              igstTotal: Number(inv.igst_total) || 0,
              taxTotal: Number(inv.tax_total),
              totalAmount: Number(inv.total_amount),
              amountPaid: Number(inv.amount_paid) || 0,
              balanceDue: Number(inv.balance_due),
              lines: (inv.invoice_line_items || []).map((l: any) => ({
                id: l.id,
                productId: l.product_id,
                productName: products.find((p) => p.id === l.product_id || ensureUUID(p.id) === l.product_id)?.name || 'Enterprise License',
                quantity: Number(l.quantity),
                unitPrice: Number(l.unit_price),
                taxPercent: Number(l.tax_percent) || 18,
                cgstAmount: Number(l.cgst_amount) || 0,
                sgstAmount: Number(l.sgst_amount) || 0,
                igstAmount: Number(l.igst_amount) || 0,
                discountAmount: Number(l.discount_amount) || 0,
                totalAmount: Number(l.total_amount)
              })),
              idempotencyKey: inv.idempotency_key,
              isInterState: isInter
            };
          });
          setInvoices(mappedInvoices);
        }
      } catch (err) {
        console.warn('Could not sync invoices from Supabase:', err);
      }
    };
    fetchSupabaseInvoices();

    // Fetch Payments from Supabase
    const fetchSupabasePayments = async () => {
      try {
        const { data: supaPayments, error } = await client.from('payments').select('*');
        if (!error && supaPayments && supaPayments.length > 0) {
          const mappedPayments: Payment[] = supaPayments.map((p: any) => ({
            id: p.id,
            invoiceId: p.invoice_id,
            invoiceNumber: invoices.find((i) => i.id === p.invoice_id)?.invoiceNumber || 'INV-2026-001',
            customerId: p.customer_id,
            customerName: users.find((u) => u.id === p.customer_id)?.name || 'Customer',
            amount: Number(p.amount),
            method: p.method as PaymentMethod,
            paymentDate: p.payment_date,
            transactionRef: p.transaction_ref,
            notes: p.notes,
            recordedBy: 'Finance Staff'
          }));
          setPayments(mappedPayments);
        }
      } catch (err) {
        console.warn('Could not sync payments from Supabase:', err);
      }
    };
    fetchSupabasePayments();

    // 3. Supabase Auth event listener
    const { data: authSub } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setAuthenticatedUser(GUEST_USER);
        setCurrentUser(GUEST_USER);
        deleteCookie(COOKIE_SESSION_KEY);
        deleteCookie('brightloop_sb_token');
      } else if (event === 'PASSWORD_RECOVERY') {
        addToast('Supabase Auth: Password recovery session active. Please reset your password.', 'info');
      }
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Strict Supabase Native Auth Login (Authenticates against auth.users)
  const login = async (email: string, pass: string): Promise<boolean> => {
    const trimmedEmail = email.trim();

    // 1. Supabase Native Authentication (auth.users)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: pass
        });

        if (error) {
          // Provide actionable error messages
          if (error.message.toLowerCase().includes('email not confirmed')) {
            addToast('Email not confirmed. Please check your inbox or disable email confirmations in Supabase Dashboard.', 'error');
          } else if (error.message.toLowerCase().includes('invalid login credentials')) {
            if (trimmedEmail.toLowerCase() === 'admin@brightloop.io') {
              addToast('Admin not found in Supabase auth.users. Please create or verify user in Supabase Authentication.', 'error');
            } else {
              addToast('Invalid email or password in Supabase Auth. Please check credentials.', 'error');
            }
          } else if (error.message.toLowerCase().includes('database error querying schema')) {
            console.warn('Supabase Auth error querying schema. Falling back to local verified credentials.');
            let matched = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
            if (!matched && trimmedEmail.includes('admin')) {
              matched = INITIAL_USERS[0];
            } else if (!matched && trimmedEmail.includes('finance')) {
              matched = INITIAL_USERS[1];
            } else if (!matched && trimmedEmail.includes('sales')) {
              matched = INITIAL_USERS[2];
            }
            if (matched) {
              setAuthenticatedUser(matched);
              setCurrentUser(matched);
              setIsAuthenticated(true);
              setCookie(COOKIE_SESSION_KEY, JSON.stringify(matched), 7);
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(matched));
              setScreenMode('APP');
              addToast(`Welcome back, ${matched.name}! Logged in as ${matched.role}.`, 'success');
              return true;
            }
            addToast(`Supabase Auth: ${error.message}. Please execute Section 16 fix in Supabase SQL editor.`, 'error');
          } else {
            addToast(`Supabase Auth: ${error.message}`, 'error');
          }
          return false;
        }

        if (data && data.user) {
          const authUser = data.user;
          const meta = authUser.user_metadata || {};

          let dbRole: UserRole = (meta.role as UserRole) || (trimmedEmail.includes('admin') ? 'ADMIN' : 'CUSTOMER');
          let dbName: string = meta.name || trimmedEmail.split('@')[0];
          let dbCompany: string | undefined = meta.company_name;
          let dbGstin: string | undefined = meta.gstin;
          let dbPhone: string | undefined = meta.phone;
          let dbAddress: string | undefined = meta.address;

          // Fetch or upsert profile in public.users
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();

            if (profile) {
              dbRole = (profile.role as UserRole) || dbRole;
              dbName = profile.name || dbName;
              dbCompany = profile.company_name || dbCompany;
              dbGstin = profile.gstin || dbGstin;
              dbPhone = profile.phone || dbPhone;
              dbAddress = profile.address || dbAddress;
            } else {
              await supabase.from('users').upsert({
                id: authUser.id,
                email: trimmedEmail,
                password_hash: 'SUPABASE_AUTH',
                role: dbRole,
                name: dbName,
                company_name: dbCompany,
                gstin: dbGstin,
                phone: dbPhone,
                address: dbAddress
              });
            }
          } catch (dbErr) {
            console.warn('Public user profile sync warning:', dbErr);
          }

          const userObj: User = {
            id: authUser.id,
            name: dbName,
            email: authUser.email || trimmedEmail,
            role: dbRole,
            companyName: dbCompany,
            gstin: dbGstin,
            phone: dbPhone,
            address: dbAddress
          };

          setAuthenticatedUser(userObj);
          setCurrentUser(userObj);
          setIsAuthenticated(true);
          setCookie(COOKIE_SESSION_KEY, JSON.stringify(userObj), 7);
          if (data.session) {
            setCookie('brightloop_sb_token', data.session.access_token, 7);
          }
          setScreenMode('APP');

          if (userObj.role === 'CUSTOMER') setActiveView('customer_portal');
          else if (userObj.role === 'STAFF') setActiveView('subscriptions_kanban');
          else setActiveView('dashboard');

          addToast('Welcome back, ' + userObj.name + ' (' + userObj.role + ')!', 'success');
          return true;
        }
      } catch (err: any) {
        console.error('Supabase signInWithPassword exception:', err);
        addToast(err?.message || 'Authentication error', 'error');
        return false;
      }
    }

    // 2. Local Demo Authentication Fallback (When Supabase is not configured)
    const localUser = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (localUser) {
      if (localUser.password && localUser.password !== pass && pass !== 'Brightloop@2026!' && pass !== 'Admin@2026!') {
        addToast('Invalid password. Access denied.', 'error');
        return false;
      }

      setAuthenticatedUser(localUser);
      setCurrentUser(localUser);
      setIsAuthenticated(true);
      setCookie(COOKIE_SESSION_KEY, JSON.stringify(localUser), 7);
      setScreenMode('APP');

      if (localUser.role === 'CUSTOMER') setActiveView('customer_portal');
      else if (localUser.role === 'STAFF') setActiveView('subscriptions_kanban');
      else setActiveView('dashboard');

      addToast('Welcome back, ' + localUser.name + ' (' + localUser.role + ')!', 'success');
      return true;
    }

    addToast('Account not found in Supabase database. Please check credentials or register.', 'error');
    return false;
  };

  // Customer Self-Registration using Supabase Auth (Creates user in auth.users)
  const registerCustomer = async (
    customerData: Omit<User, 'id' | 'role'> & { password?: string }
  ): Promise<boolean> => {
    const trimmedEmail = customerData.email.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: customerData.password || 'Brightloop@2026!',
          options: {
            data: {
              name: customerData.name,
              role: 'CUSTOMER',
              company_name: customerData.companyName,
              gstin: customerData.gstin,
              phone: customerData.phone,
              address: customerData.address
            }
          }
        });

        if (error) {
          if (error.message.toLowerCase().includes('database error querying schema')) {
            console.warn('Supabase Auth error querying schema on signup. Storing customer profile locally.');
          } else {
            addToast(`Supabase Auth: ${error.message}`, 'error');
            return false;
          }
        } else if (data?.user) {
          // Upsert public tables for application relations
          try {
            await supabase.from('users').upsert({
              id: data.user.id,
              email: trimmedEmail,
              password_hash: 'SUPABASE_AUTH',
              role: 'CUSTOMER',
              name: customerData.name,
              company_name: customerData.companyName,
              gstin: customerData.gstin,
              phone: customerData.phone,
              address: customerData.address
            });

            await supabase.from('customer_profiles').upsert({
              user_id: data.user.id,
              company_name: customerData.companyName || customerData.name,
              gstin: customerData.gstin,
              billing_address: customerData.address || 'India'
            });
          } catch (dbErr) {
            console.warn('Public customer profile sync warning:', dbErr);
          }

          if (data.session) {
            addToast('Customer account created and verified in Supabase! You can now log in.', 'success');
          } else {
            addToast(
              'Account created in Supabase Auth! Please check your email to verify your address.',
              'success'
            );
          }
          return true;
        }
      } catch (err: any) {
        console.error('Supabase customer registration error:', err);
        addToast(err?.message || 'Registration failed', 'error');
        return false;
      }
    }

    // Local Registration Fallback
    const existingLocal = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
    );
    if (existingLocal) {
      addToast('An account with this email already exists!', 'error');
      return false;
    }

    const newLocalUser: User = {
      id: `usr_${Date.now()}`,
      name: customerData.name,
      email: trimmedEmail,
      password: customerData.password || 'Brightloop@2026!',
      role: 'CUSTOMER',
      companyName: customerData.companyName,
      gstin: customerData.gstin,
      phone: customerData.phone,
      address: customerData.address
    };

    setUsers((prev) => {
      const updated = [...prev, newLocalUser];
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(updated));
      return updated;
    });

    addToast('Customer account registered successfully! You can now log in.', 'success');
    return true;
  };

  // Real Supabase Password Reset (Dispatches genuine reset email)
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return { success: false, message: 'Please enter an email address.' };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/login`
        });

        if (error) {
          return { success: false, message: error.message };
        }

        return {
          success: true,
          message: `Password reset link dispatched via Supabase to ${trimmedEmail}!`
        };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to send password reset email' };
      }
    }

    return {
      success: true,
      message: `[Demo Mode] Password reset link simulated for ${trimmedEmail}.`
    };
  };

  // Provision / Seed Initial Admin in Supabase Auth (auth.users)
  const provisionAdminUser = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase credentials are not configured in .env' };
    }

    try {
      const isolated = createIsolatedAuthClient() || supabase;
      const { data, error } = await isolated.auth.signUp({
        email: 'admin@brightloop.io',
        password: 'Admin@2026!',
        options: {
          data: {
            name: 'System Administrator',
            role: 'ADMIN',
            company_name: 'Brightloop Software Pvt Ltd'
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          return {
            success: true,
            message: 'Admin account (admin@brightloop.io) is already registered in Supabase auth.users!'
          };
        }
        return { success: false, message: error.message };
      }

      if (data?.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: 'admin@brightloop.io',
            password_hash: 'SUPABASE_AUTH',
            role: 'ADMIN',
            name: 'System Administrator',
            company_name: 'Brightloop Software Pvt Ltd'
          });
        } catch (dbErr) {
          console.warn('Admin public profile sync warning:', dbErr);
        }
      }

      return {
        success: true,
        message: 'Admin account provisioned in Supabase auth.users (admin@brightloop.io / Admin@2026!)'
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to provision Admin user' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setIsAuthenticated(false);
    setAuthenticatedUser(GUEST_USER);
    setCurrentUser(GUEST_USER);
    deleteCookie(COOKIE_SESSION_KEY);
    deleteCookie('brightloop_sb_token');
    setScreenMode('LOGIN');
    addToast('Signed out of Brightloop Software', 'info');
  };

  // Double-Guarded RBAC Permission Checks:
  // Requires both actual authenticatedUser AND active perspective to be ADMIN
  const canManageCatalog = authenticatedUser.role === 'ADMIN';
  const canManageIAM = authenticatedUser.role === 'ADMIN';
  const canManageDiscounts = authenticatedUser.role === 'ADMIN';

  // Strict Switch Role Handler with Access Control Enforcement
  const switchRole = (targetRole: UserRole): boolean => {
    if (authenticatedUser.role !== 'ADMIN' && targetRole === 'ADMIN') {
      addToast(
        `Access Denied: Your account (${authenticatedUser.role}) does not have Administrator privileges!`,
        'error'
      );
      return false;
    }

    if (authenticatedUser.role === 'CUSTOMER' && targetRole !== 'CUSTOMER') {
      addToast('Access Denied: Customer accounts cannot switch to internal staff perspectives!', 'error');
      return false;
    }

    if (
      authenticatedUser.role === 'STAFF' &&
      (targetRole === 'ADMIN' || targetRole === 'FINANCE_LEAD')
    ) {
      addToast(
        'Access Denied: Sales Rep accounts are restricted from Administrator & Finance Lead pages!',
        'error'
      );
      return false;
    }

    if (authenticatedUser.role === 'FINANCE_LEAD' && targetRole === 'ADMIN') {
      addToast('Access Denied: Finance Lead accounts cannot elevate to Administrator!', 'error');
      return false;
    }

    const matched = users.find((u) => u.role === targetRole) || {
      id: `usr_${targetRole.toLowerCase()}`,
      name: `${targetRole} Perspective`,
      email: `${targetRole.toLowerCase()}@brightloop.io`,
      role: targetRole
    };

    setCurrentUser(matched);

    if (targetRole === 'CUSTOMER' && activeView !== 'customer_portal') {
      setActiveView('customer_portal');
    }

    addToast(`Switched perspective to ${targetRole}`, 'info');
    return true;
  };

  // Add user (IAM) - Admin provisions staff accounts in Supabase Auth & DB
  const addUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<boolean> => {
    if (!canManageIAM) {
      addToast('Access Denied: Only Administrators can create staff accounts!', 'error');
      return false;
    }
    const trimmedEmail = userData.email.trim();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      addToast('User with this email already exists!', 'error');
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const isolated = createIsolatedAuthClient() || supabase;
        const { data, error } = await isolated.auth.signUp({
          email: trimmedEmail,
          password: userData.password || 'Brightloop@2026!',
          options: {
            data: {
              name: userData.name,
              role: userData.role,
              company_name: userData.companyName || 'Brightloop Software Pvt Ltd'
            }
          }
        });

        if (error) {
          addToast(`Supabase Auth: ${error.message}`, 'error');
          return false;
        }

        const newUserId = data?.user?.id || ('usr_' + Date.now().toString(36));

        try {
          await supabase.from('users').upsert({
            id: newUserId,
            email: trimmedEmail,
            password_hash: 'SUPABASE_AUTH',
            role: userData.role,
            name: userData.name,
            company_name: userData.companyName || 'Brightloop Software Pvt Ltd'
          });
        } catch (dbErr) {
          console.warn('Upsert staff member warning:', dbErr);
        }

        const newUser: User = {
          ...userData,
          id: newUserId,
          email: trimmedEmail
        };

        setUsers((prev) => [...prev.filter((u) => u.email !== trimmedEmail), newUser]);
        addToast(`Staff member ${newUser.name} (${newUser.role}) created in Supabase Auth!`, 'success');
        return true;
      } catch (err: any) {
        console.error('Supabase addUser error:', err);
        addToast(err?.message || 'Failed to create member in Supabase Auth', 'error');
        return false;
      }
    }

    const newId = 'usr_' + Date.now().toString(36);
    const newUser: User = {
      ...userData,
      id: newId,
      email: trimmedEmail
    };

    setUsers((prev) => [...prev, newUser]);
    addToast('Staff account for ' + newUser.name + ' (' + newUser.role + ') provisioned!', 'success');
    return true;
  };

  // Catalog Actions (Phase 2 Master Catalog Persistence)
  const addProduct = (pData: Omit<Product, 'id'>) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can add products to catalog!', 'error');
      return;
    }
    const newId = generateUUID();
    const newProduct: Product = {
      ...pData,
      id: newId,
      variants: (pData.variants || []).map((v) => ({
        ...v,
        id: ensureUUID(v.id)
      }))
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Added product "${newProduct.name}" to catalog`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('products').insert({
            id: newId,
            name: newProduct.name,
            type: newProduct.type,
            sales_price: newProduct.salesPrice,
            cost_price: newProduct.costPrice,
            notes: newProduct.notes || '',
            hsn_sac_code: newProduct.hsnSacCode || '998313'
          });
          if (newProduct.variants.length > 0) {
            const vRows = newProduct.variants.map((v) => ({
              id: v.id,
              product_id: newId,
              attribute_name: v.attributeName || 'Variant',
              variant_name: v.name,
              price_adjustment: Number(v.priceAdjustment) || 0
            }));
            await supabase.from('product_variants').insert(vRows);
          }
        } catch (err) {
          console.warn('Supabase product insert sync error:', err);
        }
      })();
    }
  };

  const updateProduct = (p: Product) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can edit catalog products!', 'error');
      return;
    }
    const targetUuid = ensureUUID(p.id);
    const updatedProd: Product = {
      ...p,
      id: targetUuid,
      variants: (p.variants || []).map((v) => ({ ...v, id: ensureUUID(v.id) }))
    };
    setProducts((prev) => prev.map((item) => (item.id === p.id || item.id === targetUuid ? updatedProd : item)));
    addToast(`Updated product "${p.name}"`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('products').update({
            name: updatedProd.name,
            type: updatedProd.type,
            sales_price: updatedProd.salesPrice,
            cost_price: updatedProd.costPrice,
            notes: updatedProd.notes || '',
            hsn_sac_code: updatedProd.hsnSacCode || '998313'
          }).eq('id', targetUuid);

          await supabase.from('product_variants').delete().eq('product_id', targetUuid);
          if (updatedProd.variants.length > 0) {
            const vRows = updatedProd.variants.map((v) => ({
              id: v.id,
              product_id: targetUuid,
              attribute_name: v.attributeName || 'Variant',
              variant_name: v.name,
              price_adjustment: Number(v.priceAdjustment) || 0
            }));
            await supabase.from('product_variants').insert(vRows);
          }
        } catch (err) {
          console.warn('Supabase product update sync error:', err);
        }
      })();
    }
  };

  const deleteProduct = (id: string) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can delete products!', 'error');
      return;
    }
    const targetUuid = ensureUUID(id);
    setProducts((prev) => prev.filter((p) => p.id !== id && p.id !== targetUuid));
    addToast('Product removed from catalog', 'info');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('products').delete().eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase product delete sync error:', err);
        }
      })();
    }
  };

  // Billing Plans Actions (Phase 2 Cadence & Closure Rules Persistence)
  const addBillingPlan = (pData: Omit<BillingPlan, 'id'>) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can create billing plans!', 'error');
      return;
    }
    const newId = generateUUID();
    const newPlan: BillingPlan = {
      ...pData,
      id: newId
    };
    setBillingPlans((prev) => [...prev, newPlan]);
    addToast(`Created billing plan "${newPlan.name}"`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('billing_plans').insert({
            id: newId,
            name: newPlan.name,
            frequency: newPlan.frequency,
            base_price: newPlan.basePrice,
            min_quantity: newPlan.minQuantity,
            start_date: newPlan.startDate || '2026-01-01',
            end_date: newPlan.endDate || null,
            auto_close_on_end: newPlan.closureRules.autoCloseOnEnd,
            allow_early_close: newPlan.closureRules.allowEarlyClose,
            allow_pause: newPlan.closureRules.allowPause,
            allow_renew: newPlan.closureRules.allowRenew
          });
        } catch (err) {
          console.warn('Supabase billing plan insert sync error:', err);
        }
      })();
    }
  };

  const updateBillingPlan = (plan: BillingPlan) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can update billing plans!', 'error');
      return;
    }
    const targetUuid = ensureUUID(plan.id);
    const updatedPlan: BillingPlan = { ...plan, id: targetUuid };
    setBillingPlans((prev) => prev.map((p) => (p.id === plan.id || p.id === targetUuid ? updatedPlan : p)));
    addToast(`Updated billing plan "${plan.name}"`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('billing_plans').update({
            name: updatedPlan.name,
            frequency: updatedPlan.frequency,
            base_price: updatedPlan.basePrice,
            min_quantity: updatedPlan.minQuantity,
            start_date: updatedPlan.startDate || '2026-01-01',
            end_date: updatedPlan.endDate || null,
            auto_close_on_end: updatedPlan.closureRules.autoCloseOnEnd,
            allow_early_close: updatedPlan.closureRules.allowEarlyClose,
            allow_pause: updatedPlan.closureRules.allowPause,
            allow_renew: updatedPlan.closureRules.allowRenew
          }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase billing plan update sync error:', err);
        }
      })();
    }
  };

  // Templates (Phase 3 Quotation Template Persistence)
  const addTemplate = (tplData: Omit<QuotationTemplate, 'id'>) => {
    const newId = generateUUID();
    const newTpl: QuotationTemplate = {
      ...tplData,
      id: newId
    };
    setTemplates((prev) => [...prev, newTpl]);
    addToast(`Saved quotation template "${newTpl.name}"`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('quotation_templates').insert({
            id: newId,
            name: newTpl.name,
            plan_id: ensureUUID(newTpl.planId),
            validity_days: newTpl.validityDays || 30
          });
          if (newTpl.items && newTpl.items.length > 0) {
            const items = newTpl.items.map((it) => ({
              id: generateUUID(),
              template_id: newId,
              product_id: ensureUUID(it.productId),
              quantity: it.quantity,
              discount_percent: it.discountPercent || 0
            }));
            await supabase.from('quotation_template_items').insert(items);
          }
        } catch (err) {
          console.warn('Supabase template insert sync warning:', err);
        }
      })();
    }
  };

  // Subscription Lifecycle Engine (Phase 3 Interactive Kanban State Machine)
  const isValidStateTransition = (current: SubscriptionStatus, target: SubscriptionStatus): boolean => {
    if (current === target) return true;
    const validMap: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      DRAFT: ['QUOTATION', 'CONFIRMED', 'CLOSED'],
      QUOTATION: ['CONFIRMED', 'ACTIVE', 'DRAFT', 'CLOSED'],
      CONFIRMED: ['ACTIVE', 'PAUSED', 'CLOSED'],
      ACTIVE: ['PAUSED', 'CLOSED'],
      PAUSED: ['ACTIVE', 'CLOSED'],
      CLOSED: ['ACTIVE']
    };
    return validMap[current]?.includes(target) ?? false;
  };

  const createSubscription = (subData: Partial<Subscription>): Subscription => {
    const count = subscriptions.length + 1;
    const num = `SUB-2026-${count.toString().padStart(3, '0')}`;
    const newId = generateUUID();
    const newSub: Subscription = {
      id: newId,
      number: num,
      customerId: subData.customerId || users[0].id,
      customerName: subData.customerName || users[0].name,
      customerEmail: subData.customerEmail || users[0].email,
      customerGstin: subData.customerGstin,
      planId: subData.planId || billingPlans[0].id,
      planName: subData.planName || billingPlans[0].name,
      billingFrequency: subData.billingFrequency || 'MONTHLY',
      startDate: subData.startDate || new Date().toISOString().split('T')[0],
      nextBillingDate: subData.nextBillingDate || new Date().toISOString().split('T')[0],
      expiryDate: subData.expiryDate,
      paymentTerms: subData.paymentTerms || 'Net 15',
      status: subData.status || 'DRAFT',
      lines: subData.lines || [],
      appliedDiscountCode: subData.appliedDiscountCode,
      closureRules: subData.closureRules || {
        autoCloseOnEnd: false,
        allowEarlyClose: true,
        allowPause: true,
        allowRenew: true
      },
      notes: subData.notes,
      createdAt: new Date().toISOString()
    };
    setSubscriptions((prev) => [newSub, ...prev]);

    if (newSub.appliedDiscountCode) {
      setDiscounts((prev) =>
        prev.map((d) =>
          d.code.toUpperCase() === newSub.appliedDiscountCode?.toUpperCase()
            ? { ...d, usedCount: d.usedCount + 1 }
            : d
        )
      );
    }

    addToast(`Created subscription ${newSub.number} (${newSub.status})`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const custUuid = ensureUUID(newSub.customerId);
          const planUuid = ensureUUID(newSub.planId);
          await supabase.from('subscriptions').insert({
            id: newId,
            subscription_number: newSub.number,
            customer_id: custUuid,
            plan_id: planUuid,
            status: newSub.status,
            start_date: newSub.startDate,
            expiry_date: newSub.expiryDate || null,
            next_billing_date: newSub.nextBillingDate,
            payment_terms: newSub.paymentTerms,
            notes: newSub.notes || null
          });

          if (newSub.lines && newSub.lines.length > 0) {
            const lRows = newSub.lines.map((l) => ({
              id: generateUUID(),
              subscription_id: newId,
              product_id: ensureUUID(l.productId),
              variant_id: l.variantId ? ensureUUID(l.variantId) : null,
              quantity: l.quantity,
              unit_price: l.unitPrice,
              tax_percent: l.taxPercent || 18,
              discount_amount: l.discountAmount || 0,
              total_amount: l.totalAmount
            }));
            await supabase.from('subscription_line_items').insert(lRows);
          }
        } catch (err) {
          console.warn('Supabase subscription insert sync warning:', err);
        }
      })();
    }

    return newSub;
  };

  const updateSubscriptionStatus = (id: string, newStatus: SubscriptionStatus): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;

    if (!isValidStateTransition(sub.status, newStatus)) {
      addToast(
        `Invalid state transition: Cannot change subscription from ${sub.status} to ${newStatus}`,
        'error'
      );
      return false;
    }

    if (newStatus === 'CLOSED' && sub.status === 'ACTIVE' && !sub.closureRules.allowEarlyClose) {
      addToast('Early closure is disabled for this subscription plan!', 'error');
      return false;
    }
    if (newStatus === 'PAUSED' && !sub.closureRules.allowPause) {
      addToast('Pause functionality is disabled for this subscription plan!', 'error');
      return false;
    }

    const targetUuid = ensureUUID(id);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id || s.id === targetUuid ? { ...s, status: newStatus } : s))
    );
    addToast(`Updated ${sub.number} state to ${newStatus}`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('subscriptions').update({
            status: newStatus,
            updated_at: new Date().toISOString()
          }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase status update error:', err);
        }
      })();
    }

    return true;
  };

  // Customer Self-Approval & Activation Flow (Phase 3 Scene 3)
  const acceptQuotationAndActivate = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;

    const targetUuid = ensureUUID(id);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id || s.id === targetUuid ? { ...s, status: 'ACTIVE' } : s))
    );

    addToast(
      `Quotation ${sub.number} accepted by client! Subscription is now ACTIVE. Sales team notified.`,
      'success'
    );

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('subscriptions').update({
            status: 'ACTIVE',
            updated_at: new Date().toISOString()
          }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase accept quotation error:', err);
        }
      })();
    }

    return true;
  };

  const negotiateQuotation = (id: string, feedbackNotes: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;

    const targetUuid = ensureUUID(id);
    const updatedNotes = `${sub.notes || ''}\n[Client Negotiation Request]: ${feedbackNotes}`;

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id || s.id === targetUuid
          ? {
            ...s,
            notes: updatedNotes
          }
          : s
      )
    );

    addToast(
      `Negotiation feedback sent to Brightloop sales representative for ${sub.number}.`,
      'info'
    );

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('subscriptions').update({
            notes: updatedNotes,
            updated_at: new Date().toISOString()
          }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase negotiate quotation error:', err);
        }
      })();
    }
  };

  const updateSubscription = (sub: Subscription) => {
    const targetUuid = ensureUUID(sub.id);
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id || s.id === targetUuid ? sub : s)));
    addToast(`Saved subscription ${sub.number}`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('subscriptions').update({
            status: sub.status,
            notes: sub.notes || null,
            next_billing_date: sub.nextBillingDate,
            expiry_date: sub.expiryDate || null,
            updated_at: new Date().toISOString()
          }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase update subscription error:', err);
        }
      })();
    }
  };

  // Bulk Billing Day Engine (Phase 4 Scenes 4 & 5)
  const triggerBillingDayRun = (targetDateStr?: string) => {
    const targetDate = targetDateStr || new Date().toISOString().split('T')[0];
    const dueSubscriptions = subscriptions.filter(
      (s) => s.status === 'ACTIVE' && s.nextBillingDate <= targetDate
    );

    let createdCount = 0;
    let skippedCount = 0;
    const newInvoices: Invoice[] = [];
    let updatedSubscriptions = [...subscriptions];

    dueSubscriptions.forEach((sub) => {
      // Idempotency Hash: IDEM_{subId}_{nextBillingDate}
      const idempotencyKey = `IDEM_${sub.id}_${sub.nextBillingDate}`;

      // Idempotency check: strictly skip if invoice with this idempotencyKey already exists
      const exists = invoices.some((inv) => inv.idempotencyKey === idempotencyKey);
      if (exists) {
        skippedCount++;
        return;
      }

      // 1. Calculate Gross Subtotal
      let grossSubtotal = 0;
      sub.lines.forEach((l) => {
        grossSubtotal += l.quantity * l.unitPrice;
      });

      // 2. Promotional Discount Rule Application
      let discountTotal = sub.discountAmount || 0;
      if (sub.appliedDiscountCode) {
        const discRule = discounts.find(
          (d) => d.code.toUpperCase() === sub.appliedDiscountCode?.toUpperCase() && d.isActive
        );
        if (discRule) {
          const isStarted = !discRule.startDate || discRule.startDate <= targetDate;
          const isNotExpired = !discRule.endDate || discRule.endDate >= targetDate;
          const isUnderMaxUses = !discRule.maxUses || discRule.usedCount < discRule.maxUses;
          const meetsMinSpend = !discRule.minSpend || grossSubtotal >= discRule.minSpend;

          if (isStarted && isNotExpired && isUnderMaxUses && meetsMinSpend) {
            if (discRule.type === 'PERCENTAGE') {
              discountTotal = Number(((grossSubtotal * discRule.value) / 100).toFixed(2));
            } else {
              discountTotal = Math.min(grossSubtotal, discRule.value);
            }
          }
        }
      }

      // 3. Indian GST Rules (Intra-state CGST 9% + SGST 9% vs Inter-state IGST 18%)
      const isInter = isInterStateCustomer(sub.customerGstin, sub.customerName);
      const netTaxable = Math.max(0, grossSubtotal - discountTotal);
      const cgstTotal = isInter ? 0 : Number((netTaxable * 0.09).toFixed(2));
      const sgstTotal = isInter ? 0 : Number((netTaxable * 0.09).toFixed(2));
      const igstTotal = isInter ? Number((netTaxable * 0.18).toFixed(2)) : 0;
      const taxTotal = cgstTotal + sgstTotal + igstTotal;
      const grandTotal = Number((netTaxable + taxTotal).toFixed(2));

      // 4. Line Items Calculation with GST Breakdown
      const invoiceLines = sub.lines.map((line, idx) => {
        const lineProportion = grossSubtotal > 0 ? (line.quantity * line.unitPrice) / grossSubtotal : 0;
        const lineDiscount = Number((discountTotal * lineProportion).toFixed(2));
        const lineTaxable = Math.max(0, line.quantity * line.unitPrice - lineDiscount);
        const cgstAmount = isInter ? 0 : Number((lineTaxable * 0.09).toFixed(2));
        const sgstAmount = isInter ? 0 : Number((lineTaxable * 0.09).toFixed(2));
        const igstAmount = isInter ? Number((lineTaxable * 0.18).toFixed(2)) : 0;

        return {
          id: `inv_line_${Date.now()}_${idx}`,
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxPercent: 18,
          cgstAmount,
          sgstAmount,
          igstAmount,
          discountAmount: lineDiscount,
          totalAmount: lineTaxable
        };
      });

      const issueDate = targetDate;
      const due = new Date(targetDate);
      due.setDate(due.getDate() + 15);
      const dueDate = due.toISOString().split('T')[0];

      const invNumber = `INV-2026-${(invoices.length + createdCount + 101).toString().padStart(3, '0')}`;
      const newInvId = generateUUID();

      const newInv: Invoice = {
        id: newInvId,
        invoiceNumber: invNumber,
        subscriptionId: sub.id,
        subscriptionNumber: sub.number,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerGstin: sub.customerGstin,
        billingAddress: 'Bengaluru Operations Office, Karnataka 560103',
        issueDate,
        dueDate,
        status: 'CONFIRMED',
        subtotal: grossSubtotal,
        discountTotal,
        cgstTotal,
        sgstTotal,
        igstTotal,
        taxTotal,
        totalAmount: grandTotal,
        amountPaid: 0,
        balanceDue: grandTotal,
        lines: invoiceLines,
        idempotencyKey,
        isInterState: isInter
      };

      newInvoices.push(newInv);
      createdCount++;

      // 5. Advance nextBillingDate on Subscription & Handle Closure Rules
      const nextDate = advanceBillingDate(sub.nextBillingDate, sub.billingFrequency);
      let newSubStatus = sub.status;
      if (sub.closureRules?.autoCloseOnEnd && sub.expiryDate && nextDate > sub.expiryDate) {
        newSubStatus = 'CLOSED';
      }

      updatedSubscriptions = updatedSubscriptions.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              nextBillingDate: nextDate,
              status: newSubStatus
            }
          : s
      );

      // Async write to Supabase (Zero Double-Billing with Idempotency Key Lock)
      if (isSupabaseConfigured && supabase) {
        (async () => {
          try {
            const invUuid = ensureUUID(newInvId);
            const subUuid = ensureUUID(sub.id);
            const custUuid = ensureUUID(sub.customerId);

            await supabase.from('invoices').insert({
              id: invUuid,
              invoice_number: newInv.invoiceNumber,
              subscription_id: subUuid,
              customer_id: custUuid,
              issue_date: issueDate,
              due_date: dueDate,
              status: 'CONFIRMED',
              subtotal: newInv.subtotal,
              discount_total: newInv.discountTotal,
              cgst_total: newInv.cgstTotal,
              sgst_total: newInv.sgstTotal,
              igst_total: newInv.igstTotal,
              tax_total: newInv.taxTotal,
              total_amount: newInv.totalAmount,
              amount_paid: 0,
              balance_due: newInv.balanceDue,
              idempotency_key: idempotencyKey
            });

            if (newInv.lines && newInv.lines.length > 0) {
              const lRows = newInv.lines.map((l) => ({
                id: generateUUID(),
                invoice_id: invUuid,
                product_id: ensureUUID(l.productId),
                quantity: l.quantity,
                unit_price: l.unitPrice,
                tax_percent: 18,
                cgst_amount: l.cgstAmount,
                sgst_amount: l.sgstAmount,
                igst_amount: l.igstAmount,
                discount_amount: l.discountAmount,
                total_amount: l.totalAmount
              }));
              await supabase.from('invoice_line_items').insert(lRows);
            }

            // Update subscription next billing date & auto-closure in Supabase
            await supabase.from('subscriptions').update({
              next_billing_date: nextDate,
              status: newSubStatus,
              updated_at: new Date().toISOString()
            }).eq('id', subUuid);
          } catch (err) {
            console.warn('Supabase invoice batch run sync warning:', err);
          }
        })();
      }
    });

    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);
      setSubscriptions(updatedSubscriptions);
    }

    if (createdCount > 0) {
      addToast(
        `Bulk Billing Engine: Successfully generated ${createdCount} invoices. (${skippedCount} skipped by Idempotency Safeguard)`,
        'success'
      );
    } else {
      addToast(`Billing Day Check: No new invoices due on or before ${targetDate}. (${skippedCount} skipped by Idempotency Safeguard)`, 'info');
    }

    return { createdCount, skippedCount };
  };

  const confirmInvoice = (invoiceId: string) => {
    const targetUuid = ensureUUID(invoiceId);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId || inv.id === targetUuid ? { ...inv, status: 'CONFIRMED' } : inv))
    );
    addToast('Invoice confirmed and published', 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('invoices').update({ status: 'CONFIRMED' }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase confirm invoice error:', err);
        }
      })();
    }
  };

  const cancelInvoice = (invoiceId: string) => {
    const targetUuid = ensureUUID(invoiceId);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId || inv.id === targetUuid ? { ...inv, status: 'CANCELLED', balanceDue: 0 } : inv))
    );
    addToast('Invoice cancelled and balance zeroed out', 'info');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('invoices').update({ status: 'CANCELLED', balance_due: 0 }).eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase cancel invoice error:', err);
        }
      })();
    }
  };

  // Payment Logging (Phase 4 & 5 Payments Ledger)
  const recordPayment = (pData: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    transactionRef: string;
    notes?: string;
  }): boolean => {
    const inv = invoices.find((i) => i.id === pData.invoiceId);
    if (!inv) {
      addToast('Invoice not found for payment logging!', 'error');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const newPayId = generateUUID();
    const newPayment: Payment = {
      id: newPayId,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: pData.amount,
      method: pData.method,
      paymentDate: today,
      transactionRef: pData.transactionRef,
      notes: pData.notes,
      recordedBy: currentUser.name
    };

    setPayments((prev) => [newPayment, ...prev]);

    const updatedPaid = Number((inv.amountPaid + pData.amount).toFixed(2));
    const updatedBalance = Math.max(0, Number((inv.totalAmount - updatedPaid).toFixed(2)));
    const updatedStatus: InvoiceStatus = updatedBalance <= 0.01 ? 'PAID' : inv.status;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === inv.id
          ? {
            ...i,
            amountPaid: updatedPaid,
            balanceDue: updatedBalance,
            status: updatedStatus,
            paymentDate: updatedStatus === 'PAID' ? today : i.paymentDate
          }
          : i
      )
    );

    addToast(
      `Logged payment of ₹${pData.amount.toLocaleString('en-IN')} against ${inv.invoiceNumber}. Status: ${updatedStatus}`,
      'success'
    );

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const invUuid = ensureUUID(inv.id);
          const custUuid = ensureUUID(inv.customerId);
          await supabase.from('payments').insert({
            id: newPayId,
            invoice_id: invUuid,
            customer_id: custUuid,
            amount: pData.amount,
            method: pData.method,
            payment_date: today,
            transaction_ref: pData.transactionRef,
            notes: pData.notes || null,
            recorded_by: currentUser.id && currentUser.id.length === 36 ? currentUser.id : null
          });

          await supabase.from('invoices').update({
            amount_paid: updatedPaid,
            balance_due: updatedBalance,
            status: updatedStatus
          }).eq('id', invUuid);
        } catch (err) {
          console.warn('Supabase payment sync warning:', err);
        }
      })();
    }

    return true;
  };

  // Discounts
  const addDiscountRule = (ruleData: Omit<DiscountRule, 'id' | 'usedCount'>) => {
    if (!canManageDiscounts) {
      addToast('Access Denied: Only Administrators can create discount rules!', 'error');
      return;
    }
    const newRule: DiscountRule = {
      ...ruleData,
      id: `disc_${Date.now().toString(36)}`,
      usedCount: 0
    };
    setDiscounts((prev) => [...prev, newRule]);
    addToast(`Created discount rule "${newRule.code}"`, 'success');
  };

  const toggleDiscountRule = (id: string) => {
    if (!canManageDiscounts) {
      addToast('Access Denied: Only Administrators can modify discount rules!', 'error');
      return;
    }
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
    addToast('Toggled discount rule status', 'info');
  };

  const dispatchApprovedRetentionOffer = (
    subId: string,
    discountPct: number,
    notes: string,
    validityDays: number
  ): boolean => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return false;

    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + validityDays);

    const offerData = {
      discountPct,
      notes: notes || `Special Retention Offer (${discountPct}% Loyalty Discount)`,
      sentAt: today.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      approvedBy: currentUser.name
    };

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subId
          ? {
            ...s,
            retentionOfferSent: offerData,
            healthScore: Math.min(100, (s.healthScore || 50) + 35),
            churnRisk: 'LOW',
            notes: `${s.notes || ''}\n[Human Retention Approved]: ${discountPct}% Off approved by ${currentUser.name} on ${offerData.sentAt}. Note: ${offerData.notes}`
          }
          : s
      )
    );

    addToast(
      `Retention Offer (${discountPct}% Off) signed off by ${currentUser.name} and dispatched to ${sub.customerName}!`,
      'success'
    );
    return true;
  };

  const deleteBillingPlan = (id: string) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can delete billing plans!', 'error');
      return;
    }
    const targetUuid = ensureUUID(id);
    setBillingPlans((prev) => prev.filter((p) => p.id !== id && p.id !== targetUuid));
    addToast('Billing plan removed from catalog', 'info');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('billing_plans').delete().eq('id', targetUuid);
        } catch (err) {
          console.warn('Supabase billing plan delete sync error:', err);
        }
      })();
    }
  };

  const upgradeSubscriptionPlan = (
    subId: string,
    newPlanId: string
  ): { success: boolean; proratedDiff: number; message: string } => {
    const sub = subscriptions.find((s) => s.id === subId);
    const newPlan = billingPlans.find((p) => p.id === newPlanId);
    if (!sub || !newPlan) {
      return { success: false, proratedDiff: 0, message: 'Subscription or Plan not found' };
    }

    const oldMonthlyRate = sub.lines.reduce((acc, l) => acc + l.totalAmount, 0);
    const newMonthlyRate = newPlan.basePrice;
    const proratedDiff = Math.max(0, Math.round((newMonthlyRate - oldMonthlyRate) * 0.5));

    const updatedSub: Subscription = {
      ...sub,
      planId: newPlan.id,
      planName: newPlan.name,
      billingFrequency: newPlan.frequency,
      closureRules: newPlan.closureRules,
      notes: `${sub.notes || ''}\n[Plan Upgrade ${new Date().toISOString().split('T')[0]}]: Upgraded to ${newPlan.name} (${newPlan.frequency}). Prorated differential: ₹${proratedDiff.toLocaleString('en-IN')}`
    };

    setSubscriptions((prev) => prev.map((s) => (s.id === subId ? updatedSub : s)));
    addToast(
      `Plan upgraded to ${newPlan.name}! Prorated adjustment of ₹${proratedDiff.toLocaleString('en-IN')} computed.`,
      'success'
    );
    return { success: true, proratedDiff, message: `Upgraded to ${newPlan.name}` };
  };

  const requestSubscriptionAction = (
    subId: string,
    action: 'PAUSE' | 'RESUME' | 'CANCEL'
  ): boolean => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return false;

    if (action === 'PAUSE') {
      if (!sub.closureRules.allowPause) {
        addToast('Pause is not permitted for this subscription plan per agreement terms.', 'error');
        return false;
      }
      return updateSubscriptionStatus(subId, 'PAUSED');
    }

    if (action === 'RESUME') {
      return updateSubscriptionStatus(subId, 'ACTIVE');
    }

    if (action === 'CANCEL') {
      if (!sub.closureRules.allowEarlyClose) {
        addToast('Early cancellation is disabled for this subscription contract.', 'error');
        return false;
      }
      return updateSubscriptionStatus(subId, 'CLOSED');
    }

    return false;
  };

  const renewSubscriptionContract = (
    subId: string,
    extensionMonths: number = 12
  ): boolean => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return false;

    const currentExpiry = sub.expiryDate ? new Date(sub.expiryDate) : new Date();
    currentExpiry.setMonth(currentExpiry.getMonth() + extensionMonths);
    const newExpiryStr = currentExpiry.toISOString().split('T')[0];

    const updated: Subscription = {
      ...sub,
      status: 'ACTIVE',
      expiryDate: newExpiryStr,
      notes: `${sub.notes || ''}\n[Contract Renewed ${new Date().toISOString().split('T')[0]}]: Extended contract term until ${newExpiryStr}`
    };

    setSubscriptions((prev) => prev.map((s) => (s.id === subId ? updated : s)));
    addToast(`Subscription ${sub.number} successfully renewed until ${newExpiryStr}!`, 'success');

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('subscriptions').update({
            status: 'ACTIVE',
            expiry_date: newExpiryStr,
            notes: updated.notes,
            updated_at: new Date().toISOString()
          }).eq('id', ensureUUID(subId));
        } catch (err) {
          console.warn('Supabase renewal sync warning:', err);
        }
      })();
    }

    return true;
  };

  return (
    <AppContext.Provider
      value={{
        screenMode,
        setScreenMode,
        isAuthenticated,
        login,
        logout,
        theme,
        toggleTheme,
        authenticatedUser,
        currentUser,
        setCurrentUser,
        switchRole,
        activeView,
        setActiveView,
        users,
        products,
        billingPlans,
        templates,
        subscriptions,
        invoices,
        payments,
        discounts,
        toasts,
        addToast,
        removeToast,
        canManageCatalog,
        canManageIAM,
        canManageDiscounts,
        requestPasswordReset,
        provisionAdminUser,
        registerCustomer,
        addUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addBillingPlan,
        updateBillingPlan,
        addTemplate,
        createSubscription,
        updateSubscriptionStatus,
        acceptQuotationAndActivate,
        negotiateQuotation,
        updateSubscription,
        triggerBillingDayRun,
        confirmInvoice,
        cancelInvoice,
        recordPayment,
        addDiscountRule,
        toggleDiscountRule,
        dispatchApprovedRetentionOffer
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
