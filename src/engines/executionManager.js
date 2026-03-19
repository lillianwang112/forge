/* =========================================================
   ExecutionManager — unified runner for Python + Julia
   Python: Pyodide (in-browser Web Worker)
   Julia:  Judge0 CE (cloud API)
   ========================================================= */

import { PyodideRunner } from './python/pyodideRunner.js';
import { Judge0Client } from './julia/judge0Client.js';

export class ExecutionManager {
  constructor() {
    this.pythonRunner = new PyodideRunner();
    this.juliaRunner = new Judge0Client();
  }

  /**
   * Begin background initialisation of the Python engine.
   * Julia needs no warm-up (cloud API).
   */
  init(onLoadingProgress) {
    this.pythonRunner.init(onLoadingProgress);
  }

  /**
   * Execute code in the given language.
   *
   * Python: streaming via onStdout / onStderr callbacks (Pyodide)
   * Julia:  batch result posted once after polling completes (Judge0)
   *
   * @param {'python'|'julia'} language
   * @param {string} code
   * @param {{ onStdout?, onStderr?, onFigures?, onRateWarning? }} callbacks
   * @returns {Promise<{ time: number|null, memory: number|null, result: string|null }>}
   */
  async execute(language, code, callbacks = {}) {
    if (language === 'python') {
      const r = await this.pythonRunner.execute(code, callbacks);
      return { time: r.time, memory: null, result: r.result };
    }

    if (language === 'julia') {
      const r = await this.juliaRunner.execute(code);

      // Surface rate-limit warning through callback so the hook can toast it
      if (r.rateWarning) callbacks.onRateWarning?.(r.rateWarning);

      // Surface client-level errors (network, timeout, rate limit)
      if (r.error) throw new Error(r.error);

      // Deliver output as single-shot callbacks (no streaming for cloud API)
      const out = (r.stdout || '').trimEnd();
      const err = (r.stderr || '').trimEnd();
      if (out) callbacks.onStdout?.(out);
      if (err) callbacks.onStderr?.(err);

      return { time: r.time, memory: r.memory, result: null };
    }

    throw new Error(`Unknown language: ${language}`);
  }

  /**
   * Return the status of the runner for the given language.
   * @returns {'loading'|'ready'|'executing'|'error'}
   */
  getStatus(language = 'python') {
    if (language === 'python') return this.pythonRunner.getStatus();
    if (language === 'julia') return this.juliaRunner.getStatus();
    return 'ready';
  }
}

// Singleton — shared across all components
export const executionManager = new ExecutionManager();
