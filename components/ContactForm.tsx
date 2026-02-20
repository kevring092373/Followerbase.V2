"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Etwas ist schiefgelaufen.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte später erneut versuchen.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="contact-form-row">
        <label htmlFor="contact-name" className="contact-form-label">
          Name *
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="contact-form-input"
          placeholder="Dein Name"
          disabled={status === "sending"}
        />
      </div>
      <div className="contact-form-row">
        <label htmlFor="contact-email" className="contact-form-label">
          E-Mail *
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="contact-form-input"
          placeholder="deine@email.de"
          disabled={status === "sending"}
        />
      </div>
      <div className="contact-form-row">
        <label htmlFor="contact-message" className="contact-form-label">
          Nachricht *
        </label>
        <textarea
          id="contact-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="contact-form-input contact-form-textarea"
          placeholder="Deine Nachricht..."
          rows={5}
          disabled={status === "sending"}
        />
      </div>

      {status === "error" && errorMsg && (
        <p className="contact-form-error" role="alert">
          {errorMsg}
        </p>
      )}
      {status === "success" && (
        <p className="contact-form-success" role="status">
          Nachricht wurde gesendet. Wir melden uns schnellstmöglich.
        </p>
      )}

      <button
        type="submit"
        className="contact-form-submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Wird gesendet…" : "Nachricht senden"}
      </button>
    </form>
  );
}
