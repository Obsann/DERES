import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/components/PlaceholderPage';

/** Incident timeline for the bystander view — Task 22. */
export function TimelinePage() {
  const { incidentId = 'unknown' } = useParams();

  return (
    <PlaceholderPage
      title="Incident timeline"
      purpose="Chronological conversation, answers, actions, state changes, and escalation."
      task="Task 22 · Incident timeline UI"
    >
      <p>
        Incident: <code>{incidentId}</code>
      </p>
    </PlaceholderPage>
  );
}
