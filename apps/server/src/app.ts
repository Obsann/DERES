import express, { type Express, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './common/config.js';
import type { LlmProvider } from './ai/provider.js';
import { healthRouter } from './common/health.routes.js';
import { requestId } from './common/middleware/requestId.js';
import { requestLogger } from './common/middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './common/middleware/errorHandler.js';
import { createIncidentRouter } from './incidents/routes.js';

/**
 * Builds the Express application.
 *
 * Kept separate from `index.ts` so tests can exercise the app without binding
 * a port.
 */
export interface CreateAppOptions {
  llmProvider?: LlmProvider | null;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();

  // Behind Render/Vercel style proxies, so client IPs and protocol are correct.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );

  // Emergency payloads are transcripts, not uploads. A small cap limits abuse.
  app.use(express.json({ limit: '256kb' }));

  app.use(requestId);
  app.use(requestLogger);

  const api = Router();
  api.use(healthRouter);
  api.use(createIncidentRouter({ llmProvider: options.llmProvider }));
  // Feature routers still to mount:
  //   protocols  Task 5 public list    voice      Task 9
  //   handoff    Task 11               security   Task 12
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
