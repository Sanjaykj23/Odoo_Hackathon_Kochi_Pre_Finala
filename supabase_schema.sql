-- ============================================================================
-- Brightloop Software - Supabase PostgreSQL Schema Migration (Phase 1)
-- Event: Odoo Hackathon Kochi (Pre-Finals)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'FINANCE_LEAD', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('SOFTWARE', 'ADDON', 'SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('UPI', 'NET_BANKING', 'CREDIT_CARD', 'NEFT_RTGS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('FIXED', 'PERCENTAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Core Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(200),
    gstin VARCHAR(15),
    pan VARCHAR(10),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer Profiles (Tenant isolation)
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    billing_address TEXT NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'Karnataka',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type product_type NOT NULL DEFAULT 'SOFTWARE',
    sales_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    hsn_sac_code VARCHAR(10) DEFAULT '997331',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Product Variants (e.g. Odoo Brand +560)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name VARCHAR(50) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    price_adjustment NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 8. Billing Plans Table
CREATE TABLE IF NOT EXISTS billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    frequency billing_frequency NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL,
    min_quantity INT NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    auto_close_on_end BOOLEAN DEFAULT TRUE,
    allow_early_close BOOLEAN DEFAULT TRUE,
    allow_pause BOOLEAN DEFAULT TRUE,
    allow_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Quotation Templates
CREATE TABLE IF NOT EXISTS quotation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    plan_id UUID NOT NULL REFERENCES billing_plans(id),
    validity_days INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES quotation_templates(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00
);

-- 10. Discount Rules Table
CREATE TABLE IF NOT EXISTS discount_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    type discount_type NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(12, 2) DEFAULT 0.00,
    min_quantity INT DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_usage_limit INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id),
    plan_id UUID NOT NULL REFERENCES billing_plans(id),
    status subscription_status NOT NULL DEFAULT 'DRAFT',
    start_date DATE NOT NULL,
    expiry_date DATE,
    next_billing_date DATE NOT NULL,
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 15',
    applied_discount_id UUID REFERENCES discount_rules(id),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 12. Invoices Table (With Idempotency Lock)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cgst_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igst_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 13. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id),
    amount NUMERIC(12, 2) NOT NULL,
    method payment_method NOT NULL,
    payment_date DATE NOT NULL,
    transaction_ref VARCHAR(100) NOT NULL,
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Seed Initial Super Admin (Editable)
-- Replace with your own desired initial admin email & password hash if needed
INSERT INTO users (id, email, password_hash, role, name, phone, company_name, gstin)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@brightloop.io',
    'Admin@2026!',
    'ADMIN',
    'System Administrator',
    '+91 9876543210',
    'Brightloop Software Pvt Ltd',
    '29AAACB9999A1Z1'
)
ON CONFLICT (email) DO NOTHING;

-- 15. Disable RLS for Hackathon Development (Ensures Anon Key has read/write permissions)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_template_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE discount_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
