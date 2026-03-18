import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDueCards, getAllProgress } from '../../storage/db';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const navItemBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '7px 12px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  transition: 'background 0.15s, color 0.15s',
  cursor: 'pointer',
  borderLeft: '2px solid transparent',
  fontFamily: 'var(--font-body)',
};

function NavSection({ label, collapsed }) {
  if (collapsed) return null;
  return (
    <div
      style={{
        padding: '16px 12px 6px',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {label}
    </div>
  );
}

function Dot({ color }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  );
}

function SidebarNavLink({ to, icon, label, dot, collapsed, badge }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navItemBase,
        borderLeftColor: isActive ? 'var(--accent-blue)' : 'transparent',
        backgroundColor: isActive ? 'rgba(88,166,255,0.08)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.style.borderLeftColor.includes('58a6ff')) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.style.borderLeftColor.includes('58a6ff')) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      title={collapsed ? label : undefined}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
      {!collapsed && (
        <>
          {dot && <Dot color={dot} />}
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          {badge > 0 && (
            <span
              style={{
                background: 'var(--accent-orange)',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '1px 6px',
                flexShrink: 0,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const [dueCount, setDueCount] = useState(0);
  const [progress, setProgress] = useState({ completed: 0, total: 30 });

  useEffect(() => {
    getDueCards(Date.now()).then((cards) => setDueCount(cards.length)).catch(() => {});
    getAllProgress().then((all) => {
      if (all.length > 0) {
        setProgress({
          completed: all.filter((p) => p.completed).length,
          total: Math.max(all.length, 30),
        });
      }
    }).catch(() => {});
  }, []);

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <nav
      style={{
        width,
        minWidth: width,
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>🔨</span>
        {!collapsed && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Forge
          </span>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        <NavSection label="Learn" collapsed={collapsed} />
        <SidebarNavLink to="/learn/python" icon="🐍" label="Python Track" dot="var(--accent-green)" collapsed={collapsed} />
        <SidebarNavLink to="/learn/julia" icon="🟣" label="Julia Track" dot="var(--accent-purple)" collapsed={collapsed} />
        <SidebarNavLink to="/learn/shared" icon="⚡" label="Shared Skills" dot="var(--accent-blue)" collapsed={collapsed} />

        <NavSection label="Practice" collapsed={collapsed} />
        <SidebarNavLink to="/challenge/1" icon="⚔️" label="Challenges" collapsed={collapsed} />
        <SidebarNavLink to="/review" icon="🗂️" label="Review (SRS)" collapsed={collapsed} badge={dueCount} />

        <div
          style={{
            height: 1,
            backgroundColor: 'var(--border)',
            margin: '12px 6px',
          }}
        />
        <SidebarNavLink to="/settings" icon="⚙️" label="Settings" collapsed={collapsed} />
      </div>

      {/* Progress bar */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginBottom: 6,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>Progress</span>
            <span>
              {progress.completed} / {progress.total}
            </span>
          </div>
          <div
            style={{
              height: 3,
              backgroundColor: 'var(--border)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(progress.completed / progress.total) * 100}%`,
                backgroundColor: 'var(--accent-blue)',
                borderRadius: 2,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={onToggle}
        style={{
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          gap: 6,
          borderTop: '1px solid var(--border)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          transition: 'color 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span style={{ fontSize: '1rem' }}>{collapsed ? '→' : '←'}</span>
        {!collapsed && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>Collapse</span>}
      </button>
    </nav>
  );
}
