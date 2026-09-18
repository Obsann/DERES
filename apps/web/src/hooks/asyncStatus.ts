import { AsyncStatus } from '@voicesos/shared';

/** Map TanStack query flags onto the shared AsyncStatus contract. */
export function toAsyncStatus(input: {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  fetchStatus?: 'fetching' | 'paused' | 'idle';
}): AsyncStatus {
  if (input.isPending || input.fetchStatus === 'fetching') return AsyncStatus.LOADING;
  if (input.isError) return AsyncStatus.ERROR;
  if (input.isSuccess) return AsyncStatus.SUCCESS;
  return AsyncStatus.IDLE;
}
