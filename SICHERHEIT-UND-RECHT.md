# Sicherheit & Recht – Checkliste Followerbase

Kurze Übersicht, was technisch und rechtlich sinnvoll ist. Kein Rechtsrat – bei Unsicherheit bitte anwaltlich prüfen.

---

## Bereits umgesetzt

- **Admin-Schutz:** `/admin` nur mit Passwort (Cookie, kein Klartext).
- **Keys:** PayPal/Supabase nur über Umgebungsvariablen, `.env.local` nicht im Repo.
- **Cookie-Banner:** Einwilligung (Alle akzeptieren / Nur notwendige), Link zur Datenschutzerklärung.
- **Datenschutz:** Platzhalter mit Cookie-Hinweis; Impressum, AGB, Widerruf verlinkt.

---

## Empfohlene Schritte

### Rechtlich / Inhalt

1. **Impressum & Datenschutz ausfüllen**  
   Platzhalter `[Name/Anschrift]`, `[E-Mail-Adresse]` durch deine echten Angaben ersetzen (Impressum, Datenschutz, ggf. AGB).

2. **Datenschutz anpassen**  
   Wenn du z. B. Analytics (Google, Plausible, etc.) oder andere Drittanbieter nutzt, in der Datenschutzerklärung erwähnen und ggf. das Cookie-Banner um „Marketing/Analyse“ erweitern.

### Technisch / Sicherheit

3. **HTTPS**  
   Netlify liefert standardmäßig HTTPS – keine Extra-Einstellung nötig.

4. **Security-Header (optional)**  
   Über Netlify oder `next.config.js` z. B.:
   - `X-Frame-Options: DENY` (oder `SAMEORIGIN`)
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`  
   Netlify: Site settings → Build & deploy → Post processing → Header rules.

5. **Supabase / Backend**  
   - Row Level Security (RLS) in Supabase prüfen, falls du Kundendaten in Tabellen speicherst.
   - `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig nutzen (bereits so umgesetzt).

6. **Regelmäßig**  
   - Abhängigkeiten aktualisieren (`npm update`, Sicherheitswarnungen beachten).
   - PayPal/Supabase-Zugangsdaten bei Verdacht rotieren.

---

## Optional

- **Rate Limiting:** API-Routes (z. B. Checkout, Login) gegen zu viele Anfragen absichern (z. B. über Netlify Functions oder Middleware).
- **2FA für Admin:** Statt nur Passwort später z. B. E-Mail-Link oder TOTP (würde zusätzliche Implementierung bedeuten).

Wenn du willst, können wir als Nächstes z. B. die Security-Header in der `netlify.toml` oder in `next.config.js` konkret einbauen.
