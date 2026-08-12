const express = require('express');
const cors = require('cors');
const { computeDiff, summarizeDiff } = require('./diffEngine');
const { explainDiff } = require('./ollamaClient');
const { saveDiff, getRecentDiffs, getDiffById } = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check - used by Docker healthcheck and Jenkins smoke test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Main diff endpoint: computes diff + gets AI explanation, saves to history
app.post('/api/diff', async (req, res) => {
  try {
    const { snippetA, snippetB, language } = req.body;

    if (typeof snippetA !== 'string' || typeof snippetB !== 'string') {
      return res.status(400).json({ error: 'snippetA and snippetB are required strings' });
    }

    const diffParts = computeDiff(snippetA, snippetB);
    const summary = summarizeDiff(diffParts);
    const explanation = await explainDiff(summary);

    const id = saveDiff({
      snippetA,
      snippetB,
      language: language || 'plaintext',
      explanation,
    });

    res.json({ id, diff: diffParts, explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute diff' });
  }
});

// History endpoints
app.get('/api/diffs', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  res.json(getRecentDiffs(limit));
});

app.get('/api/diffs/:id', (req, res) => {
  const item = getDiffById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

const PORT = process.env.PORT || 4000;

// Only start listening if this file is run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

module.exports = app;
