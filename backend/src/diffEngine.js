const { diffLines } = require('diff');

/**
 * Computes a line-level diff between two code snippets.
 * Returns an array of { type: 'added'|'removed'|'unchanged', value, lineCount }
 */
function computeDiff(snippetA, snippetB) {
  if (typeof snippetA !== 'string' || typeof snippetB !== 'string') {
    throw new Error('Both snippets must be strings');
  }

  const parts = diffLines(snippetA, snippetB);

  return parts.map((part) => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
    value: part.value,
    lineCount: part.count || 0,
  }));
}

/**
 * Produces a compact human-readable summary of the diff,
 * used as input context for the AI explanation prompt.
 */
function summarizeDiff(diffParts) {
  const added = diffParts.filter((p) => p.type === 'added');
  const removed = diffParts.filter((p) => p.type === 'removed');

  const addedLines = added.reduce((sum, p) => sum + p.lineCount, 0);
  const removedLines = removed.reduce((sum, p) => sum + p.lineCount, 0);

  return {
    addedLines,
    removedLines,
    addedText: added.map((p) => p.value).join(''),
    removedText: removed.map((p) => p.value).join(''),
  };
}

module.exports = { computeDiff, summarizeDiff };
