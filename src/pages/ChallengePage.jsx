import { useParams } from 'react-router-dom';

export default function ChallengePage() {
  const { id } = useParams();
  return (
    <div style={{ padding: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 8 }}>
        Challenge: {id}
      </h2>
      <p>Challenge content coming in Phase 3.</p>
    </div>
  );
}
