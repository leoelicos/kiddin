import './Wordmark.css';

const LETTERS = ['k', 'i', 'd', 'd', 'i', 'n', '’'];

/** Bouncy, multi-colour logotype. Purely visual; the accessible name comes from the parent link. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'xl' }) {
  return (
    <span className="wordmark" data-size={size} aria-hidden="true">
      {LETTERS.map((l, i) => (
        // oxlint-disable-next-line react/no-array-index-key -- static, never reordered
        <span key={i} className="wordmark__l" style={{ '--i': i } as React.CSSProperties}>
          {l}
        </span>
      ))}
    </span>
  );
}
