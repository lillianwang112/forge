import { useState, useRef, useEffect, useCallback } from 'react';

const MIN_WIDTH = 300;
const STORAGE_KEY = 'forge-split-ratio';

export default function SplitPane({ left, right }) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const [ratio, setRatio] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseFloat(saved) : 0.55;
  });

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      const rawLeft = e.clientX - rect.left;
      const clampedLeft = Math.max(MIN_WIDTH, Math.min(rawLeft, totalWidth - MIN_WIDTH));
      const newRatio = clampedLeft / totalWidth;
      setRatio(newRatio);
      localStorage.setItem(STORAGE_KEY, String(newRatio));
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
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Left pane */}
      <div
        style={{
          width: `${ratio * 100}%`,
          minWidth: MIN_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: 6,
          flexShrink: 0,
          backgroundColor: 'var(--border)',
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
          position: 'relative',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(88,166,255,0.4)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--border)')}
      >
        {/* Grip dots */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pointerEvents: 'none',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: 2,
                borderRadius: '50%',
                backgroundColor: 'var(--text-muted)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Right pane */}
      <div
        style={{
          flex: 1,
          minWidth: MIN_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {right}
      </div>
    </div>
  );
}
