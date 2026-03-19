/**
 * SM-2 spaced repetition scheduler.
 *
 * Reference: P.A. Wozniak, "Algorithm SM-2", 1987
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

/**
 * @typedef {Object} CardState
 * @property {number} interval      - Days until next review
 * @property {number} easeFactor    - Ease multiplier (≥ 1.3)
 * @property {number} repetitions   - Consecutive successful reviews
 * @property {number} nextReview    - Unix timestamp of next review
 */

/**
 * Apply one SM-2 review cycle.
 *
 * @param {CardState} card
 * @param {number} quality - 0 (blackout) … 5 (perfect)
 * @returns {CardState}
 */
export function calculateNextReview(card, quality) {
  let { interval, easeFactor, repetitions } = card;

  if (quality < 3) {
    // Failed recall — reset to beginning
    interval    = 1;
    repetitions = 0;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: Date.now() + interval * 86_400_000,
  };
}

/**
 * Returns true if the card is due for review right now.
 *
 * @param {{ nextReview: number }} card
 * @returns {boolean}
 */
export function isDue(card) {
  return card.nextReview <= Date.now();
}

/**
 * Sort cards for a review session:
 * overdue first (longest overdue at front), then by shortest interval.
 *
 * @param {CardState[]} cards
 * @returns {CardState[]}
 */
export function sortByPriority(cards) {
  const now = Date.now();
  return [...cards].sort((a, b) => {
    const overdueA = now - a.nextReview;
    const overdueB = now - b.nextReview;
    if (overdueA !== overdueB) return overdueB - overdueA; // most overdue first
    return a.interval - b.interval; // then shortest interval
  });
}
