const Database = require('better-sqlite3');
const path = require('path');

// DB file lives alongside source; in Docker this will be a mounted volume path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS diffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snippet_a TEXT NOT NULL,
    snippet_b TEXT NOT NULL,
    language TEXT,
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function saveDiff({ snippetA, snippetB, language, explanation }) {
  const stmt = db.prepare(`
    INSERT INTO diffs (snippet_a, snippet_b, language, explanation)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(snippetA, snippetB, language, explanation);
  return info.lastInsertRowid;
}

function getRecentDiffs(limit = 20) {
  const stmt = db.prepare(`
    SELECT id, language, explanation, created_at
    FROM diffs
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

function getDiffById(id) {
  const stmt = db.prepare(`SELECT * FROM diffs WHERE id = ?`);
  return stmt.get(id);
}

module.exports = { db, saveDiff, getRecentDiffs, getDiffById };
