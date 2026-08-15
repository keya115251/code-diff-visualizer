import React from 'react';

/**
 * Renders a computed diff (array of {type, value}) as color-coded lines.
 * type: 'added' | 'removed' | 'unchanged'
 */
export default function DiffViewer({ diff }) {
  if (!diff || diff.length === 0) {
    return <p className="empty-state">No diff to show yet.</p>;
  }

  return (
    <pre className="diff-viewer">
      {diff.map((part, idx) => {
        const lines = part.value.replace(/\n$/, '').split('\n');
        return lines.map((line, lineIdx) => (
          <div key={`${idx}-${lineIdx}`} className={`diff-line diff-${part.type}`}>
            <span className="diff-marker">
              {part.type === 'added' ? '+' : part.type === 'removed' ? '-' : ' '}
            </span>
            <span className="diff-text">{line}</span>
          </div>
        ));
      })}
    </pre>
  );
}
