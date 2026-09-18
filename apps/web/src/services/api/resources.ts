/**
 * Resource API surface.
 *
 * Methods are declared here so Task 19 can fill them without reshuffling imports.
 * Calling one before Task 19 throws on purpose — do not invent mock medical data here.
 */
export const incidentsApi = {
  create: async (): Promise<never> => {
    throw new Error('incidentsApi.create — implement in Task 19');
  },
  getById: async (_id: string): Promise<never> => {
    throw new Error('incidentsApi.getById — implement in Task 19');
  },
  list: async (): Promise<never> => {
    throw new Error('incidentsApi.list — implement in Task 19');
  },
  addMessage: async (_id: string): Promise<never> => {
    throw new Error('incidentsApi.addMessage — implement in Task 19');
  },
  recordAction: async (_id: string): Promise<never> => {
    throw new Error('incidentsApi.recordAction — implement in Task 19');
  },
  getTimeline: async (_id: string): Promise<never> => {
    throw new Error('incidentsApi.getTimeline — implement in Task 19');
  },
  getHandoff: async (_id: string): Promise<never> => {
    throw new Error('incidentsApi.getHandoff — implement in Task 19');
  },
};

export const protocolsApi = {
  list: async (): Promise<never> => {
    throw new Error('protocolsApi.list — implement in Task 19');
  },
};
