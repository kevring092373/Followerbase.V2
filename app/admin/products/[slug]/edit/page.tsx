/**
 * Admin: Produkt bearbeiten.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products-data";
import { ProductForm } from "../../ProductForm";

type Props = { params: { slug: string } };

export default async function AdminProductEditPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="admin-back">
        ← Produkte
      </Link>
      <h1 className="heading-hero">Produkt bearbeiten</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        {product.name}
      </p>
      <ProductForm product={product} />
    </>
  );
}
