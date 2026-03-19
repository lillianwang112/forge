import { useState, useEffect, useCallback } from 'react';
import { saveProgress, getProgress, getAllProgress } from '../storage/db.js';
import { getTrack } from '../curriculum/index.js';

// ---- low-level helpers ----------------------------------------

function lessonKey(trackId, lessonId) {
  return `lesson:${trackId}:${lessonId}`;
}

function challengeKey(trackId, lessonId, challengeId) {
  return `challenge:${trackId}:${lessonId}:${challengeId}`;
}

// ---- hook ------------------------------------------------------

/**
 * Provides progress read/write for a specific track.
 *
 * @param {string} trackId
 */
export function useProgress(trackId) {
  const [progressMap, setProgressMap] = useState({}); // { id: progressRecord }
  const [loading, setLoading]         = useState(true);

  // Load all progress records for this track on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAllProgress(trackId).then((records) => {
      if (cancelled) return;
      const map = {};
      for (const r of records) map[r.id] = r;
      setProgressMap(map);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [trackId]);

  // ---- writers ------------------------------------------------

  const completeLesson = useCallback(async (lessonId) => {
    const id = lessonKey(trackId, lessonId);
    const record = { id, trackId, lessonId, type: 'lesson', completed: true, completedAt: Date.now() };
    await saveProgress(record);
    setProgressMap((prev) => ({ ...prev, [id]: record }));
  }, [trackId]);

  const completeChallenge = useCallback(async (lessonId, challengeId, testResults) => {
    const id = challengeKey(trackId, lessonId, challengeId);
    const allPassed = testResults.every((r) => r.passed);
    const record = {
      id, trackId, lessonId, challengeId,
      type: 'challenge',
      completed: allPassed,
      testResults,
      completedAt: Date.now(),
    };
    await saveProgress(record);
    setProgressMap((prev) => ({ ...prev, [id]: record }));
    return allPassed;
  }, [trackId]);

  // ---- readers ------------------------------------------------

  const isLessonComplete = useCallback((lessonId) => {
    return !!progressMap[lessonKey(trackId, lessonId)]?.completed;
  }, [progressMap, trackId]);

  const isChallengeComplete = useCallback((lessonId, challengeId) => {
    return !!progressMap[challengeKey(trackId, lessonId, challengeId)]?.completed;
  }, [progressMap, trackId]);

  const getTestResults = useCallback((lessonId, challengeId) => {
    return progressMap[challengeKey(trackId, lessonId, challengeId)]?.testResults ?? [];
  }, [progressMap, trackId]);

  const getTrackProgress = useCallback(() => {
    const track = getTrack(trackId);
    if (!track) return { completedLessons: 0, totalLessons: 0, completedChallenges: 0, totalChallenges: 0 };

    let totalLessons = track.lessons.length;
    let completedLessons = 0;
    let totalChallenges = 0;
    let completedChallenges = 0;

    for (const lesson of track.lessons) {
      if (isLessonComplete(lesson.id)) completedLessons++;
      for (const challenge of lesson.challenges) {
        totalChallenges++;
        if (isChallengeComplete(lesson.id, challenge.id)) completedChallenges++;
      }
    }

    return { completedLessons, totalLessons, completedChallenges, totalChallenges };
  }, [trackId, isLessonComplete, isChallengeComplete]);

  const getNextLesson = useCallback(() => {
    const track = getTrack(trackId);
    if (!track) return null;
    const sorted = [...track.lessons].sort((a, b) => a.order - b.order);
    for (const lesson of sorted) {
      if (!isLessonComplete(lesson.id)) return lesson.id;
    }
    return null; // all complete
  }, [trackId, isLessonComplete]);

  return {
    loading,
    completeLesson,
    completeChallenge,
    isLessonComplete,
    isChallengeComplete,
    getTestResults,
    getTrackProgress,
    getNextLesson,
  };
}

// ---- cross-track summary hook --------------------------------

/**
 * Returns aggregate progress across all tracks.
 */
export function useAllProgress() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllProgress().then((records) => {
      if (cancelled) return;
      // Group by trackId, count completed lessons
      const map = {};
      for (const r of records) {
        if (r.type !== 'lesson' || !r.completed) continue;
        map[r.trackId] = (map[r.trackId] || 0) + 1;
      }
      setSummary(map);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { summary, loading };
}
