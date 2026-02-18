"use client";

import { useRouter } from "next/navigation";
import { deleteProductAction } from "./actions";

type Props = { slug: string; name: string };

export function DeleteProductButton({ slug, name }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Wollen Sie dieses Produkt wirklich löschen? Die Aktion kann nicht rückgängig gemacht werden.")) return;
    const res = await deleteProductAction(slug);
    if (res.error) {
      alert(res.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleDelete} className="admin-list-delete">
      Löschen
    </button>
  );
}
