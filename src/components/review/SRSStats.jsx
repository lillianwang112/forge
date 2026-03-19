import { useState, useEffect } from 'react';
import { getStats, getDailyReviewCounts } from '../../srs/conceptStore.js';

/**
 * Stats widget for the Review page.
 *
 * @param {{ onStartReview: () => void }} props
 */
export default function SRSStats({ onStartReview }) {
  const [stats, setStats]   = useState(null);
  const [daily, setDaily]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getStats(), Promise.resolve(getDailyReviewCounts(7))]).then(([s, d]) => {
      if (cancelled) return;
      setStats(s);
      setDaily(d);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
        }}
      >
        Loading stats…
      </div>
    );
  }

  const maxCount = Math.max(...daily.map((d) => d.count), 1);

  const nextReviewText = stats.due > 0
    ? 'now'
    : 'Check back tomorrow';

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🗂️ Spaced Repetition
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          SM-2 algorithm
        </span>
      </div>

      <div style={{ padding: '18px 20px' }}>
        {/* Stat numbers */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
          {[
            { label: 'Total',   value: stats.total,   color: 'var(--text-primary)' },
            { label: 'Due',     value: stats.due,     color: stats.due > 0 ? 'var(--accent-orange)' : 'var(--text-muted)' },
            { label: 'Learned', value: stats.learned, color: 'var(--accent-green)'  },
            { label: 'New',     value: stats.new,     color: 'var(--accent-blue)'   },
          ].map(({ label, value, color }, i, arr) => (
            <div
              key={label}
              style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '4px 8px',
              }}
            >
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color,
                  lineHeight: 1.1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: 3,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* 7-day bar chart */}
        <div style={{ marginBottom: 18 }}>
          <p
            style={{
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}
          >
            Reviews — last 7 days
          </p>
          <div
            style={{
              display: 'flex',
              gap: 4,
              alignItems: 'flex-end',
              height: 48,
            }}
          >
            {daily.map(({ date, count }) => {
              const height = count > 0 ? Math.max(4, Math.round((count / maxCount) * 44)) : 3;
              const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
              const isToday  = date === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={date}
                  title={`${date}: ${count} review${count !== 1 ? 's' : ''}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    justifyContent: 'flex-end',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height,
                      borderRadius: 3,
                      backgroundColor: isToday
                        ? 'var(--accent-blue)'
                        : count > 0
                        ? 'rgba(88,166,255,0.4)'
                        : 'var(--border)',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.58rem',
                      fontFamily: 'var(--font-mono)',
                      color: isToday ? 'var(--accent-blue)' : 'var(--text-muted)',
                    }}
                  >
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start button + next review info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onStartReview}
            disabled={stats.due === 0}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: stats.due > 0
                ? 'var(--accent-blue)'
                : 'var(--bg-elevated)',
              color: stats.due > 0 ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              fontFamily: 'var(--font-body)',
              cursor: stats.due > 0 ? 'pointer' : 'not-allowed',
              opacity: stats.due === 0 ? 0.6 : 1,
              transition: 'background 0.15s, opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              if (stats.due > 0) e.currentTarget.style.backgroundColor = '#79c0ff';
            }}
            onMouseLeave={(e) => {
              if (stats.due > 0) e.currentTarget.style.backgroundColor = 'var(--accent-blue)';
            }}
          >
            {stats.due > 0 ? `▶ Review ${stats.due} card${stats.due !== 1 ? 's' : ''}` : '✓ All caught up'}
          </button>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Next review: {nextReviewText}
          </span>
        </div>
      </div>
    </div>
  );
}
