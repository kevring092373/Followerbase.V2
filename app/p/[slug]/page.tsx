/**
 * Eigene Seite: Inhalt aus content/pages.json unter /p/[slug].
 */
import { notFound } from "next/navigation";
import { getPageBySlug, getAllPages } from "@/lib/pages-data";
import { absoluteUrl, brandOgImage, truncateDescription, stripEmbeddedDuplicateSeoFromHtml } from "@/lib/seo";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const page = await getPageBySlug(params.slug);
  if (!page) return { title: "Seite" };
  // Meta-Titel unverändert nutzen, sonst einmal „ – Followerbase“ anhängen
  const title = page.metaTitle?.trim()
    ? page.metaTitle.trim()
    : `${page.title ?? page.slug} – Followerbase`;
  const rawDesc = page.metaDescription ?? page.content?.replace(/<[^>]+>/g, "").slice(0, 200) ?? "";
  const description = truncateDescription(rawDesc);
  const url = absoluteUrl(`/p/${page.slug}`);
  return {
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      url,
      type: "website",
      images: [brandOgImage()],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: [brandOgImage().url],
    },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export default async function PagePage({ params }: Props) {
  const page = await getPageBySlug(params.slug);

  if (!page) notFound();

  return (
    <div
      className="blog-page-html"
      dangerouslySetInnerHTML={{
        __html: stripEmbeddedDuplicateSeoFromHtml((page.content ?? "").trim() || ""),
      }}
    />
  );
}
