/**
 * Admin: Produkte verwalten (Liste wie Blog).
 */
import Link from "next/link";
import { getAllProducts } from "@/lib/products-data";
import { categories } from "@/lib/categories";
import { DeleteProductButton } from "./DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  return (
    <>
      <Link href="/admin" className="admin-back">
        ← Admin
      </Link>
      <h1 className="heading-hero">Produkte</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Alle Produkte bearbeiten, Meta-Daten setzen oder löschen.
      </p>

      <ul className="admin-list">
        {products.map((product) => (
          <li key={product.slug} className="admin-list-item card">
            <div>
              <strong>{product.name}</strong>
              <span className="admin-list-meta">
                {categoryName(product.categoryId)} · /product/{product.slug}
              </span>
            </div>
            <div className="admin-list-actions">
              <Link href={`/admin/products/${product.slug}/edit`} className="admin-list-link">
                Bearbeiten
              </Link>
              <DeleteProductButton slug={product.slug} name={product.name} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
