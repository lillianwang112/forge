import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg = this.state.error?.message ?? 'Unknown error';

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid rgba(248,81,73,0.3)',
            borderRadius: 14,
            padding: '36px 32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.2rem', marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--text-primary)',
              marginBottom: 10,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.55,
              marginBottom: 6,
            }}
          >
            An unexpected error occurred. Your progress is saved locally.
          </p>
          <pre
            style={{
              fontSize: '0.72rem',
              color: 'var(--accent-red)',
              backgroundColor: 'rgba(248,81,73,0.07)',
              border: '1px solid rgba(248,81,73,0.2)',
              borderRadius: 6,
              padding: '8px 12px',
              textAlign: 'left',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-mono)',
              marginBottom: 20,
              marginTop: 12,
            }}
          >
            {msg}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'var(--accent-blue)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Reload Forge
          </button>
        </div>
      </div>
    );
  }
}
