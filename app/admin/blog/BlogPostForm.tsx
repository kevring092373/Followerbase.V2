"use client";

/**
 * Formular: URL, Bezeichnung, Meta, Beitragsbild (Upload), HTML.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import type { BlogPost } from "@/lib/blog";
import { savePostAction, uploadBlogImageAction } from "./actions";

type Props = {
  post?: BlogPost | null;
};

export function BlogPostForm({ post }: Props) {
  const isEdit = !!post;
  const [state, formAction] = useFormState(savePostAction, { success: false } as { error?: string; success?: boolean });
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(post?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.push("/admin/blog"), 1200);
      return () => clearTimeout(t);
    }
  }, [state?.success, router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadBlogImageAction(null, formData);
      if (result.error) setUploadError(result.error);
      if (result.url) setImageUrl(result.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <form action={formAction} className="admin-form">
      {post && <input type="hidden" name="originalSlug" value={post.slug} />}
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
          defaultValue={post?.slug}
          placeholder="z. B. mein-beitrag → wird zu /blog/mein-beitrag"
          className="admin-input"
        />
      </div>

      <input type="hidden" name="image" value={imageUrl} />

      <div className="admin-form-row">
        <label htmlFor="title">Bezeichnung (für Blog-Übersicht) *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={post?.title}
          placeholder="Text des Links in der Blog-Liste"
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="excerpt">Kurzbeschreibung</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt}
          placeholder="Kurzer Text unter dem Titel in der Blog-Übersicht"
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="category">Kategorie (für Filter auf Blog-Übersicht)</label>
        <input
          id="category"
          name="category"
          type="text"
          defaultValue={post?.category}
          placeholder="z. B. Instagram, TikTok, Tipps"
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
            defaultValue={post?.metaTitle}
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
            defaultValue={post?.metaDescription}
            placeholder="Kurzbeschreibung für Suchmaschinen"
            className="admin-input"
          />
        </div>
      </div>

      <div className="admin-form-row">
        <label>Beitragsbild</label>
        <div className="admin-image-upload">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            disabled={uploading}
            className="admin-input"
          />
          {uploading && <span className="admin-upload-status">Wird hochgeladen …</span>}
          {uploadError && <span className="admin-upload-error">{uploadError}</span>}
          {imageUrl && (
            <div className="admin-image-preview">
              <img src={imageUrl} alt="Vorschau" />
              <span className="admin-image-url">{imageUrl}</span>
              <button type="button" onClick={() => setImageUrl("")} className="admin-image-remove">
                Bild entfernen
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="admin-form-row">
        <label htmlFor="content">HTML (gesamte Seite) *</label>
        <textarea
          id="content"
          name="content"
          required
          rows={20}
          defaultValue={post?.content}
          placeholder="Vollständiger HTML-Code der Seite (wird 1:1 ausgegeben)"
          className="admin-input admin-textarea admin-textarea-mono"
        />
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary">
          {isEdit ? "Beitrag aktualisieren" : "Beitrag erstellen"}
        </button>
      </div>
    </form>
  );
}
