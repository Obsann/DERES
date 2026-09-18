import { QueryClient } from '@tanstack/react-query';
import { ApiErrorCode } from '@voicesos/shared';
import { isApiClientError } from './client';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (!isApiClientError(error)) return failureCount < 1;
  if (error.causeKind === 'aborted') return false;
  if (
    error.code === ApiErrorCode.UNAUTHORIZED ||
    error.code === ApiErrorCode.FORBIDDEN ||
    error.code === ApiErrorCode.NOT_FOUND ||
    error.code === ApiErrorCode.VALIDATION_ERROR
  ) {
    return false;
  }
  return error.isRetryable;
}

/** Shared QueryClient — loading / error / retry live here for Task 19. */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: shouldRetry,
      },
    },
  });
}
