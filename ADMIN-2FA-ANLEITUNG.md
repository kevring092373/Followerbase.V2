# Admin 2FA (Zwei-Faktor-Authentifizierung) – ausführliche Anleitung

Mit 2FA musst du dich beim Admin-Login nach dem Passwort zusätzlich mit einem **6-stelligen Code** aus einer Authenticator-App (z. B. Google Authenticator) anmelden. Das schützt den Admin-Bereich auch dann, wenn jemand dein Passwort kennt.

**Wichtig:** 2FA ist **optional**. Wenn du `ADMIN_TOTP_SECRET` nicht setzt, reicht wie bisher nur das Passwort.

---

## Übersicht der Schritte

1. **TOTP-Secret erzeugen** (einmalig)
2. **Secret in `.env.local` eintragen** (lokal testen)
3. **Authenticator-App einrichten** (QR-Code scannen oder Secret eingeben)
4. **Secret bei Netlify eintragen** (für die Live-Seite)
5. **Login testen** (Passwort → Code → Admin)

---

## Schritt 1: TOTP-Secret erzeugen

Das Secret ist ein geheimer Schlüssel, den nur deine App und die Authenticator-App kennen. Du erzeugst es **einmal** mit einem Script im Projekt.

### Was du brauchst

- Projekt geöffnet in Cursor bzw. Terminal im Projektordner
- Node.js installiert (ist bei Next.js-Projekten normalerweise der Fall)

### So gehst du vor

1. **Terminal öffnen** (z. B. in Cursor: Terminal → New Terminal oder `` Ctrl+` ``).
2. **In den Projektordner wechseln**, falls du nicht schon dort bist:
   ```powershell
   cd "c:\Users\Kevin Ringsdorf\.cursor\projects\Followercloud.V1"
   ```
3. **Script ausführen:**
   ```powershell
   node scripts/generate-totp-secret.mjs
   ```
4. **Ausgabe notieren.** Du siehst etwas in der Art:
   ```text
   --- Admin 2FA (TOTP) ---

   In .env.local und Netlify eintragen:
   ADMIN_TOTP_SECRET=2HPXQARB4EZ6VD5HNYHZM72BRO5U7P5P

   QR-Code / manuell in Authenticator-App:
   otpauth://totp/Followerbase:Admin?secret=2HPXQARB4EZ6VD5HNYHZM72BRO5U7P5P&issuer=Followerbase
   ```

- **ADMIN_TOTP_SECRET=…** → diesen kompletten Wert brauchst du in Schritt 2 und 4.
- **otpauth://…** → diese Zeile brauchst du in Schritt 3 (QR-Code oder manuelle Eingabe).

**Hinweis:** Das Secret wird jedes Mal neu erzeugt, wenn du das Script startest. Für 2FA verwendest du immer **dasselbe** Secret (einmal erzeugen und überall eintragen). Wenn du es verlierst, musst du ein neues erzeugen und die Authenticator-App neu einrichten.

---

## Schritt 2: Secret in `.env.local` eintragen (lokal)

Damit 2FA **lokal** auf deinem Rechner funktioniert, trägst du das Secret in die Umgebungsdatei ein.

### Wo liegt die Datei?

- Im **Projektordner**, gleiche Ebene wie `package.json`:
  `c:\Users\Kevin Ringsdorf\.cursor\projects\Followercloud.V1\.env.local`
- Die Datei kann versteckt sein (Name beginnt mit Punkt). In Cursor erscheint sie in der Dateiliste, wenn du den Projektordner aufklappst.

### Was eintragen?

1. **`.env.local` öffnen** (z. B. in Cursor).
2. **Neue Zeile** am Ende (oder bei den anderen Admin-Variablen) einfügen:
   ```env
   ADMIN_TOTP_SECRET=DEIN_GEHEIMER_WERT_AUS_SCHRITT_1
   ```
   Ersetze `DEIN_GEHEIMER_WERT_AUS_SCHRITT_1` durch den Wert, den das Script ausgegeben hat (z. B. `2HPXQARB4EZ6VD5HNYHZM72BRO5U7P5P`). **Keine Anführungszeichen**, **keine Leerzeichen** um das `=`.
3. **Datei speichern** (Ctrl+S).

### Wichtig

- `.env.local` wird **nicht** ins Git-Repository übernommen (steht in `.gitignore`). Dein Secret bleibt nur auf deinem Rechner und auf Netlify (Schritt 4), nicht im Code.

---

## Schritt 3: Authenticator-App einrichten

Die App auf deinem Handy (oder Rechner) erzeugt alle 30 Sekunden einen neuen 6-stelligen Code. Beim Login gibst du genau den aktuellen Code ein.

### Welche App?

- **Google Authenticator** (Android / iOS)
- **Microsoft Authenticator** (Android / iOS)
- **Authy** (Android / iOS / Desktop)
- Oder jede andere App, die **TOTP** (z. B. „Authenticator“ oder „Zwei-Faktor-Code“) unterstützt.

### Option A: Mit QR-Code (einfach)

1. **QR-Code erzeugen:**  
   Gehe z. B. auf [https://www.qr-code-generator.com](https://www.qr-code-generator.com) (oder einen anderen QR-Generator).
2. **In das Text-/URL-Feld** die komplette **otpauth://…**-Zeile aus Schritt 1 einfügen (von `otpauth` bis zum Ende).
3. **QR-Code anzeigen lassen** und mit der Authenticator-App **scannen** („Konto hinzufügen“ → „QR-Code scannen“).
4. In der App erscheint ein Eintrag wie **Followerbase** oder **Followerbase Admin** mit wechselnden 6-stelligen Codes.

### Option B: Secret manuell eingeben

1. In der Authenticator-App **„Konto manuell hinzufügen“** oder **„Schlüssel eingeben“** wählen.
2. **Kontoname:** z. B. `Followerbase Admin`.
3. **Schlüssel / Secret:** Den Teil **nach** `ADMIN_TOTP_SECRET=` aus Schritt 1 eingeben (nur die Buchstaben und Zahlen, z. B. `2HPXQARB4EZ6VD5HNYHZM72BRO5U7P5P`). Keine Leerzeichen.
4. Speichern – die App zeigt dir fortan 6-stellige Codes an.

---

## Schritt 4: Secret bei Netlify eintragen (Live-Seite)

Damit 2FA auch auf deiner **veröffentlichten** Seite (z. B. `https://deine-site.netlify.app`) funktioniert, muss Netlify das gleiche Secret kennen.

### So gehst du vor

1. **Bei Netlify anmelden** und deine **Site** auswählen (die mit diesem Projekt verbunden ist).
2. **Site settings** (oder **Site configuration**) öffnen.
3. Im Menü links **„Environment variables“** (Umgebungsvariablen) suchen und anklicken.
4. **„Add a variable“** / **„Add environment variable“** (oder „Add new variable“) wählen.
5. **Key:** `ADMIN_TOTP_SECRET` (genau so, großgeschrieben).
6. **Value:** Den **gleichen** Wert wie in Schritt 2 eintragen (der aus der Script-Ausgabe).
7. **Scope:** Alle Scopes anhaken („All“ bzw. Production, Deploy Previews usw.), damit es bei jedem Build gilt.
8. **Speichern** („Save“ / „Add“).
9. **Neuen Deploy auslösen**, damit die neue Variable aktiv wird:  
   **Deploys** → **Trigger deploy** → **Deploy site** (oder **Clear cache and deploy site**).

**Wichtig:** Der Wert muss **identisch** mit dem in `.env.local` und dem in der Authenticator-App sein. Sonst sind die Codes ungültig.

---

## Schritt 5: Login testen

### Ablauf mit 2FA

1. **Admin-Seite aufrufen** (lokal: z. B. `http://localhost:3000/admin` oder nach Deploy die Netlify-URL + `/admin`).
2. **Weiterleitung zur Login-Seite** (z. B. `/admin/login`).
3. **Passwort** eingeben und **„Weiter“** klicken.
4. **2FA-Maske:** 6-stelligen **Code** aus der Authenticator-App eingeben (der **aktuelle** Code; er wechselt alle 30 Sekunden).
5. **„Anmelden“** klicken → du landest im Admin-Bereich.

### Wenn etwas nicht klappt

- **„Code ungültig oder abgelaufen“:**  
  Aktuellen Code verwenden (nicht einen von vor 1–2 Minuten). Uhr auf dem Handy und am Rechner sollten ungefähr gleich gehen.
- **„Bitte zuerst mit Passwort anmelden“:**  
  Zuerst Passwort eingeben und „Weiter“, dann auf der 2FA-Seite den Code eingeben. Nicht direkt die Verify-2FA-URL aufrufen.
- **Lokal funktioniert, auf Netlify nicht:**  
  Prüfen, ob `ADMIN_TOTP_SECRET` bei Netlify gesetzt ist und ob nach dem Eintragen ein neuer Deploy gelaufen ist.

### 2FA wieder abschalten

Wenn du nur mit Passwort einsteigen willst: `ADMIN_TOTP_SECRET` aus `.env.local` und aus den Netlify Environment variables **entfernen** (Variable löschen). Anschließend neu deployen. Dann wird wieder nur das Passwort abgefragt.

---

## Kurz-Checkliste

- [ ] `node scripts/generate-totp-secret.mjs` ausgeführt und Ausgabe gespeichert
- [ ] `ADMIN_TOTP_SECRET=…` in `.env.local` eingetragen
- [ ] Authenticator-App eingerichtet (QR oder manuell) mit demselben Secret
- [ ] `ADMIN_TOTP_SECRET` bei Netlify gesetzt und neuer Deploy ausgelöst
- [ ] Login getestet: Passwort → 2FA-Code → Admin

Wenn du alle Punkte abgehakt hast, ist 2FA für den Admin-Bereich aktiv.
