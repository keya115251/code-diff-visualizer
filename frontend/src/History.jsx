import React, { useEffect, useState } from 'react';
import { fetchRecentDiffs } from './api';

export default function History({ onSelect, refreshKey }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentDiffs()
      .then(setItems)
      .catch((err) => setError(err.message));
  }, [refreshKey]);

  if (error) return <p className="error-text">Couldn't load history: {error}</p>;

  return (
    <div className="history-panel">
      <h3>Recent Diffs</h3>
      {items.length === 0 && <p className="empty-state">No diffs saved yet.</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button className="history-item" onClick={() => onSelect(item.id)}>
              <span className="history-lang">{item.language}</span>
              <span className="history-date">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
