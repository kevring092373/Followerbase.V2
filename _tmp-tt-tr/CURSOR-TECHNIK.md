# Cursor: TikTok Follower Türkisch gezielt überarbeiten

## Auftrag

Nur diese Produktseite bearbeiten:

`https://followerbase.de/product/tiktok-follower-tuerkisch-kaufen`

Artikelnummer: `FC-019`. URL, Kaufmöglichkeit und bestehende Produkt-H1 erhalten. Produktdaten und Geschäftsbedingungen nicht eigenmächtig verändern. Keine Shop-Veröffentlichung oder Live-Datenbankmutation ohne separaten Auftrag; nötige CMS-Änderungen als gezielten Patch vorbereiten.

Alle anderen Produktseiten bleiben unverändert, insbesondere `/product/tiktok-follower-kaufen` und `/product/youtube-views-kaufen`. Auch Änderungen gemeinsamer Komponenten dürfen auf diesen Seiten weder Inhalt, Schema, Metadaten noch Verhalten verändern. Produktbezogene Overrides statt globaler Text-/Schema-Ersetzungen verwenden. Bestehende Änderungen anderer Bearbeiter nicht zurücksetzen.

## Frisch geprüfte Befunde

Direkter HTML-Abruf: 8. September 2026, 13:23 Uhr deutscher Zeit. Zusätzlich Crawl genau dieser einen URL über den konfigurierten Crawl-Dienst. Der Volltext, Formulardaten und JSON-LD wurden aus dem direkten Abruf geprüft, nicht aus der gekürzten Crawl-Ansicht.

| Bereich | Beobachtung | Konsequenz |
|---|---|---|
| HTTP/Canonical/Robots | 200, korrekter Self-Canonical, `index, follow`, kein X-Robots-Tag im Abruf | Erhalten, kein vorsorgliches `noindex` oder Redirect |
| H1 | Genau eine: `TikTok Follower Türkisch kaufen` | Erhalten |
| Mengenwahl | 100 ausgewählt; Range min/value/aria-valuenow jeweils 100, max 5.000, step 50 | Initial stimmig. Keinen angeblichen 50er-Minimumfehler reparieren |
| Preis | Standardpaket 100 / 2,85 €; weitere Preise im JSON-LD | Gegen echte Produktquelle abgleichen |
| Beschreibung | Je zwei `html`, `head` und `body`; zusätzliches Dokument im Contentfeld | Durch geliefertes HTML-Fragment ersetzen |
| CSS | Globale Regeln unter anderem für `:root`, `body`, `*`, Überschriften und Links | Nur produktbezogene Styles verwenden |
| Text-CTA | „Türkische Follower bestellen“ zeigt auf `/products` | Zum eigenen Kaufmodul führen |
| Mobile Kaufleiste | Initial `aria-hidden="true"`, Button `tabindex="-1"` | Nach Sichtbarkeit/Scrollzustand prüfen, nicht pauschal als Fehler werten |
| FAQs | Neun Antworten, Inline-`onclick`, veraltete/unbelegte Claims | Durch die sechs neuen, zugänglichen FAQs ersetzen |
| Schema | Product mit AggregateOffer für sechs Mengenpakete, BreadcrumbList, FAQPage | Angebotsmodell und sichtbaren Inhalt synchronisieren |

Der aktuelle Google-Indexstatus wurde nicht neu abgefragt. Die frühere Nichtindexierung aus dem August-Audit ist kein Beweis für eine Spam-Abstrafung. Die folgenden Maßnahmen beheben belegte Inhalts- und Strukturprobleme, garantieren aber keine bestimmte Platzierung.

## 1. Neue Beschreibung integrieren

- `producttext.html` ersetzt den alten Text vollständig, nicht ergänzend darunter.
- Es enthält nur einen gekapselten Contentblock und dessen Styles, keine H1 oder Dokumenthülle.
- Für externe CSS-Einbindung `producttext.css` verwenden und den identischen Styleblock aus dem Fragment entfernen. Styles nur einmal laden.
- Keine globalen `body`-/`h1`-/`table`-Regeln oder Font-Downloads aus dem Beschreibungsfeld. CSS-Präfix: `.fbtr-tiktok-copy`.
- Das HTML serverseitig beziehungsweise im initialen Seiten-HTML ausgeben. Keine versteckte zweite Version und kein clientseitiger Nachladeersatz.
- `html/index.html` ist nur die lokale Vorschau. Deren Vorschau-Kopfzeile, Kaufmodul-Platzhalter und `noindex, nofollow` NICHT auf die Produktseite übernehmen.

## 2. Wirkungsversprechen auch außerhalb des Langtexts bereinigen

Auf dieser URL aus Text, Grafiken, Metadaten, Kurzbeschreibung, FAQ/Schema und Sharing-Feldern entfernen:

- garantierte türkische For-You-Ausspielung, regionale Algorithmus-Einordnung oder Empfehlungscluster durch gekaufte Follower;
- „Türkei erscheint als Top-Land“ in Analytics als zugesichertes Ergebnis;
- Angaben zu tatsächlich türkischer Herkunft, echten Identitäten, Aktivität oder Botfreiheit ohne belastbare Grundlage;
- Monetarisierungshilfe durch gekaufte Follower, insbesondere das alte Creativity-Program-/10.000-Follower-Argument;
- scheinbar authentisches Wachstum, Verschleierung durch Staffelung oder Zukauf passender Likes/Views;
- unbelegte Zahlen zu Marktgrößen, Diaspora oder gelöschten Fake-Accounts als Verkaufsargument;
- „günstigste Option“, „beste Qualität“ und ähnliche nicht belegte Rangfolgen. Schon der aktuelle Seitenvergleich ist widersprüchlich: Hier ab 2,85 €, allgemeine TikTok-Follower-Kachel ab 1,29 €.

Besonders beachten: Im Kaufmodul steht ebenfalls „damit das Wachstum natürlich und echt wirkt“. Nur auf dieser Zielseite neutralisieren. Die technische Eigenschaft einer bestätigten gestaffelten Lieferung kann sachlich bestehen bleiben, ihre angebliche Tarn-/Sicherheitswirkung nicht.

Eine feste Dauer „24–72 Stunden“, 30-Tage-Nachfüllung und Klarna sind zwar im alten Text behauptet, aber nicht gegen Lieferanten-/Produktbedingungen bestätigt. Die tatsächliche Quelle prüfen. Existierende Vertragsrechte nicht durch Textbearbeitung ändern. Bestätigte Fristen nur mit Voraussetzungen und Ausschlüssen ergänzen, sonst keine neue Zusicherung machen. Im sichtbaren Zahlungsbereich stehen aktuell PayPal, Kreditkarte und Überweisung; verfügbare Checkout-Methoden sind maßgeblich.

## 3. Produktdaten und Eingaben prüfen

| Paketmenge | Preis laut öffentlichem JSON-LD | Paket-SKU |
|---:|---:|---|
| 100 | 2,85 € | FC-019-100 |
| 250 | 5,90 € | FC-019-250 |
| 500 | 9,90 € | FC-019-500 |
| 1.000 | 17,90 € | FC-019-1000 |
| 2.500 | 39,90 € | FC-019-2500 |
| 5.000 | 74,90 € | FC-019-5000 |

Nur 100 / 2,85 € ist zusätzlich im initial sichtbaren Kaufmodul bestätigt. Keine zweite verbindliche Preisdatenbank aus dieser Tabelle bauen.

- Vorauswahl, Range, Mengenlabel, Hauptpreis, Sticky-Leiste und Warenkorb aus demselben Zustand speisen.
- Erlaubte Zwischenmengen und Preisberechnung prüfen. Aktuelle 50er-Schritte nicht mit frei erfundenen Zwischenpreisen unterlegen.
- Das Eingabefeld heißt „Profillink oder Nutzername“. Beide zugesagten Formen müssen korrekt verarbeitet werden. TikTok-Profil, nicht Video-, Musik- oder Hashtag-Link. Identität des Zielprofils erhalten; keine Umwandlung türkischer Namen zu einem anderen Account.
- Anzeigename und eindeutigen `@Nutzernamen` nicht verwechseln. Nur die tatsächliche Accountkennung für den Auftrag verwenden.
- Leere/ungültige Eingaben sowie fremde Hosts verständlich abweisen. Vorhandene Frontend- und Backendvalidierung prüfen; fehlendes natives `required` allein beweist keinen fehlenden Schutz.
- Shortlink-Auflösung nur, falls unterstützt, mit erlaubten Hosts und kontrollierten Weiterleitungen. Nicht jede vom Browser übergebene URL serverseitig beliebig abrufen.
- Preis und Menge serverseitig aus der Produktquelle validieren. Keine echten Testbestellungen, Zahlungen oder Lieferantenaufträge auslösen.

## 4. CTA, mobile Leiste und Zugänglichkeit

- Eindeutiges `id="produkt-auswahl"` am vorhandenen Kaufmodul setzen oder den Fragmentlink auf dessen tatsächliche ID anpassen. Kein leeres Ziel im Langtext.
- Sticky-Header durch `scroll-margin-top` berücksichtigen und Fokuszustand sichtbar halten.
- Bei sichtbarer mobiler Kaufleiste müssen deren Accessibility-Zustand und Tastaturzugänglichkeit passen. `aria-hidden`/`tabindex` dürfen nur zur tatsächlich verborgenen Leiste gehören; vorhandene Steuerung erst testen.
- Neue FAQs als native `details`/`summary` beibehalten oder vollständig zugänglich in das bestehende System integrieren. Keine starre Antwort-Maximalhöhe oder Inline-Handler.
- Die neue Preisübersicht verwendet responsive Karten. Keine breite Tabelle für diesen Text erforderlich.

## 5. Metadaten und Schema

Die Werte aus `seo-metadaten.md`/`seo.json` in die tatsächlichen SEO-Felder der Route oder des Produktdatensatzes eintragen. Das Beschreibungsfragment setzt sie nicht automatisch. Title, Description, Open Graph, Twitter und WhatsApp-/Twitter-Sharing synchronisieren. Bestehendes Produktbild, H1 und Canonical erhalten.

Die sechs Mengenpakete nicht ungeprüft als AggregateOffer weiterführen. Google sieht AggregateOffer nicht für die Darstellung eines Sets von Produktvarianten vor; siehe [Product-Dokumentation](https://developers.google.com/search/docs/appearance/structured-data/product-snippet#aggregateoffer).

- Angebotsmodell gegen die echte Produktlogik prüfen. Für diese einzelne URL mit eindeutiger Standardauswahl vorzugsweise ein konkretes Offer für 100 Follower zu 2,85 € aus der verbindlichen Produktquelle ausgeben.
- Paketmenge im Angebotsnamen eindeutig nennen. Gesamtpreis nicht als Einzelpreis pro Follower darstellen.
- Die übrigen Mengen bleiben bestellbar. Keine künstlichen Produkt-URLs, GTINs oder nicht vorhandenen Varianten erfinden.
- Bestehenden Product-Block aktualisieren, keinen zweiten hinzufügen. Ein passendes echtes Variantenmodell nur verwenden, falls es tatsächlich existiert und den Anforderungen entspricht.
- Product-Beschreibung, Preis, Verfügbarkeit, SKU und Offer-URL müssen zur sichtbaren Seite passen. Keine erfundenen Bewertungen, Liefertermine oder Rückgaberegeln ergänzen.
- BreadcrumbList erhalten. Die neuen sechs sichtbaren FAQs sind in `faq-data.json` enthalten; alte FAQPage-Antworten ersetzen oder das bisherige FAQ-Markup entfernen. Keine neun alten Antworten parallel behalten.
- Änderungsdatum nur bei einer echten Produktänderung setzen, nicht bei jedem Build.

## 6. Abnahme

1. HTTP 200, unveränderte URL, genau eine H1, Self-Canonical, `index, follow`.
2. Neue Beschreibung im initialen HTML; keine zweite Dokumenthülle oder alten versteckten Textreste.
3. Alle Mengen-/Preiszustände und Test-Warenkorb konsistent; erlaubte und unzulässige Eingaben getestet.
4. SEO-Felder und vorhandenes Schema auf bereinigten Inhalt umgestellt, JSON-LD syntaktisch und im Rich Results Test geprüft.
5. Mobile Darstellung bei 320, 360, 390, 768 und 1280 Pixeln; FAQs offen/geschlossen und per Tastatur; kein Seitenüberlauf.
6. Kauf-CTA und sichtbare Sticky-Leiste bedienen das echte Kaufmodul.
7. Keine veränderten Texte, Metadaten oder Verhaltensweisen auf anderen Produkten, insbesondere den zwei geschützten URLs; bei gemeinsamen Komponenten Regressionstests vorlegen.
8. Build/Lint/relevante Tests ausführen. Ungeprüfte Punkte nicht als bestanden ausgeben.

Änderungsübersicht, Testresultate und noch offene Definition-/Lieferbedingungen zur Abnahme liefern. Keine Weiterleitung, Indexierungsanfrage oder Veröffentlichung eigenständig durchführen.
