export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onReset,
  onAIFeedback,
  isRunning = false,
}) {
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
        onClick={onRun}
        disabled={isRunning}
        style={{
          ...btnBase,
          backgroundColor: isRunning ? 'rgba(63,185,80,0.5)' : 'var(--accent-green)',
          color: '#000',
          fontWeight: 600,
          opacity: isRunning ? 0.7 : 1,
          cursor: isRunning ? 'not-allowed' : 'pointer',
          paddingRight: 14,
        }}
      >
        {isRunning ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                border: '2px solid rgba(0,0,0,0.3)',
                borderTopColor: '#000',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
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
                color: 'rgba(0,0,0,0.55)',
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
      `}</style>
    </div>
  );
}
