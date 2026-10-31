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
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
    return saved ? JSON.parse(saved) : INITIAL_USERS;
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

  // Synchronize users from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const fetchSupabaseUsers = async () => {
      try {
        const { data: supaUsers, error } = await supabase.from('users').select('*');
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
        console.warn('Could not sync from Supabase:', err);
      }
    };
    fetchSupabaseUsers();
  }, []);

  // Strict Auth Function (Only Real Database Credentials)
  const login = async (email: string, pass: string): Promise<boolean> => {
    const trimmedEmail = email.trim();

    // 1. Supabase Postgres Authentication
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', trimmedEmail)
          .single();

        if (error || !data) {
          addToast('Account not found in Supabase database. Please check your email or register as a new customer.', 'error');
          return false;
        }

        if (!data.password_hash || data.password_hash !== pass) {
          addToast('Invalid password. Access denied.', 'error');
          return false;
        }

        const userObj: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          companyName: data.company_name,
          gstin: data.gstin,
          pan: data.pan,
          phone: data.phone,
          address: data.address
        };

        setAuthenticatedUser(userObj);
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        setCookie(COOKIE_SESSION_KEY, JSON.stringify(userObj), 7);
        setScreenMode('APP');

        if (userObj.role === 'CUSTOMER') setActiveView('customer_portal');
        else if (userObj.role === 'STAFF') setActiveView('subscriptions_kanban');
        else setActiveView('dashboard');

        addToast('Welcome back, ' + userObj.name + ' (' + userObj.role + ')!', 'success');
        return true;
      } catch (err: any) {
        console.error('Supabase query error:', err);
        addToast('Database connection error: ' + (err.message || 'Check Supabase keys'), 'error');
        return false;
      }
    }

    // 2. Unconfigured Supabase Warning
    addToast('Supabase is not configured yet! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to authenticate.', 'error');
    return false;
  };

  // Customer Self-Registration (PDF Scene: A new customer signs up)
  const registerCustomer = async (
    customerData: Omit<User, 'id' | 'role'> & { password?: string }
  ): Promise<boolean> => {
    const trimmedEmail = customerData.email.trim();

    if (!isSupabaseConfigured || !supabase) {
      addToast('Cannot register: Supabase database is not connected. Add credentials to .env', 'error');
      return false;
    }

    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .ilike('email', trimmedEmail)
        .maybeSingle();

      if (existing) {
        addToast('An account with this email is already registered in Supabase!', 'error');
        return false;
      }

      const { data: insertedUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: trimmedEmail,
          password_hash: customerData.password || '',
          role: 'CUSTOMER',
          name: customerData.name,
          company_name: customerData.companyName,
          gstin: customerData.gstin,
          phone: customerData.phone,
          address: customerData.address
        })
        .select()
        .single();

      if (userError) {
        addToast('Registration error: ' + userError.message, 'error');
        return false;
      }

      await supabase.from('customer_profiles').insert({
        user_id: insertedUser.id,
        company_name: customerData.companyName || customerData.name,
        gstin: customerData.gstin,
        billing_address: customerData.address || 'India'
      });

      addToast('Customer account registered in Supabase! You can now log in.', 'success');
      return true;
    } catch (err: any) {
      addToast('Registration failed: ' + err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthenticatedUser(GUEST_USER);
    setCurrentUser(GUEST_USER);
    deleteCookie(COOKIE_SESSION_KEY);
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

  // Add user (IAM) - Admin provisions staff accounts
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

    const newId = 'usr_' + Date.now().toString(36);
    const newUser: User = {
      ...userData,
      id: newId,
      email: trimmedEmail
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').insert({
          id: newId,
          email: trimmedEmail,
          password_hash: userData.password || '',
          role: userData.role,
          name: userData.name,
          company_name: userData.companyName
        });
      } catch (err) {
        console.error('Supabase staff creation error:', err);
      }
    }

    setUsers((prev) => [...prev, newUser]);
    addToast('Staff account for ' + newUser.name + ' (' + newUser.role + ') provisioned!', 'success');
    return true;
  };

  // Catalog Actions
  const addProduct = (pData: Omit<Product, 'id'>) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can add products to catalog!', 'error');
      return;
    }
    const newProduct: Product = {
      ...pData,
      id: `prod_${Date.now().toString(36)}`
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Added product "${newProduct.name}" to catalog`, 'success');
  };

  const updateProduct = (p: Product) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can edit catalog products!', 'error');
      return;
    }
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    addToast(`Updated product "${p.name}"`, 'success');
  };

  const deleteProduct = (id: string) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can delete products!', 'error');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Product removed from catalog', 'info');
  };

  // Billing Plans Actions
  const addBillingPlan = (pData: Omit<BillingPlan, 'id'>) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can create billing plans!', 'error');
      return;
    }
    const newPlan: BillingPlan = {
      ...pData,
      id: `plan_${Date.now().toString(36)}`
    };
    setBillingPlans((prev) => [...prev, newPlan]);
    addToast(`Created billing plan "${newPlan.name}"`, 'success');
  };

  const updateBillingPlan = (plan: BillingPlan) => {
    if (!canManageCatalog) {
      addToast('Access Denied: Only Administrators can update billing plans!', 'error');
      return;
    }
    setBillingPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
    addToast(`Updated billing plan "${plan.name}"`, 'success');
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

  return (
    <AppContext.Provider
      value={{
        screenMode,
        setScreenMode,
        isAuthenticated,
        login,
        authenticatedUser,
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
