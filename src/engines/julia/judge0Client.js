/* =========================================================
   WandboxClient — Julia execution via Wandbox API
   https://wandbox.org  (free, no auth required, synchronous)

   Note: we keep the filename judge0Client.js and export name
   Judge0Client for backwards-compat with executionManager imports.
   ========================================================= */

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const JULIA_COMPILER = 'julia-1.10.5';
const FETCH_TIMEOUT_MS = 60_000; // 60 s — Julia JIT can be slow

// ── Rate limit tracker (client-side guard, not Wandbox-mandated) ───────────

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_WARN_AT = 5;
const requestTimestamps = [];

function recordRequest() {
  const now = Date.now();
  while (requestTimestamps.length && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  requestTimestamps.push(now);
}

function isApproachingRateLimit() {
  const now = Date.now();
  return requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS).length >= RATE_LIMIT_WARN_AT;
}

// ── Fetch with AbortController timeout ────────────────────────────────────

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── WandboxClient (exported as Judge0Client for import compatibility) ───────

export class Judge0Client {
  constructor() {
    this._status = 'ready'; // 'ready' | 'executing'
  }

  getStatus() {
    return this._status;
  }

  /**
   * Execute Julia code via Wandbox.
   * Returns { stdout, stderr, time, memory, status, error, rateWarning }.
   * Never throws — errors are returned in the .error field.
   */
  async execute(code) {
    this._status = 'executing';

    const rateWarning = isApproachingRateLimit()
      ? "You're sending many requests. Consider slowing down to stay within Wandbox's fair-use limits."
      : null;

    const t0 = Date.now();

    try {
      recordRequest();

      const resp = await fetchWithTimeout(
        WANDBOX_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compiler: JULIA_COMPILER, code }),
        },
        FETCH_TIMEOUT_MS
      );

      if (!resp.ok) {
        throw new Error(`Wandbox returned HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const timeMs = Date.now() - t0;

      // Wandbox fields:
      //   program_output  → stdout
      //   program_error   → stderr / runtime errors
      //   compiler_error  → compilation errors
      //   status          → exit code as string ("0" = success)
      //   signal          → signal name if killed (e.g. "SIGKILL")
      const stdout = (data.program_output || '').trimEnd();
      const stderrParts = [data.program_error, data.compiler_error]
        .filter(Boolean)
        .join('\n')
        .trimEnd();

      // Killed by signal → likely TLE
      if (data.signal && data.signal !== '') {
        return {
          stdout,
          stderr: stderrParts,
          time: timeMs,
          memory: null,
          status: data.status,
          error: `Program killed by signal ${data.signal}. Check for infinite loops or excessive memory use.`,
          rateWarning,
        };
      }

      return {
        stdout,
        stderr: stderrParts,
        time: timeMs,
        memory: null, // Wandbox doesn't expose memory usage
        status: data.status,
        error: null,
        rateWarning,
      };
    } catch (err) {
      this._status = 'ready';
      return this._formatError(err, Date.now() - t0, rateWarning);
    } finally {
      this._status = 'ready';
    }
  }

  _formatError(err, elapsedMs, rateWarning) {
    const msg = err.message || String(err);
    const isAbort = err.name === 'AbortError' || msg.includes('aborted');
    const isNetwork = msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError');

    let error;
    if (isAbort) {
      error = "Execution timed out (60 s). Julia's JIT compiler can be slow — try shorter code, or check for infinite loops.";
    } else if (isNetwork) {
      error = 'Network error: could not reach Wandbox. Check your internet connection and try again.';
    } else {
      error = `Wandbox error: ${msg}`;
    }

    return { stdout: '', stderr: '', time: elapsedMs, memory: null, status: null, error, rateWarning };
  }
}
