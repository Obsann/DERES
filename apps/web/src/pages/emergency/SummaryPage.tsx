import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/components/PlaceholderPage';

/** Incident summary for the bystander view — Task 20 / handoff-adjacent. */
export function SummaryPage() {
  const { incidentId = 'unknown' } = useParams();

  return (
    <PlaceholderPage
      title="Incident summary"
      purpose="Short picture of what is known, what was done, and current status."
      task="Task 20 · Emergency interaction UI"
    >
      <p>
        Incident: <code>{incidentId}</code>
      </p>
    </PlaceholderPage>
  );
}
