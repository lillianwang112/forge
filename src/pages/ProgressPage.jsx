import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllProgress } from '../storage/db';
import { getStats } from '../srs/conceptStore';
import { getAllTracks } from '../curriculum/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysAgo(n) {
  return startOfDay(Date.now() - n * 86400000);
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Build 84-day (12-week) activity heatmap
function buildHeatmap(progressRecords) {
  const counts = {};
  for (const r of progressRecords) {
    if (!r.completedAt || !r.completed) continue;
    const day = startOfDay(r.completedAt);
    counts[day] = (counts[day] || 0) + 1;
  }

  const cells = [];
  for (let i = 83; i >= 0; i--) {
    const day = daysAgo(i);
    cells.push({ day, count: counts[day] || 0 });
  }
  return cells;
}

function heatColor(count) {
  if (count === 0) return 'var(--bg-elevated)';
  if (count === 1) return 'rgba(88,166,255,0.35)';
  if (count === 2) return 'rgba(88,166,255,0.6)';
  if (count <= 4) return 'rgba(88,166,255,0.85)';
  return 'var(--accent-blue)';
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, color = 'var(--accent-blue)' }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      flex: '1 1 140px',
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function TrackBar({ track, completed, total }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>{track.emoji}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
            {track.name}
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {completed} / {total}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 99, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div
          className="progress-bar-fill"
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 99,
            backgroundColor: track.color,
            minWidth: pct > 0 ? 4 : 0,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProgressPage() {
  const [progressRecords, setProgressRecords] = useState([]);
  const [srsStats, setSrsStats] = useState({ due: 0, total: 0, new: 0 });
  const [loading, setLoading] = useState(true);

  const tracks = useMemo(() => getAllTracks(), []);

  useEffect(() => {
    Promise.all([
      getAllProgress(),
      getStats().catch(() => ({ due: 0, total: 0, new: 0 })),
    ]).then(([records, stats]) => {
      setProgressRecords(records);
      setSrsStats(stats);
      setLoading(false);
    });
  }, []);

  const heatmapCells = useMemo(() => buildHeatmap(progressRecords), [progressRecords]);

  const { totalLessons, completedLessons, completedChallenges, totalChallenges, trackStats } = useMemo(() => {
    let totalLessons = 0;
    let completedLessons = 0;
    let totalChallenges = 0;
    let completedChallenges = 0;
    const trackStats = {};

    for (const track of tracks) {
      totalLessons += track.lessons.length;
      totalChallenges += track.lessons.reduce((sum, l) => sum + l.challenges.length, 0);

      const completedL = progressRecords.filter(
        (r) => r.trackId === track.id && r.type === 'lesson' && r.completed
      ).length;
      const completedC = progressRecords.filter(
        (r) => r.trackId === track.id && r.type === 'challenge' && r.completed
      ).length;
      const totalC = track.lessons.reduce((sum, l) => sum + l.challenges.length, 0);

      completedLessons += completedL;
      completedChallenges += completedC;
      trackStats[track.id] = { completed: completedL, total: track.lessons.length, completedChallenges: completedC, totalChallenges: totalC };
    }

    return { totalLessons, completedLessons, completedChallenges, totalChallenges, trackStats };
  }, [tracks, progressRecords]);

  // Milestones
  const milestones = useMemo(() => {
    const events = [];
    const lessonRecords = progressRecords.filter((r) => r.type === 'lesson' && r.completed && r.completedAt);

    if (completedLessons >= 1) {
      const first = lessonRecords.reduce((a, b) => (a.completedAt < b.completedAt ? a : b), lessonRecords[0]);
      if (first) events.push({ label: 'First lesson completed', ts: first.completedAt, emoji: '🎯' });
    }
    if (completedLessons >= 5) events.push({ label: '5 lessons down', ts: null, emoji: '⭐' });
    if (completedLessons >= 10) events.push({ label: '10 lessons completed', ts: null, emoji: '🔥' });
    if (completedLessons >= 20) events.push({ label: '20 lessons milestone', ts: null, emoji: '🚀' });
    if (completedChallenges >= 1) events.push({ label: 'First challenge solved', ts: null, emoji: '⚡' });
    if (completedChallenges >= 10) events.push({ label: '10 challenges solved', ts: null, emoji: '🏆' });

    for (const track of tracks) {
      const ts = trackStats[track.id];
      if (ts && ts.completed === ts.total && ts.total > 0) {
        events.push({ label: `${track.name} complete!`, ts: null, emoji: track.emoji });
      }
    }

    return events.slice(0, 8);
  }, [progressRecords, completedLessons, completedChallenges, tracks, trackStats]);

  // Heatmap: group into weeks (7 cells per row, Sunday-first)
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < heatmapCells.length; i += 7) {
      result.push(heatmapCells.slice(i, i + 7));
    }
    return result;
  }, [heatmapCells]);

  const maxHeat = Math.max(...heatmapCells.map((c) => c.count), 1);

  if (loading) {
    return (
      <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        Loading progress...
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Progress Analytics
        </h1>
        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          Your Forge learning journey at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Lessons completed" value={completedLessons} sub={`of ${totalLessons} total`} color="var(--accent-blue)" />
        <StatCard label="Challenges solved" value={completedChallenges} sub={`of ${totalChallenges} total`} color="var(--accent-green)" />
        <StatCard label="Flashcards due" value={srsStats.due} sub="review now" color="var(--accent-warm)" />
        <StatCard label="Cards learned" value={srsStats.total} sub="in SRS deck" color="var(--accent-purple)" />
      </div>

      {/* Heatmap */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'var(--font-body)' }}>
          Activity — Last 12 Weeks
        </h2>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start', overflowX: 'auto' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((cell) => (
                <div
                  key={cell.day}
                  title={`${formatDate(cell.day)}: ${cell.count} item${cell.count !== 1 ? 's' : ''}`}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 2,
                    backgroundColor: heatColor(cell.count),
                    transition: 'transform 0.1s ease',
                    cursor: cell.count > 0 ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Less</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <div key={n} style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: heatColor(n) }} />
          ))}
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>More</span>
        </div>
      </div>

      {/* Per-track breakdown */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 18px', fontFamily: 'var(--font-body)' }}>
          Track Completion
        </h2>
        {tracks.map((track) => {
          const ts = trackStats[track.id] || { completed: 0, total: 0 };
          return (
            <Link key={track.id} to={`/learn/${track.id}`} style={{ textDecoration: 'none' }}>
              <TrackBar track={track} completed={ts.completed} total={ts.total} />
            </Link>
          );
        })}
      </div>

      {/* SRS stats panel */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: 'var(--font-body)' }}>
            Spaced Repetition
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-body)' }}>
            {srsStats.due > 0
              ? `${srsStats.due} cards are due for review today`
              : 'All cards are up to date!'}
          </p>
        </div>
        <Link
          to="/review"
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(163,113,247,0.12)',
            border: '1px solid rgba(163,113,247,0.3)',
            color: 'var(--accent-purple)',
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          Start Review
        </Link>
      </div>

      {/* Milestones timeline */}
      {milestones.length > 0 && (
        <div style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'var(--font-body)' }}>
            Milestones
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.2rem' }}>{m.emoji}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                    {m.label}
                  </div>
                  {m.ts && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatDate(m.ts)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestones.length === 0 && (
        <div style={{
          padding: '32px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎯</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Complete your first lesson to start earning milestones!
          </p>
          <Link
            to="/learn/python"
            style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '9px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(63,185,80,0.1)',
              border: '1px solid rgba(63,185,80,0.25)',
              color: 'var(--accent-green)',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}
          >
            Start Python Track
          </Link>
        </div>
      )}
    </div>
  );
}
