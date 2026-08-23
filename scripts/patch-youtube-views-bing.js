/**
 * Patcht die YouTube-Views-Beschreibung (CTA, FAQ, Tabellen) und schreibt sie
 * in die HTML-Datei. Optional: Upsert nach Supabase.
 *
 *   node scripts/patch-youtube-views-bing.js
 *   node scripts/patch-youtube-views-bing.js --upsert
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^["']|["']$/g, "");
    if (key) process.env[key] = value;
  }
}

function htmlToPlainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isBadFaq(block) {
  const text = htmlToPlainText(block);
  if (text.includes("erkennt youtube gekaufte views")) return true;
  if (text.includes("zählen gekaufte views zur watchtime")) return true;
  if (/4\.?000\s*-?\s*stunden/.test(text)) return true;
  return false;
}

function patchHtml(html) {
  let out = html.replace(
    /<(div|details)\b([^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi,
    (block) => (isBadFaq(block) ? "" : block)
  );
  out = out
    .replace(
      /(<a\b[^>]*class=["'][^"']*\bcta-button\b[^"']*["'][^>]*\bhref=["'])[^"']*(["'])/gi,
      "$1#produkt-auswahl$2"
    )
    .replace(
      /(<a\b[^>]*\bhref=["'])[^"']*(["'][^>]*class=["'][^"']*\bcta-button\b[^"']*["'])/gi,
      "$1#produkt-auswahl$2"
    );
  if (!out.includes("table-scroll-wrap")) {
    out = out.replace(
      /<table\b[^>]*class=["'][^"']*\bdata-table\b[^"']*["'][^>]*>[\s\S]*?<\/table>/gi,
      (table) =>
        `<div class="table-scroll-wrap"><p class="table-scroll-hint">Tabelle seitlich scrollen, um alle Spalten zu sehen</p><div class="table-scroll">${table}</div></div>`
    );
  }
  out = out.replace(
    /<div\b([^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*)>\s*<button\b[^>]*>([\s\S]*?)<\/button>\s*<div\b([^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*)>\s*(?:<div\b[^>]*class=["'][^"']*\bfaq-answer-inner\b[^"']*["'][^>]*>)?([\s\S]*?)(?:<\/div>\s*)?<\/div>\s*<\/div>/gi,
    (_m, _a, question, _b, answer) =>
      `<details class="faq-item"><summary class="faq-question">${question}</summary><div class="faq-answer"><div class="faq-answer-inner">${answer}</div></div></details>`
  );
  const extraCss = `
details.faq-item .faq-answer,
details.faq-item[open] .faq-answer { max-height: none; overflow: visible; }
details.faq-item summary.faq-question { list-style: none; }
details.faq-item summary.faq-question::-webkit-details-marker { display: none; }
.table-scroll-wrap { margin: 1.5rem 0; max-width: 100%; }
.table-scroll-hint { display: none; font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.5rem; }
.table-scroll { width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
@media (max-width: 768px) {
  .table-scroll-hint { display: block; }
}
`;
  if (!out.includes("details.faq-item .faq-answer") && out.includes("</style>")) {
    out = out.replace("</style>", `${extraCss}</style>`);
  }
  return out;
}

async function main() {
  const root = path.join(__dirname, "..");
  const htmlPath = path.join(root, "content", "product-html", "youtube-views-kaufen.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const patched = patchHtml(html);
  fs.writeFileSync(htmlPath, patched, "utf8");
  console.log("HTML gepatcht:", htmlPath);

  const badLeft = /erkennt youtube gekaufte views|zählen gekaufte views zur watchtime|4\.000-Stunden-Ziel/i.test(
    patched
  );
  const ctaOk = patched.includes('href="#produkt-auswahl"') && patched.includes("YouTube Views bestellen");
  console.log("Problematische FAQ entfernt:", !/Zählen gekaufte Views zur Watchtime\?/.test(patched));
  console.log("CTA auf #produkt-auswahl:", ctaOk);
  if (badLeft) console.warn("Hinweis: 4.000-Stunden-Formulierung steht noch im Fließtext (absichtlich nicht umgeschrieben).");

  if (!process.argv.includes("--upsert")) return;

  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Supabase-Env fehlt – Upsert übersprungen.");
    process.exit(1);
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("products")
    .update({
      description: patched,
      meta_title: "YouTube Views kaufen: 1.000 Aufrufe ab 5,23 €",
      meta_description:
        "YouTube Views kaufen: 1.000–25.000 Aufrufe, Lieferung in 1–5 Tagen und kein Passwort nötig. Pakete, Preise und Bedingungen transparent ansehen.",
      image: "/icons/youtube-views-kaufen.webp",
      prices_cents: [523, 1195, 2345, 4450, 9950],
      updated_at: now,
    })
    .eq("slug", "youtube-views-kaufen");
  if (error) {
    console.error("Supabase-Update:", error.message);
    process.exit(1);
  }
  console.log("Supabase aktualisiert, updated_at=", now);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
