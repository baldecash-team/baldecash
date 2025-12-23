/**
 * Celebration Components Index - BaldeCash v0.4
 */

export { CelebrationV1 } from './CelebrationV1';
export { CelebrationV2 } from './CelebrationV2';
export { CelebrationV3 } from './CelebrationV3';
export { CelebrationV4 } from './CelebrationV4';
export { CelebrationV5 } from './CelebrationV5';
export { CelebrationV6 } from './CelebrationV6';

import { CelebrationV1 } from './CelebrationV1';
import { CelebrationV2 } from './CelebrationV2';
import { CelebrationV3 } from './CelebrationV3';
import { CelebrationV4 } from './CelebrationV4';
import { CelebrationV5 } from './CelebrationV5';
import { CelebrationV6 } from './CelebrationV6';

export const CelebrationVersions = {
  1: CelebrationV1,
  2: CelebrationV2,
  3: CelebrationV3,
  4: CelebrationV4,
  5: CelebrationV5,
  6: CelebrationV6,
};

export const getCelebration = (version: 1 | 2 | 3 | 4 | 5 | 6) => CelebrationVersions[version];
