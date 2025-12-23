/**
 * Confetti Components Index - BaldeCash v0.4
 */

export { ConfettiV1 } from './ConfettiV1';
export { ConfettiV2 } from './ConfettiV2';
export { ConfettiV3 } from './ConfettiV3';
export { ConfettiV4 } from './ConfettiV4';
export { ConfettiV5 } from './ConfettiV5';
export { ConfettiV6 } from './ConfettiV6';

import { ConfettiV1 } from './ConfettiV1';
import { ConfettiV2 } from './ConfettiV2';
import { ConfettiV3 } from './ConfettiV3';
import { ConfettiV4 } from './ConfettiV4';
import { ConfettiV5 } from './ConfettiV5';
import { ConfettiV6 } from './ConfettiV6';

export const ConfettiVersions = {
  1: ConfettiV1,
  2: ConfettiV2,
  3: ConfettiV3,
  4: ConfettiV4,
  5: ConfettiV5,
  6: ConfettiV6,
};

export const getConfetti = (version: 1 | 2 | 3 | 4 | 5 | 6) => ConfettiVersions[version];
