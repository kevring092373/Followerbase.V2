-- Bild für "Instagram Follower kaufen" auf neues Asset umstellen
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.

UPDATE products
SET image = '/icons/Instagram Follower  kaufen 1.webp',
    updated_at = now()
WHERE slug = 'instagram-follower-kaufen';
