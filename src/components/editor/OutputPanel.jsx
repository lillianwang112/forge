import { useEffect, useRef } from 'react';

// Entry types: { type: 'stdout' | 'stderr' | 'system', text: string, ts?: number }

export default function OutputPanel({ entries = [], onClear, execTime }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#080c12',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Output
        </span>

        {execTime != null && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-elevated)',
              padding: '1px 7px',
              borderRadius: 10,
              marginLeft: 2,
            }}
          >
            {execTime < 1000 ? `${execTime}ms` : `${(execTime / 1000).toFixed(2)}s`}
          </span>
        )}

        <div style={{ flex: 1 }} />

        {entries.length > 0 && (
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: 4,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            clear
          </button>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          fontSize: '0.82rem',
          lineHeight: 1.7,
        }}
      >
        {entries.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Run your code to see output here
          </span>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              style={{
                color:
                  entry.type === 'stderr'
                    ? 'var(--accent-red)'
                    : entry.type === 'system'
                    ? 'var(--text-muted)'
                    : 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {entry.text}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
