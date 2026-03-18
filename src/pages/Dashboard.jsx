import { useState } from 'react';
import { Link } from 'react-router-dom';
import SplitPane from '../components/editor/SplitPane';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import OutputPanel from '../components/editor/OutputPanel';
import { useCodeExecution } from '../hooks/useCodeExecution';

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
# Julia execution uses Judge0 (coming in Phase 3)

println("Hello from Julia!")
x = range(0, 2π, length=100)
println("Generated $(length(x)) points from 0 to 2π")
println("Max sin(x): $(maximum(sin.(x)))")
`,
};

// ---------------------------------------------------------------------------
// Track cards data
// ---------------------------------------------------------------------------

const TRACKS = [
  {
    id: 'python',
    name: 'Python Track',
    emoji: '🐍',
    color: 'var(--accent-green)',
    bgColor: 'rgba(63,185,80,0.07)',
    borderColor: 'rgba(63,185,80,0.2)',
    description: 'NumPy, SciPy, data pipelines, numerical methods and scientific computing.',
    lessons: 24,
    completed: 0,
  },
  {
    id: 'julia',
    name: 'Julia Track',
    emoji: '💜',
    color: 'var(--accent-purple)',
    bgColor: 'rgba(163,113,247,0.07)',
    borderColor: 'rgba(163,113,247,0.2)',
    description: 'High-performance computing, differential equations, and numerical analysis.',
    lessons: 18,
    completed: 0,
  },
  {
    id: 'shared',
    name: 'Shared Skills',
    emoji: '⚡',
    color: 'var(--accent-blue)',
    bgColor: 'rgba(88,166,255,0.07)',
    borderColor: 'rgba(88,166,255,0.2)',
    description: 'Math foundations, algorithm design, data structures, and ML essentials.',
    lessons: 12,
    completed: 0,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTERS.python);

  const { execute, output, isRunning, engineStatus, loadingMessage, clearOutput } =
    useCodeExecution();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTERS[lang]);
    clearOutput();
  };

  const handleRun = () => {
    execute(code, language);
  };

  const handleReset = () => {
    setCode(STARTERS[language]);
    clearOutput();
  };

  const handleAIFeedback = () => {
    // Phase 4
    console.info('[Forge] AI Feedback coming in Phase 4');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '14px 20px 10px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Sandbox
        </h1>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            margin: '3px 0 0',
            fontFamily: 'var(--font-body)',
          }}
        >
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
        engineStatus={engineStatus}
      />

      {/* ── Split pane ────────────────────────────────────────────────── */}
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
            <OutputPanel
              output={output}
              isRunning={isRunning}
              engineStatus={engineStatus}
              loadingMessage={loadingMessage}
              onClear={clearOutput}
            />
          }
        />
      </div>

      {/* ── Track cards ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-mono)',
            marginBottom: 10,
          }}
        >
          Learning Tracks
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {TRACKS.map((track) => (
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
                    {track.completed} / {track.lessons} lessons
                  </span>
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
                      width: `${(track.completed / track.lessons) * 100}%`,
                      backgroundColor: track.color,
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
