"use client";

import { useState, useCallback } from "react";
import { WhatsAppIcon } from "./WhatsAppButton";

type Props = {
  url: string;
  title: string;
  /** Optional description for WhatsApp etc. */
  text?: string;
  /** Optional class for the wrapper */
  className?: string;
  /** Icon-only layout (no "Teilen:" label, compact) */
  iconOnly?: boolean;
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

const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconTwitter = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconLink = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export function ShareButtons({ url, title, text, className = "", iconOnly = false }: Props) {
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
    <div
      className={`share-buttons ${iconOnly ? "share-buttons--icon-only" : ""} ${className}`}
      role="group"
      aria-label="Seite teilen"
    >
      <span className="share-buttons-label">{iconOnly ? "Teilen" : "Teilen:"}</span>
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
          title="Auf Facebook teilen"
        >
          <IconFacebook />
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
          title="Auf X teilen"
        >
          <IconTwitter />
        </a>
        <a
          href={buildShareUrl("whatsapp", url, title, text)}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn share-btn-whatsapp"
          aria-label="Per WhatsApp teilen"
          title="Per WhatsApp teilen"
        >
          <WhatsAppIcon />
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
          title="Auf LinkedIn teilen"
        >
          <IconLinkedIn />
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="share-btn share-btn-copy"
          aria-label="Link kopieren"
          title={copied ? "Kopiert!" : "Link kopieren"}
        >
          {copied ? <span className="share-btn-copy-text">Kopiert!</span> : <IconLink />}
        </button>
      </div>
    </div>
  );
}
