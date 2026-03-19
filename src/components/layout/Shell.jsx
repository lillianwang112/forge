import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import { getSetting, setSetting } from '../../storage/db.js';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export default function Shell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shortcutsOpen, setShortcutsOpen]       = useState(false);
  const [theme, setTheme]                        = useState('light'); // light is default

  // Load saved theme on mount; fall back to 'light'
  useEffect(() => {
    getSetting('theme').then((saved) => {
      const t = saved ?? 'light';
      setTheme(t);
      applyTheme(t);
    });
  }, []);

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    await setSetting('theme', next);
    window.dispatchEvent(new CustomEvent('forge-theme-changed'));
  };

  // Global '?' key to open keyboard shortcuts modal
  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === '?' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <Outlet />
        </main>
      </div>

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
