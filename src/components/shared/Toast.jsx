import { createContext, useCallback, useContext, useRef, useState } from 'react';

// ── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ── Hook ──────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Variant styles ────────────────────────────────────────────────────────

const VARIANTS = {
  success: {
    border: 'rgba(63,185,80,0.4)',
    bg: 'rgba(63,185,80,0.1)',
    icon: '✓',
    iconColor: 'var(--accent-green)',
  },
  error: {
    border: 'rgba(248,81,73,0.4)',
    bg: 'rgba(248,81,73,0.1)',
    icon: '✕',
    iconColor: 'var(--accent-red)',
  },
  warning: {
    border: 'rgba(210,153,34,0.4)',
    bg: 'rgba(210,153,34,0.1)',
    icon: '⚠',
    iconColor: 'var(--accent-orange)',
  },
  info: {
    border: 'rgba(88,166,255,0.4)',
    bg: 'rgba(88,166,255,0.1)',
    icon: 'ℹ',
    iconColor: 'var(--accent-blue)',
  },
};

// ── Toast item component ──────────────────────────────────────────────────

function ToastItem({ id, type = 'info', message, onDismiss }) {
  const v = VARIANTS[type] ?? VARIANTS.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 8,
        backgroundColor: 'var(--bg-elevated)',
        border: `1px solid ${v.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        maxWidth: 360,
        fontSize: '0.82rem',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        lineHeight: 1.5,
        animation: 'toast-in 0.2s ease',
        position: 'relative',
      }}
      role="alert"
    >
      {/* Icon */}
      <span
        style={{
          color: v.iconColor,
          fontWeight: 700,
          fontSize: '0.85rem',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {v.icon}
      </span>

      {/* Message */}
      <span style={{ flex: 1 }}>{message}</span>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1,
          padding: '0 0 0 4px',
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, duration = 5000 }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
