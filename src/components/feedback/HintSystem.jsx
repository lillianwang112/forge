import { useState } from 'react';
import MarkdownRenderer from '../shared/MarkdownRenderer';

const HINT_LEVELS = [
  { level: 1, icon: '💡', label: 'Nudge',      desc: 'A conceptual nudge' },
  { level: 2, icon: '🔑', label: 'Approach',   desc: 'The high-level approach' },
  { level: 3, icon: '📝', label: 'Pseudocode', desc: 'Structural pseudocode' },
];

function HintCard({ level, icon, label, content, isCollapsed, onToggle }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      {/* Card header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            flex: 1,
          }}
        >
          Hint {level} — {label}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          {isCollapsed ? '▶' : '▼'}
        </span>
      </button>

      {/* Card content */}
      {!isCollapsed && (
        <div style={{ padding: '10px 14px' }}>
          <MarkdownRenderer content={content} />
        </div>
      )}
    </div>
  );
}

export default function HintSystem({
  challenge,
  userCode,
  requestHint,
  isStreaming,
  feedback,
}) {
  // Track which hints have been revealed and their content
  const [revealedHints, setRevealedHints] = useState({}); // { 1: 'text', 2: 'text', ... }
  const [activeLevel, setActiveLevel] = useState(null);   // which hint is currently streaming
  const [collapsedHints, setCollapsedHints] = useState({}); // { 1: bool }

  // Accumulate streamed text into the active hint when streaming completes
  const handleRequestHint = (level) => {
    if (isStreaming) return;
    setActiveLevel(level);
    requestHint(challenge, level, userCode);
  };

  // When streaming finishes, save the accumulated feedback to this hint level
  // (parent passes feedback; we detect completion via isStreaming flipping to false)
  const prevStreamingRef = { current: false };
  if (!isStreaming && activeLevel !== null && feedback) {
    if (!revealedHints[activeLevel]) {
      setRevealedHints((prev) => ({ ...prev, [activeLevel]: feedback }));
      setActiveLevel(null);
    }
  }

  const maxRevealedLevel = Math.max(0, ...Object.keys(revealedHints).map(Number));

  const toggleCollapse = (level) => {
    setCollapsedHints((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hint buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {HINT_LEVELS.map(({ level, icon, label, desc }) => {
          const isRevealed = !!revealedHints[level];
          const isUnlocked = level === 1 || maxRevealedLevel >= level - 1;
          const isActive = activeLevel === level && isStreaming;
          const canClick = isUnlocked && !isStreaming && !isRevealed;

          return (
            <button
              key={level}
              onClick={() => canClick && handleRequestHint(level)}
              disabled={!canClick}
              title={!isUnlocked ? `Reveal Hint ${level - 1} first` : desc}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                cursor: canClick ? 'pointer' : 'not-allowed',
                border: isRevealed
                  ? '1px solid rgba(63,185,80,0.3)'
                  : isActive
                  ? '1px solid rgba(88,166,255,0.5)'
                  : isUnlocked
                  ? '1px solid var(--border)'
                  : '1px solid rgba(72,79,88,0.5)',
                backgroundColor: isRevealed
                  ? 'rgba(63,185,80,0.08)'
                  : isActive
                  ? 'rgba(88,166,255,0.1)'
                  : 'transparent',
                color: isRevealed
                  ? 'var(--accent-green)'
                  : isActive
                  ? 'var(--accent-blue)'
                  : isUnlocked
                  ? 'var(--text-secondary)'
                  : 'var(--text-muted)',
                opacity: isUnlocked ? 1 : 0.5,
                transition: 'all 0.15s',
              }}
            >
              <span>{icon}</span>
              {isActive ? 'Loading…' : isRevealed ? `✓ ${label}` : label}
            </button>
          );
        })}
      </div>

      {/* Streaming hint in progress */}
      {isStreaming && activeLevel !== null && feedback && (
        <div
          style={{
            padding: '10px 14px',
            border: '1px solid rgba(88,166,255,0.2)',
            borderRadius: 8,
            backgroundColor: 'rgba(88,166,255,0.04)',
          }}
        >
          <MarkdownRenderer content={feedback} />
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
        </div>
      )}

      {/* Revealed hint cards */}
      {HINT_LEVELS.filter(({ level }) => revealedHints[level]).map(({ level, icon, label }) => (
        <HintCard
          key={level}
          level={level}
          icon={icon}
          label={label}
          content={revealedHints[level]}
          isCollapsed={!!collapsedHints[level]}
          onToggle={() => toggleCollapse(level)}
        />
      ))}

      <style>{`
        @keyframes ai-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
