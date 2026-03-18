import { useLocation, useParams, Link } from 'react-router-dom';

function useBreadcrumbs() {
  const location = useLocation();
  const { track, lessonId, id } = useParams() || {};
  const parts = [{ label: 'Home', to: '/' }];

  const segments = location.pathname.replace(/^\//, '').split('/');

  if (segments[0] === 'learn' && track) {
    const trackLabel = track.charAt(0).toUpperCase() + track.slice(1);
    parts.push({ label: `${trackLabel} Track`, to: `/learn/${track}` });
    if (lessonId) {
      parts.push({ label: `Lesson ${lessonId}`, to: null });
    }
  } else if (segments[0] === 'challenge') {
    parts.push({ label: 'Challenges', to: '/challenge/1' });
    if (id) parts.push({ label: `Challenge ${id}`, to: null });
  } else if (segments[0] === 'review') {
    parts.push({ label: 'SRS Review', to: null });
  } else if (segments[0] === 'settings') {
    parts.push({ label: 'Settings', to: null });
  }

  return parts;
}

function LangBadge({ track }) {
  if (!track) return null;
  const isPython = track === 'python';
  const isJulia = track === 'julia';
  if (!isPython && !isJulia) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        backgroundColor: isPython ? 'rgba(63,185,80,0.12)' : 'rgba(163,113,247,0.12)',
        color: isPython ? 'var(--accent-green)' : 'var(--accent-purple)',
        border: `1px solid ${isPython ? 'rgba(63,185,80,0.25)' : 'rgba(163,113,247,0.25)'}`,
      }}
    >
      {isPython ? '🐍' : '💜'} {isPython ? 'Python' : 'Julia'}
    </span>
  );
}

export default function Header() {
  const breadcrumbs = useBreadcrumbs();
  const { track } = useParams() || {};

  return (
    <header
      style={{
        height: 48,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
      }}
    >
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/</span>
            )}
            {crumb.to ? (
              <Link
                to={crumb.to}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-body)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <LangBadge track={track} />
    </header>
  );
}
