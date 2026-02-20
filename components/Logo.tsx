import Link from "next/link";

type Props = {
  className?: string;
  showText?: boolean;
};

/** Logo: Symbol (Wolke) + optionaler Text. Farben aus CSS-Variablen. */
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
            d="M8 20a6 6 0 0 1 5.5-5.96 6.5 6.5 0 0 1 12.2-1.8A5 5 0 0 1 24 22H8.5a4.5 4.5 0 0 1-.5-2Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {showText && <span className="logo-text">Followerbase</span>}
    </Link>
  );
}
