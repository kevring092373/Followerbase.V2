-- Bestellbetrag in Cent für Anzeige in Supabase (z. B. Dashboard)
-- Falls die Tabelle orders ohne total_cents angelegt wurde (nur schema.sql hatte die Spalte).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_cents INT;
COMMENT ON COLUMN orders.total_cents IS 'Bestellbetrag in Cent (z. B. 1050 = 10,50 €)';
