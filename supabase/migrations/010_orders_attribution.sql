-- First-Touch-Herkunft der Bestellung (Google, Bing, Direkt, …)
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS attribution JSONB;
COMMENT ON COLUMN orders.attribution IS 'First-Touch-Herkunft (source, landing, UTM) – nur intern/Admin, nicht öffentliche Verfolgung';

ALTER TABLE pending_checkouts ADD COLUMN IF NOT EXISTS attribution JSONB;
COMMENT ON COLUMN pending_checkouts.attribution IS 'First-Touch-Herkunft, wird nach PayPal-Capture in orders übernommen';

ALTER TABLE viva_pending_checkouts ADD COLUMN IF NOT EXISTS attribution JSONB;
COMMENT ON COLUMN viva_pending_checkouts.attribution IS 'First-Touch-Herkunft, wird nach Viva-Zahlung in orders übernommen';
