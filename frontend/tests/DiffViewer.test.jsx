import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiffViewer from '../src/DiffViewer.jsx';

describe('DiffViewer', () => {
  test('shows empty state when no diff provided', () => {
    render(<DiffViewer diff={null} />);
    expect(screen.getByText(/no diff to show/i)).toBeInTheDocument();
  });

  test('renders added and removed lines with correct classes', () => {
    const diff = [
      { type: 'unchanged', value: 'const x = 1;\n' },
      { type: 'removed', value: 'console.log(x);\n' },
      { type: 'added', value: 'console.log(x + 1);\n' },
    ];
    const { container } = render(<DiffViewer diff={diff} />);
    expect(container.querySelectorAll('.diff-added').length).toBe(1);
    expect(container.querySelectorAll('.diff-removed').length).toBe(1);
    expect(container.querySelectorAll('.diff-unchanged').length).toBe(1);
  });
});
