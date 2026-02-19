"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [step, setStep] = useState<"password" | "2fa">("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, from }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login fehlgeschlagen.");
        return;
      }
      if (data.need2fa) {
        setStep("2fa");
        setCode("");
      } else {
        window.location.href = data.redirect || "/admin";
        return;
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  async function handle2FASubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.replace(/\s/g, "") }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Code ungültig.");
        return;
      }
      window.location.href = data.redirect || "/admin";
      return;
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "2fa") {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login card">
          <h1 className="admin-login-title">Zwei-Faktor-Code</h1>
          <p className="admin-login-hint">
            Gib den 6-stelligen Code aus deiner Authenticator-App (z. B. Google Authenticator) ein.
          </p>
          <form onSubmit={handle2FASubmit} className="admin-login-form">
            {error && (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            )}
            <label htmlFor="admin-2fa-code" className="admin-login-label">
              Code
            </label>
            <input
              id="admin-2fa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="admin-login-input"
              placeholder="000000"
              maxLength={6}
              disabled={loading}
              autoFocus
            />
            <div className="admin-login-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setStep("password"); setError(null); setCode(""); }}
                disabled={loading}
              >
                Zurück
              </button>
              <button type="submit" className="btn btn-primary admin-login-btn" disabled={loading || code.length !== 6}>
                {loading ? "Wird geprüft …" : "Anmelden"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login card">
        <h1 className="admin-login-title">Admin-Login</h1>
        <p className="admin-login-hint">Passwort eingeben, um auf den Admin-Bereich zuzugreifen.</p>
        <form onSubmit={handlePasswordSubmit} className="admin-login-form">
          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}
          <label htmlFor="admin-password" className="admin-login-label">
            Passwort
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-login-input"
            autoComplete="current-password"
            autoFocus
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary admin-login-btn" disabled={loading}>
            {loading ? "Wird geprüft …" : "Weiter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-wrap"><div className="admin-login card"><p>Laden …</p></div></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
