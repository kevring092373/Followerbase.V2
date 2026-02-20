/**
 * Admin: Seite bearbeiten.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/pages-data";
import { PageForm } from "../../PageForm";

type Props = { params: { slug: string } };

export default async function AdminPageEditPage({ params }: Props) {
  const page = await getPageBySlug(params.slug);

  if (!page) notFound();

  return (
    <>
      <Link href="/admin/pages" className="admin-back">
        ← Seiten
      </Link>
      <h1 className="heading-hero">Seite bearbeiten</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        {page.title}
      </p>
      <PageForm page={page} />
    </>
  );
}
