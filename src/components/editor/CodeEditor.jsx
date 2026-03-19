import { useRef, useCallback, useEffect, useState } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';

// Configure Monaco to load from CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
});

const FORGE_THEME = {
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

  const handleBeforeMount = useCallback((monaco) => {
    monacoRef.current = monaco;
    monaco.editor.defineTheme('forge-dark', FORGE_THEME);
  }, []);

  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

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
      theme="forge-dark"
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
