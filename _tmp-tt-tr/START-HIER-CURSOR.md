# Komplettpaket: TikTok Follower Türkisch

## Auftrag zum Kopieren

Überarbeite ausschließlich `https://followerbase.de/product/tiktok-follower-tuerkisch-kaufen` mit dem Inhalt dieses Pakets. Lies zuerst `CURSOR-TECHNIK.md` vollständig. Setze die dort beschriebenen produktbezogenen Korrekturen um und ersetze die alte Beschreibung durch `producttext.html`. Die allgemeine TikTok-Follower-Seite und YouTube Views sind ausdrücklich geschützt; auch gemeinsame Komponenten dürfen deren Ausgabe und Verhalten nicht ändern. Preise und Vertragsbedingungen bleiben durch die vorhandene Produktquelle vorgegeben. Keine Live-Veröffentlichung, echte Testbestellung, Weiterleitung oder Indexierungsanfrage eigenständig durchführen.

Der neue Text ist ein ausgearbeiteter Entwurf. Vor Veröffentlichung müssen die nachfolgend genannten Produktangaben bestätigt sein. Fehlende Angaben nicht selbst ergänzen oder aus anderen Produkten übernehmen.

## Dateien und richtige Verwendung

| Datei | Verwendung |
|---|---|
| `CURSOR-TECHNIK.md` | Live-Befunde, konkrete technische Aufgaben und Abnahmetests |
| `producttext.html` | Neues HTML-Fragment mit gekapseltem Styleblock; für die Produktbeschreibung |
| `producttext.css` | Identische Styles separat, falls CSS im Frontend eingebunden wird; dann Styleblock im Fragment entfernen |
| `seo-metadaten.md` | SEO Title, Meta Description, H1, Canonical und Sharing-Felder in lesbarer Form |
| `seo.json` | Metadaten und beobachtete Paketdaten als Einbauhilfe; kein fertiges JSON-LD und keine neue Preisdatenbank |
| `faq-data.json` | Genau die sechs sichtbaren Fragen und Antworten für das vorhandene FAQ-System/Schema |
| `html/index.html` | Lokale Designvorschau, NICHT vollständig als Produktbeschreibung einfügen |
| `release-qa.md` | Ergebnis der lokalen Text-, Struktur- und Browserprüfung |

## Produktdefinition vor Live-Freigabe bestätigen

Die bisherige Website beschreibt türkische Namen und Profilmerkmale, behauptet daneben aber auch tatsächliche Herkunft. Diese Aussagen sind nicht dasselbe.

Der neue Entwurf arbeitet vorsichtig mit einem türkischen beziehungsweise türkischsprachigen Profilbezug und enthält keine Herkunftsgarantie. Eine ausdrückliche Betreiberbestätigung für dieses TikTok-Produkt steht bei Erstellung noch aus. Die frühere Aussage zu deutschsprachigen Instagram-Likes-Accounts darf nicht als Bestätigung für TikTok verwendet werden.

Vor Veröffentlichung aus der Produkt-/Lieferantenquelle oder durch den Betreiber klären:

1. Welche türkischen beziehungsweise türkischsprachigen Merkmale sind tatsächlich Bestandteil dieses Pakets?
2. Werden Aufenthaltsort, Länderanteil, Aktivität oder Identität überhaupt überprüft? Ohne Beleg keine entsprechende Zusicherung ergänzen.
3. Welche Lieferweise und voraussichtliche Dauer gelten konkret für FC-019?
4. Gibt es eine Nachfüllleistung? Wenn ja: Dauer, Voraussetzungen, Ausschlüsse und Anfrageweg.

Eine bestehende tatsächliche Leistung nicht durch den vorsichtigen Entwurf abschaffen. Bestätigte Bedingungen vor Live-Freigabe korrekt im Text, Kaufmodul und Schema abbilden. Bis dahin die technische Vorbereitung und den Entwurf lokal fertigstellen, nicht ungeprüft veröffentlichen.

## Preise anbinden

Die sechs Preise sind der öffentlichen Ausgabe vom 8. September 2026 entnommen. Der Gesamtpreis für 100 Follower beträgt dort 2,85 €, der für 5.000 Follower 74,90 €. Alle Werte vor Integration gegen die aktive Produktquelle prüfen.

- `data-fbtt-price="100"` usw. markieren die Gesamtpreisfelder.
- `data-fbtt-unit="250"` usw. markieren den Vergleichspreis je 100 Follower.
- Diese Attribute stellen noch keine Datenbindung her. Im Frontend serverseitig aus der bestehenden Preisquelle rendern oder bei CMS-Preisänderungen zuverlässig neu generieren.
- Einstiegspreis in Fließtext, Einstiegskarte, Preisabschnitt und Meta Description ebenfalls synchron halten.
- Vergleichspreise = Gesamtpreis ÷ Menge × 100, auf zwei Nachkommastellen gerundet. Insbesondere 2.500: 1,60 € je 100; 5.000: 1,50 € je 100.
- Preiskarten nicht in eine zweite unabhängige Kauf- oder Warenkorblogik verwandeln.

## HTML und Seiten-Head getrennt behandeln

Das Fragment enthält weder H1 noch Metadaten oder Product-Schema. Diese werden von der vorhandenen Produktseite übernommen beziehungsweise über die zuständigen Felder aktualisiert. Zwei Kauf-CTAs benötigen das echte Ziel `#produkt-auswahl` am bestehenden Kaufmodul.

Die lokale Vorschau zeigt nur einen beschrifteten Kaufmodul-Platzhalter und hat `noindex, nofollow`. Weder Platzhalter noch Vorschau-Robots gehören in den Shop. Die Produktseite bleibt bei ihrem Canonical und `index, follow`.

Das bestehende Produktbild bleibt bestehen. Für das neue Design sind keine zusätzlichen Bilddateien oder externen Schrift-Downloads nötig. Keine Quellenliste oder separate Hinweis-Sektion ans Textende hängen; die zwei sachlichen Primärlinks stehen bereits bei den zugehörigen Aussagen.

## Rückgabe durch Cursor

Liste geänderte Dateien/Felder, bestätigte Produktangaben, durchgeführte Tests und offene Punkte auf. Prüfe vor Abnahme die echte Produktseite inklusive Kaufmodul, Metadaten und bestehender strukturierter Daten. Die lokale Designprüfung ersetzt weder den Backendabgleich noch einen Test im tatsächlichen Shop-Template.
