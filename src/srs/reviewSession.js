import { saveCardReview } from './conceptStore.js';
import { sortByPriority } from './scheduler.js';

/**
 * Manages a single SRS review session.
 *
 * Cards that are answered incorrectly (quality < 3) are re-inserted
 * at the end of the queue so they appear again in the same session.
 */
export class ReviewSession {
  /**
   * @param {Array} cards - Due cards (already sorted by priority)
   */
  constructor(cards) {
    this._queue    = [...cards];
    this._reviewed = 0;
    this._total    = cards.length;
    this._done     = false;
  }

  /** @returns {object | null} */
  getCurrentCard() {
    if (this._done || this._queue.length === 0) return null;
    return this._queue[0];
  }

  /**
   * Submit a quality rating for the current card, save to IndexedDB,
   * and advance the queue.
   *
   * @param {number} quality  0-5
   * @returns {Promise<object>} updated card state
   */
  async submitReview(quality) {
    const card = this.getCurrentCard();
    if (!card) throw new Error('No current card');

    const updated = await saveCardReview(card.conceptId, quality);

    // Remove from front of queue
    this._queue.shift();
    this._reviewed += 1;

    // Re-insert failed cards at the end (so user sees them again)
    if (quality < 3 && this._queue.length > 0) {
      this._queue.push({ ...card, nextReview: Date.now() });
    }

    if (this._queue.length === 0) {
      this._done = true;
    }

    return updated;
  }

  /** @returns {{ reviewed: number, remaining: number, total: number }} */
  getProgress() {
    return {
      reviewed:  this._reviewed,
      remaining: this._queue.length,
      total:     this._total,
    };
  }

  /** @returns {boolean} */
  isComplete() {
    return this._done || this._queue.length === 0;
  }
}
