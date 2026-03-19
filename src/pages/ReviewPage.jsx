import { useState, useEffect, useCallback } from 'react';
import SRSStats from '../components/review/SRSStats.jsx';
import SRSSession from '../components/review/SRSSession.jsx';
import { getDueCards, loadAllCards } from '../srs/conceptStore.js';

const TRACK_COLORS = {
  python: { color: 'var(--accent-green)',  bg: 'rgba(63,185,80,0.07)',   border: 'rgba(63,185,80,0.2)'  },
  julia:  { color: 'var(--accent-purple)', bg: 'rgba(163,113,247,0.07)', border: 'rgba(163,113,247,0.2)' },
  shared: { color: 'var(--accent-blue)',   bg: 'rgba(88,166,255,0.07)',  border: 'rgba(88,166,255,0.2)' },
};

export default function ReviewPage() {
  const [sessionCards, setSessionCards] = useState(null); // null = not in session
  const [allCards, setAllCards]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statsKey, setStatsKey]         = useState(0); // increment to force SRSStats re-mount

  const loadCards = useCallback(async () => {
    setLoading(true);
    const cards = await loadAllCards();
    setAllCards(cards);
    setLoading(false);
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const handleStartReview = async () => {
    const due = await getDueCards();
    if (due.length > 0) {
      setSessionCards(due);
    }
  };

  const handleSessionEnd = useCallback(() => {
    setSessionCards(null);
    setStatsKey((k) => k + 1);
    loadCards();
  }, [loadCards]);

  // Group all cards by category for browsing
  const byCategory = {};
  for (const card of allCards) {
    const key = `${card.track}:${card.category}`;
    if (!byCategory[key]) byCategory[key] = { track: card.track, category: card.category, cards: [] };
    byCategory[key].cards.push(card);
  }
  const groups = Object.values(byCategory).sort((a, b) => {
    const order = { python: 0, julia: 1, shared: 2 };
    return (order[a.track] ?? 3) - (order[b.track] ?? 3) || a.category.localeCompare(b.category);
  });

  return (
    <>
      {/* Active session overlay */}
      {sessionCards && (
        <SRSSession
          cards={sessionCards}
          onExit={handleSessionEnd}
          onComplete={handleSessionEnd}
        />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 24px 12px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Review
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              margin: '3px 0 0',
              fontFamily: 'var(--font-body)',
            }}
          >
            Spaced repetition flashcards — review concept cards unlocked by completing lessons
          </p>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          {/* Stats widget */}
          <div style={{ maxWidth: 640, marginBottom: 32 }}>
            <SRSStats key={statsKey} onStartReview={handleStartReview} />
          </div>

          {/* Card browser */}
          {!loading && allCards.length > 0 && (
            <>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 14,
                  marginTop: 0,
                }}
              >
                All unlocked cards ({allCards.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {groups.map((group) => (
                  <CategoryGroup key={`${group.track}:${group.category}`} group={group} />
                ))}
              </div>
            </>
          )}

          {!loading && allCards.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>🗂️</div>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                No cards yet — complete a lesson to unlock concept cards
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CategoryGroup({ group }) {
  const [collapsed, setCollapsed] = useState(true);
  const theme = TRACK_COLORS[group.track] ?? TRACK_COLORS.shared;

  return (
    <div
      style={{
        borderRadius: 8,
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'var(--bg-surface)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: theme.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            flex: 1,
          }}
        >
          {group.category}
        </span>
        <span
          style={{
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {group.cards.length} card{group.cards.length !== 1 ? 's' : ''}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {group.cards.map((card) => (
            <CardRow key={card.conceptId} card={card} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardRow({ card, theme }) {
  const [expanded, setExpanded] = useState(false);
  const due     = card.nextReview <= Date.now();
  const learned = card.interval > 21;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 14px 9px 28px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            flex: 1,
          }}
        >
          {card.front}
        </span>
        {learned && (
          <span
            style={{
              fontSize: '0.58rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-green)',
              backgroundColor: 'rgba(63,185,80,0.1)',
              padding: '1px 5px',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            learned
          </span>
        )}
        {due && !learned && (
          <span
            style={{
              fontSize: '0.58rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-orange)',
              backgroundColor: 'rgba(255,165,0,0.1)',
              padding: '1px 5px',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            due
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', flexShrink: 0 }}>
          {expanded ? '▼' : '▶'}
        </span>
      </button>
      {expanded && (
        <div
          style={{
            padding: '10px 14px 14px 28px',
            backgroundColor: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.55,
          }}
        >
          <div style={{ marginBottom: 6, fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Answer
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
            {card.back.replace(/```[\w]*/g, '').replace(/```/g, '').trim()}
          </pre>
          {card.interval > 0 && (
            <div style={{ marginTop: 8, fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              interval: {card.interval}d · ease: {card.easeFactor?.toFixed(2)} · reps: {card.repetitions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
