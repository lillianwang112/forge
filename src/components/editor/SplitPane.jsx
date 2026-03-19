import { useState, useRef, useEffect, useCallback } from 'react';

const MIN_SIZE = 180;

export default function SplitPane({
  left,
  right,
  direction = 'horizontal',
  defaultRatio = 0.55,
  storageKey = 'forge-split-ratio',
}) {
  const containerRef = useRef(null);
  const isDragging   = useRef(false);

  const [ratio, setRatio] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseFloat(saved) : defaultRatio;
  });

  const isHorizontal = direction === 'horizontal';

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [isHorizontal]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect      = containerRef.current.getBoundingClientRect();
      const totalSize = isHorizontal ? rect.width  : rect.height;
      const rawPos    = isHorizontal
        ? e.clientX - rect.left
        : e.clientY - rect.top;
      const clamped  = Math.max(MIN_SIZE, Math.min(rawPos, totalSize - MIN_SIZE));
      const newRatio = clamped / totalSize;
      setRatio(newRatio);
      localStorage.setItem(storageKey, String(newRatio));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isHorizontal, storageKey]);

  const dividerStyle = isHorizontal
    ? {
        width: 6,
        flexShrink: 0,
        cursor: 'col-resize',
        backgroundColor: 'var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
      }
    : {
        height: 6,
        flexShrink: 0,
        cursor: 'row-resize',
        backgroundColor: 'var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
      };

  const gripDots = isHorizontal
    ? [0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}
        />
      ))
    : [0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block' }}
        />
      ));

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        flex: 1,
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* First pane */}
      <div
        style={
          isHorizontal
            ? { width: `${ratio * 100}%`, minWidth: MIN_SIZE, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
            : { height: `${ratio * 100}%`, minHeight: MIN_SIZE, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
        }
      >
        {left}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        style={dividerStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(88,166,255,0.4)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--border)')}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'column' : 'row',
            gap: 3,
            pointerEvents: 'none',
          }}
        >
          {gripDots}
        </div>
      </div>

      {/* Second pane */}
      <div
        style={
          isHorizontal
            ? { flex: 1, minWidth: MIN_SIZE, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
            : { flex: 1, minHeight: MIN_SIZE, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
        }
      >
        {right}
      </div>
    </div>
  );
}
