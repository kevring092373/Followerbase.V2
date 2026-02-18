# Projektstruktur Followerbase

## Übersicht

| Ordner/Datei | Zweck |
|--------------|--------|
| `app/` | Next.js App Router – alle Seiten und API-Routen |
| `app/page.tsx` | Startseite (Links zu Produkten) |
| `app/products/` | Produktübersicht (Links zu allen Produkt-URLs) |
| `app/product/[slug]/` | Einzelprodukt, z.B. /product/instagram-follower-kaufen |
| `app/admin/` | Admin-Bereich – nicht von der öffentlichen Seite verlinkt, später eigene URL/Login |
| `app/admin/products/` | Produktverwaltung |
| `app/admin/orders/` | Bestellübersicht |
| `app/api/` | API für Frontend und ggf. externes Ausführungssystem |
| `lib/` | Gemeinsame Typen, später DB/Store-Logik |
| `lib/types.ts` | Product, Order, OrderItem, Platform, OrderStatus |
| `components/` | Header, Logo, später weitere UI-Komponenten |
| `public/` | (noch leer) Statische Dateien |

## API (geplant)

- `GET /api/products` – Produkte (optional `?platform=...` oder `?slug=instagram-follower-kaufen`)
- `POST /api/orders` – Bestellung anlegen (Checkout)
- `GET /api/orders` – Bestellungen (Admin, später mit Auth)

## Nächste Ausbauschritte

1. **Daten:** Persistenz (z.B. `lib/store.ts` mit JSON/Datei oder SQLite) für Produkte & Bestellungen.
2. **Shop:** Produktkarten aus API, Warenkorb (localStorage oder Context), Checkout-Formular.
3. **Admin:** CRUD für Produkte, Bestellliste mit Status, Export (CSV/API) für dein Ausführungssystem.
4. **Sicherheit:** Admin-Login, Rate-Limiting, Validierung der API-Inputs.
