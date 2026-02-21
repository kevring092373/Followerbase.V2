-- Produkte (für Admin auf Netlify: read-only Dateisystem)
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  quantities JSONB NOT NULL DEFAULT '[]',
  prices_cents JSONB NOT NULL DEFAULT '[]',
  tiers JSONB,
  article_number TEXT,
  bullets JSONB,
  description TEXT,
  image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON products (slug);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);

COMMENT ON TABLE products IS 'Shop-Produkte – auf Netlify statt content/products.json';

CREATE OR REPLACE FUNCTION set_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE set_products_updated_at();
