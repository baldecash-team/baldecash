// HowItWorks Components - 6 versiones para A/B testing
// Generado desde PROMPT_01_HERO_LANDING.md

export { HowItWorksV1 } from './HowItWorksV1';
export { HowItWorksV2 } from './HowItWorksV2';
export { HowItWorksV3 } from './HowItWorksV3';
export { HowItWorksV4 } from './HowItWorksV4';
export { HowItWorksV5 } from './HowItWorksV5';
export { HowItWorksV6 } from './HowItWorksV6';

// Re-export para uso con wrapper
import { HowItWorksV1 } from './HowItWorksV1';
import { HowItWorksV2 } from './HowItWorksV2';
import { HowItWorksV3 } from './HowItWorksV3';
import { HowItWorksV4 } from './HowItWorksV4';
import { HowItWorksV5 } from './HowItWorksV5';
import { HowItWorksV6 } from './HowItWorksV6';

export const HowItWorksVersions = {
  1: HowItWorksV1,
  2: HowItWorksV2,
  3: HowItWorksV3,
  4: HowItWorksV4,
  5: HowItWorksV5,
  6: HowItWorksV6,
} as const;
