-- ============================================
-- Dubai Visa Application: Database Schema for Supabase
-- Run ALL of this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: core_country
-- ============================================
CREATE TABLE IF NOT EXISTS core_country (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_national_id_required BOOLEAN DEFAULT FALSE,
    content TEXT,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS core_countr_slug_8790d7_idx ON core_country (slug);
CREATE INDEX IF NOT EXISTS core_countr_is_acti_7e1857_idx ON core_country (is_active, is_national_id_required);

-- ============================================
-- TABLE: core_visatype
-- ============================================
CREATE TABLE IF NOT EXISTS core_visatype (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('single', 'multiple')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('tourist', 'transit', 'job_seeker', 'freelance')),
    processing_time VARCHAR(100),
    visa_validity VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS core_visaty_slug_ac5d03_idx ON core_visatype (slug);
CREATE INDEX IF NOT EXISTS core_visaty_categor_21c20b_idx ON core_visatype (category, is_active);

-- ============================================
-- TABLE: core_pricing
-- ============================================
CREATE TABLE IF NOT EXISTS core_pricing (
    id BIGSERIAL PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    citizen_country_id BIGINT NOT NULL REFERENCES core_country(id) ON DELETE CASCADE,
    visa_type_id BIGINT NOT NULL REFERENCES core_visatype(id) ON DELETE CASCADE,
    travelling_from_country_id BIGINT REFERENCES core_country(id) ON DELETE CASCADE,
    destination_id BIGINT REFERENCES core_destination(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS core_pricin_visa_ty_unique ON core_pricing (visa_type_id, citizen_country_id, travelling_from_country_id, destination_id);
CREATE INDEX IF NOT EXISTS core_pricin_visa_ty_800bcd_idx ON core_pricing (visa_type_id, citizen_country_id);

-- ============================================
-- TABLE: core_destination
-- ============================================
CREATE TABLE IF NOT EXISTS core_destination (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    processing_time VARCHAR(100) NOT NULL DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: core_blogpost
-- ============================================
CREATE TABLE IF NOT EXISTS core_blogpost (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    cover_image VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: applications_application
-- ============================================
CREATE TABLE IF NOT EXISTS applications_application (
    id BIGSERIAL PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    passport_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    national_id_number VARCHAR(50),
    passport_file VARCHAR(500),
    photo_file VARCHAR(500),
    national_id_file VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visa_type_id BIGINT NOT NULL REFERENCES core_visatype(id) ON DELETE CASCADE,
    citizen_country_id BIGINT NOT NULL REFERENCES core_country(id) ON DELETE CASCADE,
    travelling_from_country_id BIGINT REFERENCES core_country(id) ON DELETE CASCADE,
    destination_id BIGINT REFERENCES core_destination(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS application_referen_56abf0_idx ON applications_application (reference_number);
CREATE INDEX IF NOT EXISTS application_status_c17d0b_idx ON applications_application (status, payment_status);
CREATE INDEX IF NOT EXISTS application_created_c6d08d_idx ON applications_application (created_at);

-- ============================================
-- TABLE: applications_payment
-- ============================================
CREATE TABLE IF NOT EXISTS applications_payment (
    id BIGSERIAL PRIMARY KEY,
    stripe_payment_intent_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    application_id BIGINT NOT NULL UNIQUE REFERENCES applications_application(id) ON DELETE CASCADE
);

-- NOTE: payments.PaymentIntent was removed; payment tracking lives in
-- applications_payment. No payments_* tables needed.

-- ============================================
-- SEED DATA: Countries
-- ============================================
INSERT INTO core_country (name, slug, is_national_id_required, is_active) VALUES
('India', 'india-citizens', FALSE, TRUE),
('Pakistan', 'pakistan-citizens', TRUE, TRUE),
('Iran', 'iran-citizens', TRUE, TRUE),
('UK', 'uk-citizens', FALSE, TRUE),
('USA', 'usa-citizens', FALSE, TRUE),
('UAE', 'uae-citizens', FALSE, TRUE),
('Canada', 'canada-citizens', FALSE, TRUE),
('Australia', 'australia-citizens', FALSE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Visa Types
-- ============================================
INSERT INTO core_visatype (name, slug, duration_days, entry_type, category, processing_time, visa_validity, is_active) VALUES
('14 Days Dubai Visa - Single Entry', '14-days-single', 14, 'single', 'tourist', '2-3 Days', '60 days from date of issue', TRUE),
('30 Days Dubai Visa - Multiple Entry', '30-days-multiple', 30, 'multiple', 'tourist', '3-5 Days', '90 days from date of issue', TRUE),
('96 Hours Transit Visa', '96-hours-transit', 4, 'single', 'transit', '1-2 Days', '8 days from date of issue', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Pricing
-- ============================================
-- NOTE: no demo rates seeded on purpose. Add real pricing per
-- (visa x citizen x travelling-from x destination) via Django Admin >
-- Pricing. Countries/visas without pricing show the "contact us"
-- empty state on the site.

-- ============================================
-- SEED DATA: Destinations
-- ============================================
INSERT INTO core_destination (name, slug, country, processing_time, is_active) VALUES
('Dubai', 'dubai', 'UAE', '2-3 Days', TRUE),
('Qatar', 'qatar', 'Qatar', '3-5 Days', TRUE),
('UAE', 'uae', 'UAE', '2-4 Days', TRUE),
('Egypt', 'egypt', 'Egypt', '5-7 Days', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Verify
-- ============================================
SELECT 'Countries: ' || COUNT(*) FROM core_country;
SELECT 'Visa Types: ' || COUNT(*) FROM core_visatype;
SELECT 'Destinations: ' || COUNT(*) FROM core_destination;
SELECT 'Pricing: ' || COUNT(*) FROM core_pricing;
SELECT 'Tables created successfully!' AS status;
