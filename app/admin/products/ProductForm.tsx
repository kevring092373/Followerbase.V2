"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import type { Product } from "@/lib/products-data";
import { categories } from "@/lib/categories";
import { saveProductAction, uploadProductImageAction, uploadProductDescriptionImageAction } from "./actions";

const PRICE_TABLE_ROWS = 12;

type Props = {
  product: Product;
};

export function ProductForm({ product }: Props) {
  const [state, formAction] = useFormState(saveProductAction, { success: false } as { error?: string; success?: boolean });
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(product.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [descImageUrl, setDescImageUrl] = useState<string | null>(null);
  const [descUploading, setDescUploading] = useState(false);
  const [descUploadError, setDescUploadError] = useState("");

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.push("/admin/products"), 1200);
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
      const result = await uploadProductImageAction(null, formData);
      if (result.error) setUploadError(result.error);
      if (result.url) setImageUrl(result.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDescriptionImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDescUploadError("");
    setDescUploading(true);
    setDescImageUrl(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductDescriptionImageAction(null, formData);
      if (result.error) setDescUploadError(result.error);
      if (result.url) setDescImageUrl(result.url);
    } finally {
      setDescUploading(false);
      e.target.value = "";
    }
  }

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="slug" value={product.slug} />
      <input type="hidden" name="image" value={imageUrl} />

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
        <label htmlFor="slug">URL (Slug) *</label>
        <input
          id="slug"
          type="text"
          value={product.slug}
          readOnly
          className="admin-input"
          style={{ opacity: 0.8 }}
          aria-required="true"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="name">Produktname *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={1}
          defaultValue={product.name}
          className="admin-input"
          placeholder="Pflichtfeld"
          aria-required="true"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="articleNumber">Artikelnummer</label>
        <input
          id="articleNumber"
          name="articleNumber"
          type="text"
          defaultValue={product.articleNumber}
          className="admin-input"
          placeholder="z. B. FC-001"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="categoryId">Kategorie *</label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="admin-input"
          defaultValue={product.categoryId}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-row">
        <label>Mengen & Preise (eine Zeile = eine Stufe, Preis in Cent)</label>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Menge</th>
                <th>Preis (Cent)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: PRICE_TABLE_ROWS }, (_, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="number"
                      name={`quantity_${i}`}
                      defaultValue={product.quantities[i] ?? ""}
                      min={1}
                      placeholder="z. B. 100"
                      className="admin-input admin-table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`price_${i}`}
                      defaultValue={product.pricesCents[i] ?? ""}
                      min={0}
                      placeholder="z. B. 100 (= 1€)"
                      className="admin-input admin-table-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-form-section">
        <h3 className="admin-form-section-title">Meta-Tags (SEO)</h3>
        <div className="admin-form-row">
          <label htmlFor="metaTitle">Meta-Titel</label>
          <input
            id="metaTitle"
            name="metaTitle"
            type="text"
            defaultValue={product.metaTitle}
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
            defaultValue={product.metaDescription}
            placeholder="Kurzbeschreibung für Suchmaschinen"
            className="admin-input"
          />
        </div>
      </div>

      <div className="admin-form-row">
        <label htmlFor="bullets">Kurzbeschreibung (Bulletpoints, eine pro Zeile)</label>
        <textarea
          id="bullets"
          name="bullets"
          rows={4}
          defaultValue={product.bullets?.join("\n")}
          placeholder={"Schnelle Lieferung\nSichere Zahlung\nQualitätsgarantie"}
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label>Produktbild</label>
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
        <label>Bilder in Produktbeschreibung</label>
        <div className="admin-image-upload">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleDescriptionImageUpload}
            disabled={descUploading}
            className="admin-input"
          />
          {descUploading && <span className="admin-upload-status">Wird hochgeladen …</span>}
          {descUploadError && <span className="admin-upload-error">{descUploadError}</span>}
          {descImageUrl && (
            <div className="admin-desc-image-url">
              <span className="admin-desc-image-label">URL zum Einfügen in die Beschreibung:</span>
              <code className="admin-desc-image-code">{`<img src="${descImageUrl}" alt="Beschreibung">`}</code>
              <button
                type="button"
                className="admin-copy-url-btn"
                onClick={() => navigator.clipboard.writeText(`<img src="${descImageUrl}" alt="Beschreibung">`)}
              >
                HTML kopieren
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="admin-form-row">
        <label htmlFor="description">Produktbeschreibung (HTML)</label>
        <textarea
          id="description"
          name="description"
          rows={14}
          defaultValue={product.description}
          placeholder="HTML, z. B.: <p>Text</p>, <ul><li>Punkt</li></ul>, <img src=\"/uploads/products/description/xxx.jpg\" alt=\"...\">"
          className="admin-input admin-textarea admin-textarea-mono"
        />
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary">
          Produkt speichern
        </button>
      </div>
    </form>
  );
}
