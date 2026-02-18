"use client";

import { useRouter } from "next/navigation";
import { deletePostAction } from "./actions";

type Props = { slug: string; title: string };

export function DeletePostButton({ slug, title }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Wollen Sie wirklich löschen? Der Beitrag wird unwiderruflich gelöscht.")) return;
    const res = await deletePostAction(slug);
    if (res.error) {
      alert(res.error);
      return;
    }
    router.push("/admin/blog");
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
