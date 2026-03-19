import { useState, useEffect, useCallback } from 'react';
import { ReviewSession } from '../../srs/reviewSession.js';
import ConceptCard from './ConceptCard.jsx';

const QUALITY_BUTTONS = [
  { quality: 1, label: 'Again', sublabel: 'complete miss', color: 'var(--accent-red)',    bg: 'rgba(248,81,73,0.12)',   border: 'rgba(248,81,73,0.3)',  key: '1' },
  { quality: 2, label: 'Hard',  sublabel: 'barely',         color: 'var(--accent-orange)', bg: 'rgba(255,165,0,0.12)',   border: 'rgba(255,165,0,0.3)',  key: '2' },
  { quality: 3, label: 'Good',  sublabel: 'with effort',    color: 'var(--accent-green)',  bg: 'rgba(63,185,80,0.12)',   border: 'rgba(63,185,80,0.3)',  key: '3' },
  { quality: 5, label: 'Easy',  sublabel: 'instant recall', color: 'var(--accent-blue)',   bg: 'rgba(88,166,255,0.12)',  border: 'rgba(88,166,255,0.3)', key: '4' },
];

/**
 * Full-screen SRS review session.
 *
 * @param {{
 *   cards: Array,
 *   onExit: () => void,
 *   onComplete: () => void,
 * }} props
 */
export default function SRSSession({ cards, onExit, onComplete }) {
  const [session]   = useState(() => new ReviewSession(cards));
  const [card, setCard]       = useState(() => session.getCurrentCard());
  const [isFlipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(() => session.getProgress());
  const [isAnimating, setAnimating] = useState(false);

  const handleFlip = useCallback(() => {
    if (!isFlipped) setFlipped(true);
  }, [isFlipped]);

  const handleRate = useCallback(async (quality) => {
    if (!isFlipped || isAnimating) return;
    setAnimating(true);

    await session.submitReview(quality);
    setProgress(session.getProgress());

    if (session.isComplete()) {
      onComplete();
      return;
    }

    // Brief pause before showing next card
    setTimeout(() => {
      setCard(session.getCurrentCard());
      setFlipped(false);
      setAnimating(false);
    }, 220);
  }, [isFlipped, isAnimating, session, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
        return;
      }

      if (isFlipped && !isAnimating) {
        const btn = QUALITY_BUTTONS.find((b) => b.key === e.key);
        if (btn) handleRate(btn.quality);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleFlip, handleRate, isFlipped, isAnimating]);

  if (!card) return null;

  const { reviewed, total } = progress;
  const pct = total > 0 ? (reviewed / total) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          padding: '16px 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            flex: 1,
            height: 4,
            backgroundColor: 'var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              backgroundColor: 'var(--accent-blue)',
              borderRadius: 2,
              transition: 'width 0.35s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          {reviewed} / {total}
        </span>
        <button
          onClick={onExit}
          title="Exit session"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            padding: '3px 10px',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ✕ Exit
        </button>
      </div>

      {/* ── Card area ── */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 760,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: 32,
        }}
      >
        <ConceptCard
          card={card}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        {/* ── Quality buttons (shown after flip) ── */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            opacity: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? 'auto' : 'none',
            transform: isFlipped ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.25s, transform 0.25s',
          }}
        >
          {QUALITY_BUTTONS.map((btn) => (
            <button
              key={btn.quality}
              onClick={() => handleRate(btn.quality)}
              disabled={isAnimating}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '10px 22px',
                borderRadius: 10,
                border: `1px solid ${btn.border}`,
                backgroundColor: btn.bg,
                color: btn.color,
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.15s, transform 0.1s',
                opacity: isAnimating ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isAnimating) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                {btn.label}
              </span>
              <span
                style={{
                  fontSize: '0.6rem',
                  color: btn.color,
                  opacity: 0.7,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                [{btn.key}] {btn.sublabel}
              </span>
            </button>
          ))}
        </div>

        {/* Keyboard hint (before flip) */}
        {!isFlipped && (
          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              margin: 0,
            }}
          >
            [Space] reveal · [1] again · [2] hard · [3] good · [4] easy
          </p>
        )}
      </div>
    </div>
  );
}
