import { useState, useEffect } from 'react';
import { getSetting, setSetting, getAllProgress, getAllCards, getDB } from '../storage/db.js';
import Modal from '../components/shared/Modal';

const AI_MODELS = [
  { label: 'Claude (Sonnet 4.6)', value: 'claude-sonnet-4-6' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
];

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontSize: '0.62rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 8,
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-body)' }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '5px 14px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-body)',
            fontWeight: value === opt.value ? 600 : 400,
            backgroundColor: value === opt.value ? 'var(--accent-blue)' : 'transparent',
            color: value === opt.value ? '#000' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ActionButton({ onClick, variant = 'default', children }) {
  const colors = {
    default: { bg: 'var(--bg-elevated)', border: 'var(--border)', color: 'var(--text-secondary)' },
    danger:  { bg: 'rgba(248,81,73,0.08)', border: 'rgba(248,81,73,0.3)', color: 'var(--accent-red)' },
    primary: { bg: 'var(--accent-blue)', border: 'var(--accent-blue)', color: '#000' },
  };
  const c = colors[variant];
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: 8,
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        color: c.color,
        fontSize: '0.82rem',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  const [theme, setTheme]           = useState('dark');
  const [fontSize, setFontSize]     = useState(14);
  const [language, setLanguage]     = useState('python');
  const [aiModel, setAiModel]       = useState('claude-sonnet-4-6');
  const [resetModal, setResetModal] = useState(false);
  const [toast, setToast]           = useState(null);
  const [loaded, setLoaded]         = useState(false);

  // Load settings from IndexedDB
  useEffect(() => {
    (async () => {
      const [t, fs, lang, ai] = await Promise.all([
        getSetting('theme'),
        getSetting('editorFontSize'),
        getSetting('defaultLanguage'),
        getSetting('aiModel'),
      ]);
      if (t)    setTheme(t);
      if (fs)   setFontSize(Number(fs));
      if (lang) setLanguage(lang);
      if (ai)   setAiModel(ai);
      setLoaded(true);
    })();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleTheme(val) {
    setTheme(val);
    await setSetting('theme', val);
    document.documentElement.setAttribute('data-theme', val);
  }

  async function handleFontSize(val) {
    const n = Number(val);
    setFontSize(n);
    await setSetting('editorFontSize', n);
    localStorage.setItem('forge-font-size', String(n));
    window.dispatchEvent(new CustomEvent('forge-settings', { detail: { fontSize: n } }));
  }

  async function handleLanguage(val) {
    setLanguage(val);
    await setSetting('defaultLanguage', val);
  }

  async function handleAiModel(val) {
    setAiModel(val);
    await setSetting('aiModel', val);
  }

  async function handleExport() {
    try {
      const [progress, cards] = await Promise.all([getAllProgress(), getAllCards()]);
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        progress,
        srsCards: cards,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge-progress-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Progress exported successfully');
    } catch {
      showToast('Export failed');
    }
  }

  function handleImportClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.progress || !data.srsCards) throw new Error('Invalid file');
        // Import is advisory — user's existing data takes precedence
        showToast(`Import preview: ${data.progress.length} progress records, ${data.srsCards.length} SRS cards. Full import coming soon.`);
      } catch {
        showToast('Import failed — invalid file');
      }
    };
    input.click();
  }

  async function handleReset() {
    // Clear IndexedDB stores and localStorage SRS log
    const db = await getDB();
    await db.clear('progress');
    await db.clear('srs-cards');
    localStorage.removeItem('forge-srs-daily-log');
    setResetModal(false);
    showToast('All progress reset');
  }

  if (!loaded) return null;

  return (
    <div
      style={{
        maxWidth: 620,
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Preferences are saved automatically to your local device.
        </p>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Theme" hint="Switch between dark and light mode">
          <SegmentedControl
            options={[{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }]}
            value={theme}
            onChange={handleTheme}
          />
        </Row>
        <Row
          label="Editor font size"
          hint={`Currently ${fontSize}px`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12</span>
            <input
              type="range"
              min={12}
              max={20}
              step={1}
              value={fontSize}
              onChange={(e) => handleFontSize(e.target.value)}
              style={{
                width: 120,
                accentColor: 'var(--accent-blue)',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>20</span>
          </div>
        </Row>
      </Section>

      {/* Editor */}
      <Section title="Editor">
        <Row label="Default language" hint="Used when opening the sandbox editor">
          <SegmentedControl
            options={[{ label: 'Python', value: 'python' }, { label: 'Julia', value: 'julia' }]}
            value={language}
            onChange={handleLanguage}
          />
        </Row>
      </Section>

      {/* AI */}
      <Section title="AI Feedback">
        <Row label="AI model" hint="Model used for code feedback via Puter.js">
          <select
            value={aiModel}
            onChange={(e) => handleAiModel(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            {AI_MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </Row>
      </Section>

      {/* Data */}
      <Section title="Data">
        <Row label="Export progress" hint="Download all progress and SRS card data as JSON">
          <ActionButton onClick={handleExport} variant="default">Export JSON</ActionButton>
        </Row>
        <Row label="Import progress" hint="Restore from a previously exported JSON file">
          <ActionButton onClick={handleImportClick} variant="default">Import JSON</ActionButton>
        </Row>
        <Row
          label="Reset all progress"
          hint="Permanently deletes all lesson progress and SRS review history"
        >
          <ActionButton onClick={() => setResetModal(true)} variant="danger">Reset Progress</ActionButton>
        </Row>
      </Section>

      {/* Reset confirmation modal */}
      <Modal isOpen={resetModal} onClose={() => setResetModal(false)} title="Reset All Progress" maxWidth={400}>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          This will permanently delete all lesson progress, challenge completions, and SRS review history.
          This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <ActionButton onClick={() => setResetModal(false)} variant="default">Cancel</ActionButton>
          <ActionButton onClick={handleReset} variant="danger">Yes, Reset Everything</ActionButton>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 20px',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            zIndex: 99999,
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
