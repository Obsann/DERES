/**
 * What the device can do right now, not which permission API we called.
 *
 * Screens and spoken lines should read these states instead of inventing
 * their own "mic denied" / "offline" checks. From Ayne SPEC-006.
 */

export const CapabilityId = {
  LISTEN: 'listen',
  SPEAK: 'speak',
  LOCATION: 'location',
  PLACE_CALL: 'place_call',
} as const;
export type CapabilityId = (typeof CapabilityId)[keyof typeof CapabilityId];

export const CapabilityStatus = {
  AVAILABLE: 'available',
  REQUEST_REQUIRED: 'request_required',
  NOT_GRANTED: 'not_granted',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
  UNSUPPORTED: 'unsupported',
} as const;
export type CapabilityStatus = (typeof CapabilityStatus)[keyof typeof CapabilityStatus];

export interface Capability {
  id: CapabilityId;
  status: CapabilityStatus;
}

export function isUsable(capability: Capability): boolean {
  return capability.status === CapabilityStatus.AVAILABLE;
}

export function listenCapability(input: {
  hasMediaDevices: boolean;
  engineReady: boolean;
  denied: boolean;
}): Capability {
  if (!input.hasMediaDevices) {
    return { id: CapabilityId.LISTEN, status: CapabilityStatus.UNSUPPORTED };
  }
  if (input.denied) {
    return { id: CapabilityId.LISTEN, status: CapabilityStatus.NOT_GRANTED };
  }
  if (!input.engineReady) {
    return { id: CapabilityId.LISTEN, status: CapabilityStatus.TEMPORARILY_UNAVAILABLE };
  }
  return { id: CapabilityId.LISTEN, status: CapabilityStatus.AVAILABLE };
}

export function speakCapability(input: { canSpeak: boolean }): Capability {
  return {
    id: CapabilityId.SPEAK,
    status: input.canSpeak ? CapabilityStatus.AVAILABLE : CapabilityStatus.TEMPORARILY_UNAVAILABLE,
  };
}

export function locationCapability(input: {
  supported: boolean;
  status: 'idle' | 'requesting' | 'shared' | 'denied' | 'unavailable';
}): Capability {
  if (!input.supported) return { id: CapabilityId.LOCATION, status: CapabilityStatus.UNSUPPORTED };
  switch (input.status) {
    case 'shared':
      return { id: CapabilityId.LOCATION, status: CapabilityStatus.AVAILABLE };
    case 'denied':
      return { id: CapabilityId.LOCATION, status: CapabilityStatus.NOT_GRANTED };
    case 'unavailable':
      return { id: CapabilityId.LOCATION, status: CapabilityStatus.TEMPORARILY_UNAVAILABLE };
    default:
      return { id: CapabilityId.LOCATION, status: CapabilityStatus.REQUEST_REQUIRED };
  }
}

export function placeCallCapability(): Capability {
  return { id: CapabilityId.PLACE_CALL, status: CapabilityStatus.AVAILABLE };
}
