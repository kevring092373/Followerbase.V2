"use client";

import { useRouter } from "next/navigation";
import { deletePageAction } from "./actions";

type Props = { slug: string; title: string };

export function DeletePageButton({ slug, title }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Wollen Sie diese Seite wirklich löschen? Die Seite wird unwiderruflich gelöscht.")) return;
    const res = await deletePageAction(slug);
    if (res.error) {
      alert(res.error);
      return;
    }
    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="admin-list-delete"
    >
      Löschen
    </button>
  );
}
