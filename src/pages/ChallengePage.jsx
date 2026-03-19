import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { getChallenge, getLesson, getTrack } from '../curriculum/index.js';
import { useProgress } from '../hooks/useProgress.js';
import LessonView from '../components/curriculum/LessonView.jsx';
import { unlockCardsForLesson } from '../srs/conceptStore.js';

export default function ChallengePage() {
  const { id } = useParams();

  const entry    = getChallenge(id);        // { ...challenge, trackId, lessonId }
  const track    = entry ? getTrack(entry.trackId)              : null;
  const lesson   = entry ? getLesson(entry.trackId, entry.lessonId) : null;

  const {
    completeLesson,
    completeChallenge,
    isLessonComplete,
    isChallengeComplete,
    getTestResults,
  } = useProgress(entry?.trackId ?? '');

  if (!entry || !track || !lesson) {
    return (
      <div style={{ padding: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        <p>Challenge not found: <code>{id}</code></p>
        <Link
          to="/challenges"
          style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', marginTop: 12, display: 'inline-block' }}
        >
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  const handleCompleteChallenge = async (challengeId, testResults) => {
    const allPassed = await completeChallenge(entry.lessonId, challengeId, testResults);
    if (allPassed) {
      const allDone = lesson.challenges.every((c) => {
        if (c.id === challengeId) return true;
        return isChallengeComplete(entry.lessonId, c.id);
      });
      if (allDone) {
        await completeLesson(entry.lessonId);
        unlockCardsForLesson(entry.lessonId).catch(() => {});
      }
    }
    return allPassed;
  };

  const complete = isLessonComplete(entry.lessonId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Breadcrumb */}
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
          to="/challenges"
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Challenges
        </Link>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/</span>
        <Link
          to={`/learn/${track.id}`}
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
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {lesson.title}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/</span>
        <span
          style={{
            fontSize: '0.72rem',
            color: track.color ?? 'var(--accent-blue)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
          }}
        >
          {entry.title}
        </span>
        <span style={{ flex: 1 }} />
        <Link
          to={`/learn/${track.id}/${lesson.id}`}
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
          open full lesson
        </Link>
      </div>

      {/* Full lesson view, pre-focused on this challenge */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <LessonView
          lesson={lesson}
          trackId={track.id}
          trackColor={track.color}
          language={track.language ?? 'python'}
          initialChallengeId={id}
          isLessonComplete={complete}
          isChallengeComplete={(challengeId) => isChallengeComplete(entry.lessonId, challengeId)}
          getTestResults={(lid, cid) => getTestResults(lid, cid)}
          onCompleteChallenge={handleCompleteChallenge}
          onCompleteLesson={() => completeLesson(entry.lessonId)}
        />
      </div>
    </div>
  );
}
