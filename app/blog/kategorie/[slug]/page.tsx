import { notFound } from "next/navigation";
import { getAllPosts, findBlogCategoryName, blogCategoryPath } from "@/lib/blog-data";
import { absoluteUrl, truncateDescription } from "@/lib/seo";
import { BlogArticleList } from "@/components/BlogArticleList";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/structured-data";

type Props = { params: { slug: string } };

export const revalidate = 3600;

function resolveSlug(params: Props["params"]): string {
  return decodeURIComponent(params.slug ?? "").trim();
}

export async function generateMetadata({ params }: Props) {
  const posts = await getAllPosts();
  const category = findBlogCategoryName(posts, resolveSlug(params));
  if (!category) return { title: "Kategorie" };
  const title = `${category} – Blog | Followerbase`;
  const description = truncateDescription(
    `Artikel der Kategorie ${category}: Tipps und Anleitungen zu Reichweite und Social Media.`
  );
  const url = absoluteUrl(blogCategoryPath(category));
  return {
    title,
    description,
    keywords: [],
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "website" as const,
    },
    twitter: { card: "summary" as const, title, description },
    alternates: { canonical: url },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const posts = await getAllPosts();
  const category = findBlogCategoryName(posts, resolveSlug(params));
  if (!category) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Startseite", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: category, path: blogCategoryPath(category) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <header className="blog-hero">
        <h1 className="blog-hero-title">{category}</h1>
        <p className="blog-hero-subtitle">
          Alle Artikel in der Kategorie {category}.
        </p>
      </header>

      <BlogArticleList posts={posts} activeCategory={category} />
    </>
  );
}
