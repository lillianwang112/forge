import MarkdownRenderer from '../shared/MarkdownRenderer';

/**
 * @param {{
 *   challenge: import('../../curriculum/schema').Challenge,
 *   isSelected: boolean,
 *   isComplete: boolean,
 *   testResults: Array<{id:string, passed:boolean}>,
 *   onSelect: () => void,
 * }} props
 */
export default function ChallengeCard({ challenge, isSelected, isComplete, testResults, onSelect }) {
  const total  = challenge.testCases.filter(tc => !tc.isHidden).length;
  const passed = testResults.filter((r) => r.passed).length;
  const hasRun = testResults.length > 0;

  let statusIcon = '◯';
  let statusColor = 'var(--text-muted)';
  if (isComplete) {
    statusIcon  = '✓';
    statusColor = 'var(--accent-green)';
  } else if (hasRun) {
    statusIcon  = passed === total ? '✓' : '✗';
    statusColor = passed === total ? 'var(--accent-green)' : 'var(--accent-red)';
  }

  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 14px',
        borderRadius: 8,
        border: isSelected
          ? '1px solid var(--accent-blue)'
          : '1px solid var(--border)',
        backgroundColor: isSelected
          ? 'rgba(88,166,255,0.07)'
          : 'var(--bg-surface)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'rgba(88,166,255,0.4)';
          e.currentTarget.style.backgroundColor = 'rgba(88,166,255,0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: statusColor,
            width: 16,
            flexShrink: 0,
          }}
        >
          {statusIcon}
        </span>
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            flex: 1,
          }}
        >
          {challenge.title}
        </span>
        {hasRun && (
          <span
            style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: passed === total ? 'var(--accent-green)' : 'var(--accent-red)',
              backgroundColor: passed === total ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
              padding: '1px 6px',
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            {passed}/{total}
          </span>
        )}
      </div>
      <p
        style={{
          margin: '0 0 0 24px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {challenge.description.replace(/\*\*/g, '').split('\n')[0]}
      </p>
    </button>
  );
}
