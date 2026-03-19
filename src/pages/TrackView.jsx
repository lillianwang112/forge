import { useParams, Link } from 'react-router-dom';
import { getTrack } from '../curriculum/index.js';
import { useProgress } from '../hooks/useProgress.js';
import ProgressMap from '../components/curriculum/ProgressMap.jsx';

export default function TrackView() {
  const { track: trackId }    = useParams();
  const track                 = getTrack(trackId);
  const { isLessonComplete, getTrackProgress, getNextLesson, loading } = useProgress(trackId);

  if (!track) {
    return (
      <div style={{ padding: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        Track not found: <code>{trackId}</code>
      </div>
    );
  }

  const { completedLessons, totalLessons } = getTrackProgress();
  const nextLessonId = getNextLesson();
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
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
          padding: '16px 24px 14px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: '1.4rem' }}>{track.emoji}</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {track.name}
          </h1>
        </div>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            margin: '0 0 10px',
            fontFamily: 'var(--font-body)',
          }}
        >
          {track.description}
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              flex: 1,
              height: 3,
              backgroundColor: 'var(--border)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: track.color,
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            {loading ? '…' : `${completedLessons} / ${totalLessons}`} lessons
          </span>
          {nextLessonId && (
            <Link
              to={`/learn/${trackId}/${nextLessonId}`}
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                color: track.color,
                textDecoration: 'none',
                padding: '3px 10px',
                border: `1px solid ${track.borderColor}`,
                borderRadius: 6,
                backgroundColor: track.bgColor,
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = track.bgColor.replace('0.07', '0.14'))}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = track.bgColor)}
            >
              {completedLessons === 0 ? '▶ Start' : '▶ Continue'}
            </Link>
          )}
        </div>
      </div>

      {/* Lesson skill tree */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-mono)',
            marginBottom: 16,
            marginTop: 0,
          }}
        >
          Lessons
        </p>
        {!loading && (
          <ProgressMap
            track={track}
            isLessonComplete={isLessonComplete}
            currentLessonId={nextLessonId}
          />
        )}
      </div>
    </div>
  );
}
