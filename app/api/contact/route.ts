import { NextResponse } from "next/server";

const CONTACT_TO = "info@followerbase.de";
const FROM_EMAIL = process.env.EMAIL_FROM || "Followerbase <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Bitte alle Felder ausfüllen." },
        { status: 400 }
      );
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Bitte eine gültige E-Mail-Adresse angeben." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[contact] RESEND_API_KEY fehlt");
      return NextResponse.json(
        { error: "E-Mail-Versand ist derzeit nicht konfiguriert." },
        { status: 503 }
      );
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const html = `
      <p><strong>Von:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${escapeHtml(message)}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_TO,
      replyTo: email,
      subject: `Kontaktanfrage von ${name} – Followerbase`,
      html,
    });

    if (error) {
      console.error("[contact] Resend Fehler:", JSON.stringify(error));
      return NextResponse.json(
        { error: "E-Mail konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[contact] Fehler:", e);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
