import { Link } from 'react-router-dom';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { responderIncidentPath } from '@/routes/paths';

/** Responder incident list — task.md Phase 11. Implemented in Task 23. */
export function ResponderListPage() {
  return (
    <PlaceholderPage
      title="Responder dashboard"
      purpose="List of active incidents. Critical facts first — not the full conversation."
      task="Task 23 · Responder dashboard"
    >
      <Link to={responderIncidentPath('demo-incident')}>Open demo incident (placeholder)</Link>
    </PlaceholderPage>
  );
}
