import pythonTrack from './tracks/python-foundations.json';
import juliaTrack  from './tracks/julia-foundations.json';
import sharedTrack from './tracks/shared-engineering.json';

/** @type {import('./schema').Track[]} */
const TRACKS = [pythonTrack, juliaTrack, sharedTrack];

// Build flat lookup maps at module-load time for O(1) access
const TRACK_MAP     = new Map(TRACKS.map(t => [t.id, t]));
const LESSON_MAP    = new Map();
const CHALLENGE_MAP = new Map();

for (const track of TRACKS) {
  for (const lesson of track.lessons) {
    LESSON_MAP.set(`${track.id}:${lesson.id}`, lesson);
    for (const challenge of lesson.challenges) {
      CHALLENGE_MAP.set(challenge.id, { ...challenge, trackId: track.id, lessonId: lesson.id });
    }
  }
}

/** @returns {import('./schema').Track[]} */
export function getAllTracks() {
  return TRACKS;
}

/**
 * @param {string} trackId
 * @returns {import('./schema').Track | undefined}
 */
export function getTrack(trackId) {
  return TRACK_MAP.get(trackId);
}

/**
 * @param {string} trackId
 * @param {string} lessonId
 * @returns {import('./schema').Lesson | undefined}
 */
export function getLesson(trackId, lessonId) {
  return LESSON_MAP.get(`${trackId}:${lessonId}`);
}

/**
 * @param {string} challengeId
 * @returns {(import('./schema').Challenge & { trackId: string, lessonId: string }) | undefined}
 */
export function getChallenge(challengeId) {
  return CHALLENGE_MAP.get(challengeId);
}
