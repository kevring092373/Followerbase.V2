"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CONSENT_KEY = "followerbase_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function acceptAll() {
    localStorage.setItem(CONSENT_KEY, "all");
    setVisible(false);
  }

  function acceptNecessaryOnly() {
    localStorage.setItem(CONSENT_KEY, "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie-Hinweis">
      <div className="cookie-banner-inner">
        <p className="cookie-banner-text">
          Wir nutzen Cookies, um die Nutzung der Seite zu ermöglichen und zu verbessern. Notwendige
          Cookies sind für den Betrieb erforderlich. Weitere Infos findest du in unserer{" "}
          <Link href="/datenschutz" className="cookie-banner-link">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="cookie-banner-actions">
          <button
            type="button"
            onClick={acceptNecessaryOnly}
            className="btn btn-secondary cookie-banner-btn"
          >
            Nur notwendige
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="btn btn-primary cookie-banner-btn"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
