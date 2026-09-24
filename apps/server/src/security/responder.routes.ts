import { Router } from 'express';
import { sendSuccess } from '../common/http.js';
import { listIncidents } from '../database/persist.js';
import { createIncidentHandoff } from '../handoff/service.js';
import { readIncident } from '../incidents/service.js';
import { requireResponder } from './middleware.js';

export function createResponderRouter(): Router {
  const router = Router();
  router.use(requireResponder);

  router.get('/responder/incidents', async (req, res) => {
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

  router.get('/responder/incidents/:id', async (req, res) => {
    const incident = await readIncident(req.params.id as string);
    sendSuccess(res, incident);
  });

  router.get('/responder/incidents/:id/handoff', async (req, res) => {
    const handoff = await createIncidentHandoff(req.params.id as string);
    sendSuccess(res, handoff);
  });

  return router;
}
