/* =========================================================
   Judge0Client — Julia execution via Judge0 CE public API
   Endpoint: https://ce.judge0.com  (no API key required)
   ========================================================= */

const BASE_URL = 'https://ce.judge0.com';
const JULIA_LANGUAGE_ID = 93;
const POLL_INTERVAL_MS = 1500; // Julia JIT is slow; poll every 1.5s
const MAX_POLLS = 30;          // 45 seconds max polling time
const RETRY_DELAY_MS = 3000;

// Judge0 CE status IDs
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
  // 7-12: various runtime errors
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Encode code to base64, handling Unicode correctly */
function encodeCode(code) {
  return btoa(unescape(encodeURIComponent(code)));
}

/** Decode base64 Judge0 field, handling Unicode */
function decode(b64) {
  if (!b64) return '';
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    try { return atob(b64); } catch { return ''; }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Rate limit tracker ─────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const requestTimestamps = [];

function recordRequest() {
  const now = Date.now();
  // Prune entries older than the window
  while (requestTimestamps.length && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  requestTimestamps.push(now);
}

function isApproachingRateLimit() {
  const now = Date.now();
  const recent = requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  return recent.length >= RATE_LIMIT_MAX;
}

// ── Judge0Client ───────────────────────────────────────────────────────────

export class Judge0Client {
  constructor() {
    this.baseUrl = BASE_URL;
    this.juliaLanguageId = JULIA_LANGUAGE_ID;
    this._status = 'ready'; // 'ready' | 'executing' | 'error'
  }

  getStatus() {
    return this._status;
  }

  /**
   * Submit code and poll for results.
   * Returns { stdout, stderr, time, memory, status, error }.
   * Never throws — errors are returned in the .error field.
   */
  async execute(code) {
    this._status = 'executing';

    // Warn (but don't block) if approaching rate limit
    const rateWarning = isApproachingRateLimit()
      ? "You're sending many requests. Judge0's free API has rate limits — slow down a bit."
      : null;

    try {
      recordRequest();
      const token = await this._submit(code);
      const result = await this._pollResult(token);
      this._status = 'ready';
      return { ...result, rateWarning };
    } catch (err) {
      this._status = 'ready';
      return this._formatError(err, rateWarning);
    }
  }

  // ── Private: submit ──────────────────────────────────────────────────────

  async _submit(code) {
    const body = JSON.stringify({
      source_code: encodeCode(code),
      language_id: this.juliaLanguageId,
      cpu_time_limit: 15,
      wall_time_limit: 30,
      memory_limit: 256000,
      stdin: '',
    });

    let response = await this._fetchWithRetry(
      `${this.baseUrl}/submissions?base64_encoded=true&wait=false`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
    );

    const data = await response.json();
    if (!data.token) throw new Error('No token returned from Judge0');
    return data.token;
  }

  // ── Private: poll ────────────────────────────────────────────────────────

  async _pollResult(token) {
    const url =
      `${this.baseUrl}/submissions/${token}` +
      `?base64_encoded=true&fields=stdout,stderr,status,time,memory,compile_output,message`;

    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS);
      const resp = await fetch(url);

      if (!resp.ok) {
        throw new Error(`Poll failed: HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const statusId = data.status?.id ?? 0;

      // Still running — keep polling
      if (statusId <= STATUS.PROCESSING) continue;

      // Done — decode and return
      const stdout = decode(data.stdout);
      const stderrRaw = decode(data.stderr);
      const compileOut = decode(data.compile_output);
      const message = decode(data.message);

      // Combine stderr sources
      const stderr = [stderrRaw, compileOut, message]
        .filter(Boolean)
        .join('\n')
        .trimEnd();

      // Execution time: Judge0 returns seconds as a string → convert to ms
      const timeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : null;

      // Memory: Judge0 returns KB
      const memoryKb = data.memory ?? null;

      // Non-accepted statuses map to user-friendly error messages
      let error = null;
      if (statusId === STATUS.TIME_LIMIT) {
        error = `Time Limit Exceeded (wall time > 30s)\nJulia's JIT compiler can be slow on first run — try simpler code or shorter loops.`;
      } else if (statusId === STATUS.INTERNAL_ERROR) {
        error = `Judge0 internal error. The public API may be temporarily overloaded — try again in a moment.`;
      } else if (statusId === STATUS.EXEC_FORMAT_ERROR) {
        error = `Execution format error. Please report this.`;
      }

      return { stdout: stdout.trimEnd(), stderr, time: timeMs, memory: memoryKb, status: data.status, error };
    }

    throw new Error(
      "Execution timed out waiting for Judge0 (45s). Julia's JIT compiler can be slow on first run — try simpler code."
    );
  }

  // ── Private: fetch with one retry on 429 / 5xx ───────────────────────────

  async _fetchWithRetry(url, options) {
    let resp = await fetch(url, options);

    if (resp.status === 429 || resp.status >= 500) {
      await sleep(RETRY_DELAY_MS);
      recordRequest();
      resp = await fetch(url, options);
    }

    if (resp.status === 429) {
      throw new Error(
        'Judge0 is rate-limiting requests. The free API allows limited calls per minute — please wait a moment and try again.'
      );
    }
    if (!resp.ok) {
      throw new Error(`Judge0 submission failed: HTTP ${resp.status}`);
    }

    return resp;
  }

  // ── Private: error formatting ─────────────────────────────────────────────

  _formatError(err, rateWarning) {
    const msg = err.message || String(err);
    const isNetwork = msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError');
    const isTimeout = msg.includes('timed out');
    const isRateLimit = msg.includes('rate-limit') || msg.includes('rate limit') || msg.includes('429');

    let error;
    if (isRateLimit) {
      error = 'Judge0 is temporarily unavailable due to rate limiting. The public API has request limits — please wait a moment and try again.';
    } else if (isTimeout) {
      error = msg;
    } else if (isNetwork) {
      error = 'Network error: could not reach Judge0. Check your internet connection and try again.';
    } else {
      error = `Judge0 error: ${msg}`;
    }

    return { stdout: '', stderr: '', time: null, memory: null, status: null, error, rateWarning };
  }
}
