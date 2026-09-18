import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/components/PlaceholderPage';

/**
 * Active incident for responders.
 * Surfaces: summary, known state, uncertainty, actions, timeline, handoff (Tasks 23–25).
 */
export function ResponderIncidentPage() {
  const { incidentId = 'unknown' } = useParams();

  return (
    <PlaceholderPage
      title="Active incident"
      purpose="Responder view of one emergency without replaying the entire conversation."
      task="Task 23 · Dashboard · Task 25 · Handoff presentation"
    >
      <p>
        Incident: <code>{incidentId}</code>
      </p>
      <ul style={{ margin: '1rem 0 0', paddingLeft: '1.25rem' }}>
        <li>Emergency summary</li>
        <li>Known state</li>
        <li>Missing / uncertain information</li>
        <li>Actions already performed</li>
        <li>Timeline</li>
        <li>Handoff</li>
      </ul>
    </PlaceholderPage>
  );
}
