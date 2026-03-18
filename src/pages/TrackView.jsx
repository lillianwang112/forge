import { useParams } from 'react-router-dom';

export default function TrackView() {
  const { track } = useParams();
  return (
    <div style={{ padding: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 8 }}>
        Track: {track}
      </h2>
      <p>Lesson list coming in Phase 3.</p>
    </div>
  );
}
