import { useReducedMotion } from '../lib/motion.ts';
import './Confetti.css';

const COLORS = ['var(--pink)', 'var(--sun)', 'var(--sky)', 'var(--mint)'];
const PIECES = Array.from({ length: 28 }, (_, i) => ({
  '--x': `${Math.cos((i / 28) * Math.PI * 2) * (120 + (i % 5) * 30)}px`,
  '--y': `${Math.sin((i / 28) * Math.PI * 2) * (90 + (i % 4) * 30) - 60}px`,
  '--r': `${(i * 47) % 360}deg`,
  '--c': COLORS[i % COLORS.length],
}));

/**
 * One-second celebratory burst, replayed whenever `fire` changes (it is used as a key).
 * Decorative only, and skipped entirely for reduced motion.
 */
export function Confetti({ fire }: { fire: number | string }) {
  const reduced = useReducedMotion();
  if (!fire || reduced) return null;
  return (
    <div className="confetti" aria-hidden="true" key={fire}>
      {PIECES.map((style, i) => (
        // oxlint-disable-next-line react/no-array-index-key -- static decorative list
        <span key={i} style={style as React.CSSProperties} />
      ))}
    </div>
  );
}
