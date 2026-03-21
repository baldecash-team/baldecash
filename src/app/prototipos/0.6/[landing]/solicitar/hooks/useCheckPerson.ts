'use client';

/**
 * useCheckPerson - Hook for checking person data and prefilling form
 *
 * Handles:
 * - Calling check-person API when document number is complete
 * - Debouncing API calls
 * - Triggering callbacks for prefill data
 */

import { useState, useCallback, useRef } from 'react';
import {
  checkPerson,
  CheckPersonResponse,
  PrefillData,
} from '../../../services/applicationApi';

interface UseCheckPersonOptions {
  /** Callback when prefill data is available */
  onPrefillReady?: (data: PrefillData) => void;
  /** Callback when no prefill data is available (to clear fields) */
  onNoPrefillData?: () => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

interface UseCheckPersonResult {
  /** Trigger a person check */
  check: (documentType: string, documentNumber: string) => void;
  /** Whether a check is in progress */
  isChecking: boolean;
  /** Last response from API */
  response: CheckPersonResponse | null;
  /** Error message if any */
  error: string | null;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook to check person data by document number
 *
 * @example
 * ```tsx
 * const { check, isChecking, response } = useCheckPerson({
 *   onPrefillReady: (data) => {
 *     updateField('first_name', data.first_name || '');
 *     updateField('paternal_surname', data.paternal_surname || '');
 *   },
 * });
 *
 * // Call when document number changes
 * useEffect(() => {
 *   if (documentNumber.length === 8 && documentType === 'dni') {
 *     check(documentType, documentNumber);
 *   }
 * }, [documentNumber, documentType]);
 * ```
 */
export function useCheckPerson(
  options: UseCheckPersonOptions = {}
): UseCheckPersonResult {
  const {
    onPrefillReady,
    onNoPrefillData,
    onError,
    debounceMs = 300,
  } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [response, setResponse] = useState<CheckPersonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  // Track last checked document to avoid duplicate calls
  const lastChecked = useRef<string>('');

  const check = useCallback(
    (documentType: string, documentNumber: string) => {
      // Validate document length before calling
      const cleanNumber = documentNumber.trim();

      if (documentType === 'dni' && cleanNumber.length !== 8) return;
      if (documentType === 'ce' && cleanNumber.length < 9) return;
      if (documentType === 'passport' && cleanNumber.length < 6) return;

      // Skip if already checked this document
      const checkKey = `${documentType}:${cleanNumber}`;
      if (lastChecked.current === checkKey) return;

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce the API call
      debounceTimer.current = setTimeout(async () => {
        lastChecked.current = checkKey;
        setIsChecking(true);
        setError(null);

        try {
          const result = await checkPerson({
            document_type: documentType as 'dni' | 'ce' | 'passport',
            document_number: cleanNumber,
          });

          setResponse(result);

          // Trigger prefill callback or clear fields
          if (result.prefill_data && onPrefillReady) {
            onPrefillReady(result.prefill_data);
          } else if (!result.prefill_data && onNoPrefillData) {
            // No prefill data available - clear the fields
            onNoPrefillData();
          }
        } catch (err) {
          const errorMsg = 'Error al verificar datos';
          setError(errorMsg);
          onError?.(errorMsg);
        } finally {
          setIsChecking(false);
        }
      }, debounceMs);
    },
    [onPrefillReady, onNoPrefillData, onError, debounceMs]
  );

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    lastChecked.current = '';
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return { check, isChecking, response, error, reset };
}
