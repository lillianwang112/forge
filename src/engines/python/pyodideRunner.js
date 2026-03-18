/* =========================================================
   PyodideRunner — manages the Pyodide Web Worker lifecycle
   ========================================================= */

const PRELOAD_PACKAGES = ['numpy', 'pandas', 'scipy', 'scikit-learn', 'matplotlib'];
const EXEC_TIMEOUT_MS = 60_000;

export class PyodideRunner {
  constructor() {
    this.worker = null;
    this._status = 'loading'; // 'loading' | 'ready' | 'executing' | 'error'
    this.readyPromise = null;
    // Map<id, { resolve, reject, onStdout, onStderr, onFigures, timeoutId }>
    this._callbacks = new Map();
    // Pending resolve for the readyPromise
    this._readyResolve = null;
    this._readyReject = null;
    // Loading progress callbacks
    this._onLoadingProgress = null;
  }

  // ── Status ────────────────────────────────────────────────────────────────

  getStatus() {
    return this._status;
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  /**
   * Initialise the worker and pre-load scientific packages.
   * Returns a promise that resolves when the engine is ready.
   * Subsequent calls return the same promise (idempotent).
   */
  init(onLoadingProgress) {
    if (this.readyPromise) return this.readyPromise;
    if (onLoadingProgress) this._onLoadingProgress = onLoadingProgress;

    this.readyPromise = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;

      // Worker lives in public/ so Vite serves it verbatim (importScripts works)
      this.worker = new Worker(import.meta.env.BASE_URL + 'pythonWorker.js');

      this.worker.onmessage = (e) => this._handleMessage(e.data);
      this.worker.onerror = (err) => {
        this._status = 'error';
        reject(new Error(`Worker error: ${err.message}`));
      };

      this.worker.postMessage({ type: 'init' });
    });

    return this.readyPromise;
  }

  // ── Message routing ───────────────────────────────────────────────────────

  _handleMessage(msg) {
    switch (msg.type) {
      // ── Init lifecycle ──────────────────────────────────────────────────
      case 'status':
        this._onLoadingProgress?.({ phase: 'runtime', message: msg.message });
        break;

      case 'ready':
        // Runtime loaded — now pre-load packages
        this._onLoadingProgress?.({ phase: 'packages', message: 'Loading packages…' });
        this.worker.postMessage({ type: 'loadPackages', packages: PRELOAD_PACKAGES });
        break;

      case 'loadingPackage':
        this._onLoadingProgress?.({ phase: 'packages', message: `Loading ${msg.name}…` });
        break;

      case 'packageLoaded':
        this._onLoadingProgress?.({ phase: 'packages', message: `Loaded ${msg.name}` });
        break;

      case 'packageLoadWarning':
        console.warn(`[Forge] Package load warning (${msg.name}):`, msg.error);
        break;

      case 'packagesLoaded':
        this._status = 'ready';
        this._readyResolve?.();
        this._onLoadingProgress?.({ phase: 'done', message: 'Engine ready' });
        break;

      case 'initError':
        this._status = 'error';
        this._readyReject?.(new Error(msg.message));
        break;

      // ── Execution streaming ─────────────────────────────────────────────
      case 'stdout': {
        const cb = this._callbacks.get(msg.id);
        cb?.onStdout?.(msg.text);
        break;
      }

      case 'stderr': {
        const cb = this._callbacks.get(msg.id);
        cb?.onStderr?.(msg.text);
        break;
      }

      case 'figures': {
        const cb = this._callbacks.get(msg.id);
        cb?.onFigures?.(msg.images);
        break;
      }

      case 'result': {
        const cb = this._callbacks.get(msg.id);
        if (cb) cb._result = { value: msg.value, time: msg.time };
        break;
      }

      case 'complete': {
        const cb = this._callbacks.get(msg.id);
        if (cb) {
          clearTimeout(cb.timeoutId);
          this._callbacks.delete(msg.id);
          this._status = 'ready';
          cb.resolve({ time: msg.time, result: cb._result?.value ?? null });
        }
        break;
      }

      case 'error': {
        const cb = this._callbacks.get(msg.id);
        if (cb) {
          clearTimeout(cb.timeoutId);
          this._callbacks.delete(msg.id);
          this._status = 'ready';
          cb.reject(new Error(msg.message));
        }
        break;
      }

      default:
        break;
    }
  }

  // ── Execute ───────────────────────────────────────────────────────────────

  /**
   * Execute Python code.
   * @param {string} code - Python source code
   * @param {{ onStdout?, onStderr?, onFigures? }} callbacks - streaming hooks
   * @returns {Promise<{ time: number, result: string|null }>}
   */
  async execute(code, { onStdout, onStderr, onFigures } = {}) {
    await this.readyPromise;

    const id = crypto.randomUUID();
    this._status = 'executing';

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this._callbacks.delete(id);
        this._status = 'ready';
        reject(new Error('Execution timed out after 60 seconds'));
      }, EXEC_TIMEOUT_MS);

      this._callbacks.set(id, {
        resolve,
        reject,
        onStdout,
        onStderr,
        onFigures,
        timeoutId,
        _result: null,
      });

      this.worker.postMessage({ type: 'execute', code, id });
    });
  }

  // ── Teardown ──────────────────────────────────────────────────────────────

  terminate() {
    this.worker?.terminate();
    this.worker = null;
    this._status = 'loading';
    this.readyPromise = null;
    this._callbacks.clear();
  }
}
