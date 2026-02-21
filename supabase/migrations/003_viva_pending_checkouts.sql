-- Viva-Pending-Checkouts (unbezahlte Karten-Zahlungen) – für Netlify (read-only Dateisystem)
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.

CREATE TABLE IF NOT EXISTS viva_pending_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viva_order_code BIGINT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  total_cents INT NOT NULL DEFAULT 0,
  seller_note TEXT,
  customer JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS viva_pending_checkouts_order_code_key ON viva_pending_checkouts (viva_order_code);
CREATE INDEX IF NOT EXISTS viva_pending_checkouts_created_at_idx ON viva_pending_checkouts (created_at DESC);

COMMENT ON TABLE viva_pending_checkouts IS 'Unbezahlte Viva-Checkouts – wird nach erfolgreicher Zahlung in Bestellung überführt und gelöscht';
