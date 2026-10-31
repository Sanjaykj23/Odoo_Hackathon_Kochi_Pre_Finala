export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER' | 'FINANCE_LEAD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  gstin?: string;
  pan?: string;
  phone?: string;
  address?: string;
}

export type ProductType = 'SOFTWARE' | 'ADDON' | 'SERVICE';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Odoo Brand Integration Add-on", "Premium Enterprise SLA"
  attributeName: string; // e.g., "Brand", "SLA Tier"
  priceAdjustment: number; // e.g., +560
}

export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number; // Monthly base selling price in INR
  costPrice: number;
  notes?: string;
  hsnSacCode?: string;
  supportedFrequencies: BillingFrequency[]; // Which time durations this software allows
  variants: ProductVariant[];
}

export interface ClosureRules {
  autoCloseOnEnd: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  frequency: BillingFrequency; // The time duration the software is allowed to be used
  basePrice: number;
  minQuantity: number;
  startDate: string;
  endDate?: string;
  allowedProductIds?: string[]; // Which software products can use this duration plan
  closureRules: ClosureRules;
}

export interface TemplateItem {
  productId: string;
  quantity: number;
  discountPercent?: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  validityDays: number;
  planId: string;
  items: TemplateItem[];
}

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface SubscriptionLineItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number; // Defaults to 18 (GST)
  discountAmount: number;
  totalAmount: number;
}

export interface Subscription {
  id: string;
  number: string; // e.g., "SUB-2026-001"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerGstin?: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency; // Duration of license
  startDate: string;
  nextBillingDate: string;
  expiryDate?: string;
  paymentTerms: string; // e.g. "Net 15", "Due on Receipt"
  status: SubscriptionStatus;
  lines: SubscriptionLineItem[];
  appliedDiscountCode?: string;
  discountAmount?: number;
  closureRules: ClosureRules;
  notes?: string;
  createdAt: string;
  healthScore?: number; // 0-100% Renewal Health Score
  churnRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  retentionOfferSent?: {
    discountPct: number;
    notes: string;
    sentAt: string;
    validUntil: string;
    approvedBy: string;
  };
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface InvoiceLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., "INV-2026-089"
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  billingAddress?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  discountTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  lines: InvoiceLineItem[];
  idempotencyKey: string;
  paymentDate?: string;
  isInterState?: boolean;
}

export type PaymentMethod = 'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'NEFT_RTGS';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  transactionRef: string;
  notes?: string;
  recordedBy: string;
}

export type DiscountType = 'FIXED' | 'PERCENTAGE';

export interface DiscountRule {
  id: string;
  code: string;
  title: string;
  type: DiscountType;
  value: number; // Fixed amount in INR or Percentage (e.g. 10 for 10%)
  minSpend?: number;
  minQuantity?: number;
  startDate: string;
  endDate: string;
  maxUsageLimit: number;
  usedCount: number;
  applicableProductIds?: string[]; // If empty, applies to entire subscription
  isActive: boolean;
}
