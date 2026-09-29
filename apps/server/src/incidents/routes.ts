import { Router } from 'express';
import type { LlmProvider } from '../ai/provider.js';
import { UpstreamUnavailableError } from '../common/errors.js';
import { sendSuccess } from '../common/http.js';
import { listIncidents } from '../database/persist.js';
import { createIncidentHandoff } from '../handoff/service.js';
import { requireResponder } from '../security/middleware.js';
import type { VoxideProvider } from '../voice/provider.js';
import { handleVoiceTurn, parseVoiceTurnBody, toVoiceTurnResponse } from '../voice/session.js';
import {
  parseAddMessage,
  parseCreateIncident,
  parseRecordAction,
  parseUpdateIncident,
} from './parseRequest.js';
import {
  addIncidentMessage,
  openIncident,
  readIncident,
  readIncidentTimeline,
  recordIncidentAction,
  updateIncident,
  type IncidentServiceOptions,
} from './service.js';

export interface IncidentRouterOptions extends IncidentServiceOptions {
  voxideProvider?: VoxideProvider | null;
}

function requireLlm(options: IncidentRouterOptions): LlmProvider {
  if (!options.llmProvider) {
    throw new UpstreamUnavailableError('LLM');
  }
  return options.llmProvider;
}

export function createIncidentRouter(options: IncidentRouterOptions = {}): Router {
  const router = Router();

  router.post('/incidents', async (req, res) => {
    const incident = await openIncident(parseCreateIncident(req.body), options);
    sendSuccess(res, incident, 201);
  });

  router.get('/incidents', requireResponder, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const page = await listIncidents({
      status: typeof req.query.status === 'string' ? (req.query.status as never) : undefined,
      emergencyType: typeof req.query.emergencyType === 'string' ? (req.query.emergencyType as never) : undefined,
      limit,
      offset,
    });
    sendSuccess(res, page);
  });

  router.post('/incidents/:id/voice', async (req, res) => {
    const result = await handleVoiceTurn(parseVoiceTurnBody(req.params.id as string, req.body), {
      llmProvider: requireLlm(options),
      voxideProvider: options.voxideProvider,
    });
    sendSuccess(res, toVoiceTurnResponse(result));
  });

  router.get('/incidents/:id', async (req, res) => {
    const incident = await readIncident(req.params.id as string);
    sendSuccess(res, incident);
  });

  router.patch('/incidents/:id', async (req, res) => {
    const incident = await updateIncident(req.params.id as string, parseUpdateIncident(req.body));
    sendSuccess(res, incident);
  });

  router.post('/incidents/:id/messages', async (req, res) => {
    const message = await addIncidentMessage(req.params.id as string, parseAddMessage(req.body), options);
    sendSuccess(res, message, 201);
  });

  router.post('/incidents/:id/actions', async (req, res) => {
    const action = await recordIncidentAction(req.params.id as string, parseRecordAction(req.body));
    sendSuccess(res, action);
  });

  router.get('/incidents/:id/timeline', async (req, res) => {
    const timeline = await readIncidentTimeline(req.params.id as string);
    sendSuccess(res, timeline);
  });

  router.get('/incidents/:id/handoff', requireResponder, async (req, res) => {
    const handoff = await createIncidentHandoff(req.params.id as string);
    sendSuccess(res, handoff);
  });

  return router;
}
