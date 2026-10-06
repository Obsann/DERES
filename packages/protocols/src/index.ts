export { unconsciousAdultProtocol } from './unconsciousAdult.js';
export { suspectedStrokeProtocol } from './suspectedStroke.js';
export { chokingProtocol } from './choking.js';
export { severeBleedingProtocol } from './severeBleeding.js';
export { burnsProtocol } from './burns.js';
export { traumaticInjuryProtocol } from './traumaticInjury.js';
export { applyButtonGuide, GuideError, toLocalVoiceTurn, type GuideTurn } from './guide.js';
export { isPlaceCallStep } from './conditions.js';

import type { Protocol } from '@voicesos/shared';
import { unconsciousAdultProtocol } from './unconsciousAdult.js';
import { suspectedStrokeProtocol } from './suspectedStroke.js';
import { chokingProtocol } from './choking.js';
import { severeBleedingProtocol } from './severeBleeding.js';
import { burnsProtocol } from './burns.js';
import { traumaticInjuryProtocol } from './traumaticInjury.js';

export const publishedProtocols: Protocol[] = [
  unconsciousAdultProtocol,
  suspectedStrokeProtocol,
  chokingProtocol,
  severeBleedingProtocol,
  burnsProtocol,
  traumaticInjuryProtocol,
];
