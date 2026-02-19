# Followerbase auf Netlify bringen – genau diese Schritte

Alles im Projekt ist vorbereitet (`netlify.toml`, Build). Du musst nur noch **GitHub** und **Netlify** verbinden.

---

## ⚠️ Fehler: „No url found for submodule path 'followerbase'“

Wenn Netlify beim **Preparing repo** abbricht mit *fatal: No url found for submodule path 'followerbase'*, liegt ein **Submodule** „followerbase“ im Repo ohne gültige URL. Das musst du einmalig entfernen:

**Im Projektordner (Followerbase / dein Repo) in Git Bash oder PowerShell:**

```bash
# Submodule aus der Konfiguration und aus dem Index entfernen
git submodule deinit -f followerbase
git rm -f followerbase
```

Falls eine Datei **.gitmodules** existiert, prüfen: Enthält sie nur den Eintrag für followerbase? Dann die Datei löschen und mit committen:

```bash
git rm .gitmodules
```

Falls unter **.git/modules** ein Ordner **followerbase** existiert, ihn löschen (Windows PowerShell):

```powershell
Remove-Item -Recurse -Force .git\modules\followerbase -ErrorAction SilentlyContinue
```

Dann committen und pushen:

```bash
git add -A
git commit -m "Submodule followerbase entfernt (Netlify Build)"
git push
```

Danach bei Netlify **Trigger deploy** → **Clear cache and deploy site** ausführen. Der Ordner **followerbase** bleibt bei dir lokal erhalten, ist aber nicht mehr Teil des Repos. Wenn du seinen Inhalt später wieder brauchst, kannst du ihn als ganz normale Ordner (ohne eigenes .git) ins Projekt legen und erneut committen.

---

## Teil 1: Code auf GitHub

### 1. Neues Repository auf GitHub anlegen

1. Gehe zu [github.com/new](https://github.com/new).
2. **Repository name:** z. B. `Followerbase` oder `followerbase-shop`.
3. **Public** wählen.
4. **Nicht** „Add a README“ oder „Add .gitignore“ anhaken (Projekt hat schon welche).
5. Auf **Create repository** klicken.

### 2. Projekt mit Git hochladen

**Falls du den alten Remote bereits entfernt hast** (z. B. `git remote remove origin`): Kein `git init` nötig. Im Projektordner nur noch:

```bash
git remote add origin https://github.com/kevring092373/Followerbase.git
git push -u origin main
```

(Ersetze `kevring092373` und `Followerbase` durch deinen GitHub-Benutzernamen und den exakten Repo-Namen.)

**Falls du komplett neu startest** (noch kein Git im Ordner):

```bash
git init
git add .
git commit -m "Initial commit – Followerbase Shop"
git branch -M main
git remote add origin https://github.com/DEIN-BENUTZERNAME/DEIN-REPO-NAME.git
git push -u origin main
```

Falls Git noch nicht installiert ist: [git-scm.com/download/win](https://git-scm.com/download/win) – danach **neues** Terminal öffnen.

---

## Teil 2: Netlify mit GitHub verbinden

### 3. Site bei Netlify anlegen

1. Gehe zu [app.netlify.com](https://app.netlify.com) und melde dich an (oder registriere dich mit GitHub).
2. **Add new site** → **Import an existing project**.
3. **Connect to Git provider** → **GitHub**.
4. Zugriff erlauben, dann dein **Followerbase-Repository** auswählen.

### 4. Build-Einstellungen

- **Branch:** `main` (oder der Branch, auf dem du gepusht hast).
- **Build command** und **Publish directory** können leer bleiben – die `netlify.toml` im Projekt reicht.

Auf **Deploy** klicken – der erste Build startet. Du kannst sofort mit Schritt 5 weitermachen.

### 5. Umgebungsvariablen eintgen (wichtig)

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
   | `ADMIN_PASSWORD` | aus `.env.local` (mind. 8 Zeichen – schützt `/admin`) |

   Optional (Überweisung): `BANK_RECIPIENT`, `BANK_IBAN`, `BANK_BIC`, `BANK_NAME`.

3. **Save** / **Add**.
4. Unter **Deploys** → **Trigger deploy** → **Clear cache and deploy site** – damit der nächste Build die neuen Variablen nutzt.

---

## Fertig

- Deine Seite läuft unter einer URL wie `https://… .netlify.app`.
- Bei jedem **Push auf `main`** baut Netlify automatisch neu und veröffentlicht.

Eigene Domain einrichten: **Domain settings** → **Add custom domain**.

---

## Deploy-Befehl (nach Änderungen)

Zum Veröffentlichen deiner Änderungen im Projektordner (PowerShell oder Git Bash):

```bash
git add -A
git status
git commit -m "Deploy: Beschreibung deiner Änderung"
git push
```

Netlify startet danach automatisch einen neuen Build und veröffentlicht die Seite. Build-Status siehst du unter **Deploys** in der Netlify-Übersicht.

**Optional – vor dem Push lokal testen:**

```bash
npm run build
```

Wenn der Build ohne Fehler durchläuft, kannst du wie oben committen und pushen.

---

## Build failed: „Exposed secrets“ (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_PAYPAL_CLIENT_ID)

Netlify scannt den Build-Output und meldet die Werte dieser Variablen. In Next.js sind `NEXT_PUBLIC_*`-Variablen **bewusst** im Client – keine Server-Geheimnisse.

**Im Projekt:** In der **`netlify.toml`** ist `SECRETS_SCAN_OMIT_KEYS = "NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_PAYPAL_CLIENT_ID"` gesetzt. Netlify ignoriert diese Keys beim Scan. Nach Push und Deploy sollte der Fehler weg sein.

**Falls du die Variablen in Netlify als „Contains secret values“ markiert hast:** Für `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_PAYPAL_CLIENT_ID` die Markierung entfernen (Options → Edit) – diese Werte sind für den Browser gedacht.

**Falls der Fehler bleibt**, in Netlify unter **Environment variables** setzen:
- **Key:** `SECRETS_SCAN_OMIT_KEYS`
- **Value:** `NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_PAYPAL_CLIENT_ID`

**Option A – Safelist (alternative)**  
In Netlify: **Site configuration** → **Environment variables** → **Add a variable** / **Add a single variable**.

- **Key:** `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES`
- **Value:** Die **konkreten Werte**, die Netlify meldet, kommagetrennt, z. B.  
  `https://dein-projekt.supabase.co, dein-paypal-client-id-string`  
  (Supabase-URL und PayPal Client ID aus deiner `.env.local` eintragen, durch Komma getrennt.)

Speichern, dann **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.

**Option B – Smart Detection ausschalten**  
Falls du die Werte nicht in eine weitere Variable eintragen willst:

- **Key:** `SECRETS_SCAN_SMART_DETECTION_ENABLED`
- **Value:** `false`

Damit wird nur die automatische „Smart Detection“ deaktiviert; normale Secret-Scans für als Secret markierte Variablen laufen weiter.

---

## Wenn der Build fehlschlägt

1. **Build-Log in Netlify prüfen**  
   Unter **Deploys** → fehlgeschlagener Deploy → **Deploy log** öffnen. Die letzte rote Zeile verrät oft den Fehler.

2. **Branch „main“ eintragen**  
   Wenn unter „Branch to deploy“ keine Auswahl erscheint: **main** (oder dein Standard-Branch) von Hand eintragen und speichern.

3. **„Essential Next.js“-Plugin**  
   Unter **Site configuration** → **Build & deploy** → **Build plugins** prüfen, ob **Essential Next.js** (oder „Next.js“) aktiv ist. Falls nicht: **Add plugin** → „Essential Next.js“ suchen und hinzufügen.

4. **Ordner `content/` muss im Repo sein**  
   Die Dateien unter `content/` (z. B. `products.json`, `orders.json`) müssen mit ins GitHub-Repo committed sein. Prüfen mit:
   ```bash
   git add content/
   git status
   git commit -m "content für Build hinzugefügt"
   git push
   ```

5. **Umgebungsvariablen**  
   Fehlen sie, bricht der Build manchmal nicht ab, die Seite funktioniert aber nicht. Alle Werte aus `.env.local` unter **Environment variables** eintragen und **Clear cache and deploy** ausführen.
