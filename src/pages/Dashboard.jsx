import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SplitPane from '../components/editor/SplitPane';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import RightPanel from '../components/editor/RightPanel';
import TrackSelector from '../components/curriculum/TrackSelector';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useAIFeedback } from '../hooks/useAIFeedback';
import { useAllProgress } from '../hooks/useProgress';
import { getAllTracks, getTrack } from '../curriculum/index';

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
// Component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTERS.python);

  // Execution engine
  const { execute, output, isRunning, engineStatus, loadingMessage, clearOutput } =
    useCodeExecution(language);

  // AI feedback engine
  const { requestReview, feedback, isStreaming, error: aiError, clearFeedback } =
    useAIFeedback();

  const { summary } = useAllProgress();

  // Compute "continue" card: find the first track with incomplete lessons
  const continueCard = (() => {
    for (const track of getAllTracks()) {
      const completed = summary[track.id] ?? 0;
      if (completed < track.lessons.length) {
        // Find next incomplete lesson
        const nextLesson = track.lessons
          .sort((a, b) => a.order - b.order)
          .find((_, i) => i >= completed);
        if (nextLesson) return { track, lesson: nextLesson };
      }
    }
    return null;
  })();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTERS[lang]);
    clearOutput();
    clearFeedback();
  };

  const handleRun = () => execute(code, language);
  const handleReset = () => { setCode(STARTERS[language]); clearOutput(); };

  const handleAIFeedback = useCallback(() => {
    requestReview(code, language);
  }, [code, language, requestReview]);

  const handleRetryFeedback = useCallback(() => {
    requestReview(code, language);
  }, [code, language, requestReview]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '14px 20px 10px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
          Sandbox
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'var(--font-body)' }}>
          Free-form coding — experiment freely in Python or Julia
        </p>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
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

      {/* ── Split pane: editor left, tabbed right ────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
              // output tab
              output={output}
              isRunning={isRunning}
              engineStatus={engineStatus}
              loadingMessage={loadingMessage}
              language={language}
              onClearOutput={clearOutput}
              // feedback tab
              feedback={feedback}
              isStreaming={isStreaming}
              aiError={aiError}
              onRetry={handleRetryFeedback}
              onClearFeedback={clearFeedback}
            />
          }
        />
      </div>

      {/* ── Continue card + Track selector ───────────────────────────── */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        {continueCard && (
          <Link
            to={`/learn/${continueCard.track.id}/${continueCard.lesson.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: continueCard.track.bgColor,
              border: `1px solid ${continueCard.track.borderColor}`,
              textDecoration: 'none',
              marginBottom: 12,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = continueCard.track.color)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = continueCard.track.borderColor)}
          >
            <span style={{ fontSize: '0.9rem' }}>▶</span>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: continueCard.track.color, fontFamily: 'var(--font-body)' }}>
                Continue: {continueCard.lesson.title}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {continueCard.track.name}
              </div>
            </div>
          </Link>
        )}
        <TrackSelector />
      </div>
    </div>
  );
}
