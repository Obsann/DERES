import { Router } from 'express';
import type { HealthResponse } from '@voicesos/shared';
import { config } from './config.js';
import { sendSuccess } from './http.js';

export const healthRouter: Router = Router();

/**
 * `GET /api/health`
 *
 * Used by the deployment platform and by the team to confirm the API is up.
 * Never requires authentication and never touches emergency data.
 *
 * `database` stays `unknown` until Task 2 wires up persistence and reports a
 * real connection state. It is reported rather than omitted so the gap is
 * visible instead of looking healthy.
 */
healthRouter.get('/health', (_req, res) => {
  const dependencies: HealthResponse['dependencies'] = {
    database: 'unknown',
  };

  const body: HealthResponse = {
    status: Object.values(dependencies).includes('down') ? 'degraded' : 'ok',
    service: config.serviceName,
    version: config.version,
    uptimeSeconds: Math.round(process.uptime()),
    dependencies,
    timestamp: new Date().toISOString(),
  };

  sendSuccess(res, body);
});
