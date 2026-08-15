const API_BASE = '/api';

export async function submitDiff(snippetA, snippetB, language) {
  const res = await fetch(`${API_BASE}/diff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snippetA, snippetB, language }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchRecentDiffs(limit = 20) {
  const res = await fetch(`${API_BASE}/diffs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchDiffById(id) {
  const res = await fetch(`${API_BASE}/diffs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch diff');
  return res.json();
}
