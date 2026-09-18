import { Router } from 'express';
import type { HealthResponse } from '@voicesos/shared';
import { getDatabaseHealth } from '../database/connection.js';
import { config } from './config.js';
import { sendSuccess } from './http.js';

export const healthRouter: Router = Router();

/**
 * `GET /api/health`
 *
 * Used by the deployment platform and by the team to confirm the API is up.
 * Never requires authentication and never touches emergency data.
 */
healthRouter.get('/health', async (_req, res) => {
  const dependencies: HealthResponse['dependencies'] = {
    database: await getDatabaseHealth(),
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
