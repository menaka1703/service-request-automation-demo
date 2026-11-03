import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// In test environment or when TEST_DB is set, use a separate test database file or in-memory
const isTest = process.env.NODE_ENV === 'test' || process.env.USE_TEST_DB === 'true';
const dbPath = isTest
  ? path.join(DB_DIR, 'test_service_requests.db')
  : path.join(DB_DIR, 'service_requests.db');

export const db = new DatabaseSync(dbPath);

// Initialize schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS idempotency_keys (
      key TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      response_body TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
    CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
    CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);
  `);
}

// Generate human-friendly ID like REQ-2026-001
export function generateRequestId(): string {
  const year = new Date().getFullYear();
  const prefix = `REQ-${year}-`;
  
  // Find highest existing sequence for this year
  const row = db.prepare(`
    SELECT id FROM requests 
    WHERE id LIKE ? 
    ORDER BY id DESC 
    LIMIT 1
  `).get(`${prefix}%`) as { id: string } | undefined;

  let nextSeq = 1;
  if (row && row.id) {
    const parts = row.id.split('-');
    if (parts.length === 3) {
      const currentSeq = parseInt(parts[2], 10);
      if (!isNaN(currentSeq)) {
        nextSeq = currentSeq + 1;
      }
    }
  }

  return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
}

// Reset helper (for tests and manual seed reset)
export function resetDatabase() {
  db.exec(`
    DELETE FROM requests;
    DELETE FROM idempotency_keys;
  `);
}

