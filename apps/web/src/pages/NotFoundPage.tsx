import { PlaceholderPage } from '@/components/PlaceholderPage';

/** Catch-all for unknown paths. */
export function NotFoundPage() {
  return (
    <PlaceholderPage
      title="Page not found"
      purpose="This route is not part of the emergency or responder flows."
      task="Task 18 · Frontend scaffold"
    />
  );
}
