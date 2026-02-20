import Link from "next/link";
import { getAllProducts } from "@/lib/products-data";
import { categories } from "@/lib/categories";
import { getAllPosts } from "@/lib/blog-data";

import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Sitemap",
  description:
    "Übersicht aller Seiten von Followerbase: Produkte, Kategorien, Blog und rechtliche Seiten.",
  openGraph: { title: "Sitemap – Followerbase", url: absoluteUrl("/seiten"), type: "website" as const },
  alternates: { canonical: absoluteUrl("/seiten") },
};

const staticMain = [
  { href: "/", label: "Start" },
  { href: "/products", label: "Produktübersicht" },
  { href: "/blog", label: "Blog" },
  { href: "/bestellung-verfolgen", label: "Bestellung verfolgen" },
  { href: "/instagram-profilbild", label: "Instagram-Profilbild" },
];

const staticLegal = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/widerrufsbelehrung", label: "Widerrufsbelehrung" },
];

export default async function SitemapPage() {
  const [products, posts] = await Promise.all([getAllProducts(), getAllPosts()]);

  return (
    <article className="sitemap-page">
      <header className="sitemap-header">
        <h1 className="heading-hero">Sitemap</h1>
        <p className="subtitle">
          Alle Seiten im Überblick – Shop, Blog und Rechtliches.
        </p>
      </header>

      <div className="sitemap-grid">
        <section className="sitemap-section">
          <h2 className="sitemap-section-title">Start & Shop</h2>
          <ul className="sitemap-list">
            {staticMain.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="sitemap-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="sitemap-section">
          <h2 className="sitemap-section-title">Kategorien</h2>
          <ul className="sitemap-list">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products/${cat.slug}`}
                  className="sitemap-link"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="sitemap-section sitemap-section--wide">
          <h2 className="sitemap-section-title">Produkte</h2>
          <ul className="sitemap-list sitemap-list--columns">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/product/${p.slug}`} className="sitemap-link">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="sitemap-section">
          <h2 className="sitemap-section-title">Blog</h2>
          <ul className="sitemap-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="sitemap-link">
                  {post.title || post.slug}
                </Link>
              </li>
            ))}
            {posts.length === 0 && (
              <li className="sitemap-list-empty">Noch keine Beiträge.</li>
            )}
          </ul>
        </section>

        <section className="sitemap-section">
          <h2 className="sitemap-section-title">Rechtliches</h2>
          <ul className="sitemap-list">
            {staticLegal.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="sitemap-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="sitemap-xml-hint">
        <Link href="/sitemap.xml" className="sitemap-xml-link">
          sitemap.xml
        </Link>{" "}
        für Suchmaschinen
      </p>
    </article>
  );
}
