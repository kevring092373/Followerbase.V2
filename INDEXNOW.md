# IndexNow

Nach einem erfolgreichen Deploy werden geänderte öffentliche Canonical-URLs an [IndexNow](https://www.indexnow.org/) gemeldet (Bing und teilnehmende Suchmaschinen). Ein fehlgeschlagener Ping bricht den Deploy nicht ab.

## Schlüssel

| Variable | Zweck |
| --- | --- |
| `INDEXNOW_KEY` | Öffentlicher Nachweis-Schlüssel. Muss zum Dateinamen `public/<INDEXNOW_KEY>.txt` passen. |
| `INDEXNOW_SECRET` | Geheim. Autorisiert `POST /api/indexnow`. Darf **nicht** dem öffentlichen Key entsprechen. |

Den öffentlichen Key nicht als Secret behandeln: die Datei `/<INDEXNOW_KEY>.txt` muss erreichbar sein, damit IndexNow die Domain prüfen kann. `INDEXNOW_SECRET` niemals ins Repository schreiben.

Aktuelle Key-Datei: `public/a8c39dc9f6e64c79b59409b682c15d4c.txt`

## Wann wird gesendet?

1. **Nach dem Netlify-Deploy** über das lokale Plugin `netlify/plugins/indexnow` (`onSuccess`).
2. **Manuell / per Webhook** über `POST /api/indexnow` mit Header `x-indexnow-secret` oder `Authorization: Bearer <INDEXNOW_SECRET>`.

Body-Varianten der API:

```json
{ "urls": ["/product/instagram-follower-kaufen"] }
```

```json
{ "all": true }
```

Supabase-Webhooks mit `table` + `record.slug` (z. B. `products`, `blog_posts`) werden ebenfalls in Canonical-Pfade übersetzt.

## Regeln

- Nur HTTPS-Canonical-URLs der eigenen Domain
- Keine Query-Parameter, keine Admin-/API-Pfade
- Doppelte URLs im selben Lauf werden entfernt
- Gelöschte Produkt-Slugs aus `content/products.json` werden mitgemeldet (treffen danach auf 301 oder 404)
- Fehler werden geloggt, der Deploy bleibt erfolgreich
