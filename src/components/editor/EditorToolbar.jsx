/** @param {{ color: string, pulse?: boolean }} props */
function StatusDot({ color, pulse = false }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        animation: pulse ? 'toolbar-pulse 1.1s ease-in-out infinite' : 'none',
      }}
    />
  );
}

export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onReset,
  onAIFeedback,
  isRunning = false,
  engineStatus = 'loading', // 'loading' | 'ready' | 'executing' | 'error'
}) {
  const canRun = !isRunning && engineStatus === 'ready';

  const engineDot = (() => {
    if (engineStatus === 'ready') return { color: 'var(--accent-green)', pulse: false, title: 'Engine ready' };
    if (engineStatus === 'executing') return { color: 'var(--accent-orange)', pulse: true, title: 'Executing…' };
    if (engineStatus === 'error') return { color: 'var(--accent-red)', pulse: false, title: 'Engine error' };
    return { color: 'var(--accent-blue)', pulse: true, title: 'Loading engine…' };
  })();

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 6,
    fontSize: '0.82rem',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s, opacity 0.15s',
    border: '1px solid transparent',
    lineHeight: 1.4,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}
    >
      {/* Language toggle */}
      <div
        style={{
          display: 'flex',
          borderRadius: 7,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => onLanguageChange?.('python')}
          style={{
            ...btnBase,
            borderRadius: 0,
            border: 'none',
            backgroundColor: language === 'python' ? 'rgba(63,185,80,0.18)' : 'transparent',
            color: language === 'python' ? 'var(--accent-green)' : 'var(--text-secondary)',
            borderRight: '1px solid var(--border)',
            padding: '4px 12px',
          }}
        >
          🐍 Python
        </button>
        <button
          onClick={() => onLanguageChange?.('julia')}
          style={{
            ...btnBase,
            borderRadius: 0,
            border: 'none',
            backgroundColor: language === 'julia' ? 'rgba(163,113,247,0.18)' : 'transparent',
            color: language === 'julia' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            padding: '4px 12px',
          }}
        >
          💜 Julia
        </button>
      </div>

      {/* Engine status indicator */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          padding: '3px 8px',
          borderRadius: 10,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          userSelect: 'none',
        }}
        title={engineDot.title}
      >
        <StatusDot color={engineDot.color} pulse={engineDot.pulse} />
        {engineDot.title}
      </span>

      <div style={{ flex: 1 }} />

      {/* Reset button */}
      <button
        onClick={onReset}
        title="Reset to starter code"
        style={{
          ...btnBase,
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          padding: '4px 10px',
          fontSize: '1rem',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        ↺
      </button>

      {/* AI Feedback button */}
      <button
        onClick={onAIFeedback}
        style={{
          ...btnBase,
          backgroundColor: 'transparent',
          color: 'var(--accent-blue)',
          border: '1px solid rgba(88,166,255,0.35)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(88,166,255,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        ✦ AI Feedback
      </button>

      {/* Run button */}
      <button
        onClick={canRun ? onRun : undefined}
        disabled={!canRun}
        title={!canRun && engineStatus === 'loading' ? 'Waiting for engine to load…' : undefined}
        style={{
          ...btnBase,
          backgroundColor: canRun
            ? 'var(--accent-green)'
            : isRunning
            ? 'rgba(63,185,80,0.4)'
            : 'rgba(63,185,80,0.2)',
          color: canRun ? '#000' : 'rgba(0,0,0,0.5)',
          fontWeight: 600,
          cursor: canRun ? 'pointer' : 'not-allowed',
          paddingRight: 14,
          opacity: canRun ? 1 : 0.75,
        }}
      >
        {isRunning ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                border: '2px solid rgba(0,0,0,0.25)',
                borderTopColor: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                animation: 'spin 0.65s linear infinite',
              }}
            />
            Running…
          </>
        ) : (
          <>
            ▶ Run
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: canRun ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                marginLeft: 2,
              }}
            >
              ⌘↩
            </span>
          </>
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toolbar-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
