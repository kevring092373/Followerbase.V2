# Viva Wallet (Kreditkarte) – Einrichtung

Kartenzahlung läuft über Viva. **Auf Netlify (Live)** wird Supabase für Viva-Pending-Checkouts benötigt – die Datei `content/viva-pending.json` ist dort read-only. Führe im Supabase SQL Editor die Migration **`supabase/migrations/003_viva_pending_checkouts.sql`** aus, falls noch nicht geschehen.

---

## 1. Umgebungsvariablen

Trage in **`.env.local`** (lokal) bzw. in **Netlify → Site settings → Environment variables** (Live) ein:

| Variable | Beschreibung |
|----------|--------------|
| `VIVA_CLIENT_ID` | Client ID aus dem Viva Dashboard (siehe unten) |
| `VIVA_CLIENT_SECRET` | Client Secret / API Key aus dem Viva Dashboard |
| `VIVA_DEMO` | Optional: `true` = Demo-Umgebung, weglassen = Live |
| `VIVA_SOURCE_CODE` | Optional: Source Code deiner „Payment Source“ für Online-Zahlungen |

**Wo finde ich Client ID und Secret?**

- Im **Viva Dashboard** (demo.vivapayments.com oder www.vivapayments.com) einloggen.
- Gehe zu **Settings** (oder **Einstellungen**) → **API Access** / **Apps**.
- Dort findest du die Zugangsdaten für **Smart Checkout** / **Redirect Checkout** (Client ID und Client Secret).
- Falls du mit **Merchant ID + API Key** arbeitest: Viva unterstützt auch OAuth mit Client ID + Secret; die Anleitung und der Code nutzen diese Variablen.

---

## 2. Payment Source (Online-Zahlungen) im Viva Dashboard

Damit die Weiterleitung zur Zahlungsseite und die Rückleitung funktionieren:

1. Im Viva Dashboard: **Sales** → **Online payments** → **Websites/Apps** (oder vergleichbar).
2. Eine **Payment Source** für deine Website anlegen (falls noch nicht geschehen).
3. **Success URL** setzen – **genau diese URL** eintragen:
   ```
   https://DEINE-DOMAIN.de/kasse/viva/success
   ```
   Beispiele:
   - Live: `https://followerbase.de/kasse/viva/success`
   - Lokal testen: `https://dein-ngrok-oder-tunnel.de/kasse/viva/success`
4. Optional: **Failure/Cancel URL** auf z. B. `https://DEINE-DOMAIN.de/checkout` setzen.
5. Den **Source Code** dieser Payment Source (falls du mehrere nutzt) in `VIVA_SOURCE_CODE` in der .env eintragen.

---

## 3. Kurzablauf

- Kunde wählt an der Kasse **„Kreditkarte (Viva)“** und klickt auf **„Zur Kartenzahlung (Viva)“**.
- Dein Server erstellt eine Viva Payment Order und leitet den Kunden zur Viva-Zahlungsseite weiter.
- Nach erfolgreicher Zahlung leitet Viva den Kunden auf **Success URL** weiter (mit Parameter `t=TransactionId`).
- Deine Seite `/kasse/viva/success` prüft die Transaktion, legt die Bestellung an und leitet zur Danke-Seite weiter (inkl. E-Mail an Kunde und an info@followerbase.de).

---

## 4. Checkliste

- [ ] `VIVA_CLIENT_ID` und `VIVA_CLIENT_SECRET` in .env.local / Netlify gesetzt
- [ ] Success URL im Viva Dashboard = `https://DEINE-DOMAIN.de/kasse/viva/success`
- [ ] Optional: `VIVA_SOURCE_CODE` gesetzt, falls du eine bestimmte Payment Source nutzt
- [ ] Für Live: `VIVA_DEMO` weglassen oder auf `false`; für Tests: `VIVA_DEMO=true`

Wenn etwas nicht funktioniert: Server-Logs (lokal bzw. Netlify Functions/Logs) prüfen; Viva sendet dort keine sensiblen Kartendaten, aber Fehlermeldungen der API.
