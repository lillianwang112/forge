import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SplitPane from '../components/editor/SplitPane';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import RightPanel from '../components/editor/RightPanel';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useAIFeedback } from '../hooks/useAIFeedback';
import { useAllProgress } from '../hooks/useProgress';
import { getAllTracks } from '../curriculum/index';

// ---------------------------------------------------------------------------
// Starter code per language
// ---------------------------------------------------------------------------

const STARTERS = {
  python: `import numpy as np

# Welcome to Forge! 🔨
# Try running some Python code.

x = np.linspace(0, 2 * np.pi, 100)
print(f"Generated {len(x)} points from 0 to 2π")
print(f"Mean: {np.mean(np.sin(x)):.6f}")
print(f"Max sin(x): {np.max(np.sin(x)):.6f}")
`,
  julia: `# Welcome to Forge! 🔨
# Julia runs via Wandbox (cloud-based, Julia 1.10.5)

println("Hello from Julia!")

# Multiple dispatch example
greet(name::String) = println("Hello, \$(name)!")
greet(n::Int)        = println("Hello, person #\$(n)!")

greet("Forge")
greet(42)

# Array operations
x = range(0, 2*pi, length=100) |> collect
println("")
println("Generated \$(length(x)) points")
println("Max sin(x): \$(round(maximum(sin.(x)), digits=6))")
`,
};

// ---------------------------------------------------------------------------
// SVG Circular Progress Ring
// ---------------------------------------------------------------------------

function ProgressRing({ percent, color, size = 64, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--bg-elevated)"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Greeting based on time of day
// ---------------------------------------------------------------------------

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---------------------------------------------------------------------------
// Track Card
// ---------------------------------------------------------------------------

function TrackCard({ track, completedLessons, index }) {
  const total = track.lessons.length;
  const percent = total > 0 ? Math.round((completedLessons / total) * 100) : 0;
  const nextLesson = track.lessons
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((_, i) => i >= completedLessons);
  const remaining = total - completedLessons;
  const estMinutes = remaining * 15;
  const estDisplay = estMinutes >= 60
    ? `~${Math.round(estMinutes / 60)}h remaining`
    : `~${estMinutes}m remaining`;

  const cardClass = `track-card-${index + 1}`;

  return (
    <Link
      to={`/learn/${track.id}`}
      className={`card-lift ${cardClass}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '18px 20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: track.bgColor,
        border: `1px solid ${track.borderColor}`,
        textDecoration: 'none',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      {/* Top row: emoji + ring */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '1.6rem', lineHeight: 1, marginBottom: 6 }}>{track.emoji}</div>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: track.color,
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.01em',
          }}>
            {track.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {completedLessons} / {total} lessons
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing percent={percent} color={track.color} size={56} strokeWidth={4} />
          <div style={{
            position: 'absolute',
            fontSize: '0.62rem',
            fontWeight: 700,
            color: track.color,
            fontFamily: 'var(--font-mono)',
          }}>
            {percent}%
          </div>
        </div>
      </div>

      {/* Next lesson */}
      {nextLesson ? (
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(0,0,0,0.15)',
          borderLeft: `2px solid ${track.color}`,
        }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
            NEXT UP
          </div>
          <div style={{ fontSize: '0.77rem', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>
            {nextLesson.title}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(63,185,80,0.1)',
          borderLeft: '2px solid var(--accent-green)',
        }}>
          <div style={{ fontSize: '0.77rem', color: 'var(--accent-green)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            Track complete!
          </div>
        </div>
      )}

      {/* Time estimate */}
      {remaining > 0 && (
        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {estDisplay}
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTERS.python);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const navigate = useNavigate();

  const { execute, output, isRunning, engineStatus, loadingMessage, clearOutput } =
    useCodeExecution(language);

  const { requestReview, feedback, isStreaming, error: aiError, clearFeedback } =
    useAIFeedback();

  const { summary } = useAllProgress();

  const tracks = useMemo(() => getAllTracks(), []);

  // Aggregate stats
  const { totalLessons, completedLessons } = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const t of tracks) {
      total += t.lessons.length;
      completed += summary[t.id] ?? 0;
    }
    return { totalLessons: total, completedLessons: completed };
  }, [tracks, summary]);

  const overallPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Find next incomplete lesson across all tracks
  const continueTarget = useMemo(() => {
    for (const track of tracks) {
      const completed = summary[track.id] ?? 0;
      const next = track.lessons
        .slice()
        .sort((a, b) => a.order - b.order)
        .find((_, i) => i >= completed);
      if (next) return { track, lesson: next };
    }
    return null;
  }, [tracks, summary]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTERS[lang]);
    clearOutput();
    clearFeedback();
  };

  const handleRun = () => execute(code, language);
  const handleReset = () => { setCode(STARTERS[language]); clearOutput(); };
  const handleAIFeedback = useCallback(() => requestReview(code, language), [code, language, requestReview]);
  const handleRetryFeedback = useCallback(() => requestReview(code, language), [code, language, requestReview]);

  const greeting = getGreeting();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <div
        className="hero-enter"
        style={{
          padding: '28px 28px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {/* Greeting + title */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {greeting}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>
            Welcome back to Forge
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 5, fontFamily: 'var(--font-body)' }}>
            Your scientific computing learning environment
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="hero-stats-enter">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              Overall progress
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
              {completedLessons} / {totalLessons} lessons
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden' }}>
            <div
              className="progress-bar-fill"
              style={{
                height: '100%',
                width: `${overallPercent}%`,
                borderRadius: 99,
                background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                minWidth: overallPercent > 0 ? 6 : 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Track Cards ───────────────────────────────────────────── */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {tracks.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              completedLessons={summary[track.id] ?? 0}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>

        {/* Continue Learning */}
        {continueTarget && (
          <button
            className="quick-action"
            onClick={() => navigate(`/learn/${continueTarget.track.id}/${continueTarget.lesson.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: continueTarget.track.bgColor,
              border: `1px solid ${continueTarget.track.borderColor}`,
              color: continueTarget.track.color,
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>▶</span>
            <span>Continue: {continueTarget.lesson.title}</span>
          </button>
        )}

        {/* Review Due Cards */}
        <button
          className="quick-action"
          onClick={() => navigate('/review')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(163,113,247,0.08)',
            border: '1px solid rgba(163,113,247,0.2)',
            color: 'var(--accent-purple)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}
        >
          <span>🗂</span>
          <span>Review Flashcards</span>
        </button>

        {/* Open Sandbox */}
        <button
          className="quick-action"
          onClick={() => setSandboxOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: sandboxOpen ? 'rgba(240,136,62,0.12)' : 'var(--bg-elevated)',
            border: `1px solid ${sandboxOpen ? 'rgba(240,136,62,0.4)' : 'var(--border)'}`,
            color: sandboxOpen ? 'var(--accent-warm)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}
        >
          <span>{'{ }'}</span>
          <span>{sandboxOpen ? 'Close Sandbox' : 'Open Sandbox'}</span>
        </button>
      </div>

      {/* ── Collapsible Sandbox ───────────────────────────────────── */}
      {sandboxOpen && (
        <div
          className="expand-enter"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 520, overflow: 'hidden' }}
        >
          <EditorToolbar
            language={language}
            onLanguageChange={handleLanguageChange}
            onRun={handleRun}
            onReset={handleReset}
            onAIFeedback={handleAIFeedback}
            isRunning={isRunning}
            isStreaming={isStreaming}
            engineStatus={engineStatus}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <SplitPane
              left={
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={setCode}
                  onRun={handleRun}
                />
              }
              right={
                <RightPanel
                  output={output}
                  isRunning={isRunning}
                  engineStatus={engineStatus}
                  loadingMessage={loadingMessage}
                  language={language}
                  onClearOutput={clearOutput}
                  feedback={feedback}
                  isStreaming={isStreaming}
                  aiError={aiError}
                  onRetry={handleRetryFeedback}
                  onClearFeedback={clearFeedback}
                />
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
