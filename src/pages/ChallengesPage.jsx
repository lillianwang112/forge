import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTracks } from '../curriculum/index.js';
import { getAllProgress } from '../storage/db.js';

function buildCompletedSet(records) {
  const set = new Set();
  for (const r of records) {
    if (r.type === 'challenge' && r.completed) set.add(r.challengeId);
  }
  return set;
}

function DifficultyPip({ testCount }) {
  // Use test count as a rough difficulty proxy: 1-2 = easy, 3 = medium
  const label = testCount <= 1 ? 'easy' : testCount <= 2 ? 'medium' : 'hard';
  const color = { easy: 'var(--accent-green)', medium: 'var(--accent-orange)', hard: 'var(--accent-red)' }[label];
  return (
    <span
      style={{
        fontSize: '0.62rem',
        fontFamily: 'var(--font-mono)',
        color,
        backgroundColor: color + '18',
        border: `1px solid ${color}40`,
        padding: '1px 6px',
        borderRadius: 8,
      }}
    >
      {label}
    </span>
  );
}

function ChallengeRow({ challenge, lessonTitle, trackColor, isComplete }) {
  const visibleTests = challenge.testCases.filter((tc) => !tc.isHidden).length;

  return (
    <Link
      to={`/challenge/${challenge.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        textDecoration: 'none',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = (trackColor ?? 'rgba(88,166,255,0.5)') + '80';
        e.currentTarget.style.backgroundColor = 'rgba(88,166,255,0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      }}
    >
      {/* Status icon */}
      <span
        style={{
          width: 18,
          flexShrink: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: isComplete ? 'var(--accent-green)' : 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        {isComplete ? '✓' : '◯'}
      </span>

      {/* Title + lesson */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {challenge.title}
        </div>
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            marginTop: 1,
          }}
        >
          {lessonTitle}
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <DifficultyPip testCount={visibleTests} />
        <span
          style={{
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {visibleTests}T
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}

function TrackTab({ track, isActive, onClick, completedCount, totalCount }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 14px',
        borderRadius: 8,
        border: isActive ? `1px solid ${track.color ?? 'var(--accent-blue)'}` : '1px solid var(--border)',
        backgroundColor: isActive ? (track.bgColor ?? 'rgba(88,166,255,0.08)') : 'transparent',
        color: isActive ? (track.color ?? 'var(--accent-blue)') : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontFamily: 'var(--font-body)',
        fontWeight: isActive ? 600 : 400,
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      <span>{track.emoji}</span>
      <span>{track.name}</span>
      <span
        style={{
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          opacity: 0.7,
        }}
      >
        {completedCount}/{totalCount}
      </span>
    </button>
  );
}

export default function ChallengesPage() {
  const tracks = getAllTracks();
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());

  useEffect(() => {
    getAllProgress()
      .then((records) => setCompleted(buildCompletedSet(records)))
      .catch(() => {});
  }, []);

  const activeTrack = tracks[activeTrackIdx];

  // Count totals per track for tab badges
  const trackStats = tracks.map((t) => {
    let total = 0;
    let done = 0;
    for (const lesson of t.lessons) {
      for (const ch of lesson.challenges) {
        total++;
        if (completed.has(ch.id)) done++;
      }
    }
    return { total, done };
  });

  const totalAll  = trackStats.reduce((s, x) => s + x.total, 0);
  const doneAll   = trackStats.reduce((s, x) => s + x.done, 0);

  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '28px 24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
        >
          Challenges
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {doneAll} of {totalAll} challenges completed
        </p>
      </div>

      {/* Track tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {tracks.map((track, i) => (
          <TrackTab
            key={track.id}
            track={track}
            isActive={activeTrackIdx === i}
            onClick={() => setActiveTrackIdx(i)}
            completedCount={trackStats[i].done}
            totalCount={trackStats[i].total}
          />
        ))}
      </div>

      {/* Challenge list for active track */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeTrack.lessons
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((lesson) => {
            const lessonDone = lesson.challenges.every((c) => completed.has(c.id));
            return (
              <div key={lesson.id}>
                {/* Lesson group header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      color: lessonDone ? 'var(--accent-green)' : (activeTrack.color ?? 'var(--text-muted)'),
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                    }}
                  >
                    {lessonDone ? '✓ ' : ''}{lesson.title}
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
                  <Link
                    to={`/learn/${activeTrack.id}/${lesson.id}`}
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-mono)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    open lesson →
                  </Link>
                </div>

                {/* Challenge rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {lesson.challenges.map((ch) => (
                    <ChallengeRow
                      key={ch.id}
                      challenge={ch}
                      lessonTitle={lesson.title}
                      trackColor={activeTrack.color}
                      isComplete={completed.has(ch.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
