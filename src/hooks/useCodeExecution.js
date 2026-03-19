import { useState, useEffect, useCallback, useRef } from 'react';
import { executionManager } from '../engines/executionManager.js';
import { useToast } from '../components/shared/Toast.jsx';

const EMPTY_OUTPUT = {
  stdout: '',
  stderr: '',
  figures: [],
  result: null,
  time: null,
  memory: null, // KB (Julia only, from Judge0)
  error: null,
};

/**
 * useCodeExecution(language)
 *
 * language-aware execution hook.
 *
 * Returns:
 *   execute(code, language)  – run code; Python streams, Julia posts batch
 *   output                   – { stdout, stderr, figures, result, time, memory, error }
 *   isRunning                – true while execution is in progress
 *   engineStatus             – 'loading' | 'ready' | 'executing' | 'error'
 *   loadingMessage           – human-readable progress string (Python only)
 *   clearOutput()            – reset output state
 */
export function useCodeExecution(language = 'python') {
  const [pythonStatus, setPythonStatus] = useState('loading');
  const [pythonLoadingMsg, setPythonLoadingMsg] = useState('Loading Python engine…');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(EMPTY_OUTPUT);
  const { addToast } = useToast();

  // Derived status: Julia is always ready (cloud API, no warm-up needed)
  const engineStatus = isRunning
    ? 'executing'
    : language === 'julia'
    ? 'ready'
    : pythonStatus;

  const loadingMessage =
    language === 'julia' ? '☁️ Ready — executes via Judge0 CE' : pythonLoadingMsg;

  // Ref so streaming callbacks always see the latest setter
  const setOutputRef = useRef(setOutput);
  setOutputRef.current = setOutput;

  // ── Initialise Python engine on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    executionManager.init((progress) => {
      if (cancelled) return;
      setPythonLoadingMsg(progress.message);
      if (progress.phase === 'done') setPythonStatus('ready');
    });

    // Belt-and-suspenders poll in case the progress callback misfires
    const poll = setInterval(() => {
      if (cancelled) return;
      const s = executionManager.getStatus('python');
      if (s === 'ready') { setPythonStatus('ready'); clearInterval(poll); }
      else if (s === 'error') { setPythonStatus('error'); clearInterval(poll); }
    }, 500);

    executionManager.pythonRunner.readyPromise
      ?.then(() => { if (!cancelled) setPythonStatus('ready'); })
      .catch(() => { if (!cancelled) setPythonStatus('error'); });

    return () => { cancelled = true; clearInterval(poll); };
  }, []);

  // ── Execute ──────────────────────────────────────────────────────────────

  const execute = useCallback(async (code, lang) => {
    setIsRunning(true);
    setOutputRef.current(EMPTY_OUTPUT);

    try {
      const execResult = await executionManager.execute(lang, code, {
        onStdout: (text) => {
          setOutputRef.current((prev) => ({
            ...prev,
            stdout: prev.stdout ? prev.stdout + '\n' + text : text,
          }));
        },
        onStderr: (text) => {
          setOutputRef.current((prev) => ({
            ...prev,
            stderr: prev.stderr ? prev.stderr + '\n' + text : text,
          }));
        },
        onFigures: (images) => {
          setOutputRef.current((prev) => ({ ...prev, figures: images }));
        },
        onRateWarning: (msg) => {
          addToast({ type: 'warning', message: msg, duration: 8000 });
        },
      });

      setOutputRef.current((prev) => ({
        ...prev,
        result: execResult.result,
        time: execResult.time,
        memory: execResult.memory ?? null,
      }));
    } catch (err) {
      const msg = err.message || String(err);
      setOutputRef.current((prev) => ({ ...prev, error: msg }));

      // Toast for rate-limit errors so users notice even if output is off-screen
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('rate-limit')) {
        addToast({ type: 'warning', message: msg, duration: 10000 });
      }
    } finally {
      setIsRunning(false);
    }
  }, [addToast]);

  // ── Clear ────────────────────────────────────────────────────────────────

  const clearOutput = useCallback(() => setOutput(EMPTY_OUTPUT), []);

  return { execute, output, isRunning, engineStatus, loadingMessage, clearOutput };
}
