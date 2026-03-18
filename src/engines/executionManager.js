/* =========================================================
   ExecutionManager — unified runner for Python + Julia
   Julia uses Judge0 (Phase 3); Python uses Pyodide.
   ========================================================= */

import { PyodideRunner } from './python/pyodideRunner.js';

export class ExecutionManager {
  constructor() {
    this.pythonRunner = new PyodideRunner();
    this.juliaRunner = null; // Phase 3 — Judge0
  }

  /**
   * Begin background initialisation of the Python engine.
   * Call this early (e.g. on app mount) so Pyodide is warm by the time the
   * user clicks Run. Pass an optional progress callback.
   */
  init(onLoadingProgress) {
    // Non-blocking — let it load in the background
    this.pythonRunner.init(onLoadingProgress);
  }

  /**
   * Execute code in the given language.
   * @param {'python'|'julia'} language
   * @param {string} code
   * @param {{ onStdout?, onStderr?, onFigures? }} callbacks
   * @returns {Promise<{ time: number, result: string|null }>}
   */
  async execute(language, code, callbacks = {}) {
    if (language === 'python') {
      return this.pythonRunner.execute(code, callbacks);
    }
    if (language === 'julia') {
      throw new Error('Julia execution coming in Phase 3 (Judge0 API)');
    }
    throw new Error(`Unknown language: ${language}`);
  }

  /**
   * Return the status of the runner for a given language.
   * @returns {'loading'|'ready'|'executing'|'error'}
   */
  getStatus(language = 'python') {
    if (language === 'python') return this.pythonRunner.getStatus();
    return 'loading';
  }
}

// Singleton — shared across all components
export const executionManager = new ExecutionManager();
