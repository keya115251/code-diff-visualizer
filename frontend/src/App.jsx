import React, { useState } from 'react';
import { submitDiff, fetchDiffById } from './api';
import DiffViewer from './DiffViewer.jsx';
import History from './History.jsx';

const LANGUAGES = ['plaintext', 'javascript', 'python', 'java', 'c', 'cpp', 'html', 'css'];

export default function App() {
  const [snippetA, setSnippetA] = useState('');
  const [snippetB, setSnippetB] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [diff, setDiff] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!snippetA.trim() || !snippetB.trim()) {
      setError('Please paste both snippets before comparing.');
      return;
    }

    setLoading(true);
    try {
      const result = await submitDiff(snippetA, snippetB, language);
      setDiff(result.diff);
      setExplanation(result.explanation);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectHistory(id) {
    setError(null);
    try {
      const item = await fetchDiffById(id);
      setSnippetA(item.snippet_a);
      setSnippetB(item.snippet_b);
      setLanguage(item.language);
      setExplanation(item.explanation);
      // Recompute the visual diff client-side isn't stored server-side per id,
      // so re-submit to get the structured diff back for display.
      const result = await submitDiff(item.snippet_a, item.snippet_b, item.language);
      setDiff(result.diff);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Code Diff Visualizer</h1>
        <p className="subtitle">Paste two snippets, see what changed, and why.</p>
      </header>

      <main>
        <form className="input-panel" onSubmit={handleSubmit}>
          <div className="snippet-inputs">
            <div className="snippet-field">
              <label htmlFor="snippetA">Original</label>
              <textarea
                id="snippetA"
                value={snippetA}
                onChange={(e) => setSnippetA(e.target.value)}
                placeholder="Paste original code here..."
                rows={14}
              />
            </div>
            <div className="snippet-field">
              <label htmlFor="snippetB">Modified</label>
              <textarea
                id="snippetB"
                value={snippetB}
                onChange={(e) => setSnippetB(e.target.value)}
                placeholder="Paste modified code here..."
                rows={14}
              />
            </div>
          </div>

          <div className="controls">
            <label htmlFor="language">Language</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <button type="submit" disabled={loading}>
              {loading ? 'Comparing…' : 'Compare'}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}
        </form>

        <section className="results-panel">
          <div className="diff-section">
            <h2>Diff</h2>
            <DiffViewer diff={diff} />
          </div>

          {explanation && (
            <div className="explanation-section">
              <h2>AI Explanation</h2>
              <p>{explanation}</p>
            </div>
          )}
        </section>

        <History onSelect={handleSelectHistory} refreshKey={refreshKey} />
      </main>
    </div>
  );
}
