'use client';

/**
 * useFieldTracking - Hook for tracking field interactions (input_focus, input_blur, form_start)
 *
 * Usage in DynamicField:
 *   const { onFieldFocus, onFieldBlur } = useFieldTracking(stepOrder);
 *
 * Tracks:
 * - input_focus: when a field receives focus
 * - input_blur: when a field loses focus, with time_in_field_ms and had_value_on_blur
 * - form_start: on the FIRST field focus in the entire wizard session
 */

import { useCallback, useRef } from 'react';
import { useEventTrackerOptional } from '../context/EventTrackerContext';

// Track if form_start has been sent (shared across all fields in the session)
let formStartSent = false;

/**
 * Reset form_start tracking (call on form reset/clear session)
 */
export function resetFormStartTracking() {
  formStartSent = false;
}

export function useFieldTracking(formStep?: number) {
  const tracker = useEventTrackerOptional();

  // Track focus timestamps per field
  const focusTimestamps = useRef<Map<string, number>>(new Map());

  const onFieldFocus = useCallback(
    (fieldName: string) => {
      if (!tracker) return;

      const now = Date.now();
      focusTimestamps.current.set(fieldName, now);

      // Emit form_start on first ever focus
      if (!formStartSent) {
        formStartSent = true;
        tracker.track('form_start', {
          form_id: 'onboarding-solicitud',
          first_field: fieldName,
        });
      }

      // Emit input_focus
      tracker.track(
        'input_focus',
        {
          field_name: fieldName,
          form_step: formStep,
        },
        fieldName
      );
    },
    [tracker, formStep]
  );

  const onFieldBlur = useCallback(
    (fieldName: string, hasValue: boolean) => {
      if (!tracker) return;

      const focusTs = focusTimestamps.current.get(fieldName);
      const timeInField = focusTs ? Date.now() - focusTs : undefined;
      focusTimestamps.current.delete(fieldName);

      tracker.track(
        'input_blur',
        {
          field_name: fieldName,
          form_step: formStep,
          time_in_field_ms: timeInField,
          had_value_on_blur: hasValue,
        },
        fieldName
      );
    },
    [tracker, formStep]
  );

  return { onFieldFocus, onFieldBlur };
}
