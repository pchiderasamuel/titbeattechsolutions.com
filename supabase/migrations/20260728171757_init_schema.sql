-- 1. Billing state tracker
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT NOT NULL,
    plan_tier TEXT,
    country TEXT,
    state TEXT,
    lga TEXT,
    address TEXT,
    subscription_status TEXT,
    paystack_customer_code TEXT,
    paystack_subscription_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Local User tracker
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    admin_email TEXT NOT NULL,
    admin_name TEXT,
    role TEXT,
    school_id UUID REFERENCES public.schools(id),
    subscription_status TEXT,
    must_reset_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Idempotency tracker for Paystack
CREATE TABLE public.processed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Failure Logs
CREATE TABLE public.provisioning_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT,
    school_name TEXT,
    plan_tier TEXT,
    paystack_customer_code TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.email_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT,
    school_id UUID,
    failure_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
