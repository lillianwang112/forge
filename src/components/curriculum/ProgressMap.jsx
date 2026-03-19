import { Link } from 'react-router-dom';

/**
 * Visual lesson skill-tree displayed in the track view.
 *
 * @param {{
 *   track: import('../../curriculum/schema').Track,
 *   isLessonComplete: (lessonId: string) => boolean,
 *   currentLessonId?: string,
 * }} props
 */
export default function ProgressMap({ track, isLessonComplete, currentLessonId }) {
  const lessons = [...track.lessons].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {lessons.map((lesson, idx) => {
        const complete  = isLessonComplete(lesson.id);
        const isCurrent = lesson.id === currentLessonId;
        // A lesson is unlocked if it's the first, or the previous is complete
        const prevComplete = idx === 0 || isLessonComplete(lessons[idx - 1].id);
        const unlocked = complete || prevComplete;

        const dotColor = complete
          ? 'var(--accent-green)'
          : isCurrent
          ? 'var(--accent-blue)'
          : unlocked
          ? 'var(--text-secondary)'
          : 'var(--text-muted)';

        const lineColor = complete ? 'var(--accent-green)' : 'var(--border)';

        return (
          <div key={lesson.id} style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* Connector column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 32,
                flexShrink: 0,
              }}
            >
              {/* Line above dot (skip for first) */}
              <div
                style={{
                  width: 2,
                  flex: idx === 0 ? '0 0 8px' : '0 0 16px',
                  backgroundColor: idx === 0 ? 'transparent' : lineColor,
                  transition: 'background 0.3s',
                }}
              />
              {/* Node dot */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `2px solid ${dotColor}`,
                  backgroundColor: complete ? dotColor : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}
              >
                {complete && (
                  <span style={{ fontSize: '0.55rem', color: '#000', fontWeight: 700 }}>✓</span>
                )}
              </div>
              {/* Line below dot (skip for last) */}
              <div
                style={{
                  width: 2,
                  flex: idx === lessons.length - 1 ? '0 0 8px' : 1,
                  backgroundColor: idx === lessons.length - 1 ? 'transparent' : 'var(--border)',
                  minHeight: 16,
                }}
              />
            </div>

            {/* Lesson card */}
            <div style={{ flex: 1, padding: '8px 0 8px 10px', display: 'flex', alignItems: 'center' }}>
              {unlocked ? (
                <Link
                  to={`/learn/${track.id}/${lesson.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: isCurrent
                      ? '1px solid rgba(88,166,255,0.4)'
                      : complete
                      ? '1px solid rgba(63,185,80,0.25)'
                      : '1px solid var(--border)',
                    backgroundColor: isCurrent
                      ? 'rgba(88,166,255,0.06)'
                      : complete
                      ? 'rgba(63,185,80,0.05)'
                      : 'var(--bg-surface)',
                    width: '100%',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(88,166,255,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isCurrent
                      ? 'rgba(88,166,255,0.4)'
                      : complete
                      ? 'rgba(63,185,80,0.25)'
                      : 'var(--border)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {String(lesson.order).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: complete
                          ? 'var(--accent-green)'
                          : isCurrent
                          ? 'var(--accent-blue)'
                          : 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {lesson.title}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {lesson.challenges.length} challenge{lesson.challenges.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    width: '100%',
                    opacity: 0.4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                    >
                      {String(lesson.order).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {lesson.title}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: '0.7rem' }}>🔒</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
