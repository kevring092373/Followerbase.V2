# Supabase einrichten

## 1. Tabellen anlegen

1. Im [Supabase Dashboard](https://supabase.com/dashboard) dein Projekt öffnen.
2. Links **SQL Editor** wählen → **New query**.
3. Den kompletten Inhalt von `schema.sql` in das Fenster kopieren und **Run** ausführen.

Damit werden angelegt:

- **customers** – Kundendaten (E-Mail, Name, Telefon, Adresse)
- **orders** – Bestellungen (inkl. Zahlungsart und Kundendaten für die Live-Seite)
- **order_items** – Bestellpositionen

**Falls du `schema.sql` schon früher ausgeführt hast:** Zusätzlich die Migrationen ausführen:
- `migrations/001_orders_payment_and_customer.sql` – Spalten für Zahlungsart und Kundendaten in `orders`
- `migrations/002_pending_checkouts.sql` – Tabelle `pending_checkouts` (unbezahlte PayPal-Vorgänge), damit der Checkout auf Netlify funktioniert (read-only Dateisystem)
- `migrations/003_viva_pending_checkouts.sql` – Tabelle `viva_pending_checkouts` (unbezahlte Viva-Karten-Zahlungen), ebenfalls für Netlify nötig
- `migrations/004_products.sql` – Tabelle `products` (Shop-Produkte), damit Produkt-Updates im Admin auf Netlify funktionieren (read-only Dateisystem)

## 2. API-Keys in .env.local

In Supabase: **Project Settings** (Zahnrad) → **API**.

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- **service_role** (unter "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

Beispiel `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Hinweis:** Den `service_role`-Key nur serverseitig verwenden (niemals im Browser). Er umgeht Row Level Security (RLS).

## 3. Abhängigkeit installieren

Falls noch nicht geschehen:

```bash
npm install
```

- **Kundendaten** werden über `lib/customers-data.ts` genutzt.
- **Bestellungen** werden über `lib/orders-data.ts` und `lib/orders-supabase.ts` genutzt. Wenn Supabase konfiguriert ist (URL + Service-Role-Key), speichert die App alle neuen Bestellungen in Supabase und du kannst Status und Bemerkungen auch auf der **Live-Seite (Netlify)** bearbeiten.
