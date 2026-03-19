import { useEffect, useRef, useCallback } from 'react';
import { saveCodeSnapshot, getCodeSnapshot } from '../storage/db.js';

const AUTOSAVE_DELAY = 30_000; // 30 seconds

/**
 * Auto-saving code snapshot hook.
 *
 * @param {string | null} lessonId  - null disables persistence (sandbox mode)
 * @param {string} language
 * @param {string} code             - current editor content (live)
 * @returns {{ saveNow: () => void }}
 */
export function useCodeSnapshots(lessonId, language, code) {
  const timerRef    = useRef(null);
  const latestCode  = useRef(code);
  latestCode.current = code;

  const saveNow = useCallback(async () => {
    if (!lessonId) return;
    const id = `${lessonId}:${language}`;
    await saveCodeSnapshot({
      id,
      lessonId,
      language,
      code: latestCode.current,
      savedAt: Date.now(),
    });
  }, [lessonId, language]);

  // Debounced auto-save on every code change
  useEffect(() => {
    if (!lessonId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveNow, AUTOSAVE_DELAY);
    return () => clearTimeout(timerRef.current);
  }, [code, lessonId, saveNow]);

  // Also save on Cmd/Ctrl+S globally
  useEffect(() => {
    if (!lessonId) return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lessonId, saveNow]);

  return { saveNow };
}

/**
 * Load the last saved snapshot for a lesson, if any.
 *
 * @param {string} lessonId
 * @param {string} language
 * @returns {Promise<string | null>}
 */
export async function loadSnapshot(lessonId, language) {
  const id = `${lessonId}:${language}`;
  const snap = await getCodeSnapshot(id);
  return snap?.code ?? null;
}
