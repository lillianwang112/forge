import { useParams, Link } from 'react-router-dom';
import { getTrack, getLesson } from '../curriculum/index.js';
import { useProgress } from '../hooks/useProgress.js';
import LessonView from '../components/curriculum/LessonView.jsx';

export default function LessonPage() {
  const { track: trackId, lessonId } = useParams();
  const track  = getTrack(trackId);
  const lesson = getLesson(trackId, lessonId);

  const {
    completeLesson,
    completeChallenge,
    isLessonComplete,
    isChallengeComplete,
    getTestResults,
  } = useProgress(trackId);

  if (!track || !lesson) {
    return (
      <div style={{ padding: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        Lesson not found: <code>{trackId}/{lessonId}</code>
      </div>
    );
  }

  const handleCompleteChallenge = async (challengeId, testResults) => {
    const allPassed = await completeChallenge(lessonId, challengeId, testResults);
    // Auto-complete lesson when all challenges pass
    if (allPassed) {
      const allDone = lesson.challenges.every((c) => {
        if (c.id === challengeId) return true;
        return isChallengeComplete(c.id);
      });
      if (allDone) {
        await completeLesson(lessonId);
      }
    }
    return allPassed;
  };

  // Breadcrumb navigation
  const sortedLessons = [...track.lessons].sort((a, b) => a.order - b.order);
  const currentIdx    = sortedLessons.findIndex((l) => l.id === lessonId);
  const prevLesson    = currentIdx > 0 ? sortedLessons[currentIdx - 1] : null;
  const nextLesson    = currentIdx < sortedLessons.length - 1 ? sortedLessons[currentIdx + 1] : null;
  const complete      = isLessonComplete(lessonId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Breadcrumb bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 16px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <Link
          to={`/learn/${trackId}`}
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {track.emoji} {track.name}
        </Link>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/</span>
        <span
          style={{
            fontSize: '0.72rem',
            color: complete ? 'var(--accent-green)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {lesson.title}
          {complete && ' ✓'}
        </span>
        <span style={{ flex: 1 }} />

        {/* Prev / Next lesson nav */}
        {prevLesson && (
          <Link
            to={`/learn/${trackId}/${prevLesson.id}`}
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ← prev
          </Link>
        )}
        {nextLesson && (
          <Link
            to={`/learn/${trackId}/${nextLesson.id}`}
            style={{
              fontSize: '0.72rem',
              color: track.color ?? 'var(--accent-blue)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${track.borderColor ?? 'var(--border)'}`,
              backgroundColor: track.bgColor ?? 'transparent',
            }}
          >
            next →
          </Link>
        )}
      </div>

      {/* Main lesson view */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <LessonView
          lesson={lesson}
          trackId={trackId}
          trackColor={track.color}
          language={track.language ?? 'python'}
          isLessonComplete={complete}
          isChallengeComplete={(challengeId) => isChallengeComplete(lessonId, challengeId)}
          getTestResults={(lid, cid) => getTestResults(lid, cid)}
          onCompleteChallenge={handleCompleteChallenge}
          onCompleteLesson={() => completeLesson(lessonId)}
        />
      </div>
    </div>
  );
}
