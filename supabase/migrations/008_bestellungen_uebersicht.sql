-- Ziel-Angaben der Kunden (Nutzername, Profil- oder Beitragslink) direkt in Supabase sichtbar machen.
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.
--
-- Die Angabe steht schon immer in order_items.target, nur eben in der Kindtabelle.
-- Diese beiden Ansichten zeigen sie zusammen mit der Bestellung – ohne Daten zu duplizieren,
-- rückwirkend auch für alle bereits vorhandenen Bestellungen.
--
-- Hinweis: security_invoker setzt PostgreSQL 15+ voraus (bei Supabase Standard).
-- Auf älteren Projekten die Zeile "WITH (security_invoker = on)" entfernen.

-- 1) Eine Zeile pro Bestellung, alle Ziele der Positionen zusammengefasst.
CREATE OR REPLACE VIEW bestellungen_uebersicht
WITH (security_invoker = on) AS
SELECT
  o.order_number                    AS bestellnummer,
  o.created_at                      AS bestellt_am,
  o.status,
  o.payment_method                  AS zahlungsart,
  ROUND(o.total_cents / 100.0, 2)   AS betrag_eur,
  o.customer_email                  AS kunde_email,
  o.customer_name                   AS kunde_name,
  pos.anzahl_positionen,
  pos.ziele,
  o.seller_note                     AS nachricht_kunde,
  o.remarks                         AS bemerkungen,
  o.id                              AS order_id
FROM orders o
LEFT JOIN LATERAL (
  SELECT
    count(*) AS anzahl_positionen,
    string_agg(
      oi.product_name || ' (' || oi.quantity || '): ' || oi.target,
      E'\n' ORDER BY oi.created_at
    ) AS ziele
  FROM order_items oi
  WHERE oi.order_id = o.id
) pos ON true
ORDER BY o.created_at DESC;

COMMENT ON VIEW bestellungen_uebersicht IS 'Bestellungen mit zusammengefassten Ziel-Angaben (Nutzername/Profil-/Beitragslink) der Positionen';

-- 2) Eine Zeile pro Bestellposition – praktisch zum Abarbeiten der Aufträge.
CREATE OR REPLACE VIEW bestellpositionen_uebersicht
WITH (security_invoker = on) AS
SELECT
  o.order_number                    AS bestellnummer,
  o.created_at                      AS bestellt_am,
  o.status,
  o.customer_email                  AS kunde_email,
  oi.product_name                   AS produkt,
  oi.quantity                       AS menge,
  oi.target                         AS ziel,
  ROUND(oi.price_cents / 100.0, 2)  AS preis_eur,
  oi.product_slug,
  o.id                              AS order_id
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
ORDER BY o.created_at DESC, oi.created_at ASC;

COMMENT ON VIEW bestellpositionen_uebersicht IS 'Einzelne Bestellpositionen mit Ziel-Angabe des Kunden';

-- Absichtlich nur service_role – die Ansichten sollen nicht öffentlich lesbar sein.
GRANT SELECT ON bestellungen_uebersicht TO service_role;
GRANT SELECT ON bestellpositionen_uebersicht TO service_role;

-- Schnelleres Nachladen der Positionen für die Admin-Liste.
CREATE INDEX IF NOT EXISTS order_items_created_at_idx ON order_items (created_at);
