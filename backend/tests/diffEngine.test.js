const { computeDiff, summarizeDiff } = require('../src/diffEngine');

describe('computeDiff', () => {
  test('identical snippets produce only unchanged parts', () => {
    const code = 'const x = 1;\nconsole.log(x);';
    const result = computeDiff(code, code);
    expect(result.every((p) => p.type === 'unchanged')).toBe(true);
  });

  test('detects added lines', () => {
    const a = 'line1\nline2';
    const b = 'line1\nline2\nline3';
    const result = computeDiff(a, b);
    const added = result.filter((p) => p.type === 'added');
    expect(added.length).toBeGreaterThan(0);
    expect(added[0].value).toContain('line3');
  });

  test('detects removed lines', () => {
    const a = 'line1\nline2\nline3';
    const b = 'line1\nline3';
    const result = computeDiff(a, b);
    const removed = result.filter((p) => p.type === 'removed');
    expect(removed.length).toBeGreaterThan(0);
    expect(removed[0].value).toContain('line2');
  });

  test('throws on non-string input', () => {
    expect(() => computeDiff(null, 'foo')).toThrow();
    expect(() => computeDiff('foo', 42)).toThrow();
  });
});

describe('summarizeDiff', () => {
  test('correctly counts added and removed lines', () => {
    const a = 'a\nb\nc';
    const b = 'a\nc\nd';
    const parts = computeDiff(a, b);
    const summary = summarizeDiff(parts);
    expect(summary.addedLines).toBeGreaterThan(0);
    expect(summary.removedLines).toBeGreaterThan(0);
  });

  test('handles no changes', () => {
    const parts = computeDiff('same', 'same');
    const summary = summarizeDiff(parts);
    expect(summary.addedLines).toBe(0);
    expect(summary.removedLines).toBe(0);
  });
});
