import {
  User,
  Product,
  BillingPlan,
  QuotationTemplate,
  Subscription,
  Invoice,
  Payment,
  DiscountRule
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Ananya Sharma',
    email: 'admin@brightloop.io',
    role: 'ADMIN',
    companyName: 'Brightloop Software Pvt Ltd',
    gstin: '29AABCB1234F1Z5',
    pan: 'AABCB1234F',
    phone: '+91 98450 11223',
    address: 'Embassy TechVillage, Outer Ring Road, Bengaluru, Karnataka'
  },
  {
    id: 'usr_finance',
    name: 'Vikram Mehta',
    email: 'finance@brightloop.io',
    role: 'FINANCE_LEAD',
    companyName: 'Brightloop Software Pvt Ltd',
    gstin: '29AABCB1234F1Z5',
    pan: 'AABCB1234F',
    phone: '+91 98450 22334',
    address: 'Embassy TechVillage, Outer Ring Road, Bengaluru, Karnataka'
  },
  {
    id: 'usr_sales',
    name: 'Rohan Verma',
    email: 'sales@brightloop.io',
    role: 'STAFF',
    companyName: 'Brightloop Software Pvt Ltd',
    gstin: '29AABCB1234F1Z5',
    pan: 'AABCB1234F',
    phone: '+91 98450 33445',
    address: 'Embassy TechVillage, Outer Ring Road, Bengaluru, Karnataka'
  },
  {
    id: 'usr_customer',
    name: 'Suresh Kumar',
    email: 'billing@infosys.com',
    role: 'CUSTOMER',
    companyName: 'Infosys Tech Solutions Ltd',
    gstin: '29AAACI1234M1Z2',
    pan: 'AAACI1234M',
    phone: '+91 80 2852 0261',
    address: 'Electronics City, Hosur Road, Bengaluru, Karnataka'
  }
];


export const INITIAL_PRODUCTS: Product[] = [
  // --- SOFTWARE PRODUCTS ---
  {
    id: 'prod_erp',
    name: 'Brightloop Business ERP Core',
    type: 'SOFTWARE',
    salesPrice: 12500,
    costPrice: 3200,
    notes: 'Core enterprise ERP application with Inventory, Invoicing, and HR operations.',
    hsnSacCode: '998313',
    supportedFrequencies: ['MONTHLY', 'YEARLY'],
    variants: [
      {
        id: 'var_odoo',
        name: 'Odoo Brand Integration Add-on',
        attributeName: 'Brand Integration',
        priceAdjustment: 560
      },
      {
        id: 'var_multicurrency',
        name: 'Multi-Currency & Forex Ledger',
        attributeName: 'Forex Engine',
        priceAdjustment: 1200
      }
    ]
  },
  {
    id: 'prod_crm',
    name: 'Brightloop CRM Pro',
    type: 'SOFTWARE',
    salesPrice: 6800,
    costPrice: 1800,
    notes: 'Omnichannel CRM software with lead pipelines and deal analytics.',
    hsnSacCode: '998314',
    supportedFrequencies: ['MONTHLY', 'YEARLY', 'WEEKLY'],
    variants: [
      {
        id: 'var_whatsapp',
        name: 'WhatsApp Business API Sync',
        attributeName: 'Messaging Channel',
        priceAdjustment: 1500
      }
    ]
  },

  // --- ADD-ON MODULES ---
  {
    id: 'prod_api',
    name: 'Custom API Gateway Add-on',
    type: 'ADDON',
    salesPrice: 3500,
    costPrice: 900,
    notes: 'High-throughput REST and GraphQL API gateway license.',
    hsnSacCode: '998316',
    supportedFrequencies: ['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'],
    variants: []
  },
  {
    id: 'prod_ai_engine',
    name: 'Advanced AI Predictive Analytics Engine',
    type: 'ADDON',
    salesPrice: 4800,
    costPrice: 1200,
    notes: 'AI-driven cash flow forecasting and automated reorder point recommendations.',
    hsnSacCode: '998317',
    supportedFrequencies: ['MONTHLY', 'YEARLY'],
    variants: []
  },
  {
    id: 'prod_branch_sync',
    name: 'Multi-Tenant Branch Expansion Sync',
    type: 'ADDON',
    salesPrice: 2900,
    costPrice: 700,
    notes: 'Multi-store inventory synchronization and cross-branch intercompany transfer engine.',
    hsnSacCode: '998318',
    supportedFrequencies: ['MONTHLY', 'YEARLY'],
    variants: []
  },

  // --- PROFESSIONAL SERVICES & SLAs ---
  {
    id: 'prod_sla',
    name: 'Enterprise Dedicated SLA 24/7',
    type: 'SERVICE',
    salesPrice: 18000,
    costPrice: 5000,
    notes: 'Guaranteed 15-minute response time with dedicated technical engineer.',
    hsnSacCode: '998315',
    supportedFrequencies: ['MONTHLY', 'YEARLY'],
    variants: [
      {
        id: 'var_account_mgr',
        name: 'Dedicated Technical Account Manager',
        attributeName: 'Staffing',
        priceAdjustment: 8000
      }
    ]
  },
  {
    id: 'prod_onprem_migration',
    name: 'On-Premise Data Migration & Deployment',
    type: 'SERVICE',
    salesPrice: 25000,
    costPrice: 8000,
    notes: 'Full database ETL migration, legacy system cleanup, and air-gapped server installation.',
    hsnSacCode: '998319',
    supportedFrequencies: ['MONTHLY', 'YEARLY'],
    variants: []
  },
  {
    id: 'prod_custom_workflow',
    name: 'Custom ERP Workflow Engineering',
    type: 'SERVICE',
    salesPrice: 35000,
    costPrice: 12000,
    notes: 'Bespoke process automation, custom approval rules, and tailor-made tax reports.',
    hsnSacCode: '998320',
    supportedFrequencies: ['MONTHLY', 'YEARLY'],
    variants: []
  }
];

export const INITIAL_PLANS: BillingPlan[] = [
  {
    id: 'plan_monthly_std',
    name: 'Standard Business Monthly',
    description: 'Billed monthly for standard software licensing duration.',
    frequency: 'MONTHLY',
    basePrice: 12500,
    minQuantity: 1,
    startDate: '2026-01-01',
    allowedProductIds: ['prod_erp', 'prod_crm', 'prod_sla', 'prod_api', 'prod_ai_engine'],
    closureRules: {
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    }
  },
  {
    id: 'plan_annual_growth',
    name: 'Growth Enterprise Annual',
    description: 'Yearly license duration with commitment savings.',
    frequency: 'YEARLY',
    basePrice: 120000,
    minQuantity: 5,
    startDate: '2026-01-01',
    allowedProductIds: ['prod_erp', 'prod_crm', 'prod_sla', 'prod_onprem_migration'],
    closureRules: {
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    }
  },
  {
    id: 'plan_startup_starter',
    name: 'Small Shop Startup Starter',
    description: 'Monthly duration tier for small business software licenses.',
    frequency: 'MONTHLY',
    basePrice: 4999,
    minQuantity: 1,
    startDate: '2026-01-01',
    allowedProductIds: ['prod_crm', 'prod_api', 'prod_branch_sync'],
    closureRules: {
      autoCloseOnEnd: true,
      allowEarlyClose: false,
      allowPause: true,
      allowRenew: true
    }
  },
  {
    id: 'plan_weekly_sprint',
    name: 'Weekly Sprint Trial',
    description: 'Short term project billing duration (7 days).',
    frequency: 'WEEKLY',
    basePrice: 1500,
    minQuantity: 1,
    startDate: '2026-01-01',
    allowedProductIds: ['prod_crm', 'prod_api'],
    closureRules: {
      autoCloseOnEnd: true,
      allowEarlyClose: true,
      allowPause: false,
      allowRenew: false
    }
  },
  {
    id: 'plan_daily_poc',
    name: 'Daily Enterprise Proof-of-Concept',
    description: 'Rapid 24-hour enterprise evaluation cadence with automated closure.',
    frequency: 'DAILY',
    basePrice: 500,
    minQuantity: 1,
    startDate: '2026-01-01',
    allowedProductIds: ['prod_erp', 'prod_crm', 'prod_api'],
    closureRules: {
      autoCloseOnEnd: true,
      allowEarlyClose: true,
      allowPause: false,
      allowRenew: false
    }
  }
];

export const INITIAL_TEMPLATES: QuotationTemplate[] = [
  {
    id: 'tpl_ent_suite',
    name: 'Enterprise Full Suite Package',
    description: 'Pre-packaged offer with 10 ERP seats, CRM Pro, and SLA.',
    validityDays: 30,
    planId: 'plan_annual_growth',
    items: [
      { productId: 'prod_erp', quantity: 10, discountPercent: 10 },
      { productId: 'prod_crm', quantity: 10, discountPercent: 10 },
      { productId: 'prod_sla', quantity: 1, discountPercent: 15 }
    ]
  },
  {
    id: 'tpl_mid_odoo',
    name: 'Mid-Market ERP + Odoo Add-on',
    description: 'Standard monthly ERP bundle with Odoo variant included.',
    validityDays: 14,
    planId: 'plan_monthly_std',
    items: [
      { productId: 'prod_erp', quantity: 1 }
    ]
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_001',
    number: 'SUB-2026-001',
    customerId: 'usr_customer1',
    customerName: 'Infosys Tech Solutions',
    customerEmail: 'billing@infosystechnologies.com',
    customerGstin: '29AAACI1234H1Z5',
    planId: 'plan_annual_growth',
    planName: 'Growth Enterprise Annual',
    billingFrequency: 'YEARLY',
    startDate: '2026-01-15',
    nextBillingDate: '2026-11-01',
    expiryDate: '2027-01-14',
    paymentTerms: 'Net 15',
    status: 'ACTIVE',
    lines: [
      {
        id: 'sub_line_1',
        productId: 'prod_erp',
        productName: 'Brightloop Business ERP Core',
        variantId: 'var_odoo',
        variantName: 'Odoo Brand Integration Add-on (+₹560)',
        quantity: 10,
        unitPrice: 13060,
        taxPercent: 18,
        discountAmount: 13060,
        totalAmount: 117540
      },
      {
        id: 'sub_line_2',
        productId: 'prod_sla',
        productName: 'Enterprise Dedicated SLA 24/7',
        quantity: 1,
        unitPrice: 18000,
        taxPercent: 18,
        discountAmount: 1800,
        totalAmount: 16200
      }
    ],
    appliedDiscountCode: 'FESTIVE20',
    discountAmount: 14860,
    closureRules: {
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    },
    notes: 'Key enterprise account. Custom GST details attached.',
    createdAt: '2026-01-15T10:30:00Z',
    healthScore: 94,
    churnRisk: 'LOW'
  },
  {
    id: 'sub_002',
    number: 'SUB-2026-002',
    customerId: 'usr_customer2',
    customerName: 'Wipro Digital Systems',
    customerEmail: 'accounts@wiprodigital.in',
    customerGstin: '27AAACW5678J1ZB',
    planId: 'plan_monthly_std',
    planName: 'Standard Business Monthly',
    billingFrequency: 'MONTHLY',
    startDate: '2026-03-01',
    nextBillingDate: '2026-11-05',
    expiryDate: '2027-02-28',
    paymentTerms: 'Due on Receipt',
    status: 'CONFIRMED',
    lines: [
      {
        id: 'sub_line_3',
        productId: 'prod_erp',
        productName: 'Brightloop Business ERP Core',
        quantity: 2,
        unitPrice: 12500,
        taxPercent: 18,
        discountAmount: 0,
        totalAmount: 25000
      }
    ],
    closureRules: {
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    },
    createdAt: '2026-03-01T14:15:00Z',
    healthScore: 38,
    churnRisk: 'HIGH'
  },
  {
    id: 'sub_003',
    number: 'SUB-2026-003',
    customerId: 'usr_customer3',
    customerName: 'TCS Enterprise Services',
    customerEmail: 'finance@tcs-enterprise.com',
    customerGstin: '07AAACT9012K1Z3',
    planId: 'plan_annual_growth',
    planName: 'Growth Enterprise Annual',
    billingFrequency: 'YEARLY',
    startDate: '2026-11-01',
    nextBillingDate: '2026-11-01',
    paymentTerms: 'Net 30',
    status: 'QUOTATION',
    lines: [
      {
        id: 'sub_line_4',
        productId: 'prod_crm',
        productName: 'Brightloop CRM Pro',
        variantId: 'var_whatsapp',
        variantName: 'WhatsApp Business API Sync (+₹1500)',
        quantity: 15,
        unitPrice: 8300,
        taxPercent: 18,
        discountAmount: 12450,
        totalAmount: 112050
      },
      {
        id: 'sub_line_4_b',
        productId: 'prod_ai_engine',
        productName: 'Advanced AI Predictive Analytics Engine',
        quantity: 1,
        unitPrice: 4800,
        taxPercent: 18,
        discountAmount: 0,
        totalAmount: 4800
      }
    ],
    closureRules: {
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    },
    notes: 'Quotation sent via sales rep Rahul V.',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'sub_004',
    number: 'SUB-2026-004',
    customerId: 'usr_customer4',
    customerName: 'Shree Ram Enterprises',
    customerEmail: 'shreeram.shop@gmail.com',
    customerGstin: '33ABCDE1234F1Z9',
    planId: 'plan_startup_starter',
    planName: 'Small Shop Startup Starter',
    billingFrequency: 'MONTHLY',
    startDate: '2026-11-10',
    nextBillingDate: '2026-11-10',
    paymentTerms: 'Net 15',
    status: 'ACTIVE',
    lines: [
      {
        id: 'sub_line_5',
        productId: 'prod_branch_sync',
        productName: 'Multi-Tenant Branch Expansion Sync',
        quantity: 1,
        unitPrice: 2900,
        taxPercent: 18,
        discountAmount: 0,
        totalAmount: 2900
      }
    ],
    closureRules: {
      autoCloseOnEnd: true,
      allowEarlyClose: false,
      allowPause: true,
      allowRenew: true
    },
    createdAt: '2026-10-28T11:20:00Z'
  },
  {
    id: 'sub_005',
    number: 'SUB-2026-005',
    customerId: 'usr_customer1',
    customerName: 'Infosys Tech Solutions',
    customerEmail: 'billing@infosystechnologies.com',
    customerGstin: '29AAACI1234H1Z5',
    planId: 'plan_monthly_std',
    planName: 'Standard Business Monthly',
    billingFrequency: 'MONTHLY',
    startDate: '2026-05-01',
    nextBillingDate: '2026-12-01',
    paymentTerms: 'Net 15',
    status: 'PAUSED',
    lines: [
      {
        id: 'sub_line_6',
        productId: 'prod_crm',
        productName: 'Brightloop CRM Pro',
        quantity: 5,
        unitPrice: 6800,
        taxPercent: 18,
        discountAmount: 0,
        totalAmount: 34000
      }
    ],
    closureRules: {
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    },
    notes: 'Temporarily paused during Q4 restructuring.',
    createdAt: '2026-05-01T08:00:00Z'
  },
  {
    id: 'sub_006',
    number: 'SUB-2026-006',
    customerId: 'usr_customer2',
    customerName: 'Wipro Digital Systems',
    customerEmail: 'accounts@wiprodigital.in',
    planId: 'plan_weekly_sprint',
    planName: 'Weekly Sprint Trial',
    billingFrequency: 'WEEKLY',
    startDate: '2026-09-01',
    nextBillingDate: '2026-09-08',
    expiryDate: '2026-09-08',
    paymentTerms: 'Due on Receipt',
    status: 'CLOSED',
    lines: [
      {
        id: 'sub_line_7',
        productId: 'prod_api',
        productName: 'Custom API Gateway Add-on',
        quantity: 2,
        unitPrice: 3500,
        taxPercent: 18,
        discountAmount: 0,
        totalAmount: 7000
      }
    ],
    closureRules: {
      autoCloseOnEnd: true,
      allowEarlyClose: true,
      allowPause: false,
      allowRenew: false
    },
    notes: 'Sprint ended naturally.',
    createdAt: '2026-09-01T09:00:00Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_089',
    invoiceNumber: 'INV-2026-089',
    subscriptionId: 'sub_001',
    subscriptionNumber: 'SUB-2026-001',
    customerId: 'usr_customer1',
    customerName: 'Infosys Tech Solutions',
    customerGstin: '29AAACI1234H1Z5',
    billingAddress: 'Electronics City Phase I, Outer Ring Road, Bengaluru, Karnataka 560100',
    issueDate: '2026-10-15',
    dueDate: '2026-11-15',
    status: 'CONFIRMED',
    subtotal: 133740,
    discountTotal: 14860,
    cgstTotal: 10699.2,
    sgstTotal: 10699.2,
    igstTotal: 0,
    taxTotal: 21398.4,
    totalAmount: 140278.4,
    amountPaid: 0,
    balanceDue: 140278.4,
    idempotencyKey: 'sub_001_2026-10-15',
    isInterState: false,
    lines: [
      {
        id: 'inv_line_1',
        productId: 'prod_erp',
        productName: 'Brightloop Business ERP Core (10 Seats + Odoo Addon)',
        quantity: 10,
        unitPrice: 13060,
        taxPercent: 18,
        cgstAmount: 9455.4,
        sgstAmount: 9455.4,
        igstAmount: 0,
        discountAmount: 13060,
        totalAmount: 117540
      },
      {
        id: 'inv_line_2',
        productId: 'prod_sla',
        productName: 'Enterprise Dedicated SLA 24/7',
        quantity: 1,
        unitPrice: 18000,
        taxPercent: 18,
        cgstAmount: 1243.8,
        sgstAmount: 1243.8,
        igstAmount: 0,
        discountAmount: 1800,
        totalAmount: 16200
      }
    ]
  },
  {
    id: 'inv_088',
    invoiceNumber: 'INV-2026-088',
    subscriptionId: 'sub_002',
    subscriptionNumber: 'SUB-2026-002',
    customerId: 'usr_customer2',
    customerName: 'Wipro Digital Systems',
    customerGstin: '27AAACW5678J1ZB',
    billingAddress: 'BKC Bandra East, Mumbai, Maharashtra 400051',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    status: 'PAID',
    subtotal: 25000,
    discountTotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 4500,
    taxTotal: 4500,
    totalAmount: 29500,
    amountPaid: 29500,
    balanceDue: 0,
    idempotencyKey: 'sub_002_2026-10-01',
    paymentDate: '2026-10-05',
    isInterState: true,
    lines: [
      {
        id: 'inv_line_3',
        productId: 'prod_erp',
        productName: 'Brightloop Business ERP Core (2 Seats)',
        quantity: 2,
        unitPrice: 12500,
        taxPercent: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 4500,
        discountAmount: 0,
        totalAmount: 25000
      }
    ]
  },
  {
    id: 'inv_085',
    invoiceNumber: 'INV-2026-085',
    subscriptionId: 'sub_001',
    subscriptionNumber: 'SUB-2026-001',
    customerId: 'usr_customer1',
    customerName: 'Infosys Tech Solutions',
    customerGstin: '29AAACI1234H1Z5',
    billingAddress: 'Electronics City Phase I, Outer Ring Road, Bengaluru, Karnataka 560100',
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'CONFIRMED',
    subtotal: 133740,
    discountTotal: 0,
    cgstTotal: 12036.6,
    sgstTotal: 12036.6,
    igstTotal: 0,
    taxTotal: 24073.2,
    totalAmount: 157813.2,
    amountPaid: 0,
    balanceDue: 157813.2,
    idempotencyKey: 'sub_001_2026-09-01',
    isInterState: false,
    lines: [
      {
        id: 'inv_line_4',
        productId: 'prod_erp',
        productName: 'Brightloop Business ERP Core (10 Seats)',
        quantity: 10,
        unitPrice: 12500,
        taxPercent: 18,
        cgstAmount: 11250,
        sgstAmount: 11250,
        igstAmount: 0,
        discountAmount: 0,
        totalAmount: 125000
      }
    ]
  },
  {
    id: 'inv_084',
    invoiceNumber: 'INV-2026-084',
    subscriptionId: 'sub_004',
    subscriptionNumber: 'SUB-2026-004',
    customerId: 'usr_customer4',
    customerName: 'Shree Ram Enterprises',
    customerGstin: '33ABCDE1234F1Z9',
    billingAddress: 'T Nagar, Chennai, Tamil Nadu 600017',
    issueDate: '2026-10-28',
    dueDate: '2026-11-12',
    status: 'CONFIRMED',
    subtotal: 2900,
    discountTotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 522,
    taxTotal: 522,
    totalAmount: 3422,
    amountPaid: 0,
    balanceDue: 3422,
    idempotencyKey: 'sub_004_2026-10-28',
    isInterState: true,
    lines: [
      {
        id: 'inv_line_5',
        productId: 'prod_branch_sync',
        productName: 'Multi-Tenant Branch Expansion Sync',
        quantity: 1,
        unitPrice: 2900,
        taxPercent: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 522,
        discountAmount: 0,
        totalAmount: 2900
      }
    ]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_042',
    invoiceId: 'inv_088',
    invoiceNumber: 'INV-2026-088',
    customerId: 'usr_customer2',
    customerName: 'Wipro Digital Systems',
    amount: 29500,
    method: 'UPI',
    paymentDate: '2026-10-05',
    transactionRef: 'UPI/6483920192/AXIS',
    notes: 'Paid in full via Axis Bank UPI QR code.',
    recordedBy: 'Rahul Verma'
  }
];

export const INITIAL_DISCOUNTS: DiscountRule[] = [
  {
    id: 'disc_festive',
    code: 'FESTIVE20',
    title: 'Diwali Festival Enterprise Discount',
    type: 'PERCENTAGE',
    value: 20,
    minSpend: 100000,
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    maxUsageLimit: 50,
    usedCount: 12,
    isActive: true
  },
  {
    id: 'disc_flat5k',
    code: 'FLAT5000',
    title: 'SME Startup Launch Incentive',
    type: 'FIXED',
    value: 5000,
    minSpend: 20000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    maxUsageLimit: 20,
    usedCount: 8,
    isActive: true
  }
];
