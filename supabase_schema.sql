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


-- ============================================================================
-- 16. Supabase Native Authentication (auth.users) Synchronization Trigger
-- Automatically synchronizes users created via Supabase Auth into public.users
-- and public.customer_profiles with role and company metadata.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val public.user_role;
BEGIN
    -- Safely determine role enum
    BEGIN
        user_role_val := COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER')::public.user_role;
    EXCEPTION WHEN OTHERS THEN
        user_role_val := 'CUSTOMER'::public.user_role;
    END;

    -- Insert or update public.users
    INSERT INTO public.users (
        id,
        email,
        password_hash,
        role,
        name,
        phone,
        company_name,
        gstin,
        address,
        is_active
    )
    VALUES (
        NEW.id,
        NEW.email,
        'SUPABASE_AUTH',
        user_role_val,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'gstin',
        NEW.raw_user_meta_data->>'address',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name),
        company_name = COALESCE(EXCLUDED.company_name, public.users.company_name),
        gstin = COALESCE(EXCLUDED.gstin, public.users.gstin),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        address = COALESCE(EXCLUDED.address, public.users.address),
        updated_at = NOW();

    -- If role is CUSTOMER, ensure customer_profiles is populated
    IF user_role_val = 'CUSTOMER' THEN
        INSERT INTO public.customer_profiles (
            user_id,
            company_name,
            gstin,
            billing_address
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'gstin',
            COALESCE(NEW.raw_user_meta_data->>'address', 'India')
        )
        ON CONFLICT (user_id) DO UPDATE SET
            company_name = COALESCE(EXCLUDED.company_name, public.customer_profiles.company_name),
            gstin = COALESCE(EXCLUDED.gstin, public.customer_profiles.gstin),
            billing_address = COALESCE(EXCLUDED.billing_address, public.customer_profiles.billing_address);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger runs whenever a user is added to auth.users (via SignUp, Dashboard, or SQL)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ============================================================================
-- 17. Seed Admin & Enterprise Roles Directly into auth.users (Supabase Auth)
-- Compatible with all Supabase PostgreSQL versions (Uses WHERE NOT EXISTS)
-- Passwords:
-- Admin: Admin@2026!
-- Finance / Staff: Brightloop@2026!
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 17.1 Admin User in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@brightloop.io',
    extensions.crypt('Admin@2026!', extensions.gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"System Administrator","role":"ADMIN","company_name":"Brightloop Software Pvt Ltd","phone":"+91 9876543210"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@brightloop.io'
);

-- Ensure password and email_confirmed_at are set if already present
UPDATE auth.users
SET encrypted_password = extensions.crypt('Admin@2026!', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = '{"name":"System Administrator","role":"ADMIN","company_name":"Brightloop Software Pvt Ltd","phone":"+91 9876543210"}'::jsonb
WHERE email = 'admin@brightloop.io';

-- 17.2 auth.identities for Admin (Safe insert without ON CONFLICT error)
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@brightloop.io"}'::jsonb,
    'email',
    'a0000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
);

-- 17.3 Finance Lead in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'finance@brightloop.io',
    extensions.crypt('Brightloop@2026!', extensions.gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Priya Sharma","role":"FINANCE_LEAD","company_name":"Brightloop Software Pvt Ltd"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'finance@brightloop.io'
);

UPDATE auth.users
SET encrypted_password = extensions.crypt('Brightloop@2026!', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'finance@brightloop.io';

INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    '{"sub":"a0000000-0000-0000-0000-000000000002","email":"finance@brightloop.io"}'::jsonb,
    'email',
    'a0000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = 'a0000000-0000-0000-0000-000000000002'
);

-- 17.4 Sales Staff in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'sales@brightloop.io',
    extensions.crypt('Brightloop@2026!', extensions.gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Rajesh Kumar","role":"STAFF","company_name":"Brightloop Software Pvt Ltd"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'sales@brightloop.io'
);

UPDATE auth.users
SET encrypted_password = extensions.crypt('Brightloop@2026!', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'sales@brightloop.io';

INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    '{"sub":"a0000000-0000-0000-0000-000000000003","email":"sales@brightloop.io"}'::jsonb,
    'email',
    'a0000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = 'a0000000-0000-0000-0000-000000000003'
);


-- ============================================================================
-- 18. INITIAL SEED: MASTER CATALOG & VARIANT PRICING ENGINE (PHASE 2)
-- ============================================================================

-- A. Products (Core Software Offerings & Professional Services)
INSERT INTO products (id, name, type, sales_price, cost_price, notes, hsn_sac_code)
VALUES
    ('b0000000-0000-4000-8000-000000000001', 'Brightloop Business ERP Core', 'SOFTWARE', 12500.00, 3200.00, 'Core enterprise ERP application with Inventory, Invoicing, and HR operations.', '998313'),
    ('b0000000-0000-4000-8000-000000000002', 'Brightloop CRM Pro', 'SOFTWARE', 6800.00, 1800.00, 'Omnichannel CRM software with lead pipelines and deal analytics.', '998314'),
    ('b0000000-0000-4000-8000-000000000003', 'Enterprise Dedicated SLA 24/7', 'SERVICE', 18000.00, 5000.00, 'Guaranteed 15-minute response time with dedicated technical engineer.', '998315'),
    ('b0000000-0000-4000-8000-000000000004', 'Enterprise API & Webhook Engine', 'ADDON', 3500.00, 900.00, 'High-throughput REST and Webhook gateway.', '998316')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    sales_price = EXCLUDED.sales_price,
    cost_price = EXCLUDED.cost_price,
    notes = EXCLUDED.notes;

-- B. Product Variants (Dynamic Price Adjustments: Base + Variant)
INSERT INTO product_variants (id, product_id, attribute_name, variant_name, price_adjustment)
VALUES
    ('b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Brand Integration', 'Odoo Brand Integration Add-on', 560.00),
    ('b1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Forex Engine', 'Multi-Currency & Forex Ledger', 1200.00),
    ('b1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'Staffing', 'Dedicated Technical Account Manager', 8000.00)
ON CONFLICT (id) DO UPDATE
SET variant_name = EXCLUDED.variant_name,
    price_adjustment = EXCLUDED.price_adjustment;

-- C. Billing Cadences & Plans (Daily, Weekly, Monthly, Yearly + Plan Closure Rules)
INSERT INTO billing_plans (id, name, frequency, base_price, min_quantity, start_date, auto_close_on_end, allow_early_close, allow_pause, allow_renew)
VALUES
    ('c0000000-0000-4000-8000-000000000001', 'Standard Business Monthly', 'MONTHLY', 12500.00, 1, '2026-01-01', FALSE, TRUE, TRUE, TRUE),
    ('c0000000-0000-4000-8000-000000000002', 'Growth Enterprise Annual', 'YEARLY', 120000.00, 5, '2026-01-01', FALSE, TRUE, TRUE, TRUE),
    ('c0000000-0000-4000-8000-000000000003', 'Small Shop Startup Starter', 'MONTHLY', 4999.00, 1, '2026-01-01', TRUE, FALSE, TRUE, TRUE),
    ('c0000000-0000-4000-8000-000000000004', 'Weekly Sprint Trial', 'WEEKLY', 1500.00, 1, '2026-01-01', TRUE, TRUE, FALSE, FALSE),
    ('c0000000-0000-4000-8000-000000000005', 'Daily Enterprise POC', 'DAILY', 500.00, 1, '2026-01-01', TRUE, TRUE, FALSE, FALSE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    frequency = EXCLUDED.frequency,
    base_price = EXCLUDED.base_price,
    min_quantity = EXCLUDED.min_quantity,
    auto_close_on_end = EXCLUDED.auto_close_on_end,
    allow_early_close = EXCLUDED.allow_early_close,
    allow_pause = EXCLUDED.allow_pause,
    allow_renew = EXCLUDED.allow_renew;
