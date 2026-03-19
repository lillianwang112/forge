import pythonConcepts from '../../content/concepts/python-concepts.json';
import juliaConcepts  from '../../content/concepts/julia-concepts.json';
import sharedConcepts from '../../content/concepts/shared-concepts.json';
import { saveSRSCard, getAllCards } from '../storage/db.js';
import { calculateNextReview, sortByPriority } from './scheduler.js';

/** All static concept definitions, indexed by conceptId */
const STATIC_CONCEPTS = new Map();
for (const c of [...pythonConcepts, ...juliaConcepts, ...sharedConcepts]) {
  STATIC_CONCEPTS.set(c.conceptId, c);
}

// ---- daily review log (stored in localStorage) ----------------

const LOG_KEY = 'forge-srs-daily-log';

function getDailyLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function recordReviewToday() {
  const today = new Date().toISOString().slice(0, 10);
  const log   = getDailyLog();
  log[today]  = (log[today] ?? 0) + 1;
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

export function getDailyReviewCounts(days = 7) {
  const log    = getDailyLog();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    result.push({ date: d, count: log[d] ?? 0 });
  }
  return result;
}

// ---- core API -------------------------------------------------

/**
 * Load all concept cards that have been unlocked (are in IndexedDB),
 * merged with their static definition.
 *
 * @returns {Promise<Array>}
 */
export async function loadAllCards() {
  const saved   = await getAllCards();
  const merged  = [];

  for (const srsState of saved) {
    const def = STATIC_CONCEPTS.get(srsState.conceptId);
    if (def) {
      merged.push({ ...def, ...srsState });
    }
  }
  return merged;
}

/**
 * Save a review result, updating the card's SM-2 state in IndexedDB.
 *
 * @param {string} conceptId
 * @param {number} quality  0-5
 * @returns {Promise<object>} updated card state
 */
export async function saveCardReview(conceptId, quality) {
  const all     = await getAllCards();
  const current = all.find((c) => c.conceptId === conceptId) ?? {
    conceptId,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: Date.now(),
  };

  const next = calculateNextReview(current, quality);
  const updated = { ...current, ...next, lastReview: Date.now() };
  await saveSRSCard(updated);
  recordReviewToday();
  return updated;
}

/**
 * Get all due cards (nextReview <= now), merged with static definitions.
 *
 * @returns {Promise<Array>}
 */
export async function getDueCards() {
  const all = await loadAllCards();
  const now = Date.now();
  const due = all.filter((c) => c.nextReview <= now);
  return sortByPriority(due);
}

/**
 * Unlock concept cards for a completed lesson, adding them to IndexedDB
 * with initial SRS state (due immediately).
 *
 * @param {string} lessonId
 * @returns {Promise<number>} count of newly added cards
 */
export async function unlockCardsForLesson(lessonId) {
  const existing = new Set((await getAllCards()).map((c) => c.conceptId));
  const toAdd    = [...STATIC_CONCEPTS.values()].filter(
    (c) => c.relatedLessons?.includes(lessonId) && !existing.has(c.conceptId)
  );

  for (const concept of toAdd) {
    await saveSRSCard({
      conceptId:   concept.conceptId,
      interval:    0,
      easeFactor:  2.5,
      repetitions: 0,
      nextReview:  Date.now(),
    });
  }
  return toAdd.length;
}

/**
 * Aggregate statistics across all unlocked cards.
 *
 * @returns {Promise<{ total: number, due: number, learned: number, new: number }>}
 */
export async function getStats() {
  const saved = await getAllCards();
  const now   = Date.now();

  const total   = saved.length;
  const due     = saved.filter((c) => c.nextReview <= now).length;
  const learned = saved.filter((c) => c.interval > 21).length;
  const newCards = STATIC_CONCEPTS.size - total; // locked cards = "new"

  return { total, due, learned, new: newCards };
}
