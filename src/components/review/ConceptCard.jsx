import { Link } from 'react-router-dom';
import MarkdownRenderer from '../shared/MarkdownRenderer';

const TRACK_COLORS = {
  python: { color: 'var(--accent-green)',  bg: 'rgba(63,185,80,0.08)',   border: 'rgba(63,185,80,0.25)'  },
  julia:  { color: 'var(--accent-purple)', bg: 'rgba(163,113,247,0.08)', border: 'rgba(163,113,247,0.25)' },
  shared: { color: 'var(--accent-blue)',   bg: 'rgba(88,166,255,0.08)',  border: 'rgba(88,166,255,0.25)' },
};

const TRACK_EMOJI = { python: '🐍', julia: '💜', shared: '⚡' };

/**
 * A single flashcard with 3-D flip animation.
 *
 * @param {{
 *   card: object,
 *   isFlipped: boolean,
 *   onFlip: () => void,
 * }} props
 */
export default function ConceptCard({ card, isFlipped, onFlip }) {
  const theme = TRACK_COLORS[card.track] ?? TRACK_COLORS.shared;

  return (
    <div
      onClick={!isFlipped ? onFlip : undefined}
      style={{
        perspective: '1200px',
        width: '100%',
        maxWidth: 620,
        cursor: isFlipped ? 'default' : 'pointer',
      }}
    >
      {/* Flip container */}
      <div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
          minHeight: 240,
        }}
      >
        {/* ── FRONT ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            backgroundColor: 'var(--bg-surface)',
            backgroundImage: `linear-gradient(135deg, ${theme.bg} 0%, transparent 60%)`,
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          }}
        >
          {/* Track + category badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: theme.color,
                backgroundColor: theme.bg,
                border: `1px solid ${theme.border}`,
                padding: '2px 8px',
                borderRadius: 8,
              }}
            >
              {TRACK_EMOJI[card.track]} {card.track}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                padding: '2px 8px',
                borderRadius: 8,
              }}
            >
              {card.category}
            </span>
          </div>

          {/* Question */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {card.front}
            </p>
          </div>

          {/* Reveal hint */}
          <div
            style={{
              marginTop: 20,
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
            }}
          >
            Click or press Space to reveal
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            backgroundColor: 'var(--bg-surface)',
            backgroundImage: `linear-gradient(135deg, ${theme.bg} 0%, transparent 60%)`,
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            overflowY: 'auto',
          }}
        >
          {/* Answer label */}
          <div
            style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: theme.color,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 14,
            }}
          >
            Answer
          </div>

          {/* Answer content */}
          <div style={{ flex: 1, fontSize: '0.88rem' }}>
            <MarkdownRenderer content={card.back} />
          </div>

          {/* Related lessons */}
          {card.relatedLessons?.length > 0 && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Related:
              </span>
              {card.relatedLessons.map((lid) => {
                const [trackPrefix] = lid.split('-');
                const trackMap = { py: 'python', ju: 'julia', sh: 'shared' };
                const trackId  = trackMap[trackPrefix] ?? card.track;
                return (
                  <Link
                    key={lid}
                    to={`/learn/${trackId}/${lid}`}
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      color: theme.color,
                      textDecoration: 'none',
                      padding: '1px 6px',
                      borderRadius: 4,
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg,
                    }}
                  >
                    {lid}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
