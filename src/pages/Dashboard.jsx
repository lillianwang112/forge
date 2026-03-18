import { useState } from 'react';
import { Link } from 'react-router-dom';
import SplitPane from '../components/editor/SplitPane';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import OutputPanel from '../components/editor/OutputPanel';

const STARTERS = {
  python: `# Welcome to Forge 🔨
# Python sandbox — write anything!

def hello(name: str) -> str:
    return f"Hello, {name}!"

print(hello("Forge"))

# Try numpy-style list comprehension
squares = [x**2 for x in range(10)]
print(squares)
`,
  julia: `# Welcome to Forge 🔨
# Julia sandbox — write anything!

function hello(name::String)
    return "Hello, $name!"
end

println(hello("Forge"))

# Try Julia's array comprehension
squares = [x^2 for x in 1:10]
println(squares)
`,
};

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

export default function Dashboard() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTERS.python);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState(null);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTERS[lang]);
    setOutput([]);
    setExecTime(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput([{ type: 'system', text: '⏳ Execution engine loading in Phase 2…' }]);
    setExecTime(null);
    // Simulate brief delay
    setTimeout(() => {
      setIsRunning(false);
      setExecTime(42);
    }, 800);
  };

  const handleReset = () => {
    setCode(STARTERS[language]);
    setOutput([]);
    setExecTime(null);
  };

  const handleAIFeedback = () => {
    setOutput((prev) => [
      ...prev,
      { type: 'system', text: '✦ AI Feedback will be available in Phase 4…' },
    ]);
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
      {/* Forge sandbox heading */}
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

      {/* Toolbar */}
      <EditorToolbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onReset={handleReset}
        onAIFeedback={handleAIFeedback}
        isRunning={isRunning}
      />

      {/* Split pane: editor + output */}
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
              entries={output}
              onClear={() => { setOutput([]); setExecTime(null); }}
              execTime={execTime}
            />
          }
        />
      </div>

      {/* Track cards */}
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
              {/* Progress bar */}
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
                  <span>{track.completed} / {track.lessons} lessons</span>
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
