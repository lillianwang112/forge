import { useState, useEffect, useCallback, useRef } from 'react';
import { executionManager } from '../engines/executionManager.js';

const EMPTY_OUTPUT = {
  stdout: '',
  stderr: '',
  figures: [],
  result: null,
  time: null,
  error: null,
};

/**
 * useCodeExecution
 *
 * Manages the Pyodide execution engine and exposes a clean API to
 * the editor UI.
 *
 * Returns:
 *   execute(code, language)  – run code; streaming output updates state live
 *   output                   – { stdout, stderr, figures, result, time, error }
 *   isRunning                – true while execution is in progress
 *   engineStatus             – 'loading' | 'ready' | 'executing' | 'error'
 *   loadingMessage           – human-readable loading progress string
 *   clearOutput()            – reset output state
 */
export function useCodeExecution() {
  const [output, setOutput] = useState(EMPTY_OUTPUT);
  const [isRunning, setIsRunning] = useState(false);
  const [engineStatus, setEngineStatus] = useState('loading');
  const [loadingMessage, setLoadingMessage] = useState('Loading Python engine…');

  // Keep a ref so streaming callbacks always have the latest setter
  // without needing to re-register them on every render.
  const setOutputRef = useRef(setOutput);
  setOutputRef.current = setOutput;

  // ── Initialise engine on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    executionManager.init((progress) => {
      if (cancelled) return;
      setLoadingMessage(progress.message);
      if (progress.phase === 'done') {
        setEngineStatus('ready');
      }
    });

    // Also poll in case progress callback isn't fired for some reason
    const poll = setInterval(() => {
      if (cancelled) return;
      const s = executionManager.getStatus('python');
      if (s === 'ready') {
        setEngineStatus('ready');
        clearInterval(poll);
      } else if (s === 'error') {
        setEngineStatus('error');
        clearInterval(poll);
      }
    }, 500);

    // Wait for the runner's own promise to settle
    executionManager.pythonRunner.readyPromise
      ?.then(() => {
        if (!cancelled) setEngineStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setEngineStatus('error');
      });

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, []);

  // ── Execute ──────────────────────────────────────────────────────────────

  const execute = useCallback(async (code, language) => {
    setIsRunning(true);
    setEngineStatus('executing');
    // Reset output before each run
    setOutputRef.current(EMPTY_OUTPUT);

    try {
      const execResult = await executionManager.execute(language, code, {
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
      });

      setOutputRef.current((prev) => ({
        ...prev,
        result: execResult.result,
        time: execResult.time,
      }));
      setEngineStatus('ready');
    } catch (err) {
      setOutputRef.current((prev) => ({ ...prev, error: err.message }));
      setEngineStatus('ready');
    } finally {
      setIsRunning(false);
    }
  }, []);

  // ── Clear ────────────────────────────────────────────────────────────────

  const clearOutput = useCallback(() => {
    setOutput(EMPTY_OUTPUT);
  }, []);

  return {
    execute,
    output,
    isRunning,
    engineStatus,
    loadingMessage,
    clearOutput,
  };
}
