/**
 * Three loading spinner variants.
 *
 * @param {{
 *   variant?: 'dots' | 'ring' | 'progress',
 *   progress?: number,  // 0-100, for 'progress' variant
 *   label?: string,
 *   size?: 'sm' | 'md' | 'lg',
 *   color?: string,
 * }} props
 */
export default function LoadingSpinner({
  variant = 'ring',
  progress = 0,
  label,
  size = 'md',
  color = 'var(--accent-blue)',
}) {
  const dim = { sm: 16, md: 24, lg: 40 }[size] ?? 24;
  const strokeW = { sm: 1.5, md: 2, lg: 3 }[size] ?? 2;

  if (variant === 'dots') {
    const dotSize = { sm: 5, md: 7, lg: 10 }[size] ?? 7;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: dotSize * 0.6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: color,
              animation: `dot-pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
        {label && (
          <span
            style={{
              marginLeft: 8,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {label}
          </span>
        )}
        <style>{`
          @keyframes dot-pulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%            { transform: scale(1);   opacity: 1;   }
          }
        `}</style>
      </span>
    );
  }

  if (variant === 'progress') {
    return (
      <div style={{ width: '100%', maxWidth: 280 }}>
        {label && (
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{label}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        )}
        <div
          style={{
            height: 4,
            backgroundColor: 'var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, progress))}%`,
              backgroundColor: color,
              borderRadius: 2,
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
      </div>
    );
  }

  // Default: ring
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: dim,
          height: dim,
          border: `${strokeW}px solid rgba(88,166,255,0.2)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
      {label && (
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
