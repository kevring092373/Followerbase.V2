-- Bestehende orders-Tabelle um Zahlungsart und Kundendaten (Denormalisierung) erweitern.
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.
-- Nur nötig, wenn du schema.sql bereits vor dieser Änderung ausgeführt hast.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_line1 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_country TEXT;

COMMENT ON COLUMN orders.payment_method IS 'paypal oder ueberweisung';
COMMENT ON COLUMN orders.customer_email IS 'E-Mail aus Checkout (Denormalisierung)';
