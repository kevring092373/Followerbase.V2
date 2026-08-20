# Viva Wallet (Kreditkarte) – Einrichtung

Kartenzahlung läuft über Viva. **Auf Netlify (Live)** wird Supabase für Viva-Pending-Checkouts benötigt – die Datei `content/viva-pending.json` ist dort read-only. Führe im Supabase SQL Editor die Migration **`supabase/migrations/003_viva_pending_checkouts.sql`** aus, falls noch nicht geschehen.

**Live-Webseite:** Im Viva Dashboard ist die Payment Source für **followerbase.de** eingerichtet (Success URL, Domain Name, ggf. Failure URL). Für andere Domains die URLs entsprechend anpassen.

---

## 1. Umgebungsvariablen

Trage in **`.env.local`** (lokal) bzw. in **Netlify → Site settings → Environment variables** (Live) ein:

| Variable | Beschreibung |
|----------|--------------|
| `VIVA_CLIENT_ID` | Client ID aus dem Viva Dashboard (siehe unten) |
| `VIVA_CLIENT_SECRET` | Client Secret / API Key aus dem Viva Dashboard |
| `VIVA_DEMO` | Optional: `true` = Demo-Umgebung, weglassen = Live |
| `VIVA_SOURCE_CODE` | 4-stelliger Source Code der Payment Source. Für followerbase.de: **7889**. |

**Wo finde ich Client ID und Secret?**

- Im **Viva Dashboard** (demo.vivapayments.com oder www.vivapayments.com) einloggen.
- Gehe zu **Settings** (oder **Einstellungen**) → **API Access** / **Apps**.
- Dort findest du die Zugangsdaten für **Smart Checkout** / **Redirect Checkout** (Client ID und Client Secret).
- Falls du mit **Merchant ID + API Key** arbeitest: Viva unterstützt auch OAuth mit Client ID + Secret; die Anleitung und der Code nutzen diese Variablen.

---

## 2. Payment Source (Online-Zahlungen) im Viva Dashboard – **wichtig**

**Ohne korrekte Success URL bleibt der Kunde nach der Zahlung auf der Viva-Seite, und es wird keine Bestellung angelegt und keine E-Mail versendet.**

1. Im Viva Dashboard: **Sales** → **Online payments** → **Websites/Apps**.
2. Deine **Payment Source** für die Website auswählen (oder neu anlegen).
3. **Success URL** – **exakt** so eintragen (deine echte Domain verwenden):
   ```
   https://DEINE-DOMAIN.de/kasse/viva/success
   ```
   Beispiele:
   - **Live:** `https://followerbase.de/kasse/viva/success`
   - Mit www: `https://www.followerbase.de/kasse/viva/success` (nur wenn deine Site wirklich mit www läuft)
   - **Nur HTTPS**, keine Leerzeichen, kein Slash am Ende.
4. **Domain Name** in derselben Payment Source muss zu deiner Website passen (z. B. `followerbase.de` ohne https://).
5. **Failure URL** (optional): `https://DEINE-DOMAIN.de/checkout` – dann landet der Kunde bei Abbruch wieder im Checkout.
6. Änderungen **speichern**. **Source Code** (4 Ziffern oben links in der Payment Source) in Netlify als `VIVA_SOURCE_CODE` eintragen – sonst kann Smart Checkout die Kartenoption ausblenden.

---

## 2b. Supabase: Viva-OrderCode als Text

Im Supabase SQL Editor einmal ausführen:

```sql
-- supabase/migrations/009_viva_order_code_text.sql
ALTER TABLE viva_pending_checkouts
  ALTER COLUMN viva_order_code TYPE TEXT USING viva_order_code::text;
```

Viva-OrderCodes sind 16-stellig. Als Zahl in JavaScript gehen Stellen verloren; die Zahlungsseite findet die Bestellung dann nicht.

---

## 3. Kurzablauf

- Kunde wählt an der Kasse **„Kreditkarte (Viva)“** und klickt auf **„Zur Kartenzahlung (Viva)“**.
- Dein Server erstellt eine Viva Payment Order und leitet den Kunden zur Viva-Zahlungsseite weiter.
- Nach erfolgreicher Zahlung leitet Viva den Kunden auf **Success URL** weiter (mit Parameter `t=TransactionId`).
- Deine Seite `/kasse/viva/success` prüft die Transaktion, legt die Bestellung an und leitet zur Danke-Seite weiter (inkl. E-Mail an Kunde und an info@followerbase.de).

---

## 4. E-Mails (Bestätigung + Benachrichtigung)

Die E-Mails (an den Kunden und an info@followerbase.de) werden **erst ausgelöst, wenn der Kunde nach der Zahlung auf unsere Success-URL weitergeleitet wird**. Dafür muss die Success URL in Viva (Schritt 2) korrekt gesetzt sein. Zusätzlich in Netlify setzen:

- `RESEND_API_KEY` – API-Key von Resend
- Optional: `EMAIL_FROM` – z. B. `Shop-Name <absender@deine-domain.de>` (Domain bei Resend verifizieren)

---

## 5. Checkliste

- [ ] `VIVA_CLIENT_ID` und `VIVA_CLIENT_SECRET` in .env.local / Netlify gesetzt
- [ ] **Success URL** im Viva Dashboard = `https://DEINE-DOMAIN.de/kasse/viva/success` (exakt, mit deiner Live-Domain)
- [ ] **Domain Name** in der Payment Source passt zu deiner Website
- [ ] **`VIVA_SOURCE_CODE`** = 4-stelliger Code der Payment Source für followerbase.de
- [ ] Für Live: `VIVA_DEMO` weglassen; für Tests: `VIVA_DEMO=true`
- [ ] Migration `009_viva_order_code_text.sql` in Supabase ausgeführt`
- [ ] `RESEND_API_KEY` (und ggf. `EMAIL_FROM`) in Netlify für E-Mails gesetzt

---

## 6. Troubleshooting

| Problem | Lösung |
|--------|--------|
| Kunde bleibt nach Zahlung auf der Viva-Seite | Success URL in der **Payment Source** (Sales → Online payments → Websites/Apps) prüfen. Muss **genau** `https://deine-domain.de/kasse/viva/success` sein (mit deiner echten Domain, HTTPS). Nach Änderung speichern. |
| Keine E-Mails | Erfolgt nur, wenn unsere Success-Seite aufgerufen wird (siehe oben). Zusätzlich: `RESEND_API_KEY` und ggf. `EMAIL_FROM` in Netlify prüfen; Resend-Domain verifizieren. |
| Kreditkarte: „Diese Karte wird nicht unterstützt“ | 1) **Visa, Mastercard oder Maestro** verwenden – deutsche Girocard ohne Visa-/Mastercard-Logo nimmt Viva nicht an. 2) In Netlify prüfen: `VIVA_DEMO` darf **nicht** `true` sein (sonst gelten nur Testkarten). 3) `VIVA_SOURCE_CODE` muss der **4-stellige Code der Website-Payment-Source** sein (Sales → Online payments → Websites/Apps), nicht eine Terminal-/Ladenkasse-Source. |
| Redirect zu /checkout?error=viva_verify | Transaktion konnte nicht verifiziert werden (z. B. Demo vs. Live vertauscht: `VIVA_DEMO` muss zu der Umgebung passen, in der die Zahlung lief). |
| Redirect zu /checkout?error=viva_order | Pending-Checkout nicht gefunden – Migration `003` und `009_viva_order_code_text.sql` in Supabase ausführen. |

Server-Logs (Netlify Functions / Build-Logs) prüfen; dort erscheinen API-Fehler (ohne Kartendaten).
