/**
 * Bestellbestätigung per E-Mail an den Kunden (bei jeder Zahlungsart).
 * Nutzt Resend (https://resend.com). Umgebungsvariable: RESEND_API_KEY, optional EMAIL_FROM.
 */

import type { Order } from "./orders";
import { getPaymentMethodLabel } from "./orders";

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
  const paymentLabel = getPaymentMethodLabel(order);
  const items =
    order.items
      ?.map(
        (i) =>
          `<tr><td style="padding: 10px 12px 10px 0;">${escapeHtml(i.productName)}</td><td style="text-align: right; padding: 10px 12px; white-space: nowrap;">${i.quantity}</td><td style="text-align: right; padding: 10px 0 10px 12px; white-space: nowrap;">${formatCents(i.priceCents)}</td></tr>`
      )
      .join("") ?? "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Bestellbestätigung</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 32px;">
  <h1 style="font-size: 1.5rem; margin: 0 0 24px 0;">Danke für deinen Einkauf</h1>
  <p style="margin: 0 0 16px 0;">Hallo${order.customerName ? ` ${escapeHtml(order.customerName)}` : ""},</p>
  <p style="margin: 0 0 24px 0;">vielen Dank für deine Bestellung. Hier ist deine Bestellübersicht:</p>
  <p style="font-size: 1.25rem; font-weight: 700; color: #0284c7; margin: 0 0 8px 0;">Bestellnummer: ${escapeHtml(order.orderNumber)}</p>
  <p style="font-size: 0.9375rem; color: #64748b; margin: 0 0 28px 0;">Zahlungsart: ${escapeHtml(paymentLabel)}</p>
  <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
    <thead>
      <tr style="border-bottom: 2px solid #e2e8f0;">
        <th style="text-align: left; padding: 10px 12px 10px 0;">Produkt</th>
        <th style="text-align: right; padding: 10px 12px;">Menge</th>
        <th style="text-align: right; padding: 10px 0 10px 12px;">Preis</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>
  <p style="font-weight: 700; margin: 0 0 32px 0;">Gesamtbetrag: ${formatCents(total)}</p>
  <p style="margin: 0 0 24px 0; font-size: 0.9375rem; color: #64748b;">Du kannst deine Bestellung jederzeit unter der Bestellnummer verfolgen.</p>
  <p style="margin: 0;">Viele Grüße,<br>${escapeHtml(SITE_NAME)}</p>
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

const NOTIFY_ORDER_TO = "info@followerbase.de";

function buildOrderNotificationHtml(order: Order): string {
  const total = order.totalCents ?? 0;
  const paymentLabel = getPaymentMethodLabel(order);
  const items =
    order.items
      ?.map(
        (i) =>
          `<tr><td>${escapeHtml(i.productName)}</td><td>${i.quantity}</td><td>${formatCents(i.priceCents)}</td></tr>`
      )
      .join("") ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const adminOrdersUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/admin/orders` : "/admin/orders";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Neue Bestellung</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem;">Neue Bestellung</h1>
  <p><strong>Bestellnummer:</strong> ${escapeHtml(order.orderNumber)}</p>
  <p><strong>Zahlungsart:</strong> ${escapeHtml(paymentLabel)}</p>
  <p><strong>Kunde:</strong> ${escapeHtml(order.customerName || "-")} &lt;${escapeHtml(order.customerEmail || "")}&gt;</p>
  <p><strong>Gesamtbetrag:</strong> ${formatCents(total)}</p>
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
  ${order.sellerNote ? `<p><strong>Nachricht des Kunden:</strong><br>${escapeHtml(order.sellerNote)}</p>` : ""}
  <p style="margin-top: 16px;"><a href="${escapeHtml(adminOrdersUrl)}" style="color: #0284c7;">Bestellungen im Admin öffnen</a></p>
</body>
</html>`;
}

/**
 * Sendet eine Benachrichtigung über die neue Bestellung an info@followerbase.de.
 * Blockiert nicht – Fehler werden nur geloggt.
 */
export async function sendOrderNotificationToOwner(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_ORDER_TO,
      subject: `Neue Bestellung ${order.orderNumber} – ${SITE_NAME}`,
      html: buildOrderNotificationHtml(order),
    });
  } catch (e) {
    console.error("[email] Benachrichtigung an Inhaber:", e);
  }
}

/**
 * Sendet die Bestellbestätigung an die im Auftrag hinterlegte E-Mail.
 * Gibt true zurück bei Erfolg, false bei Fehler oder fehlender E-Mail/API-Key.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const email = order.customerEmail?.trim();
  if (!email || !email.includes("@")) {
    console.warn("[email] Keine gültige Kunden-E-Mail in Bestellung", order.orderNumber);
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY fehlt – in .env.local (lokal) bzw. Netlify Environment variables (Live) eintragen."
    );
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bestellbestätigung ${order.orderNumber} – ${SITE_NAME}`,
      html: buildOrderConfirmationHtml(order),
    });

    if (error) {
      console.error("[email] Resend API Fehler:", JSON.stringify(error));
      return false;
    }
    console.info("[email] Bestellbestätigung gesendet:", order.orderNumber, "an", email, "id:", data?.id);
    return true;
  } catch (e) {
    console.error("[email] Bestellbestätigung senden:", e);
    return false;
  }
}
