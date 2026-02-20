import Link from "next/link";

type Props = {
  className?: string;
  showText?: boolean;
};

/** Logo: Followerbase-Symbol (F) + optionaler Text. Farben aus CSS-Variablen. */
export function Logo({ className = "", showText = true }: Props) {
  return (
    <Link href="/" className={`logo-link ${className}`} aria-label="Followerbase Startseite">
      <span className="logo-icon" aria-hidden>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M8 6h12v4h-8v3h6v4h-6v9H8V6z"
            fill="currentColor"
          />
        </svg>
      </span>
      {showText && <span className="logo-text">Followerbase</span>}
    </Link>
  );
}
