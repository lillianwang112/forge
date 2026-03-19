import MarkdownRenderer from '../shared/MarkdownRenderer';

function PulseDot({ color = 'var(--accent-blue)' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'ai-pulse 1.2s ease-in-out infinite',
        flexShrink: 0,
      }}
    />
  );
}

function ThinkingDots() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        fontSize: '0.82rem',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <PulseDot color="var(--accent-blue)" />
        <PulseDot color="var(--accent-blue)" />
        <PulseDot color="var(--accent-blue)" />
      </span>
      AI is reviewing your code…
    </div>
  );
}

export default function AIFeedback({
  feedback = '',
  isStreaming = false,
  error = null,
  onRetry,
  onClear,
}) {
  const hasContent = feedback.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#080c12',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
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
          ✦ AI Feedback
        </span>

        {isStreaming && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--accent-blue)',
              backgroundColor: 'rgba(88,166,255,0.1)',
              padding: '1px 7px',
              borderRadius: 10,
              border: '1px solid rgba(88,166,255,0.2)',
            }}
          >
            Streaming…
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Model badge */}
        <span
          style={{
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--bg-elevated)',
            padding: '1px 7px',
            borderRadius: 8,
            border: '1px solid var(--border)',
          }}
        >
          claude-sonnet-4-6
        </span>

        {hasContent && !isStreaming && (
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

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px',
        }}
      >
        {/* Empty state */}
        {!hasContent && !isStreaming && !error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 10,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>✦</span>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                margin: 0,
                fontStyle: 'italic',
                fontFamily: 'var(--font-body)',
              }}
            >
              Click <strong style={{ color: 'var(--accent-blue)', fontStyle: 'normal' }}>✦ AI Feedback</strong> to get a
              review of your code
            </p>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                margin: 0,
                fontFamily: 'var(--font-body)',
              }}
            >
              Powered by Claude · Requires Puter sign-in on first use
            </p>
          </div>
        )}

        {/* Thinking dots (streaming with no text yet) */}
        {isStreaming && !hasContent && <ThinkingDots />}

        {/* Streamed + completed feedback */}
        {hasContent && (
          <div>
            <MarkdownRenderer content={feedback} />
            {/* Inline cursor while streaming */}
            {isStreaming && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: '1em',
                  backgroundColor: 'var(--accent-blue)',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'ai-blink 0.9s step-end infinite',
                }}
              />
            )}
          </div>
        )}

        {/* Error state */}
        {error && !isStreaming && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(248,81,73,0.07)',
              border: '1px solid rgba(248,81,73,0.25)',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--accent-red)',
                marginBottom: 6,
              }}
            >
              ✕ Couldn't get feedback
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                margin: '0 0 10px',
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)',
              }}
            >
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: 5,
                  border: '1px solid rgba(88,166,255,0.4)',
                  backgroundColor: 'transparent',
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(88,166,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ai-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.6); }
        }
        @keyframes ai-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
