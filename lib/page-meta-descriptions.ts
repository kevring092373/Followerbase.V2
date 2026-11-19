/**
 * Meta-Descriptions für Seiten mit bisher zu kurzen Snippets (Bing: 150–160 Zeichen).
 * Schlüssel = Canonical-Pfad.
 */
export const PAGE_META_DESCRIPTIONS = {
  "/products/instagram":
    "Instagram Follower ab 0,99 €, Likes ab 0,85 €, Views und mehr: 14 Produkte mit Drip-Feed-Lieferung, 30 Tage Nachfüllgarantie und Zahlung per PayPal oder Klarna.",
  "/products/tiktok":
    "TikTok Follower ab 2,99 €, Likes ab 1,39 €, Views ab 0,45 €: Reichweite mit Drip-Feed-Lieferung, 30 Tage Nachfüllgarantie und Zahlung per PayPal oder Klarna.",
  "/products/youtube":
    "YouTube Abonnenten ab 8,45 € und Views ab 10,45 €: Kanal-Wachstum mit Drip-Feed-Lieferung, 30 Tage Nachfüllgarantie und sicherer Zahlung per PayPal oder Klarna.",
  "/products/snapchat":
    "Snapchat Follower ab 8,90 € kaufen: schneller Reichweiten-Aufbau per Drip-Feed, ohne Passwort, mit Nachfüllgarantie und Zahlung per PayPal oder Klarna.",
  "/products/telegram":
    "Telegram Gruppenmitglieder ab 1,90 € und Post-Views kaufen: Kanal-Wachstum per Drip-Feed, ohne Passwort, mit Garantie und Zahlung per PayPal oder Klarna.",
  "/products/facebook":
    "Facebook Post-Likes und mehr kaufen: Reichweite für deine Seite per Drip-Feed-Lieferung, ohne Passwort, mit Nachfüllgarantie und Zahlung per PayPal oder Klarna.",
  "/products/reddit":
    "Reddit Follower kaufen: Profil-Wachstum per Drip-Feed-Lieferung, ohne Passwort, diskret und sicher mit Käuferschutz über PayPal oder Klarna bei Followerbase.",
  "/products/threads":
    "Threads Follower und Likes kaufen: Reichweite auf Metas Plattform per Drip-Feed, ohne Passwort, mit Nachfüllgarantie und Zahlung per PayPal oder Klarna.",
  "/blog":
    "Tipps, Anleitungen und ehrliche Ratgeber zu Followern, Likes und Reichweite auf Instagram, TikTok und YouTube: mit echten Preisen, Benchmarks und Praxis-Guides.",
  "/bestellung-verfolgen":
    "Bestellstatus live prüfen: Bestellnummer eingeben und sehen, wie weit deine Lieferung ist. Ohne Kundenkonto und ohne Passwort, direkt im Browser.",
  "/kontakt":
    "Fragen zu Bestellung, Lieferung oder Produkten? Erreich uns per WhatsApp oder Kontaktformular. Wir antworten in der Regel innerhalb von 24 Stunden.",
  "/instagram-profilbild":
    "Instagram-Profilbild in voller Größe anzeigen und herunterladen: Nutzernamen oder Profillink eingeben, kostenlos und ohne Anmeldung für jedes öffentliche Profil.",
  "/product/instagram-follower-deutsch-kaufen":
    "Deutsche Instagram Follower ab 7,90 € im 50er-Testpaket: Profile mit deutschen Namen und Bios, Drip-Feed-Lieferung, 30 Tage Garantie, Zahlung per PayPal und Klarna.",
  "/impressum":
    "Impressum der Venus Management GbR, Betreiberin von followerbase.de: Anschrift in Engelskirchen, Kontaktdaten, Umsatzsteuer-ID und Angaben gemäß § 5 TMG.",
  "/datenschutz":
    "Datenschutzerklärung von followerbase.de: Welche Daten wir bei Besuch und Bestellung verarbeiten, wie lange wir sie speichern und welche Rechte dir nach DSGVO zustehen.",
  "/agb":
    "Allgemeine Geschäftsbedingungen von followerbase.de: Vertragsschluss, Lieferung digitaler Leistungen, Zahlung, Nachfüllgarantie und Widerruf im Überblick.",
  "/widerrufsbelehrung":
    "Widerrufsbelehrung von followerbase.de: Deine Rechte beim Kauf digitaler Leistungen, Fristen, Ausnahmen und das Muster-Widerrufsformular im Überblick.",
} as const;

export type PageMetaPath = keyof typeof PAGE_META_DESCRIPTIONS;

export function pageMetaDescription(path: PageMetaPath): string {
  return PAGE_META_DESCRIPTIONS[path];
}
