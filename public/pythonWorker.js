/* =========================================================
   Forge — Python Web Worker (Classic Worker, Pyodide v0.27)
   Runs in a separate thread; uses importScripts for Pyodide.
   ========================================================= */

/* globals importScripts, loadPyodide */

let pyodide = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clean up a Python/Pyodide traceback for display in the output panel.
 * Keeps the traceback structure but strips Pyodide-internal frame noise.
 */
function cleanPythonError(raw) {
  if (!raw) return 'Unknown error';
  const lines = raw.split('\n');
  const cleaned = lines.filter((line) => {
    // Remove pyodide-internal JS frames that leak into the message
    if (line.includes('at ') && line.includes('pyodide')) return false;
    if (line.trim() === '') return false;
    return true;
  });
  return cleaned.join('\n') || raw;
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.onmessage = async (e) => {
  const { type, code, id, packages } = e.data;

  // ── INIT ──────────────────────────────────────────────────────────────────
  if (type === 'init') {
    try {
      self.postMessage({ type: 'status', message: 'Loading Pyodide runtime…' });
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js');
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      });
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'initError', message: String(err) });
    }
    return;
  }

  // ── LOAD PACKAGES ─────────────────────────────────────────────────────────
  if (type === 'loadPackages') {
    for (const pkg of packages) {
      try {
        self.postMessage({ type: 'loadingPackage', name: pkg });
        await pyodide.loadPackage(pkg);
        self.postMessage({ type: 'packageLoaded', name: pkg });
      } catch (err) {
        // Non-fatal: warn but continue so remaining packages still load
        self.postMessage({ type: 'packageLoadWarning', name: pkg, error: String(err) });
      }
    }
    self.postMessage({ type: 'packagesLoaded', packages });
    return;
  }

  // ── EXECUTE ───────────────────────────────────────────────────────────────
  if (type === 'execute') {
    if (!pyodide) {
      self.postMessage({ type: 'error', message: 'Pyodide not initialized', id });
      return;
    }

    // Wire stdout / stderr for this execution
    pyodide.setStdout({
      batched: (text) => self.postMessage({ type: 'stdout', text, id }),
    });
    pyodide.setStderr({
      batched: (text) => self.postMessage({ type: 'stderr', text, id }),
    });

    try {
      // ── matplotlib pre-injection ──────────────────────────────────────────
      const usesMpl = code.includes('matplotlib') || code.includes('plt.');
      if (usesMpl) {
        const preCode = `
import sys as _sys
import matplotlib as _mpl
_mpl.use('AGG')
import matplotlib.pyplot as plt
import io as _io
import base64 as _b64
_forge_figures = []
def _forge_show(*args, **kwargs):
    for _fn in plt.get_fignums():
        _fig = plt.figure(_fn)
        _buf = _io.BytesIO()
        _fig.savefig(_buf, format='png', dpi=100, bbox_inches='tight',
                     facecolor='#0d1117', edgecolor='none')
        _buf.seek(0)
        _forge_figures.append(_b64.b64encode(_buf.read()).decode())
        _buf.close()
    plt.close('all')
plt.show = _forge_show
`;
        await pyodide.runPythonAsync(preCode);
      }

      // ── Run user code ─────────────────────────────────────────────────────
      const t0 = performance.now();
      const result = await pyodide.runPythonAsync(code);
      const elapsed = performance.now() - t0;

      // ── Capture any figures not yet shown ─────────────────────────────────
      if (usesMpl) {
        await pyodide.runPythonAsync(`
import matplotlib.pyplot as _plt_check
if _plt_check.get_fignums():
    _forge_show()
`);
        const figJson = await pyodide.runPythonAsync(
          `import json; json.dumps(_forge_figures) if '_forge_figures' in dir() and _forge_figures else '[]'`
        );
        const figures = JSON.parse(figJson);
        if (figures.length > 0) {
          self.postMessage({ type: 'figures', images: figures, id });
        }
      }

      // ── Return value (only if not None/undefined) ─────────────────────────
      if (result !== undefined && result !== null) {
        // Convert Python proxy objects to a useful string representation
        const display =
          typeof result.toJs === 'function'
            ? String(result.toJs())
            : String(result);
        self.postMessage({ type: 'result', value: display, id, time: elapsed });
      }

      self.postMessage({ type: 'complete', id, time: elapsed });
    } catch (err) {
      const cleaned = cleanPythonError(err.message || String(err));
      self.postMessage({ type: 'error', message: cleaned, id });
    }
    return;
  }
};
