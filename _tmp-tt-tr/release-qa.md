# Lokale Abnahme: TikTok Follower Türkisch

## Status

Komplettes lokales Übergabepaket erstellt. Produkttext ist ein Entwurf mit noch ausstehender Bestätigung der genauen türkischen Produktmerkmale sowie Liefer-/Nachfüllbedingungen. Nicht veröffentlicht, nicht in Supabase eingetragen, kein Testkauf durchgeführt.

## Umfang und redaktionelle Prüfung

- 1.057 Wörter einschließlich Preiskarten und FAQ.
- Sechs Preis-/Mengenkarten; sechs FAQ.
- Title: 47 Zeichen; Meta Description: 151 Zeichen.
- Alle sechs Preise entsprechen dem frisch erhobenen öffentlichen Product-JSON-LD.
- Vergleichspreise je 100 Follower rechnerisch geprüft.
- Keine garantierte regionale Ausspielung oder Monetarisierung, keine erfundene Herkunfts-/Aktivitätsgarantie, keine feste Liefer- oder Nachfüllfrist.
- Profil-/Nutzernameneingabe TikTok-spezifisch erklärt; keine Instagram-Beitragslink-Anweisung übernommen.
- Keine laufende Suchleistungs- oder GSC-Messung behauptet.
- Zwei Primärlinks direkt im passenden Absatz, kein Quellen- oder Hinweisanhang am Textende.

## HTML und Daten

- Keine H1 im Contentfragment; eine H1 in der Vorschau.
- Keine zweite Dokumenthülle im Fragment, keine Skripte oder Inline-Eventhandler.
- Keine doppelten IDs. Interne Sprungziele vorhanden; einziges externes Ankerziel für den Einbau ist das bestehende Kaufmodul `#produkt-auswahl`.
- Meta Title/Description als separate Dateien ausgegeben. Vorschaumetadaten nicht mit Produktions-Robots vermischt.
- FAQs aus dem tatsächlichen sichtbaren Text exportiert, kein zusätzlicher konkurrierender Product-Block erzeugt.
- Keine breiten Tabellen oder externen Bild-/Schriftabhängigkeiten im Beschreibungsfragment.

## Browser und Sichtprüfung

Isolierter lokaler Chrome-Headless-Test ohne persönliches Browserprofil. Geprüfte Viewports: 320, 360, 390, 768 und 1280 Pixel.

- Kein Seitenüberlauf bei geschlossenen oder geöffneten FAQs.
- FAQ per Klick und Enter bedienbar.
- CTA erreicht das Vorschauziel.
- Keine JavaScript-Seitenfehler.
- CSS-Regeln vollständig auf Produktpräfix oder lokales Vorschaupräfix begrenzt.
- Desktop-Gesamtansicht, mobiler Einstieg und mobile Preiskarten visuell geprüft.

Ein anfänglicher Testalarm kam vom simplen Zerlegen von CSS-Selektoren innerhalb von `:where(...)`. Der Testparser wurde korrigiert; der vollständige Folgelauf bestand auf allen fünf Breiten. Kein unterdrückter Layoutfehler.

Messwerte: `qa-static.json` und `qa-browser.json`. Screenshots im Ordner `screenshots/`.

## Abnahme nach Einbau bleibt erforderlich

Backendpreise, tatsächliche Produktdefinition, eventuell bereits bestehende Liefer-/Nachfüllrechte, Formularvalidierung, echte mobile Kaufleiste, Head/Schema, serverseitige Auslieferung und Gestaltung im Shop-Template. Andere Produktseiten dürfen keinen unbeabsichtigten Diff erhalten. Keine Aussage über aktuelles Ranking, aktuelle Indexierung oder garantierte Rich Results.
