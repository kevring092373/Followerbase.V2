# Followercloud auf Netlify bringen – genau diese Schritte

Alles im Projekt ist vorbereitet (`netlify.toml`, Build). Du musst nur noch **GitHub** und **Netlify** verbinden.

---

## ⚠️ Fehler: „No url found for submodule path 'followerbase'“

Wenn Netlify beim **Preparing repo** abbricht mit *fatal: No url found for submodule path 'followerbase'*, liegt ein **Submodule** „followerbase“ im Repo ohne gültige URL. Das musst du einmalig entfernen:

**Im Projektordner (Followercloud.V1) in Git Bash oder PowerShell:**

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
