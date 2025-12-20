// FAQ Components - 6 versiones para A/B testing
// Generado desde PROMPT_01_HERO_LANDING.md

export { FaqSectionV1 } from './FaqSectionV1';
export { FaqSectionV2 } from './FaqSectionV2';
export { FaqSectionV3 } from './FaqSectionV3';
export { FaqSectionV4 } from './FaqSectionV4';
export { FaqSectionV5 } from './FaqSectionV5';
export { FaqSectionV6 } from './FaqSectionV6';

// Re-export para uso con wrapper
import { FaqSectionV1 } from './FaqSectionV1';
import { FaqSectionV2 } from './FaqSectionV2';
import { FaqSectionV3 } from './FaqSectionV3';
import { FaqSectionV4 } from './FaqSectionV4';
import { FaqSectionV5 } from './FaqSectionV5';
import { FaqSectionV6 } from './FaqSectionV6';

export const FaqSectionVersions = {
  1: FaqSectionV1,
  2: FaqSectionV2,
  3: FaqSectionV3,
  4: FaqSectionV4,
  5: FaqSectionV5,
  6: FaqSectionV6,
} as const;
