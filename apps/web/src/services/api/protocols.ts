import type {
  GetProtocolResponse,
  Id,
  ListProtocolsResponse,
} from '@voicesos/shared';
import { apiGet, type ApiRequestOptions } from './client';

/** Typed protocol endpoints. */
export const protocolsApi = {
  list(options?: ApiRequestOptions): Promise<ListProtocolsResponse> {
    return apiGet<ListProtocolsResponse>('/api/protocols', options);
  },

  getById(id: Id, options?: ApiRequestOptions): Promise<GetProtocolResponse> {
    return apiGet<GetProtocolResponse>(`/api/protocols/${id}`, options);
  },
};
