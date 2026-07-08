-- Run once: wrangler d1 execute doctorformassist-db --file=functions/schema.sql
CREATE TABLE IF NOT EXISTS licenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  license_key TEXT    NOT NULL UNIQUE,
  email       TEXT    NOT NULL,
  payment_id  TEXT    NOT NULL UNIQUE,
  order_id    TEXT    NOT NULL UNIQUE,
  plan        TEXT    NOT NULL DEFAULT 'monthly',
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_licenses_key   ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
