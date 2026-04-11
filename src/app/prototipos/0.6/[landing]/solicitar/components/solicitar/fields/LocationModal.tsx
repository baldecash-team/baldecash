'use client';

/**
 * LocationModal - Modal de ubicación con mapa y pin arrastrable
 *
 * Flujo: permission → loading → map (con pin arrastrable) → confirmar
 * Replica el flujo legacy de pidetuprestamo con patrones UI de v0.6
 *
 * Desktop: NextUI Modal centrado
 * Mobile: Framer Motion bottom sheet con drag-to-close
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { MapPin, Loader2, AlertCircle, X, Check, Navigation } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useIsMobile } from '@/app/prototipos/_shared';
import { ParsedAddress } from '../../../../../types/googleMaps.d';
import { parseGooglePlace } from '../../../utils/parseGooglePlace';

type ModalState = 'permission' | 'loading' | 'map' | 'error';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (place: ParsedAddress) => void;
  /**
   * If provided, the modal skips the "permission" screen and opens directly
   * on the map with these coordinates. Used when the caller already obtained
   * geolocation from the tap (so iOS Safari shows the permission prompt on
   * the first tap, not on the second one inside the modal).
   */
  initialCoords?: { latitude: number; longitude: number } | null;
}

/**
 * Custom marker element: brand-colored pin with pulse animation
 */
function createCustomMarkerElement(): HTMLDivElement {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '40px';
  container.style.height = '40px';
  container.style.cursor = 'grab';

  // Pulse ring (animated)
  const pulse = document.createElement('div');
  pulse.style.position = 'absolute';
  pulse.style.bottom = '0';
  pulse.style.left = '50%';
  pulse.style.transform = 'translateX(-50%)';
  pulse.style.width = '40px';
  pulse.style.height = '40px';
  pulse.style.borderRadius = '50%';
  pulse.style.backgroundColor = 'var(--color-primary)';
  pulse.style.opacity = '0.2';
  pulse.style.animation = 'location-pulse 2s ease-out infinite';
  container.appendChild(pulse);

  // Pin SVG (brand color)
  const pin = document.createElement('div');
  pin.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2C13.373 2 8 7.373 8 14c0 8.5 12 22 12 22s12-13.5 12-22c0-6.627-5.373-12-12-12z" fill="var(--color-primary)" stroke="white" stroke-width="2"/>
    <circle cx="20" cy="14" r="5" fill="white"/>
  </svg>`;
  pin.style.position = 'relative';
  pin.style.zIndex = '1';
  pin.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
  container.appendChild(pin);

  return container;
}

// ─── Shared Content (used by both desktop and mobile) ───

const LocationModalContent: React.FC<{
  onClose: () => void;
  onConfirm: (place: ParsedAddress) => void;
  initialCoords?: { latitude: number; longitude: number } | null;
}> = ({ onClose, onConfirm, initialCoords }) => {
  const [state, setState] = useState<ModalState>(
    initialCoords ? 'map' : 'permission'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentPlace, setCurrentPlace] = useState<ParsedAddress | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when modal opens. If initialCoords were provided by the caller,
  // start directly on 'map' so we skip the in-modal permission screen entirely
  // (the permission prompt was already shown on the previous user gesture).
  useEffect(() => {
    setState(initialCoords ? 'map' : 'permission');
    setErrorMessage('');
    setCurrentAddress('');
    setCurrentPlace(null);
  }, [initialCoords]);

  // Inject pulse keyframes once
  useEffect(() => {
    const styleId = 'location-pulse-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes location-pulse {
        0% { transform: translateX(-50%) scale(1); opacity: 0.25; }
        70% { transform: translateX(-50%) scale(2.5); opacity: 0; }
        100% { transform: translateX(-50%) scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Track whether the map was already initialized (prevents double-init on re-render)
  const mapInitializedRef = useRef(false);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    setIsReverseGeocoding(true);
    try {
      const results = await new Promise<google.maps.GeocoderResult[]>(
        (resolve, reject) => {
          geocoderRef.current!.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve(results);
              } else {
                reject(new Error('No address found'));
              }
            }
          );
        }
      );

      const place = results[0] as unknown as google.maps.places.PlaceResult;
      place.geometry = {
        location: new google.maps.LatLng(lat, lng),
      } as google.maps.places.PlaceGeometry;

      const parsed = parseGooglePlace(place);
      setCurrentAddress(parsed.formattedAddress);
      setCurrentPlace(parsed);
    } catch {
      setCurrentAddress('No se pudo obtener la dirección');
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Debounced reverse geocode (for marker drag)
  const debouncedReverseGeocode = useCallback((lat: number, lng: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 300);
  }, [reverseGeocode]);

  // Initialize map when entering map state
  const initializeMap = useCallback((lat: number, lng: number) => {
    if (!mapContainerRef.current) return;

    geocoderRef.current = new google.maps.Geocoder();

    const map = new google.maps.Map(mapContainerRef.current, {
      center: { lat, lng },
      zoom: 18,
      disableDefaultUI: true,
      zoomControl: true,
      mapId: 'location-modal-map',
    });
    mapRef.current = map;

    const markerElement = createCustomMarkerElement();

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat, lng },
      gmpDraggable: true,
      title: 'Tu ubicación',
      content: markerElement,
    });
    markerRef.current = marker;

    // Handle marker drag — update cursor
    marker.addListener('dragstart', () => {
      markerElement.style.cursor = 'grabbing';
    });

    marker.addListener('dragend', () => {
      markerElement.style.cursor = 'grab';
      const pos = marker.position;
      if (pos) {
        const newLat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
        const newLng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
        map.panTo({ lat: newLat, lng: newLng });
        debouncedReverseGeocode(newLat, newLng);
      }
    });

    // Initial reverse geocode
    reverseGeocode(lat, lng);
  }, [reverseGeocode, debouncedReverseGeocode]);

  // If the caller supplied initialCoords, initialize the map directly.
  // This happens when geolocation was already obtained from the previous
  // user gesture (tap on "Usar mi ubicación"), so we skip the permission screen.
  useEffect(() => {
    if (!initialCoords || mapInitializedRef.current) return;
    // Wait one tick so the map container <div> is actually rendered in the DOM.
    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapInitializedRef.current) {
        mapInitializedRef.current = true;
        initializeMap(initialCoords.latitude, initialCoords.longitude);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [initialCoords, initializeMap]);

  // Reset the init flag when the modal closes (so reopening re-initializes).
  useEffect(() => {
    if (!initialCoords) {
      mapInitializedRef.current = false;
    }
  }, [initialCoords]);

  // Handle "Permitir" click
  // IMPORTANT: iOS Safari requires navigator.geolocation.getCurrentPosition
  // to be invoked synchronously inside a user gesture (tap handler).
  // Any intermediate setState that triggers async work BEFORE the native call
  // can break the user activation chain and silently suppress the permission prompt.
  // For this reason we:
  //   1. Call getCurrentPosition FIRST (still inside the click handler call stack).
  //   2. Then update React state (safe — React batches will run after the native call is queued).
  //   3. Avoid wrapping this in NextUI's Button (onPress) which uses React Aria
  //      and can defer the handler via pointerup/rAF, losing the user gesture.
  const handleAllow = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMessage('Tu navegador no soporta geolocalización');
      setState('error');
      return;
    }

    // Kick off the native call IMMEDIATELY — before any setState.
    // This guarantees iOS Safari sees the call inside the user gesture.
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setState('map');
          // Delay map init slightly to ensure container is rendered
          setTimeout(() => initializeMap(latitude, longitude), 100);
        },
        (geoError) => {
          // Log for debugging production issues on real devices
          if (typeof console !== 'undefined') {
            console.warn('[LocationModal] geolocation error', {
              code: geoError.code,
              message: geoError.message,
            });
          }
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              setErrorMessage(
                'Permiso de ubicación denegado. Ve a Ajustes → Safari → Ubicación (o Ajustes → Privacidad → Servicios de Localización) y habilita el acceso para este sitio.'
              );
              break;
            case geoError.POSITION_UNAVAILABLE:
              setErrorMessage('No se pudo determinar tu ubicación. Verifica que el GPS esté activado.');
              break;
            case geoError.TIMEOUT:
              setErrorMessage('Se agotó el tiempo de espera para obtener la ubicación. Intenta nuevamente.');
              break;
            default:
              setErrorMessage('Error al obtener la ubicación.');
          }
          setState('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.error('[LocationModal] getCurrentPosition threw', err);
      }
      setErrorMessage('No se pudo iniciar la geolocalización.');
      setState('error');
      return;
    }

    // Now update UI to "loading" — React will batch this after the native call is queued.
    setState('loading');
  };

  // Handle confirm
  const handleConfirm = () => {
    if (currentPlace) {
      onConfirm(currentPlace);
    }
  };

  // ─── Permission State ───
  if (state === 'permission') {
    return (
      <div className="flex flex-col items-center text-center p-8 space-y-6">
        <div className="w-20 h-20 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
          <Navigation className="w-10 h-10 text-[var(--color-primary)]" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-neutral-800">
            Ubicación de domicilio
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Para realizar una mejor evaluación, deseamos conocer la ubicación de tu domicilio.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2">
          {/* Native <button> (NOT NextUI's <Button onPress>) so the tap handler
              runs inside the real user gesture activation on iOS Safari. React Aria
              (used by NextUI) can defer handlers via pointerup/rAF which breaks
              the permission prompt. */}
          <button
            type="button"
            onClick={handleAllow}
            className="w-full bg-[var(--color-primary)] text-white font-semibold h-12 rounded-xl cursor-pointer flex items-center justify-center gap-2 active:brightness-90 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Permitir ubicación
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-neutral-500 font-medium h-12 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            No permitir
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading State ───
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[280px]">
        <div className="w-16 h-16 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-base font-semibold text-neutral-800">Obteniendo ubicación</p>
          <p className="text-sm text-neutral-400">Esto puede tomar unos segundos...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center text-center p-8 space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-[#ef4444]" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-neutral-800">
            No pudimos obtener tu ubicación
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
            {errorMessage}
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2">
          {/* Retry geolocation directly from the tap to preserve the user gesture on iOS */}
          <button
            type="button"
            onClick={handleAllow}
            className="w-full bg-[var(--color-primary)] text-white font-semibold h-12 rounded-xl cursor-pointer flex items-center justify-center active:brightness-90 transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-neutral-500 font-medium h-12 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // ─── Map State ───
  return (
    <div className="flex flex-col">
      {/* Header with icon */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-800">Confirma tu ubicación</h3>
          <p className="text-xs text-neutral-400">Arrastra el pin hasta la ubicación exacta de tu domicilio</p>
        </div>
      </div>

      {/* Map container with rounded corners and margin */}
      <div className="px-4 pt-4">
        <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
          <div
            ref={mapContainerRef}
            className="w-full h-[280px] lg:h-[320px]"
          />
        </div>
      </div>

      {/* Address card + confirm */}
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Address card */}
        <div className="bg-neutral-50 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-neutral-400 mb-1">Dirección detectada</p>
            {isReverseGeocoding ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                <span className="text-sm text-neutral-400">Actualizando dirección...</span>
              </div>
            ) : (
              <p className="text-sm font-medium text-neutral-800 leading-relaxed">
                {currentAddress || 'Obteniendo dirección...'}
              </p>
            )}
          </div>
        </div>

        {/* Confirm question */}
        <p className="text-sm font-medium text-neutral-600 text-center">
          ¿Es la dirección correcta?
        </p>

        {/* Confirm button with icon */}
        <Button
          onPress={handleConfirm}
          isDisabled={!currentPlace || isReverseGeocoding}
          className="w-full bg-[var(--color-primary)] text-white font-semibold h-12 rounded-xl cursor-pointer disabled:opacity-50"
          startContent={<Check className="w-5 h-5" />}
        >
          Confirmar ubicación
        </Button>
      </div>
    </div>
  );
};

// ─── Desktop Modal (NextUI) ───

const DesktopModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onConfirm, initialCoords }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    backdrop="blur"
    placement="center"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/50 backdrop-blur-sm z-[99]',
      base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden',
      body: 'p-0',
      closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer z-10',
    }}
  >
    <ModalContent>
      <ModalBody className="p-0">
        <LocationModalContent onClose={onClose} onConfirm={onConfirm} initialCoords={initialCoords} />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// ─── Mobile Bottom Sheet (Framer Motion) ───

const MobileBottomSheet: React.FC<LocationModalProps> = ({ isOpen, onClose, onConfirm, initialCoords }) => {
  const dragControls = useDragControls();
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (document.body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        didLockRef.current = true;
      }
    } else {
      if (didLockRef.current) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollYRef.current);
        didLockRef.current = false;
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="location-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="location-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col max-h-[90vh]"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Close button */}
            <div className="absolute top-3 right-3 z-10">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <LocationModalContent onClose={onClose} onConfirm={onConfirm} initialCoords={initialCoords} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Main Export ───

export const LocationModal: React.FC<LocationModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (!props.isOpen) return null;

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  return <DesktopModal {...props} />;
};

export default LocationModal;
