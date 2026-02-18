"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, from }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login fehlgeschlagen.");
        return;
      }
      router.push(data.redirect || "/admin");
      router.refresh();
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login card">
        <h1 className="admin-login-title">Admin-Login</h1>
        <p className="admin-login-hint">Passwort eingeben, um auf den Admin-Bereich zuzugreifen.</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
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
            {loading ? "Wird geprüft …" : "Anmelden"}
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
