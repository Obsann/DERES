import { ApiErrorCode, AsyncStatus, ConnectionStatus } from '@voicesos/shared';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ApiErrorState, ApiLoadingState } from '@/components/ApiState';
import { toAsyncStatus, useConnectionStatus, useHealthQuery } from '@/hooks';
import { ApiClientError } from '@/services/api';

/**
 * Demonstrates Task 19 loading / error / connection handling against `/api/health`.
 * Final emergency copy comes from Samuel + Task 26.
 */
export function ConnectionPage() {
  const connection = useConnectionStatus({ probeApi: true });
  const health = useHealthQuery(connection.browserOnline);
  const asyncStatus = toAsyncStatus(health);

  const disconnectedError = new ApiClientError({
    status: 0,
    code: ApiErrorCode.UPSTREAM_UNAVAILABLE,
    message: 'No connection',
    causeKind: 'network',
  });

  return (
    <PlaceholderPage
      title="Connection"
      purpose="API loading, error, retry, and connection states (Task 19)."
      task="Task 19 · API client & error model"
    >
      <p style={{ marginTop: 0 }}>
        Browser: {connection.browserOnline ? 'online' : 'offline'} · Status:{' '}
        <code>{connection.status}</code>
      </p>

      {connection.status === ConnectionStatus.DISCONNECTED && !health.isError ? (
        <ApiErrorState
          error={disconnectedError}
          title="Disconnected"
          onRetry={() => {
            void connection.refresh();
            void health.refetch();
          }}
        />
      ) : null}

      {asyncStatus === AsyncStatus.LOADING ? (
        <ApiLoadingState label="Checking API…" />
      ) : null}

      {health.isError ? (
        <ApiErrorState
          error={health.error}
          title="API unavailable"
          onRetry={() => {
            void health.refetch();
          }}
        />
      ) : null}

      {health.isSuccess ? (
        <p style={{ marginBottom: 0 }}>
          API healthy · <code>{health.data.service}</code> ·{' '}
          <code>{health.data.status}</code>
        </p>
      ) : null}
    </PlaceholderPage>
  );
}
