"use client";

/**
 * Formular: URL, Titel, Meta, HTML-Inhalt (ohne Bild-Upload).
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import type { Page } from "@/lib/page";
import { savePageAction } from "./actions";

type Props = {
  page?: Page | null;
};

export function PageForm({ page }: Props) {
  const isEdit = !!page;
  const [state, formAction] = useFormState(savePageAction, { success: false } as { error?: string; success?: boolean });
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.push("/admin/pages"), 1200);
      return () => clearTimeout(t);
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="admin-form">
      {page && <input type="hidden" name="originalSlug" value={page.slug} />}
      {state?.success && (
        <p className="admin-form-success" role="status">
          Gespeichert.
        </p>
      )}
      {state?.error && (
        <p className="admin-form-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="admin-form-row">
        <label htmlFor="slug">URL (Pfad) *</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          defaultValue={page?.slug}
          placeholder="z. B. ueber-uns → wird zu /p/ueber-uns"
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="title">Titel *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={page?.title}
          placeholder="Seitentitel / Überschrift"
          className="admin-input"
        />
      </div>

      <div className="admin-form-section">
        <h3 className="admin-form-section-title">Meta-Tags (SEO)</h3>
        <div className="admin-form-row">
          <label htmlFor="metaTitle">Meta-Titel</label>
          <input
            id="metaTitle"
            name="metaTitle"
            type="text"
            defaultValue={page?.metaTitle}
            placeholder="Seitentitel für Suchmaschinen"
            className="admin-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="metaDescription">Meta-Beschreibung</label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            defaultValue={page?.metaDescription}
            placeholder="Kurzbeschreibung für Suchmaschinen"
            className="admin-input"
          />
        </div>
      </div>

      <div className="admin-form-row">
        <label htmlFor="content">HTML (Inhalt der Seite) *</label>
        <textarea
          id="content"
          name="content"
          required
          rows={20}
          defaultValue={page?.content}
          placeholder="Vollständiger HTML-Code der Seite (wird 1:1 ausgegeben)"
          className="admin-input admin-textarea admin-textarea-mono"
        />
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary">
          {isEdit ? "Seite aktualisieren" : "Seite erstellen"}
        </button>
      </div>
    </form>
  );
}
