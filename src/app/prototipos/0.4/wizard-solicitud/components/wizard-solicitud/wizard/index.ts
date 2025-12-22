/**
 * Wizard Components Index - BaldeCash Web 4.0
 * Exporta todas las versiones de componentes de wizard
 * C.1, C.5, C.14: Layout, Progress, Navigation
 */

// Layout versions
import { WizardLayoutV1 } from './WizardLayoutV1';
import { WizardLayoutV2 } from './WizardLayoutV2';
import { WizardLayoutV3 } from './WizardLayoutV3';
import { WizardLayoutV4 } from './WizardLayoutV4';
import { WizardLayoutV5 } from './WizardLayoutV5';
import { WizardLayoutV6 } from './WizardLayoutV6';

// Progress versions
import { ProgressIndicatorV1 } from './ProgressIndicatorV1';
import { ProgressIndicatorV2 } from './ProgressIndicatorV2';
import { ProgressIndicatorV3 } from './ProgressIndicatorV3';
import { ProgressIndicatorV4 } from './ProgressIndicatorV4';
import { ProgressIndicatorV5 } from './ProgressIndicatorV5';
import { ProgressIndicatorV6 } from './ProgressIndicatorV6';

// Navigation versions
import { WizardNavigationV1 } from './WizardNavigationV1';
import { WizardNavigationV2 } from './WizardNavigationV2';
import { WizardNavigationV3 } from './WizardNavigationV3';
import { WizardNavigationV4 } from './WizardNavigationV4';
import { WizardNavigationV5 } from './WizardNavigationV5';
import { WizardNavigationV6 } from './WizardNavigationV6';

// Re-exports
export { WizardLayoutV1, WizardLayoutV2, WizardLayoutV3, WizardLayoutV4, WizardLayoutV5, WizardLayoutV6 };
export { ProgressIndicatorV1, ProgressIndicatorV2, ProgressIndicatorV3, ProgressIndicatorV4, ProgressIndicatorV5, ProgressIndicatorV6 };
export { WizardNavigationV1, WizardNavigationV2, WizardNavigationV3, WizardNavigationV4, WizardNavigationV5, WizardNavigationV6 };

// Version type
export type WizardVersion = 1 | 2 | 3 | 4 | 5 | 6;

// Version mappings
const WizardLayoutVersions = {
  1: WizardLayoutV1,
  2: WizardLayoutV2,
  3: WizardLayoutV3,
  4: WizardLayoutV4,
  5: WizardLayoutV5,
  6: WizardLayoutV6,
} as const;

const ProgressIndicatorVersions = {
  1: ProgressIndicatorV1,
  2: ProgressIndicatorV2,
  3: ProgressIndicatorV3,
  4: ProgressIndicatorV4,
  5: ProgressIndicatorV5,
  6: ProgressIndicatorV6,
} as const;

const WizardNavigationVersions = {
  1: WizardNavigationV1,
  2: WizardNavigationV2,
  3: WizardNavigationV3,
  4: WizardNavigationV4,
  5: WizardNavigationV5,
  6: WizardNavigationV6,
} as const;

// Getters
export function getWizardLayout(version: WizardVersion) {
  return WizardLayoutVersions[version] || WizardLayoutV1;
}

export function getProgressIndicator(version: WizardVersion) {
  return ProgressIndicatorVersions[version] || ProgressIndicatorV1;
}

export function getWizardNavigation(version: WizardVersion) {
  return WizardNavigationVersions[version] || WizardNavigationV1;
}
