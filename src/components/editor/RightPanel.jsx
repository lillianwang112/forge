import { useState, useEffect } from 'react';
import OutputPanel from './OutputPanel';
import AIFeedback from '../feedback/AIFeedback';

const TABS = [
  { id: 'output',   label: 'Output' },
  { id: 'feedback', label: '✦ AI Feedback' },
];

export default function RightPanel({
  // OutputPanel props
  output,
  isRunning,
  engineStatus,
  loadingMessage,
  language,
  onClearOutput,

  // AIFeedback props
  feedback,
  isStreaming,
  aiError,
  onRetry,
  onClearFeedback,
}) {
  const [tab, setTab] = useState('output');
  // Track whether new feedback has arrived since the user last viewed the tab
  const [feedbackUnread, setFeedbackUnread] = useState(false);

  // Auto-switch to feedback tab when streaming begins
  useEffect(() => {
    if (isStreaming) {
      setTab('feedback');
      setFeedbackUnread(false);
    }
  }, [isStreaming]);

  // Mark feedback as unread when new content arrives while on output tab
  useEffect(() => {
    if (feedback && tab === 'output' && !isStreaming) {
      setFeedbackUnread(true);
    }
  }, [feedback, tab, isStreaming]);

  const handleTabClick = (id) => {
    setTab(id);
    if (id === 'feedback') setFeedbackUnread(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {TABS.map(({ id, label }) => {
          const isActive = tab === id;
          const showBadge = id === 'feedback' && feedbackUnread;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              style={{
                padding: '7px 14px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'none',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid var(--accent-blue)'
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: -1, // overlap the container border
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {label}
              {showBadge && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-blue)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
              )}
              {id === 'feedback' && isStreaming && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-blue)',
                    display: 'inline-block',
                    animation: 'rp-pulse 1s ease-in-out infinite',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Panel content ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: tab === 'output' ? 'flex' : 'none', flexDirection: 'column' }}>
        <OutputPanel
          output={output}
          isRunning={isRunning}
          engineStatus={engineStatus}
          loadingMessage={loadingMessage}
          language={language}
          onClear={onClearOutput}
        />
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: tab === 'feedback' ? 'flex' : 'none', flexDirection: 'column' }}>
        <AIFeedback
          feedback={feedback}
          isStreaming={isStreaming}
          error={aiError}
          onRetry={onRetry}
          onClear={onClearFeedback}
        />
      </div>

      <style>{`
        @keyframes rp-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
