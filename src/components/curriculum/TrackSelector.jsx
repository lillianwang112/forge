import { Link } from 'react-router-dom';
import { getAllTracks } from '../../curriculum/index.js';
import { useAllProgress } from '../../hooks/useProgress.js';

export default function TrackSelector() {
  const tracks = getAllTracks();
  const { summary, loading } = useAllProgress();

  return (
    <div>
      <p
        style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-mono)',
          marginBottom: 10,
          marginTop: 0,
        }}
      >
        Learning Tracks
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {tracks.map((track) => {
          const completed  = summary[track.id] ?? 0;
          const total      = track.lessons.length;
          const pct        = total > 0 ? (completed / total) * 100 : 0;

          return (
            <Link
              key={track.id}
              to={`/learn/${track.id}`}
              style={{
                flex: '1 1 180px',
                padding: '12px 14px',
                borderRadius: 8,
                backgroundColor: track.bgColor,
                border: `1px solid ${track.borderColor}`,
                textDecoration: 'none',
                transition: 'border-color 0.15s, background 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = track.color;
                e.currentTarget.style.backgroundColor = track.bgColor.replace('0.07', '0.12');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = track.borderColor;
                e.currentTarget.style.backgroundColor = track.bgColor;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: '1rem' }}>{track.emoji}</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: track.color,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {track.name}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {track.description}
              </p>
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.62rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: 4,
                  }}
                >
                  <span>
                    {loading ? '…' : `${completed} / ${total}`} lessons
                  </span>
                  {completed === total && total > 0 && (
                    <span style={{ color: 'var(--accent-green)' }}>✓ complete</span>
                  )}
                </div>
                <div
                  style={{
                    height: 2,
                    backgroundColor: 'var(--border)',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: track.color,
                      borderRadius: 1,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
