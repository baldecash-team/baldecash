'use client';

/**
 * AddressAutocompleteField - Google Maps Places Autocomplete
 * Integrates with wizard form to provide address autocomplete
 */

import React, { useState, useRef, useCallback } from 'react';
import { Check, AlertCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import { WizardField } from '../../../../../services/wizardApi';
import { useWizard } from '../../../context/WizardContext';
import { useGooglePlacesAutocomplete } from '../../../hooks/useGooglePlacesAutocomplete';
import { ParsedAddress } from '../../../../../types/googleMaps';

interface AddressAutocompleteFieldProps {
  field: WizardField;
  showError?: boolean;
}

export const AddressAutocompleteField: React.FC<AddressAutocompleteFieldProps> = ({
  field,
  showError = false,
}) => {
  const { getFieldValue, getFieldError, updateField } = useWizard();
  const [isFocused, setIsFocused] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current value and error from wizard context
  const value = (getFieldValue(field.code) as string) || '';
  const error = showError ? getFieldError(field.code) : undefined;

  // Get config from field
  const countryRestriction = field.address_config?.country_restriction || 'pe';
  const showUseLocation = field.address_config?.show_use_location !== false;
  const autoFillFields = field.address_config?.auto_fill_fields;

  // Build tooltip from help_text
  const tooltip = field.help_text
    ? {
        title: field.help_text.title || field.label,
        description: field.help_text.description || '',
        recommendation: field.help_text.recommendation ?? undefined,
      }
    : undefined;

  // Handle place selection
  const handlePlaceSelected = useCallback(
    (place: ParsedAddress) => {
      // Update the main address field
      updateField(field.code, place.formattedAddress);

      // Auto-fill related fields if configured
      if (autoFillFields) {
        if (autoFillFields.department && place.department) {
          updateField(autoFillFields.department, place.department);
        }
        if (autoFillFields.province && place.province) {
          updateField(autoFillFields.province, place.province);
        }
        if (autoFillFields.district && place.district) {
          updateField(autoFillFields.district, place.district);
        }
        if (autoFillFields.latitude) {
          updateField(autoFillFields.latitude, String(place.latitude));
        }
        if (autoFillFields.longitude) {
          updateField(autoFillFields.longitude, String(place.longitude));
        }
      }

      // Clear any location error
      setLocationError(null);
    },
    [field.code, autoFillFields, updateField]
  );

  // Handle errors
  const handleError = useCallback((errorMsg: string) => {
    setLocationError(errorMsg);
    console.error('[AddressAutocomplete]', errorMsg);
  }, []);

  // Initialize Google Places Autocomplete
  const { isLoaded, isLoading, error: googleError, getCurrentLocation } = useGooglePlacesAutocomplete({
    inputRef,
    countryRestriction,
    onPlaceSelected: handlePlaceSelected,
    onError: handleError,
  });

  // Handle "Use my location" click
  const handleUseLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const place = await getCurrentLocation();
      if (place) {
        handlePlaceSelected(place);
        // Update input value
        if (inputRef.current) {
          inputRef.current.value = place.formattedAddress;
        }
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field.code, e.target.value);
    setLocationError(null);
  };

  // Determine display error
  const displayError = error || locationError || googleError;
  const showDisplayError = !!displayError;
  const showSuccess = !showDisplayError && !!value;

  const getBorderColor = () => {
    if (showDisplayError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isFocused) return 'border-[var(--color-primary)]';
    return 'border-neutral-300';
  };

  return (
    <div id={field.code} className="space-y-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {field.label}
        {!field.required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Input container */}
      <div
        className={`
          flex items-center gap-2 h-11 px-3
          rounded-lg border-2 transition-all duration-200 bg-white
          ${getBorderColor()}
          ${field.readonly ? 'opacity-50 bg-neutral-50' : ''}
        `}
      >
        {/* Map pin icon */}
        <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0" />

        {/* Input */}
        <input
          ref={inputRef}
          name={field.code}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={field.placeholder || 'Escribe tu dirección...'}
          disabled={field.readonly || !isLoaded}
          className={`
            flex-1 bg-transparent outline-none text-base text-neutral-800
            placeholder:text-neutral-400
            ${field.readonly ? 'cursor-not-allowed' : ''}
          `}
          style={{
            WebkitBoxShadow: '0 0 0 1000px white inset',
            WebkitTextFillColor: '#262626',
          }}
          autoComplete="off"
        />

        {/* Status icons */}
        {(isLoading || isGettingLocation) && (
          <Loader2 className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 animate-spin" />
        )}
        {!isLoading && !isGettingLocation && showSuccess && (
          <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
        )}
        {!isLoading && !isGettingLocation && showDisplayError && (
          <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
        )}
      </div>

      {/* Use my location button */}
      {showUseLocation && isLoaded && (
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={isGettingLocation || field.readonly}
          className={`
            flex items-center gap-1.5 text-sm text-[var(--color-primary)]
            hover:underline disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Navigation className="w-4 h-4" />
          {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
        </button>
      )}

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {displayError}
        </p>
      )}

      {/* Loading state for Google Maps */}
      {isLoading && (
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Cargando Google Maps...
        </p>
      )}
    </div>
  );
};

export default AddressAutocompleteField;
