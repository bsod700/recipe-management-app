import * as SQLite from 'expo-sqlite';

const DB_NAME = 'recipes.db';

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Lazily open the database and run migrations.
 * Safe to call many times — memoized.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await migrate(db);
  _db = db;
  return db;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  // One call — idempotent. Keep schema simple: a single JSON column
  // for ingredients keeps the repo trivial while retaining full search
  // over title via FTS-less LIKE (dataset is tiny, personal use).
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      image_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
    CREATE INDEX IF NOT EXISTS idx_recipes_updated_at ON recipes(updated_at DESC);
  `);
}

/** Test hook — closes and resets the cached instance. */
export async function _resetDbForTests(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
