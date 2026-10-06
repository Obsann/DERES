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
import { createProtocolRouter } from './protocols/routes.js';
import { attachPrincipal } from './security/middleware.js';
import { createAuthRouter } from './security/routes.js';
import { createResponderRouter } from './security/responder.routes.js';
import { createVoiceRouter } from './voice/routes.js';
import type { VoxideProvider } from './voice/provider.js';
import { createSpeechRouter } from './voice/speech.routes.js';

/**
 * Builds the Express application.
 *
 * Kept separate from `index.ts` so tests can exercise the app without binding
 * a port.
 */
export interface CreateAppOptions {
  llmProvider?: LlmProvider | null;
  voxideProvider?: VoxideProvider | null;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();

  // Behind Render/Vercel style proxies, so client IPs and protocol are correct.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: config.clientOrigins,
      credentials: true,
    }),
  );

  // A voice turn may carry ~10s of 16kHz WAV as base64. Parsed here first, the
  // global parser below skips it.
  app.use(['/api/incidents/:id/voice', '/api/voice/sessions/:incidentId/turns'], express.json({ limit: '2mb' }));
  // Emergency payloads are transcripts, not uploads. A small cap limits abuse.
  app.use(express.json({ limit: '256kb' }));

  app.use(requestId);
  app.use(requestLogger);

  const api = Router();
  api.use(healthRouter);
  api.use(attachPrincipal);
  api.use(createAuthRouter());
  api.use(createProtocolRouter());
  api.use(createIncidentRouter({ llmProvider: options.llmProvider, voxideProvider: options.voxideProvider }));
  api.use(createVoiceRouter({ llmProvider: options.llmProvider, voxideProvider: options.voxideProvider }));
  api.use(createSpeechRouter({ speechProvider: options.voxideProvider }));
  api.use(createResponderRouter());
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
