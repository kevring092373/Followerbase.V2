# Followercloud auf Netlify bringen – genau diese Schritte

Alles im Projekt ist vorbereitet (`netlify.toml`, Build). Du musst nur noch **GitHub** und **Netlify** verbinden.

---

## Teil 1: Code auf GitHub

### 1. Neues Repository auf GitHub anlegen

1. Gehe zu [github.com/new](https://github.com/new).
2. **Repository name:** z. B. `Followercloud` oder `followercloud-shop`.
3. **Public** wählen.
4. **Nicht** „Add a README“ oder „Add .gitignore“ anhaken (Projekt hat schon welche).
5. Auf **Create repository** klicken.

### 2. Projekt mit Git hochladen

Im Projektordner **Followercloud.V1** in der **Eingabeaufforderung** oder **PowerShell** (oder Git Bash) ausführen:

```bash
git init
git add .
git commit -m "Initial commit – Followercloud Shop"
git branch -M main
git remote add origin https://github.com/DEIN-BENUTZERNAME/DEIN-REPO-NAME.git
git push -u origin main
```

**Ersetze** `DEIN-BENUTZERNAME` und `DEIN-REPO-NAME` durch deinen GitHub-Namen und den Repo-Namen (z. B. `KevinRingsdorf` und `Followercloud`).

Falls Git noch nicht installiert ist: [git-scm.com/download/win](https://git-scm.com/download/win) – danach **neues** Terminal öffnen.

---

## Teil 2: Netlify mit GitHub verbinden

### 3. Site bei Netlify anlegen

1. Gehe zu [app.netlify.com](https://app.netlify.com) und melde dich an (oder registriere dich mit GitHub).
2. **Add new site** → **Import an existing project**.
3. **Connect to Git provider** → **GitHub**.
4. Zugriff erlauben, dann dein **Followercloud-Repository** auswählen.

### 4. Build-Einstellungen

- **Branch:** `main` (oder der Branch, auf dem du gepusht hast).
- **Build command** und **Publish directory** können leer bleiben – die `netlify.toml` im Projekt reicht.

Auf **Deploy** klicken – der erste Build startet. Du kannst sofort mit Schritt 5 weitermachen.

### 5. Umgebungsvariablen eintragen (wichtig)

Ohne diese Variablen funktionieren PayPal und Supabase auf der Live-Seite nicht.

1. In Netlify: **Site configuration** (oder **Site settings**) → **Environment variables** → **Add a variable** / **Import from .env**.
2. Alle Variablen aus deiner **`.env.local`** eintragen (Werte aus der Datei kopieren):

   | Name | Wo du es hernimmst |
   |------|---------------------|
   | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | aus `.env.local` |
   | `PAYPAL_CLIENT_SECRET` | aus `.env.local` |
   | `PAYPAL_SANDBOX` | aus `.env.local` (z. B. `true` für Test) |
   | `NEXT_PUBLIC_SUPABASE_URL` | aus `.env.local` |
   | `SUPABASE_SERVICE_ROLE_KEY` | aus `.env.local` |

   Optional (Überweisung): `BANK_RECIPIENT`, `BANK_IBAN`, `BANK_BIC`, `BANK_NAME`.

3. **Save** / **Add**.
4. Unter **Deploys** → **Trigger deploy** → **Clear cache and deploy site** – damit der nächste Build die neuen Variablen nutzt.

---

## Fertig

- Deine Seite läuft unter einer URL wie `https://… .netlify.app`.
- Bei jedem **Push auf `main`** baut Netlify automatisch neu und veröffentlicht.

Eigene Domain einrichten: **Domain settings** → **Add custom domain**.
