# E-Mail-Checkliste: Bestellbestätigung

Damit die Bestellbestätigung per E-Mail an den Kunden geht, musst du Folgendes prüfen.

---

## 1. Resend-Account und API-Key

- [ ] **Account:** Du hast dich unter [resend.com](https://resend.com) registriert.
- [ ] **API-Key:** In Resend: **API Keys** → **Create API Key** → Key kopieren (beginnt mit `re_`).
- [ ] **Lokal:** In deiner `.env.local` steht eine Zeile:
  ```
  RESEND_API_KEY=re_xxxxxxxxxxxx
  ```
  (ohne Anführungszeichen, kein Leerzeichen vor/nach dem `=`)

- [ ] **Live (Netlify):** In Netlify unter **Site configuration** → **Environment variables** ist `RESEND_API_KEY` mit dem gleichen Wert eingetragen. Nach dem Eintragen einmal **Trigger deploy** → **Clear cache and deploy** ausführen.

---

## 2. Absender (FROM) – wichtig bei Resend

- **Ohne eigene Domain:** Wenn du `EMAIL_FROM` **nicht** setzt, nutzt die App den Resend-Test-Absender `onboarding@resend.dev`.  
  **Einschränkung:** Mit diesem Absender darf Resend nur an **die E-Mail-Adresse deines Resend-Accounts** senden. Alle anderen Empfänger bekommen keine Mail (Resend blockiert das).

- **Mit eigener Domain (empfohlen für echten Shop):**
  - [ ] In Resend: **Domains** → Domain hinzufügen (z. B. `deinedomain.de`) und die angezeigten **DNS-Einträge** beim Domain-Anbieter eintragen.
  - [ ] Warten, bis die Domain als „Verified“ angezeigt wird.
  - [ ] In `.env.local` bzw. in Netlify **Environment variables** eintragen:
    ```
    EMAIL_FROM=Followerbase <bestellung@deinedomain.de>
    ```
    (Ersetze `deinedomain.de` durch deine echte Domain und ggf. den Namen.)

---

## 3. E-Mail-Adresse im Checkout

- [ ] Der Kunde gibt im Checkout eine **gültige E-Mail** ein (Pflichtfeld).
- [ ] Beim Testen: Wenn du mit `onboarding@resend.dev` sendest, **Empfänger = die E-Mail, mit der du dich bei Resend registriert hast**. Sonst kommt keine Mail an.

---

## 4. Wo die E-Mail ausgelöst wird

Die Bestellbestätigung wird automatisch gesendet:

- **PayPal:** Sobald die Zahlung bestätigt ist (nach Klick „Jetzt zahlen“ bei PayPal).
- **Überweisung:** Sobald der Kunde auf „Bestellung per Überweisung abschließen“ klickt.

Es gibt keinen extra Button „E-Mail senden“.

---

## 5. Fehlersuche (Logs)

- **Lokal:** Beim Test im Terminal (wo `npm run dev` läuft) erscheinen Meldungen wie:
  - `[email] RESEND_API_KEY fehlt` → Key in `.env.local` eintragen.
  - `[email] Resend API Fehler: ...` → Fehlermeldung von Resend (z. B. ungültiger Absender).
  - `[email] Bestellbestätigung gesendet: FC-2025-0001 an kunde@example.com` → Versand war erfolgreich.

- **Live (Netlify):** In Netlify unter **Deploys** → letzten Deploy → **Deploy log** oder **Functions** → Logs der API-Route prüfen. Dort siehst du die gleichen `[email]`-Meldungen.

---

## Kurz: Das musst du prüfen

| Was | Wo prüfen |
|-----|-----------|
| API-Key gesetzt? | `.env.local` (lokal) und Netlify → Environment variables (Live) |
| Absender erlaubt? | Resend: Entweder nur an deine Account-Mail senden (Test) oder Domain verifizieren + `EMAIL_FROM` setzen |
| Kunde hat E-Mail eingegeben? | Checkout: Feld „E-Mail“ ist Pflicht |
| Nach Deploy neu gebaut? | Netlify: Nach Änderung von Env-Variablen „Clear cache and deploy“ |
