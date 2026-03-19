import { useEffect, useRef, useState } from 'react';

/** Format milliseconds → human-readable */
function fmtTime(ms) {
  if (ms == null) return null;
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(3)}s`;
}

/** Format memory KB → MB string */
function fmtMem(kb) {
  if (kb == null) return null;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Breathing pulse dot */
function PulseDot({ color = 'var(--accent-blue)' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'forge-pulse 1.4s ease-in-out infinite',
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
  language = 'python',
  onClear,
}) {
  const bottomRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);

  const {
    stdout = '',
    stderr = '',
    figures = [],
    result = null,
    time = null,
    memory = null,
    error = null,
  } = output;

  const hasContent = stdout || stderr || figures.length > 0 || result || error;
  const isRateLimit =
    error &&
    (error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('rate-limit'));

  // ── Elapsed counter ───────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now();
      setElapsed(0);
      const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
      return () => clearInterval(id);
    }
  }, [isRunning]);

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stdout, stderr, figures.length, result, error]);

  // ── Status dot ────────────────────────────────────────────────────────
  const statusDot = (() => {
    if (engineStatus === 'ready')     return { color: 'var(--accent-green)',  label: 'Ready' };
    if (engineStatus === 'executing') return { color: 'var(--accent-orange)', label: 'Running' };
    if (engineStatus === 'error')     return { color: 'var(--accent-red)',    label: 'Error' };
    return                                   { color: 'var(--accent-blue)',   label: 'Loading' };
  })();

  const isPulsing = engineStatus === 'loading' || engineStatus === 'executing';

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
      {/* ── Header ──────────────────────────────────────────────────────── */}
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

        {/* Exec time + memory badge (shown after run completes) */}
        {time != null && !isRunning && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--accent-green)',
              backgroundColor: 'rgba(63,185,80,0.1)',
              padding: '1px 8px',
              borderRadius: 10,
              border: '1px solid rgba(63,185,80,0.2)',
            }}
          >
            ✓ {fmtTime(time)}{memory != null ? ` • ${fmtMem(memory)}` : ''}
          </span>
        )}

        {/* Running elapsed */}
        {isRunning && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--accent-orange)',
              backgroundColor: 'rgba(210,153,34,0.1)',
              padding: '1px 8px',
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
            fontFamily: 'var(--font-mono)',
          }}
          title={statusDot.label}
        >
          {isPulsing ? (
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
          <span>{statusDot.label}</span>
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

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          fontSize: '0.82rem',
          lineHeight: 1.7,
        }}
      >
        {/* Python engine loading */}
        {engineStatus === 'loading' && language === 'python' && !hasContent && !isRunning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            <PulseDot color="var(--accent-blue)" />
            <span>{loadingMessage}</span>
          </div>
        )}

        {/* Julia-specific running message */}
        {isRunning && language === 'julia' && !stdout && !stderr && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              <PulseDot color="var(--accent-purple)" />
              <span>Compiling Julia code… (JIT compilation takes a few seconds)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: 17 }}>
              Tip: subsequent runs are faster once the JIT cache is warm.
            </div>
          </div>
        )}

        {/* Generic Python running indicator */}
        {isRunning && language === 'python' && !stdout && !stderr && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            <PulseDot color="var(--accent-orange)" />
            <span>Executing…</span>
          </div>
        )}

        {/* Empty state */}
        {!hasContent && !isRunning && engineStatus !== 'loading' && (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Run your code to see output here
          </span>
        )}

        {/* stdout */}
        {stdout && (
          <pre style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontFamily: 'var(--font-mono)' }}>
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

        {/* error — rate-limit gets a friendlier card */}
        {error && (
          <div
            style={{
              margin: (stdout || stderr) ? '8px 0 0' : 0,
              padding: isRateLimit ? '10px 14px' : '0 0 0 10px',
              borderLeft: '2px solid var(--accent-red)',
              backgroundColor: isRateLimit ? 'rgba(248,81,73,0.07)' : 'transparent',
              borderRadius: isRateLimit ? 6 : 0,
            }}
          >
            {isRateLimit && (
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-orange)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>
                ⚠ Rate limit hit
              </div>
            )}
            <pre
              style={{
                color: 'var(--accent-red)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {error}
            </pre>
            {isRateLimit && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-body)' }}>
                Wait 60 seconds, then try again.
              </div>
            )}
          </div>
        )}

        {/* result (Python last expression) */}
        {result != null && (
          <div style={{ marginTop: (stdout || stderr || error) ? 8 : 0, color: 'var(--accent-blue)', fontStyle: 'italic', fontSize: '0.78rem' }}>
            {'→ '}{result}
          </div>
        )}

        {/* matplotlib figures */}
        {figures.length > 0 && (
          <div style={{ marginTop: hasContent ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {figures.map((b64, i) => (
              <img
                key={i}
                src={`data:image/png;base64,${b64}`}
                alt={`Plot ${i + 1}`}
                style={{ maxWidth: '100%', borderRadius: 6, border: '1px solid var(--border)', display: 'block' }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes forge-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
