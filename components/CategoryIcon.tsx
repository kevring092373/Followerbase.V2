"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  /** Vollständiger Pfad zum Icon, z. B. /icons/instagram.png */
  src: string;
  fallback: string;
  /** Alt-Text für das Icon (z. B. Kategorie- oder Plattformname) */
  alt?: string;
  size?: number;
  className?: string;
};

/**
 * Zeigt das Kategorie-Icon; bei Fehler/404 wird das Fallback-Emoji angezeigt.
 */
export function CategoryIcon({ src, fallback, alt = "", size = 48, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={className} aria-hidden style={{ fontSize: size ? `${size * 0.6}px` : undefined }}>
        {fallback}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
