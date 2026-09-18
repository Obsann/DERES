import type { Id, ListIncidentsQuery } from '@voicesos/shared';

/** Stable TanStack Query keys for DERES API resources. */
export const queryKeys = {
  health: ['health'] as const,
  protocols: {
    all: ['protocols'] as const,
    detail: (id: Id) => ['protocols', id] as const,
  },
  incidents: {
    all: (query: ListIncidentsQuery = {}) => ['incidents', query] as const,
    detail: (id: Id) => ['incidents', id] as const,
    timeline: (id: Id) => ['incidents', id, 'timeline'] as const,
    handoff: (id: Id) => ['incidents', id, 'handoff'] as const,
    responderAll: (query: ListIncidentsQuery = {}) =>
      ['responder', 'incidents', query] as const,
    responderDetail: (id: Id) => ['responder', 'incidents', id] as const,
  },
};
