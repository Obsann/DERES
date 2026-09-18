import { Link } from 'react-router-dom';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { routes } from '@/routes/paths';

/** Landing / emergency start — task.md Phase 11. Implemented in Task 20. */
export function HomePage() {
  return (
    <PlaceholderPage
      title="Start emergency"
      purpose="Large START action and entry into the voice-first bystander flow."
      task="Task 20 · Emergency interaction UI"
    >
      <Link to={routes.emergency.language}>Continue to language (placeholder)</Link>
    </PlaceholderPage>
  );
}
