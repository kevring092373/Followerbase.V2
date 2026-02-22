"use client";

import { useState, useCallback } from "react";

type Props = {
  url: string;
  title: string;
  /** Optional description for WhatsApp etc. */
  text?: string;
  /** Optional class for the wrapper */
  className?: string;
};

function buildShareUrl(
  platform: "facebook" | "twitter" | "whatsapp" | "linkedin",
  url: string,
  title: string,
  text?: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const combined = text ? `${title} – ${text}` : title;
  const encodedCombined = encodeURIComponent(`${combined} ${url}`);

  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodedCombined}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    default:
      return url;
  }
}

export function ShareButtons({ url, title, text, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }, [url]);

  const openShare = (href: string) => {
    if (typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  return (
    <div className={`share-buttons ${className}`} role="group" aria-label="Seite teilen">
      <span className="share-buttons-label">Teilen:</span>
      <div className="share-buttons-list">
        <a
          href={buildShareUrl("facebook", url, title, text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            openShare(buildShareUrl("facebook", url, title, text));
          }}
          className="share-btn share-btn-facebook"
          aria-label="Auf Facebook teilen"
        >
          Facebook
        </a>
        <a
          href={buildShareUrl("twitter", url, title, text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            openShare(buildShareUrl("twitter", url, title, text));
          }}
          className="share-btn share-btn-twitter"
          aria-label="Auf X (Twitter) teilen"
        >
          X
        </a>
        <a
          href={buildShareUrl("whatsapp", url, title, text)}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn share-btn-whatsapp"
          aria-label="Per WhatsApp teilen"
        >
          WhatsApp
        </a>
        <a
          href={buildShareUrl("linkedin", url, title, text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            openShare(buildShareUrl("linkedin", url, title, text));
          }}
          className="share-btn share-btn-linkedin"
          aria-label="Auf LinkedIn teilen"
        >
          LinkedIn
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="share-btn share-btn-copy"
          aria-label="Link kopieren"
        >
          {copied ? "Kopiert!" : "Link kopieren"}
        </button>
      </div>
    </div>
  );
}
