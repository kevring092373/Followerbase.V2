# Followerbase auf Netlify veröffentlichen (via GitHub)

## Voraussetzungen

- **GitHub-Konto**
- **Netlify-Konto** (kostenlos: [netlify.com](https://www.netlify.com))
- Projekt lokal in Git versioniert und auf GitHub gepusht

---

## 1. Projekt auf GitHub bringen

Falls noch nicht geschehen:

```bash
# Im Projektordner (Followerbase / dein Repo-Name)
git init
git add .
git commit -m "Initial commit"
```

Auf GitHub ein neues Repository anlegen (z. B. `Followerbase`), **ohne** README/ .gitignore (weil schon vorhanden). Dann:

```bash
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO-NAME.git
git branch -M main
git push -u origin main
```

---

## 2. Netlify mit GitHub verbinden

1. Auf [app.netlify.com](https://app.netlify.com) einloggen.
2. **„Add new site“** → **„Import an existing project“**.
3. **„Connect to Git provider“** → **GitHub** wählen.
4. Netlify fragt nach Zugriff auf dein GitHub-Konto – **Authorize** bestätigen.
5. **Repository auswählen**: dein Followerbase-Repo aus der Liste wählen.

---

## 3. Build-Einstellungen prüfen

Netlify erkennt Next.js automatisch. In der Übersicht solltest du sehen:

| Einstellung        | Wert              |
|--------------------|-------------------|
| **Branch to deploy** | `main` (oder dein Standard-Branch) |
| **Build command**   | `npm run build` (steht auch in `netlify.toml`) |
| **Publish directory** | wird von Netlify für Next.js gesetzt (z. B. `.next` / Plugin-Ausgabe) |

Falls **Publish directory** leer ist oder falsch: bei Next.js oft **`.next`** eintragen oder einfach **„Deploy“** klicken – Netlify wendet dann die Next.js-Konfiguration an.

---

## 4. Umgebungsvariablen (wichtig)

Deine lokalen Secrets stehen in `.env.local` und werden **nicht** mit ins Repo gepusht. Für Netlify musst du sie manuell eintragen:

1. In Netlify: **Site settings** → **Environment variables** → **„Add a variable“** / **„Import from .env“**.
2. Alle Werte aus `.env.local` eintragen (einzeln oder per „Import from .env“, wenn du eine Datei hochlädst):

   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_SANDBOX`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional für Überweisung: `BANK_RECIPIENT`, `BANK_IBAN`, `BANK_BIC`, `BANK_NAME`

3. **Scopes**: „All scopes“ oder „Production“ wählen, damit der Build und die Live-Site die Variablen nutzen.

Ohne diese Variablen funktionieren PayPal, Supabase und ggf. Bankdaten auf der Live-Site nicht.

---

## 5. Deploy starten

- **„Deploy site“** klicken.
- Der erste Build kann einige Minuten dauern.
- Danach bekommst du eine URL wie `https://irgendwas.netlify.app`. Diese kannst du später in **Domain settings** anpassen oder eine eigene Domain verbinden.

---

## 6. Nach jedem Push

Sobald die Verbindung zu GitHub steht, baut Netlify bei jedem **Push auf den eingestellten Branch** (z. B. `main`) automatisch neu und veröffentlicht die neue Version. Du musst nichts weiter tun.

---

## Kurz-Checkliste

- [ ] Repo auf GitHub, Netlify mit GitHub verbunden
- [ ] Richtiges Repository und Branch ausgewählt
- [ ] Build command: `npm run build` (oder über `netlify.toml`)
- [ ] Alle nötigen **Environment variables** in Netlify gesetzt
- [ ] Ersten Deploy durchgeführt und URL getestet (Checkout, Bestellung verfolgen, etc.)

Wenn du willst, können wir als Nächstes eine eigene Domain oder Subdomain (z. B. `followerbase.de`) einrichten.
