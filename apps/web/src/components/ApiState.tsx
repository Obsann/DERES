import type { ReactNode } from 'react';
import { toUiErrorMessage, isApiClientError } from '@/services/api';

interface ApiErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

/**
 * Controlled error surface for API failures.
 *
 * Task 19 verify: backend errors appear as UI state, not uncaught exceptions.
 */
export function ApiErrorState({
  error,
  title = 'Could not load',
  onRetry,
  children,
}: ApiErrorStateProps) {
  const message = toUiErrorMessage(error);
  const requestId = isApiClientError(error) ? error.requestId : null;

  return (
    <div
      role="alert"
      style={{
        padding: '1rem',
        border: '1px solid rgba(120, 30, 30, 0.25)',
        background: 'rgba(120, 30, 30, 0.06)',
        borderRadius: '0.5rem',
      }}
    >
      <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{title}</strong>
      <p style={{ margin: '0 0 0.75rem' }}>{message}</p>
      {requestId ? (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', opacity: 0.7 }}>
          Ref: <code>{requestId}</code>
        </p>
      ) : null}
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
      {children}
    </div>
  );
}

export function ApiLoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <p role="status" aria-live="polite" style={{ margin: 0, opacity: 0.75 }}>
      {label}
    </p>
  );
}
