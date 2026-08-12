const fetch = require('node-fetch');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:1.5b';

/**
 * Asks the local Ollama model to explain a code diff in plain English.
 * Falls back to a generic message if Ollama is unreachable, so the
 * rest of the app still works (and demos don't break) without it.
 */
async function explainDiff({ addedText, removedText }) {
  const prompt = `You are a senior code reviewer. Briefly explain what changed between these two versions of code and why it might have been changed. Be concise (2-4 sentences).

REMOVED:
${removedText || '(nothing removed)'}

ADDED:
${addedText || '(nothing added)'}

Explanation:`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      timeout: 30000,
    });

    if (!res.ok) {
      throw new Error(`Ollama responded with status ${res.status}`);
    }

    const data = await res.json();
    return data.response ? data.response.trim() : 'No explanation generated.';
  } catch (err) {
    console.error('Ollama request failed:', err.message);
    return 'AI explanation unavailable (Ollama not reachable). The diff above still reflects the actual changes.';
  }
}

module.exports = { explainDiff };
