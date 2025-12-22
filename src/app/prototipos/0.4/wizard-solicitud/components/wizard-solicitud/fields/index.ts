/**
 * Field Components Index - BaldeCash Web 4.0
 * Exporta todas las versiones de componentes de campos
 */

// InputField - 6 versiones (Label integrado en cada version)
export { InputFieldV1 } from './InputFieldV1';
export { InputFieldV2 } from './InputFieldV2';
export { InputFieldV3 } from './InputFieldV3';
export { InputFieldV4 } from './InputFieldV4';
export { InputFieldV5 } from './InputFieldV5';
export { InputFieldV6 } from './InputFieldV6';

// SelectCards - 6 versiones
export { SelectCardsV1 } from './SelectCardsV1';
export { SelectCardsV2 } from './SelectCardsV2';
export { SelectCardsV3 } from './SelectCardsV3';
export { SelectCardsV4 } from './SelectCardsV4';
export { SelectCardsV5 } from './SelectCardsV5';
export { SelectCardsV6 } from './SelectCardsV6';

// UploadField - 6 versiones
export { UploadFieldV1 } from './UploadFieldV1';
export { UploadFieldV2 } from './UploadFieldV2';
export { UploadFieldV3 } from './UploadFieldV3';
export { UploadFieldV4 } from './UploadFieldV4';
export { UploadFieldV5 } from './UploadFieldV5';
export { UploadFieldV6 } from './UploadFieldV6';

// DatePickerField - 6 versiones
export { DatePickerFieldV1 } from './DatePickerFieldV1';
export { DatePickerFieldV2 } from './DatePickerFieldV2';
export { DatePickerFieldV3 } from './DatePickerFieldV3';
export { DatePickerFieldV4 } from './DatePickerFieldV4';
export { DatePickerFieldV5 } from './DatePickerFieldV5';
export { DatePickerFieldV6 } from './DatePickerFieldV6';

// Mapeo de versiones para uso dinamico
import { InputFieldV1 } from './InputFieldV1';
import { InputFieldV2 } from './InputFieldV2';
import { InputFieldV3 } from './InputFieldV3';
import { InputFieldV4 } from './InputFieldV4';
import { InputFieldV5 } from './InputFieldV5';
import { InputFieldV6 } from './InputFieldV6';
import { SelectCardsV1 } from './SelectCardsV1';
import { SelectCardsV2 } from './SelectCardsV2';
import { SelectCardsV3 } from './SelectCardsV3';
import { SelectCardsV4 } from './SelectCardsV4';
import { SelectCardsV5 } from './SelectCardsV5';
import { SelectCardsV6 } from './SelectCardsV6';
import { UploadFieldV1 } from './UploadFieldV1';
import { UploadFieldV2 } from './UploadFieldV2';
import { UploadFieldV3 } from './UploadFieldV3';
import { UploadFieldV4 } from './UploadFieldV4';
import { UploadFieldV5 } from './UploadFieldV5';
import { UploadFieldV6 } from './UploadFieldV6';
import { DatePickerFieldV1 } from './DatePickerFieldV1';
import { DatePickerFieldV2 } from './DatePickerFieldV2';
import { DatePickerFieldV3 } from './DatePickerFieldV3';
import { DatePickerFieldV4 } from './DatePickerFieldV4';
import { DatePickerFieldV5 } from './DatePickerFieldV5';
import { DatePickerFieldV6 } from './DatePickerFieldV6';

export const InputFieldVersions = {
  1: InputFieldV1,
  2: InputFieldV2,
  3: InputFieldV3,
  4: InputFieldV4,
  5: InputFieldV5,
  6: InputFieldV6,
};

export const SelectCardsVersions = {
  1: SelectCardsV1,
  2: SelectCardsV2,
  3: SelectCardsV3,
  4: SelectCardsV4,
  5: SelectCardsV5,
  6: SelectCardsV6,
};

export const UploadFieldVersions = {
  1: UploadFieldV1,
  2: UploadFieldV2,
  3: UploadFieldV3,
  4: UploadFieldV4,
  5: UploadFieldV5,
  6: UploadFieldV6,
};

export const DatePickerFieldVersions = {
  1: DatePickerFieldV1,
  2: DatePickerFieldV2,
  3: DatePickerFieldV3,
  4: DatePickerFieldV4,
  5: DatePickerFieldV5,
  6: DatePickerFieldV6,
};

export const getInputField = (version: 1 | 2 | 3 | 4 | 5 | 6) => InputFieldVersions[version];
export const getSelectCards = (version: 1 | 2 | 3 | 4 | 5 | 6) => SelectCardsVersions[version];
export const getUploadField = (version: 1 | 2 | 3 | 4 | 5 | 6) => UploadFieldVersions[version];
export const getDatePickerField = (version: 1 | 2 | 3 | 4 | 5 | 6) => DatePickerFieldVersions[version];

// HelpTooltips
export {
  HelpTooltipV1,
  HelpTooltipV2,
  HelpTooltipV3,
  HelpTooltipV4,
  HelpTooltipV5,
  HelpTooltipV6,
  HelpTooltipVersions,
  getHelpTooltip,
} from './HelpTooltip';
