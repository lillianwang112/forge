import { useState, useCallback, useRef } from 'react';
import { feedbackEngine } from '../ai/feedbackEngine.js';

/**
 * useAIFeedback
 *
 * Manages Puter.js streaming AI feedback for code review and hints.
 *
 * Returns:
 *   requestReview(code, language, context?)  – start streaming code review
 *   requestHint(challenge, level, code)      – start streaming hint
 *   feedback: string                         – accumulated streamed markdown
 *   isStreaming: boolean
 *   error: string | null
 *   clearFeedback()
 */
export function useAIFeedback() {
  const [feedback, setFeedback] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  // Track the current stream so we can bail out on cancellation
  const cancelledRef = useRef(false);

  // ── Internal stream consumer ─────────────────────────────────────────────

  const _consumeStream = useCallback(async (streamPromise) => {
    setIsStreaming(true);
    setFeedback('');
    setError(null);
    cancelledRef.current = false;

    try {
      const stream = await streamPromise;

      for await (const part of stream) {
        if (cancelledRef.current) break;

        // Puter.js streaming parts carry text in part.text
        // Guard against alternative shapes from different models
        const chunk =
          part?.text ??
          part?.choices?.[0]?.delta?.content ??
          '';

        if (chunk) {
          setFeedback((prev) => prev + chunk);
        }
      }
    } catch (err) {
      if (cancelledRef.current) return; // Ignore errors from deliberate cancellation

      const msg = err?.message || String(err);
      // Friendly messages for common Puter.js failure modes
      if (msg.includes('not logged in') || msg.includes('auth') || msg.includes('401')) {
        setError("Sign in to Puter.js to use AI features. Click the button to try again — Puter will prompt for sign-in.");
      } else if (msg.includes('rate') || msg.includes('429')) {
        setError("You've hit the AI rate limit. Wait a moment and try again.");
      } else if (msg.includes('model') || msg.includes('404')) {
        setError(`Model not available: ${msg}`);
      } else {
        setError(`Couldn't get AI feedback: ${msg}`);
      }
    } finally {
      if (!cancelledRef.current) setIsStreaming(false);
    }
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  const requestReview = useCallback(
    (code, language, context = null) => {
      _consumeStream(feedbackEngine.getCodeReview(code, language, context));
    },
    [_consumeStream]
  );

  const requestHint = useCallback(
    (challenge, level, code) => {
      _consumeStream(feedbackEngine.getHint(challenge, level, code));
    },
    [_consumeStream]
  );

  const clearFeedback = useCallback(() => {
    cancelledRef.current = true;
    setIsStreaming(false);
    setFeedback('');
    setError(null);
  }, []);

  return { requestReview, requestHint, feedback, isStreaming, error, clearFeedback };
}
