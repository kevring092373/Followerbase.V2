"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchInstagramProfilePic, type InstagramStats } from "./actions";

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Mio.";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + " Tsd.";
  return n.toLocaleString("de-DE");
}

function StatsBlock({ stats }: { stats: InstagramStats }) {
  const hasAny = stats.followers != null || stats.following != null || stats.posts != null;
  if (!hasAny) return null;
  return (
    <div className="instagram-profilbild-stats">
      {stats.posts != null && (
        <div className="instagram-profilbild-stat">
          <span className="instagram-profilbild-stat-value">{formatCount(stats.posts)}</span>
          <span className="instagram-profilbild-stat-label">Beiträge</span>
        </div>
      )}
      {stats.followers != null && (
        <div className="instagram-profilbild-stat">
          <span className="instagram-profilbild-stat-value">{formatCount(stats.followers)}</span>
          <span className="instagram-profilbild-stat-label">Follower</span>
        </div>
      )}
      {stats.following != null && (
        <div className="instagram-profilbild-stat">
          <span className="instagram-profilbild-stat-value">{formatCount(stats.following)}</span>
          <span className="instagram-profilbild-stat-label">wird gefolgt</span>
        </div>
      )}
    </div>
  );
}

export default function InstagramProfilbildPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchInstagramProfilePic>> | null>(null);
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);
  const [fallbackDone, setFallbackDone] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // Fallback: Wenn Server nur URL liefert (kein imageDataUrl), Bild über API laden
  useEffect(() => {
    if (!result?.ok || !result.url || result.imageDataUrl) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setFallbackImageUrl(null);
      setFallbackDone(false);
      return;
    }
    setFallbackDone(false);
    let cancelled = false;
    fetch("/api/instagram-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: result.url }),
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled) return;
        if (blob) {
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setFallbackImageUrl(url);
        }
        setFallbackDone(true);
      })
      .catch(() => {
        if (!cancelled) setFallbackDone(true);
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setFallbackImageUrl(null);
    };
  }, [result]);

  const displayImageUrl = result?.ok ? (result.imageDataUrl ?? fallbackImageUrl) : null;
  const showPlaceholder = result?.ok && !displayImageUrl;
  const placeholderText =
    showPlaceholder && !fallbackDone
      ? "Bild wird geladen…"
      : "Bild konnte nicht geladen werden. Unten „Profil auf Instagram öffnen“ nutzen und Bild dort speichern.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchInstagramProfilePic(input.trim());
      setResult(data);
    setImageZoomed(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="instagram-profilbild-page">
      <Link
        href="/"
        className="text-muted"
        style={{ marginBottom: "1rem", display: "inline-block", fontSize: "0.9375rem" }}
      >
        ← Zurück
      </Link>

      <h1 className="instagram-profilbild-title">Instagram-Profilbild anzeigen</h1>
      <p className="instagram-profilbild-intro">
        Gib einen Instagram-Nutzernamen oder einen Profillink ein – Profilbild und, wenn möglich, Follower- und Beitragszahl werden angezeigt.
      </p>

      <form onSubmit={handleSubmit} className="instagram-profilbild-form card">
        <label htmlFor="instagram-input" className="instagram-profilbild-label">
          Profilname oder Link
        </label>
        <input
          id="instagram-input"
          type="text"
          className="instagram-profilbild-input"
          placeholder="z. B. @username oder https://www.instagram.com/username/"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn btn-primary instagram-profilbild-btn"
          disabled={loading || !input.trim()}
        >
          {loading ? "Wird geladen …" : "Profil anzeigen"}
        </button>
      </form>

      {result && (
        <section className="instagram-profilbild-result card" aria-live="polite">
          {result.ok ? (
            <>
              <h2 className="instagram-profilbild-result-title">
                {result.fullName ? (
                  <>
                    {result.fullName} <span className="instagram-profilbild-username">@{result.username}</span>
                  </>
                ) : (
                  <>@{result.username}</>
                )}
              </h2>
              {result.stats && <StatsBlock stats={result.stats} />}
              <div
                className={`instagram-profilbild-result-image-wrap${imageZoomed ? " instagram-profilbild-result-image-wrap-zoomed" : ""}`}
                onClick={() => displayImageUrl && setImageZoomed((z) => !z)}
                onKeyDown={(e) => displayImageUrl && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setImageZoomed((z) => !z))}
                role={displayImageUrl ? "button" : undefined}
                tabIndex={displayImageUrl ? 0 : undefined}
                aria-label={displayImageUrl ? (imageZoomed ? "Vergrößerung schließen" : "Profilbild vergrößern") : undefined}
              >
                {displayImageUrl ? (
                  <img
                    src={displayImageUrl}
                    alt={`Profilbild von ${result.username}`}
                    className="instagram-profilbild-result-image"
                    draggable={false}
                  />
                ) : (
                  <div className="instagram-profilbild-result-image-placeholder">
                    {placeholderText}
                  </div>
                )}
              </div>
              <div className="instagram-profilbild-result-actions">
                {displayImageUrl && (
                  <a
                    href={displayImageUrl}
                    download={`instagram-${result.username}.jpg`}
                    className="btn btn-primary instagram-profilbild-download-btn"
                  >
                    Profilbild herunterladen
                  </a>
                )}
              </div>
              <p className="instagram-profilbild-result-meta">
                {displayImageUrl && (
                  <>
                    <a
                      href={displayImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram-profilbild-result-link"
                    >
                      Bild in neuem Tab öffnen
                    </a>
                    {" · "}
                  </>
                )}
                <a
                  href={`https://www.instagram.com/${result.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-profilbild-result-link"
                >
                  Profil auf Instagram öffnen
                </a>
              </p>
            </>
          ) : (
            <div className="instagram-profilbild-result-error" role="alert">
              <p className="instagram-profilbild-result-error-title">Hinweis</p>
              <p>{result.error}</p>
            </div>
          )}
        </section>
      )}

      <p className="instagram-profilbild-note">
        Öffentliche Profile werden abgefragt. Instagram kann Server-Anfragen blockieren – dann bitte Nutzernamen prüfen oder später erneut versuchen.
      </p>
    </div>
  );
}
