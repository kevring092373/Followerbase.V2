# Followercloud – Follower-Shop

Webseite und Backend für einen Shop, in dem Kunden Follower, Likes usw. für **Instagram**, **TikTok** und weitere Plattformen kaufen können. Die **Ausführung der Bestellungen** (tatsächliche Lieferung) erfolgt extern – dieses Projekt stellt nur den **Shop (Frontend)** und das **Backend zur Verwaltung** bereit.

---

## Ist das möglich?

**Ja.** Die geplante Aufteilung ist gut umsetzbar:

| Bereich | In diesem Projekt | Außerhalb (bei dir) |
|--------|-------------------|----------------------|
| Shop-Webseite | ✅ Katalog, Warenkorb, Checkout | – |
| Bestellverwaltung | ✅ Bestellungen speichern, anzeigen, Status | – |
| Ausführung | – | ✅ Anbindung an Provider/API, Lieferung |

Du kannst später z. B. per Webhook oder API die gespeicherten Bestellungen an dein Ausführungssystem übergeben.

---

## Geplante Struktur

```
Followercloud.V1/
├── app/                    # Next.js App Router
│   ├── product/[slug]/     # Einzelprodukt (z.B. /product/instagram-follower-kaufen)
│   ├── products/           # Produktübersicht (Links zu allen Produkten)
│   ├── admin/              # Admin-Bereich (Produkte, Bestellungen verwalten)
│   └── api/                # API-Routen (Bestellungen, Produkte, Admin)
├── components/             # Wiederverwendbare UI-Komponenten
├── lib/                    # Datenbank, Typen, Hilfsfunktionen
├── public/                 # Statische Dateien
└── ...                     # Konfiguration (Next.js, TypeScript, etc.)
```

- **URLs:** SEO-freundlich, z.B. `followercloud.de/product/instagram-follower-kaufen`. Startseite, Produktübersicht unter `/products`, Einzelprodukte unter `/product/[slug]`, Warenkorb & Checkout (später).
- **Admin:** Login (später), Produkte anlegen/bearbeiten, Bestellungen einsehen, ggf. Status setzen oder an „Ausführung“ übergeben.
- **API:** z. B. `POST /api/orders` (Bestellung anlegen), `GET/POST /api/products`, Admin-Endpunkte. So kann dein externes System Bestellungen lesen oder du exportierst sie.

---

## Tech-Stack (Vorschlag)

- **Next.js** (React) – eine Codebasis für Frontend + API, einfach später zu hosten (z. B. Vercel oder eigener Server).
- **TypeScript** – saubere Typen für Produkte, Bestellungen, API.
- **Daten:** Zunächst z. B. JSON/Dateien oder SQLite; später problemlos auf PostgreSQL o. Ä. umstellbar.

Wenn du andere Wünsche hast (z. B. reines React + separates Backend), können wir die Struktur anpassen.

---

## Nächste Schritte

1. **Struktur anlegen** – Ordner und Basis-Dateien wie oben.
2. **Shop:** Startseite + einfacher Katalog (Plattformen, Produkttypen wie Follower/Likes).
3. **Backend:** Typen für Produkt & Bestellung, API-Routen, einfache Speicherung.
4. **Admin:** Grundgerüst für Produkt- und Bestellverwaltung.
5. **Später:** Hosting, ggf. echte Zahlung, Anbindung an dein Ausführungssystem.

---

## Sichere Zahlung

**Ja, ein sicheres Zahlungssystem ist problemlos integrierbar.** Übliche Optionen:

| Anbieter | Besonderheit | Typisch für |
|----------|--------------|-------------|
| **Stripe** | Karte, SEPA, Apple/Google Pay, sehr gute API | International, viele Shops |
| **PayPal** | Bekannt bei Kunden, Konto oder Karte | DE/EU, geringe Hürde |
| **Mollie** | Viele Methoden (Karte, iDEAL, SEPA, PayPal) | DE/NL/EU |
| **Klarna** | Rechnung, Raten | DE/SE, hohe Conversion |

Technisch: Du holst dir einen Account beim Anbieter, bekommst API-Keys (geheim halten!) und baust im Checkout (nach Warenkorb) einen Zahlungsflow ein – oft mit Redirect zur Zahlungsseite des Anbieters oder eingebettetem Formular. Die Zahlung läuft dann über den Anbieter (PCI-konform), dein Server speichert nur die Bestellung und eine Referenz. Wenn du dich für einen Anbieter entscheidest, können wir den konkreten Einbau (z. B. Stripe Checkout oder Mollie) planen.
