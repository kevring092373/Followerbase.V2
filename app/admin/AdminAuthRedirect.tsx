"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Wird gerendert, wenn die Session im Layout ungültig ist.
 * Client-seitige Weiterleitung, damit RSC/Fetch keine leere Seite liefert (kein Server-redirect).
 */
export function AdminAuthRedirect({ loginUrl }: { loginUrl: string }) {
  useEffect(() => {
    window.location.href = loginUrl;
  }, [loginUrl]);

  return (
    <div className="admin-login-wrap">
      <div className="admin-login card">
        <h1 className="admin-login-title">Sitzung abgelaufen</h1>
        <p className="admin-login-hint">
          Du wirst zur Anmeldung weitergeleitet. Falls nicht, klicke bitte den Link unten.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href={loginUrl} className="btn btn-primary">
            Zur Anmeldung
          </Link>
        </p>
      </div>
    </div>
  );
}
