/**
 * Bestellbestätigung per E-Mail an den Kunden (z. B. nach PayPal-Zahlung).
 * Nutzt Resend (https://resend.com). Umgebungsvariable: RESEND_API_KEY, optional EMAIL_FROM.
 */

import type { Order } from "./orders";

const FROM_EMAIL = process.env.EMAIL_FROM || "Followerbase <onboarding@resend.dev>";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Followerbase";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function buildOrderConfirmationHtml(order: Order): string {
  const total = order.totalCents ?? 0;
  const items =
    order.items
      ?.map(
        (i) =>
          `<tr><td>${escapeHtml(i.productName)}</td><td>${i.quantity}</td><td>${formatCents(i.priceCents)}</td></tr>`
      )
      .join("") ?? "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Bestellbestätigung</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Bestellung bestätigt</h1>
  <p>Hallo${order.customerName ? ` ${escapeHtml(order.customerName)}` : ""},</p>
  <p>vielen Dank für deine Bestellung. Wir haben sie unter folgender Bestellnummer erfasst:</p>
  <p style="font-size: 1.25rem; font-weight: 700; color: #6366f1;">${escapeHtml(order.orderNumber)}</p>
  <p>Bezahlt per PayPal.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <thead>
      <tr style="border-bottom: 2px solid #e2e8f0;">
        <th style="text-align: left; padding: 8px 0;">Produkt</th>
        <th style="text-align: right; padding: 8px 0;">Menge</th>
        <th style="text-align: right; padding: 8px 0;">Preis</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>
  <p style="font-weight: 700;">Gesamtbetrag: ${formatCents(total)}</p>
  <p style="margin-top: 24px; font-size: 0.9375rem; color: #64748b;">Du kannst deine Bestellung jederzeit unter der Bestellnummer verfolgen.</p>
  <p style="margin-top: 24px;">Viele Grüße,<br>${escapeHtml(SITE_NAME)}</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sendet die Bestellbestätigung an die im Auftrag hinterlegte E-Mail.
 * Gibt true zurück bei Erfolg, false bei Fehler oder fehlender E-Mail/API-Key.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const email = order.customerEmail?.trim();
  if (!email || !email.includes("@")) return false;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY nicht gesetzt – Bestellbestätigung nicht gesendet.");
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bestellbestätigung ${order.orderNumber} – ${SITE_NAME}`,
      html: buildOrderConfirmationHtml(order),
    });

    if (error) {
      console.error("[email] Resend Fehler:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] Bestellbestätigung senden:", e);
    return false;
  }
}
