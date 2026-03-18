import { useParams } from 'react-router-dom';

export default function LessonPage() {
  const { track, lessonId } = useParams();
  return (
    <div style={{ padding: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 8 }}>
        Lesson: {lessonId}
      </h2>
      <p>Track: {track}</p>
      <p>Lesson content coming in Phase 3.</p>
    </div>
  );
}
