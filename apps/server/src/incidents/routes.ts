import { Router } from 'express';
import { sendSuccess } from '../common/http.js';
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

export function createIncidentRouter(options: IncidentServiceOptions = {}): Router {
  const router = Router();

  router.post('/incidents', async (req, res) => {
    const incident = await openIncident(parseCreateIncident(req.body), options);
    sendSuccess(res, incident, 201);
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

  return router;
}
