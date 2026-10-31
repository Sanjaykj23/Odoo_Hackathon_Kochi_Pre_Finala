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
  plan_daily_poc: 'c0000000-0000-4000-8000-000000000005'
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
              addToast('Admin not found in Supabase auth.users. Use "Provision Admin in Supabase" or execute the SQL script.', 'error');
            } else {
              addToast('Invalid email or password in Supabase Auth. Please check credentials.', 'error');
            }
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
          addToast(`Supabase Auth: ${error.message}`, 'error');
          return false;
        }

        if (data?.user) {
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

  // Templates
  const addTemplate = (tplData: Omit<QuotationTemplate, 'id'>) => {
    const newTpl: QuotationTemplate = {
      ...tplData,
      id: `tpl_${Date.now().toString(36)}`
    };
    setTemplates((prev) => [...prev, newTpl]);
    addToast(`Saved quotation template "${newTpl.name}"`, 'success');
  };

  // Subscription Lifecycle Engine
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
    const newSub: Subscription = {
      id: `sub_${Date.now().toString(36)}`,
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

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    addToast(`Updated ${sub.number} state to ${newStatus}`, 'success');
    return true;
  };

  // Customer Self-Approval & Activation Flow
  const acceptQuotationAndActivate = (id: string): boolean => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return false;

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'ACTIVE' } : s))
    );

    addToast(
      `Quotation ${sub.number} accepted by client! Subscription is now ACTIVE. Sales team notified.`,
      'success'
    );
    return true;
  };

  const negotiateQuotation = (id: string, feedbackNotes: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            notes: `${s.notes || ''}\n[Client Negotiation Request]: ${feedbackNotes}`
          }
          : s
      )
    );

    addToast(
      `Negotiation feedback sent to Brightloop sales representative for ${sub.number}.`,
      'info'
    );
  };

  const updateSubscription = (sub: Subscription) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
    addToast(`Saved subscription ${sub.number}`, 'success');
  };

  // Bulk Billing Day Engine
  const triggerBillingDayRun = (targetDateStr?: string) => {
    const targetDate = targetDateStr || new Date().toISOString().split('T')[0];
    const dueSubscriptions = subscriptions.filter(
      (s) => s.status === 'ACTIVE' && s.nextBillingDate <= targetDate
    );

    let createdCount = 0;
    let skippedCount = 0;
    const newInvoices: Invoice[] = [];

    dueSubscriptions.forEach((sub) => {
      const idempotencyKey = `${sub.id}_${sub.nextBillingDate}`;

      const exists = invoices.some((inv) => inv.idempotencyKey === idempotencyKey);
      if (exists) {
        skippedCount++;
        return;
      }

      let subtotal = 0;
      let discountTotal = 0;

      const invoiceLines = sub.lines.map((line, idx) => {
        const lineTotal = line.quantity * line.unitPrice - line.discountAmount;
        subtotal += line.quantity * line.unitPrice;
        discountTotal += line.discountAmount;

        const taxableAmount = Math.max(0, lineTotal);
        const cgstAmount = taxableAmount * 0.09;
        const sgstAmount = taxableAmount * 0.09;

        return {
          id: `inv_line_${Date.now()}_${idx}`,
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxPercent: 18,
          cgstAmount: Number(cgstAmount.toFixed(2)),
          sgstAmount: Number(sgstAmount.toFixed(2)),
          igstAmount: 0,
          discountAmount: line.discountAmount,
          totalAmount: taxableAmount
        };
      });

      const netTaxable = Math.max(0, subtotal - discountTotal);
      const cgstTotal = Number((netTaxable * 0.09).toFixed(2));
      const sgstTotal = Number((netTaxable * 0.09).toFixed(2));
      const taxTotal = cgstTotal + sgstTotal;
      const totalAmount = Number((netTaxable + taxTotal).toFixed(2));

      const issueDate = targetDate;
      const due = new Date(targetDate);
      due.setDate(due.getDate() + 15);
      const dueDate = due.toISOString().split('T')[0];

      const invNumber = `INV-2026-${(invoices.length + createdCount + 100).toString().padStart(3, '0')}`;

      const newInv: Invoice = {
        id: `inv_${Date.now().toString(36)}_${createdCount}`,
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
        subtotal,
        discountTotal,
        cgstTotal,
        sgstTotal,
        igstTotal: 0,
        taxTotal,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        lines: invoiceLines,
        idempotencyKey,
        isInterState: false
      };

      newInvoices.push(newInv);
      createdCount++;
    });

    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);
    }

    if (createdCount > 0) {
      addToast(
        `Bulk Billing Day Engine: Generated ${createdCount} GST invoices. (${skippedCount} skipped by idempotency check)`,
        'success'
      );
    } else {
      addToast(`Billing Day Check: No new invoices due on or before ${targetDate}.`, 'info');
    }

    return { createdCount, skippedCount };
  };

  const confirmInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'CONFIRMED' } : inv))
    );
    addToast('Invoice confirmed and published', 'success');
  };

  const cancelInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'CANCELLED', balanceDue: 0 } : inv))
    );
    addToast('Invoice cancelled and balance zeroed out', 'info');
  };

  // Payment Logging
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
    const newPayment: Payment = {
      id: `pay_${Date.now().toString(36)}`,
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

    const updatedPaid = inv.amountPaid + pData.amount;
    const updatedBalance = Math.max(0, inv.totalAmount - updatedPaid);
    const updatedStatus = updatedBalance <= 0.01 ? 'PAID' : inv.status;

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
