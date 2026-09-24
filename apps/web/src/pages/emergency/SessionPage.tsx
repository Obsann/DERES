import { Link } from 'react-router-dom';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { emergencySummaryPath, emergencyTimelinePath, routes } from '@/routes/paths';

/**
 * Active emergency / voice interaction shell.
 * Covers voice session, current instruction, and action confirmation until Task 20 splits them.
 */
export function SessionPage() {
  const demoIncidentId = 'demo-incident';

  return (
    <PlaceholderPage
      title="Active emergency session"
      purpose="Voice-first interaction: listening, speaking, one instruction, confirmation."
      task="Task 20 · Emergency UI · Task 21 · Voice integration"
    >
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>Voice session state (listening / processing / speaking)</li>
        <li>Current instruction</li>
        <li>Action confirmation</li>
        <li>Repeat / clarification</li>
      </ul>
      <p style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to={emergencyTimelinePath(demoIncidentId)}>Timeline</Link>
        <Link to={emergencySummaryPath(demoIncidentId)}>Summary</Link>
        <Link to={routes.emergency.connection}>Connection / error</Link>
      </p>
    </PlaceholderPage>
  );
}
