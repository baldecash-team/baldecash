'use client';

/**
 * AddressAutocompleteField - Google Maps Places Autocomplete
 * Integrates with wizard form to provide address autocomplete
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Check, AlertCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { LocationModal } from './LocationModal';
import { FieldTooltip } from './FieldTooltip';
import { WizardField, resolveGeoUnits } from '../../../../../services/wizardApi';
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
  const { getFieldValue, getFieldError, updateField, updateFieldBatch } = useWizard();
  const [isFocused, setIsFocused] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [initialModalCoords, setInitialModalCoords] = useState<{ latitude: number; longitude: number } | null>(null);
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
    async (place: ParsedAddress) => {
      // Update the main address field immediately
      updateField(field.code, place.formattedAddress);

      // Auto-fill lat/lng immediately (no resolution needed)
      if (autoFillFields?.latitude) {
        updateField(autoFillFields.latitude, String(place.latitude));
      }
      if (autoFillFields?.longitude) {
        updateField(autoFillFields.longitude, String(place.longitude));
      }

      // Resolve geo-unit text names to IDs via backend, then batch-update
      if (autoFillFields && (place.department || place.province || place.district)) {
        try {
          const resolved = await resolveGeoUnits({
            department: place.department || '',
            province: place.province || undefined,
            district: place.district || undefined,
          });

          if (resolved) {
            const batchUpdates: Array<{ fieldId: string; value: string; label?: string }> = [];

            if (autoFillFields.department && resolved.department) {
              batchUpdates.push({
                fieldId: autoFillFields.department,
                value: String(resolved.department.id),
                label: resolved.department.label,
              });
            }
            if (autoFillFields.province && resolved.province) {
              batchUpdates.push({
                fieldId: autoFillFields.province,
                value: String(resolved.province.id),
                label: resolved.province.label,
              });
            }
            if (autoFillFields.district && resolved.district) {
              batchUpdates.push({
                fieldId: autoFillFields.district,
                value: String(resolved.district.id),
                label: resolved.district.label,
              });
            }

            if (batchUpdates.length > 0) {
              updateFieldBatch(batchUpdates);
            }
          }
        } catch (error) {
          console.error('[AddressAutocomplete] Error resolving geo-units:', error);
        }
      }

      // Clear any location error
      setLocationError(null);
    },
    [field.code, autoFillFields, updateField, updateFieldBatch]
  );

  // Handle errors
  const handleError = useCallback((errorMsg: string) => {
    setLocationError(errorMsg);
    console.error('[AddressAutocomplete]', errorMsg);
  }, []);

  // Initialize Google Places Autocomplete
  const { isLoaded, isLoading, error: googleError } = useGooglePlacesAutocomplete({
    inputRef,
    countryRestriction,
    onPlaceSelected: handlePlaceSelected,
    onError: handleError,
  });

  // Ensure Google's pac-container floats above navbar and sticky bars on mobile,
  // and doesn't get clipped by parent overflow. Injected once globally.
  useEffect(() => {
    const styleId = 'pac-container-mobile-fix';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .pac-container {
        z-index: 10000 !important;
        border-radius: 12px;
        border: 1px solid rgb(229 229 229);
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08);
        margin-top: 4px;
        font-family: inherit;
      }
      .pac-item {
        padding: 10px 12px;
        cursor: pointer;
        min-height: 44px;
        display: flex;
        align-items: center;
      }
      .pac-item:hover {
        background-color: rgba(var(--color-primary-rgb), 0.08);
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Handle "Use my location" click.
  //
  // IMPORTANT iOS SAFARI BEHAVIOR:
  // We call navigator.geolocation.getCurrentPosition SYNCHRONOUSLY inside the
  // tap handler. This guarantees iOS Safari shows the native permission prompt
  // on the FIRST tap (instead of requiring a second tap inside the modal, which
  // breaks the user-gesture activation chain and silently suppresses the prompt).
  //
  // After the browser resolves the coordinates, we open the LocationModal with
  // `initialCoords` so it starts directly in the map view.
  const handleUseLocation = () => {
    setLocationError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    // Kick off the native call IMMEDIATELY — inside the user gesture.
    // Do NOT setState before this call; any async work between the tap and
    // getCurrentPosition can strip the user activation on iOS Safari.
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInitialModalCoords({ latitude, longitude });
          setIsLocationModalOpen(true);
          setIsRequestingLocation(false);
        },
        (geoError) => {
          if (typeof console !== 'undefined') {
            console.warn('[AddressAutocomplete] geolocation error', {
              code: geoError.code,
              message: geoError.message,
            });
          }
          let msg = 'Error al obtener la ubicación.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              msg =
                'Permiso de ubicación denegado. Habilita el acceso en Ajustes → Privacidad → Servicios de Localización → Safari.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              msg = 'No se pudo determinar tu ubicación. Verifica que el GPS esté activado.';
              break;
            case geoError.TIMEOUT:
              msg = 'Se agotó el tiempo de espera. Intenta nuevamente.';
              break;
          }
          setLocationError(msg);
          setIsRequestingLocation(false);
          // Fall back to opening the modal in permission state so the user can retry.
          setInitialModalCoords(null);
          setIsLocationModalOpen(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.error('[AddressAutocomplete] getCurrentPosition threw', err);
      }
      setLocationError('No se pudo iniciar la geolocalización.');
      setIsRequestingLocation(false);
      return;
    }

    // Update UI state AFTER the native call is queued.
    setIsRequestingLocation(true);
  };

  // Handle location confirmed from modal
  const handleLocationConfirm = (place: ParsedAddress) => {
    handlePlaceSelected(place);
    if (inputRef.current) {
      inputRef.current.value = place.formattedAddress;
    }
    setIsLocationModalOpen(false);
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field.code, e.target.value);
    setLocationError(null);
  };

  // On mobile, scroll input into view when focused so Google's pac-container
  // dropdown (positioned below the input) isn't covered by the virtual keyboard
  // or sticky product bar.
  const handleFocus = () => {
    setIsFocused(true);
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 1024) return; // desktop: no-op
    // Delay so the keyboard has time to open on iOS before we measure/scroll
    setTimeout(() => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      // Target: input should sit ~120px from top (below fixed navbar)
      const targetTop = 120;
      const delta = rect.top - targetTop;
      if (Math.abs(delta) > 10) {
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    }, 300);
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

        {/* Input for Google Places Autocomplete */}
        <input
          ref={inputRef}
          name={`place_${field.code}`}
          id={`input_${field.code}`}
          type="text"
          role="combobox"
          aria-expanded={isFocused}
          aria-controls="pac-container"
          aria-autocomplete="list"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          placeholder={field.placeholder || 'Escribe tu dirección...'}
          disabled={field.readonly || !isLoaded}
          style={{ fontSize: '16px' }}
          className={`
            flex-1 bg-transparent outline-none text-neutral-800
            placeholder:text-neutral-400
            ${field.readonly ? 'cursor-not-allowed' : ''}
          `}
          autoComplete="off"
        />

        {/* Status icons */}
        {isLoading && (
          <Loader2 className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 animate-spin" />
        )}
        {!isLoading && showSuccess && (
          <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
        )}
        {!isLoading && showDisplayError && (
          <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
        )}
      </div>

      {/* Use my location button */}
      {showUseLocation && isLoaded && (
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={field.readonly || isRequestingLocation}
          className={`
            flex items-center gap-1.5 text-sm text-[var(--color-primary)] cursor-pointer
            hover:underline disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRequestingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {isRequestingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
        </button>
      )}

      {/* Error message - always reserve space for alignment in multi-column grids */}
      <div className="min-h-[20px]">
        {displayError && (
          <p className="text-sm text-[#ef4444] flex items-center gap-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {displayError}
          </p>
        )}
      </div>

      {/* Loading state for Google Maps */}
      {isLoading && (
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Cargando Google Maps...
        </p>
      )}

      {/* Location modal (permission + map with draggable pin).
          When initialModalCoords is set, the modal skips the permission screen
          and opens directly on the map — this happens because we already obtained
          the coordinates from the user's tap on "Usar mi ubicación". */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setInitialModalCoords(null);
        }}
        onConfirm={handleLocationConfirm}
        initialCoords={initialModalCoords}
      />
    </div>
  );
};

export default AddressAutocompleteField;
