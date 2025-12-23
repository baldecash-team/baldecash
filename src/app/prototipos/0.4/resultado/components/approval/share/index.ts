/**
 * Share Buttons Components Index - BaldeCash v0.4
 */

export { ShareButtonsV1 } from './ShareButtonsV1';
export { ShareButtonsV2 } from './ShareButtonsV2';
export { ShareButtonsV3 } from './ShareButtonsV3';
export { ShareButtonsV4 } from './ShareButtonsV4';
export { ShareButtonsV5 } from './ShareButtonsV5';
export { ShareButtonsV6 } from './ShareButtonsV6';

import { ShareButtonsV1 } from './ShareButtonsV1';
import { ShareButtonsV2 } from './ShareButtonsV2';
import { ShareButtonsV3 } from './ShareButtonsV3';
import { ShareButtonsV4 } from './ShareButtonsV4';
import { ShareButtonsV5 } from './ShareButtonsV5';
import { ShareButtonsV6 } from './ShareButtonsV6';

export const ShareButtonsVersions = {
  1: ShareButtonsV1,
  2: ShareButtonsV2,
  3: ShareButtonsV3,
  4: ShareButtonsV4,
  5: ShareButtonsV5,
  6: ShareButtonsV6,
};

export const getShareButtons = (version: 1 | 2 | 3 | 4 | 5 | 6) => ShareButtonsVersions[version];
