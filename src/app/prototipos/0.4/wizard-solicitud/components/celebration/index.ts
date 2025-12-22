/**
 * StepSuccessMessage - Componentes de celebracion entre pasos
 * C.20: 6 versiones de mensaje de exito/celebracion
 */

export { StepSuccessMessageV1 } from './StepSuccessMessageV1';
export { StepSuccessMessageV2 } from './StepSuccessMessageV2';
export { StepSuccessMessageV3 } from './StepSuccessMessageV3';
export { StepSuccessMessageV4 } from './StepSuccessMessageV4';
export { StepSuccessMessageV5 } from './StepSuccessMessageV5';
export { StepSuccessMessageV6 } from './StepSuccessMessageV6';

export type { StepSuccessMessageProps } from './StepSuccessMessageV1';

// Version mapping for config
import { StepSuccessMessageV1 } from './StepSuccessMessageV1';
import { StepSuccessMessageV2 } from './StepSuccessMessageV2';
import { StepSuccessMessageV3 } from './StepSuccessMessageV3';
import { StepSuccessMessageV4 } from './StepSuccessMessageV4';
import { StepSuccessMessageV5 } from './StepSuccessMessageV5';
import { StepSuccessMessageV6 } from './StepSuccessMessageV6';

export const StepSuccessMessageVersions = {
  1: StepSuccessMessageV1,
  2: StepSuccessMessageV2,
  3: StepSuccessMessageV3,
  4: StepSuccessMessageV4,
  5: StepSuccessMessageV5,
  6: StepSuccessMessageV6,
} as const;

export type CelebrationVersion = 1 | 2 | 3 | 4 | 5 | 6;

export function getStepSuccessMessage(version: CelebrationVersion) {
  return StepSuccessMessageVersions[version] || StepSuccessMessageV1;
}
