-- Viva-OrderCodes sind 16-stellig und müssen als Text gespeichert werden.
-- Als BIGINT/Number gehen in JavaScript Stellen verloren (MAX_SAFE_INTEGER).

ALTER TABLE viva_pending_checkouts
  ALTER COLUMN viva_order_code TYPE TEXT USING viva_order_code::text;
