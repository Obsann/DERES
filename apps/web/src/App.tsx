import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ConnectionPage } from '@/pages/emergency/ConnectionPage';
import { HomePage } from '@/pages/emergency/HomePage';
import { LanguagePage } from '@/pages/emergency/LanguagePage';
import { SessionPage } from '@/pages/emergency/SessionPage';
import { SummaryPage } from '@/pages/emergency/SummaryPage';
import { TimelinePage } from '@/pages/emergency/TimelinePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ResponderIncidentPage } from '@/pages/responder/ResponderIncidentPage';
import { ResponderListPage } from '@/pages/responder/ResponderListPage';
import { routes } from '@/routes/paths';

/**
 * Application routes for Task 18.
 * Emergency user flow + responder dashboard placeholders (task.md Phase 11).
 */
export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.emergency.language} element={<LanguagePage />} />
          <Route path={routes.emergency.session} element={<SessionPage />} />
          <Route path={routes.emergency.timeline} element={<TimelinePage />} />
          <Route path={routes.emergency.summary} element={<SummaryPage />} />
          <Route path={routes.emergency.connection} element={<ConnectionPage />} />
          <Route path={routes.responder.list} element={<ResponderListPage />} />
          <Route path={routes.responder.incident} element={<ResponderIncidentPage />} />
          <Route path="/responder/incidents" element={<Navigate to={routes.responder.list} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
