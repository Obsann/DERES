import { logger } from './logger.js';

/**
 * One timed call to an external provider. Logs duration and outcome, never
 * the request body: transcripts and prompts are emergency data.
 */
export function observeProviderCall(input: {
  provider: string;
  operation: string;
  startedAt: number;
  ok: boolean;
  status?: number;
  failure?: string;
}): void {
  logger.info('provider call', {
    provider: input.provider,
    operation: input.operation,
    durationMs: Date.now() - input.startedAt,
    ok: input.ok,
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.failure ? { failure: input.failure } : {}),
  });
}
