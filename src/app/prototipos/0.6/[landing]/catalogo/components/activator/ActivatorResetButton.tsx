'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { RotateCcw } from 'lucide-react';
import { getVipToken } from '../../../../components/hero/DniModal';
import { clearActivatorSession } from './clearActivatorSession';
import { routes } from '../../../../utils/routes';
import { hardNavigate } from './hardNavigate';
import { useEventTrackerOptional } from '../../../solicitar/context/EventTrackerContext';
import { ActivatorResetDialog } from './ActivatorResetDialog';

export interface ActivatorResetButtonProps {
  /** Landing slug — storage key namespace and navigation target. */
  landing: string;
  /** features.overlay_variant; renders only for 'familyfarm'. */
  overlayVariant: string;
}

export function ActivatorResetButton({
  landing,
  overlayVariant,
}: ActivatorResetButtonProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const busyRef = useRef(false);
  const tracker = useEventTrackerOptional();

  useEffect(() => {
    setHasSession(getVipToken(landing) !== null);
    setMounted(true);
  }, [landing]);

  const handleConfirm = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsBusy(true);

    tracker?.track('cta_click', {
      cta_name: 'activator_session_reset',
      landing_slug: landing,
      location: 'catalogo_footer',
    });
    tracker?.flush();

    try {
      clearActivatorSession(landing);
    } catch {
      // clearVipData already swallows storage errors internally; this guard
      // exists only in case the call site itself is exercised differently
      // (e.g. mocked in tests). Navigation must still happen.
    }

    hardNavigate(routes.catalogo(landing));
  };

  if (!mounted || !hasSession || overlayVariant !== 'familyfarm') return null;

  return (
    <div className="flex justify-center px-4 pb-8">
      {/* border-2 is explicit: NextUI's `border-medium`, which variant="bordered"
          relies on, does not resolve under this project's Tailwind v4 setup and
          renders a 0px border. */}
      <Button
        variant="bordered"
        radius="lg"
        className="h-11 cursor-pointer border-2 border-neutral-300 bg-white text-neutral-600 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        startContent={<RotateCcw className="w-4 h-4" />}
        onPress={() => setIsOpen(true)}
      >
        Cerrar sesión
      </Button>
      <ActivatorResetDialog
        isOpen={isOpen}
        isBusy={isBusy}
        onConfirm={handleConfirm}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
