# Supabase einrichten

## 1. Tabellen anlegen

1. Im [Supabase Dashboard](https://supabase.com/dashboard) dein Projekt öffnen.
2. Links **SQL Editor** wählen → **New query**.
3. Den kompletten Inhalt von `schema.sql` in das Fenster kopieren und **Run** ausführen.

Damit werden angelegt:

- **customers** – Kundendaten (E-Mail, Name, Telefon, Adresse)
- **orders** – Bestellungen (mit optionalem Verweis auf `customers`)
- **order_items** – Bestellpositionen

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

Die Kundendaten werden im Code über `lib/customers-data.ts` und den Server-Client `lib/supabase/server.ts` genutzt.
