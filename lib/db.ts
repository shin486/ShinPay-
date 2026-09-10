import fs from 'node:fs';
import path from 'node:path';

export type SqliteDb = import('node:sqlite').DatabaseSync;

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), 'data');

const DB_FILE = path.join(DATA_DIR, 'payroll.db');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __payrollDb: SqliteDb | undefined;
}

let cached: SqliteDb | undefined = global.__payrollDb;

function createDb(): SqliteDb {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
  const db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 30000;');
  return db;
}

export function getDb(): SqliteDb {
  // In dev, Next.js may hot-reload modules; keep a single shared connection.
  if (cached) return cached;
  ensureDataDir();
  const db = createDb();
  cached = db;
  global.__payrollDb = db;
  return db;
}

export function getDataDir(): string {
  return DATA_DIR;
}

type Rows = Record<string, unknown>[];

export interface QueryResult {
  changes: number;
  lastInsertRowid: number;
}

export function all(sql: string, ...params: any[]): Rows {
  return getDb().prepare(sql).all(...params) as Rows;
}

export function get(sql: string, ...params: any[]): Record<string, unknown> | undefined {
  return getDb().prepare(sql).get(...params) as Record<string, unknown> | undefined;
}

export function run(sql: string, ...params: any[]): QueryResult {
  const stmt = getDb().prepare(sql);
  const res = stmt.run(...params);
  return {
    changes: Number(res.changes),
    lastInsertRowid: Number(res.lastInsertRowid),
  };
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export interface IdNameOption {
  id: number;
  name: string;
}

/** Convenience for the common `id` + `name` dropdown option query. */
export function idNameOptions(sql: string, ...params: any[]): IdNameOption[] {
  return getDb().prepare(sql).all(...params) as unknown as IdNameOption[];
}