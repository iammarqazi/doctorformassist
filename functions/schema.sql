-- Run once: wrangler d1 execute doctorformassist-db --file=functions/schema.sql

CREATE TABLE IF NOT EXISTS approved_devices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL,
  device_id  TEXT    NOT NULL,
  plan       TEXT    NOT NULL DEFAULT 'yearly',
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(email, device_id)
);

CREATE INDEX IF NOT EXISTS idx_dev_lookup ON approved_devices(email, device_id);
CREATE INDEX IF NOT EXISTS idx_dev_email  ON approved_devices(email);
