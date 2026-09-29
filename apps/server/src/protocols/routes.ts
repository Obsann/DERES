import { Router } from 'express';
import { NotFoundError } from '../common/errors.js';
import { sendSuccess } from '../common/http.js';
import { publishedProtocols } from './catalog.js';

/** Published protocol catalog. No auth — the bystander UI needs the active MVP protocol. */
export function createProtocolRouter(): Router {
  const router = Router();

  router.get('/protocols', (_req, res) => {
    sendSuccess(res, publishedProtocols);
  });

  router.get('/protocols/:id', (req, res) => {
    const protocol = publishedProtocols.find((item) => item.id === req.params.id);
    if (!protocol) throw new NotFoundError('Protocol');
    sendSuccess(res, protocol);
  });

  return router;
}
