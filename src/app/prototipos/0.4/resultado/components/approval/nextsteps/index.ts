/**
 * Next Steps Components Index - BaldeCash v0.4
 */

export { NextStepsV1 } from './NextStepsV1';
export { NextStepsV2 } from './NextStepsV2';
export { NextStepsV3 } from './NextStepsV3';
export { NextStepsV4 } from './NextStepsV4';
export { NextStepsV5 } from './NextStepsV5';
export { NextStepsV6 } from './NextStepsV6';

import { NextStepsV1 } from './NextStepsV1';
import { NextStepsV2 } from './NextStepsV2';
import { NextStepsV3 } from './NextStepsV3';
import { NextStepsV4 } from './NextStepsV4';
import { NextStepsV5 } from './NextStepsV5';
import { NextStepsV6 } from './NextStepsV6';

export const NextStepsVersions = {
  1: NextStepsV1,
  2: NextStepsV2,
  3: NextStepsV3,
  4: NextStepsV4,
  5: NextStepsV5,
  6: NextStepsV6,
};

export const getNextSteps = (version: 1 | 2 | 3 | 4 | 5 | 6) => NextStepsVersions[version];
