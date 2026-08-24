import Link from "next/link";
import { YOUTUBE_VIEWS_SLUG } from "@/lib/youtube-views-seo";

const VIEWS_PAGE_LINKS: { href: string; label: string }[] = [
  { href: "/product/youtube-follower-kaufen", label: "YouTube Abonnenten" },
  { href: "/product/youtube-likes-kaufen", label: "YouTube Likes" },
  { href: "/product/youtube-watchtime-kaufen", label: "YouTube Watchtime" },
  { href: "/products/youtube", label: "YouTube-Kategorieseite" },
  { href: "/blog/youtube-aufrufe-erhoehen", label: "YouTube-Aufrufe erhöhen" },
  { href: "/blog/youtube-abonnenten-bekommen", label: "YouTube-Abonnenten bekommen" },
];

const INBOUND_LINKS: Record<string, { before: string; text: string; after: string }> = {
  "youtube-likes-kaufen": {
    before: "Zusätzlich zu Likes kannst du die Sichtbarkeit deiner Videos über die ",
    text: "Preise für YouTube Views",
    after: " vergleichen.",
  },
  "youtube-watchtime-kaufen": {
    before: "Watchtime und Aufrufe gehören oft zusammen – hier kannst du ",
    text: "YouTube-Aufrufe bestellen",
    after: ".",
  },
  "youtube-follower-kaufen": {
    before: "Neben Abonnenten gibt es auch ",
    text: "YouTube-Views-Pakete",
    after: " für einzelne Videos.",
  },
};

export function ProductContextualLinks({ slug }: { slug: string }) {
  if (slug === YOUTUBE_VIEWS_SLUG) {
    return (
      <p className="product-contextual-links">
        Passend dazu findest du auch{" "}
        {VIEWS_PAGE_LINKS.map((item, index) => {
          const sep =
            index < VIEWS_PAGE_LINKS.length - 2 ? ", " : index === VIEWS_PAGE_LINKS.length - 2 ? " und " : ".";
          return (
            <span key={item.href}>
              <Link href={item.href}>{item.label}</Link>{sep}
            </span>
          );
        })}
      </p>
    );
  }

  const inbound = INBOUND_LINKS[slug];
  if (!inbound) return null;

  return (
    <p className="product-contextual-links">
      {inbound.before}
      <Link href={`/product/${YOUTUBE_VIEWS_SLUG}`}>{inbound.text}</Link>
      {inbound.after}
    </p>
  );
}
