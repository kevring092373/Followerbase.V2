-- Pending Checkouts (unbezahlte PayPal-Vorgänge) – für Netlify/Live-Seite (read-only Dateisystem)
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.

CREATE TABLE IF NOT EXISTS pending_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_order_id TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  total_cents INT NOT NULL DEFAULT 0,
  seller_note TEXT,
  customer JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pending_checkouts_paypal_order_id_key ON pending_checkouts (paypal_order_id);
CREATE INDEX IF NOT EXISTS pending_checkouts_created_at_idx ON pending_checkouts (created_at DESC);

COMMENT ON TABLE pending_checkouts IS 'Unbezahlte PayPal-Checkouts (Warenkorb/Kasse) – wird nach Capture gelöscht';
