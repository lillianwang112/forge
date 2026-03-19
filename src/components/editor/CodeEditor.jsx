import { useRef, useCallback, useEffect, useState } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';

// Configure Monaco to load from CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
});

const FORGE_DARK_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '484f58', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'ff7b72' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'number', foreground: '79c0ff' },
    { token: 'type', foreground: 'ffa657' },
    { token: 'function', foreground: 'd2a8ff' },
    { token: 'variable', foreground: 'e6edf3' },
    { token: 'operator', foreground: 'ff7b72' },
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editorLineNumber.foreground': '#484f58',
    'editorLineNumber.activeForeground': '#8b949e',
    'editor.selectionBackground': '#264f78',
    'editor.lineHighlightBackground': '#161b22',
    'editorCursor.foreground': '#58a6ff',
    'editorWhitespace.foreground': '#30363d',
    'editorIndentGuide.background': '#21262d',
    'editorIndentGuide.activeBackground': '#30363d',
    'editor.findMatchBackground': '#9e6a0340',
    'editor.findMatchHighlightBackground': '#9e6a0320',
    'scrollbarSlider.background': '#30363d80',
    'scrollbarSlider.hoverBackground': '#484f5880',
    'scrollbarSlider.activeBackground': '#8b949e80',
  },
};

const FORGE_LIGHT_THEME = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'cf222e' },
    { token: 'string', foreground: '0a3069' },
    { token: 'number', foreground: '0550ae' },
    { token: 'type', foreground: '953800' },
    { token: 'function', foreground: '8250df' },
    { token: 'variable', foreground: '24292f' },
    { token: 'operator', foreground: 'cf222e' },
  ],
  colors: {
    'editor.background': '#f8fafc',
    'editor.foreground': '#24292f',
    'editorLineNumber.foreground': '#8c959f',
    'editorLineNumber.activeForeground': '#57606a',
    'editor.selectionBackground': '#add6ff',
    'editor.lineHighlightBackground': '#f0f3f6',
    'editorCursor.foreground': '#2563eb',
    'editorWhitespace.foreground': '#d0d7de',
    'editorIndentGuide.background': '#e8ebef',
    'editorIndentGuide.activeBackground': '#d0d7de',
    'editor.findMatchBackground': '#ffd33d40',
    'editor.findMatchHighlightBackground': '#ffd33d20',
    'scrollbarSlider.background': '#d0d7de80',
    'scrollbarSlider.hoverBackground': '#8c959f80',
    'scrollbarSlider.activeBackground': '#57606a80',
  },
};

function getCurrentMonacoTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'forge-light'
    : 'forge-dark';
}

function getStoredFontSize() {
  const raw = localStorage.getItem('forge-font-size');
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 12 && n <= 20 ? n : 14;
}

export default function CodeEditor({ language = 'python', value, onChange, onRun }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [fontSize, setFontSize] = useState(getStoredFontSize);

  // Listen for live font-size changes from SettingsPage
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.fontSize) {
        const n = Number(e.detail.fontSize);
        setFontSize(n);
        editorRef.current?.updateOptions({ fontSize: n });
      }
    };
    window.addEventListener('forge-settings', handler);
    return () => window.removeEventListener('forge-settings', handler);
  }, []);

  // Switch Monaco theme when the app theme changes
  useEffect(() => {
    const handler = () => {
      monacoRef.current?.editor.setTheme(getCurrentMonacoTheme());
    };
    window.addEventListener('forge-theme-changed', handler);
    return () => window.removeEventListener('forge-theme-changed', handler);
  }, []);

  const handleBeforeMount = useCallback((monaco) => {
    monacoRef.current = monaco;
    monaco.editor.defineTheme('forge-dark', FORGE_DARK_THEME);
    monaco.editor.defineTheme('forge-light', FORGE_LIGHT_THEME);
  }, []);

  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Apply correct theme for current app theme
      monaco.editor.setTheme(getCurrentMonacoTheme());

      // Apply stored font size
      editor.updateOptions({ fontSize: getStoredFontSize() });

      // Cmd+Enter / Ctrl+Enter → run
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          onRun?.();
        }
      );

      editor.focus();
    },
    [onRun]
  );

  const monacoLanguage = language === 'julia' ? 'julia' : 'python';

  return (
    <MonacoEditor
      height="100%"
      language={monacoLanguage}
      value={value}
      onChange={onChange}
      theme={getCurrentMonacoTheme()}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize,
        lineHeight: 22,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'off',
        folding: true,
        renderLineHighlight: 'line',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        renderWhitespace: 'none',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
        suggest: {
          showWords: false,
        },
      }}
    />
  );
}
