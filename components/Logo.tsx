import Link from "next/link";
import Image from "next/image";

const LOGO_SRC = "/icons/Followerbase%20Logo.png";

type Props = {
  className?: string;
  showText?: boolean;
};

/** Logo: Followerbase-Logo-Bild aus public/icons. */
export function Logo({ className = "", showText = false }: Props) {
  return (
    <Link href="/" className={`logo-link ${className}`} aria-label="Followerbase Startseite">
      <Image
        src={LOGO_SRC}
        alt="Followerbase"
        width={160}
        height={44}
        className="logo-img"
        priority
        sizes="(max-width: 640px) 120px, 160px"
      />
      {showText && <span className="logo-text">Followerbase</span>}
    </Link>
  );
}
