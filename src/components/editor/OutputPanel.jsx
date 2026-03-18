import { useEffect, useRef, useState } from 'react';

/** Format milliseconds → human-readable string */
function fmtTime(ms) {
  if (ms == null) return null;
  return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(3)}s`;
}

/** Pulsing dot used for the loading / running animation */
function PulseDot({ color = 'var(--accent-blue)' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'forge-pulse 1.1s ease-in-out infinite',
        flexShrink: 0,
      }}
    />
  );
}

export default function OutputPanel({
  output = {},
  isRunning = false,
  engineStatus = 'loading',
  loadingMessage = 'Loading Python engine…',
  onClear,
}) {
  const bottomRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);

  const { stdout = '', stderr = '', figures = [], result = null, time = null, error = null } = output;
  const hasContent = stdout || stderr || figures.length > 0 || result || error;

  // ── Elapsed counter while running ──────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now();
      setElapsed(0);
      const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
      return () => clearInterval(id);
    }
  }, [isRunning]);

  // ── Auto-scroll to bottom on new output ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stdout, stderr, figures.length, result, error]);

  // ── Engine status indicator in header ──────────────────────────────────
  const statusDot = (() => {
    if (engineStatus === 'ready') return { color: 'var(--accent-green)', label: 'Ready' };
    if (engineStatus === 'executing') return { color: 'var(--accent-orange)', label: 'Running' };
    if (engineStatus === 'error') return { color: 'var(--accent-red)', label: 'Error' };
    return { color: 'var(--accent-blue)', label: 'Loading' };
  })();

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
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
          }}
        >
          Output
        </span>

        {/* Execution time badge */}
        {time != null && !isRunning && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--accent-green)',
              backgroundColor: 'rgba(63,185,80,0.1)',
              padding: '1px 7px',
              borderRadius: 10,
              border: '1px solid rgba(63,185,80,0.2)',
            }}
          >
            ✓ {fmtTime(time)}
          </span>
        )}

        {/* Running elapsed counter */}
        {isRunning && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--accent-orange)',
              backgroundColor: 'rgba(210,153,34,0.1)',
              padding: '1px 7px',
              borderRadius: 10,
              border: '1px solid rgba(210,153,34,0.2)',
            }}
          >
            ⏱ {fmtTime(elapsed)}
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Engine status dot */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
          }}
          title={statusDot.label}
        >
          {engineStatus === 'loading' || engineStatus === 'executing' ? (
            <PulseDot color={statusDot.color} />
          ) : (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: statusDot.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontFamily: 'var(--font-mono)' }}>{statusDot.label}</span>
        </span>

        {hasContent && !isRunning && (
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

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          fontSize: '0.82rem',
          lineHeight: 1.7,
        }}
      >
        {/* Engine loading message */}
        {engineStatus === 'loading' && !hasContent && !isRunning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            <PulseDot color="var(--accent-blue)" />
            <span>{loadingMessage}</span>
          </div>
        )}

        {/* Running indicator */}
        {isRunning && !stdout && !stderr && !error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            <PulseDot color="var(--accent-orange)" />
            <span>Executing…</span>
          </div>
        )}

        {/* Empty state (ready, nothing run yet) */}
        {engineStatus === 'ready' && !hasContent && !isRunning && (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Run your code to see output here
          </span>
        )}

        {/* stdout */}
        {stdout && (
          <pre
            style={{
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {stdout}
          </pre>
        )}

        {/* stderr */}
        {stderr && (
          <pre
            style={{
              color: 'var(--accent-red)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: stdout ? '8px 0 0' : 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {stderr}
          </pre>
        )}

        {/* error (execution error / timeout) */}
        {error && (
          <pre
            style={{
              color: 'var(--accent-red)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: (stdout || stderr) ? '8px 0 0' : 0,
              fontFamily: 'var(--font-mono)',
              borderLeft: '2px solid var(--accent-red)',
              paddingLeft: 10,
            }}
          >
            {error}
          </pre>
        )}

        {/* result (last evaluated expression) */}
        {result != null && (
          <div
            style={{
              marginTop: (stdout || stderr || error) ? 8 : 0,
              color: 'var(--accent-blue)',
              fontStyle: 'italic',
              fontSize: '0.78rem',
            }}
          >
            {'→ '}{result}
          </div>
        )}

        {/* matplotlib figures */}
        {figures.length > 0 && (
          <div
            style={{
              marginTop: hasContent ? 12 : 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {figures.map((b64, i) => (
              <img
                key={i}
                src={`data:image/png;base64,${b64}`}
                alt={`Plot ${i + 1}`}
                style={{
                  maxWidth: '100%',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  display: 'block',
                }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes forge-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
