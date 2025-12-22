/**
 * Approved Summary Components Index - BaldeCash v0.4
 */

export { ApprovedSummaryV1 } from './ApprovedSummaryV1';
export { ApprovedSummaryV2 } from './ApprovedSummaryV2';
export { ApprovedSummaryV3 } from './ApprovedSummaryV3';
export { ApprovedSummaryV4 } from './ApprovedSummaryV4';
export { ApprovedSummaryV5 } from './ApprovedSummaryV5';
export { ApprovedSummaryV6 } from './ApprovedSummaryV6';

import { ApprovedSummaryV1 } from './ApprovedSummaryV1';
import { ApprovedSummaryV2 } from './ApprovedSummaryV2';
import { ApprovedSummaryV3 } from './ApprovedSummaryV3';
import { ApprovedSummaryV4 } from './ApprovedSummaryV4';
import { ApprovedSummaryV5 } from './ApprovedSummaryV5';
import { ApprovedSummaryV6 } from './ApprovedSummaryV6';

export const ApprovedSummaryVersions = {
  1: ApprovedSummaryV1,
  2: ApprovedSummaryV2,
  3: ApprovedSummaryV3,
  4: ApprovedSummaryV4,
  5: ApprovedSummaryV5,
  6: ApprovedSummaryV6,
};

export const getApprovedSummary = (version: 1 | 2 | 3 | 4 | 5 | 6) => ApprovedSummaryVersions[version];
