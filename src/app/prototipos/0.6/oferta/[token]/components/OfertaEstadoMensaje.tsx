'use client';

/**
 * Pantalla de estado de la oferta (vencida / no disponible / inválida).
 * Diseño inspirado en la página 404 del 0.6 (NotFoundContent): ícono grande
 * animado con branding, título, descripción y CTA. Sin el "404" literal —
 * el ícono cambia según el caso (reloj = vencida, etc.).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Clock, Ban, SearchX, AlertCircle, MessageCircle, type LucideIcon } from 'lucide-react';
import { useAnalytics } from '../../../analytics/useAnalytics';

export type OfertaEstadoIcon = 'clock' | 'ban' | 'search' | 'alert';

const ICONS: Record<OfertaEstadoIcon, LucideIcon> = {
  clock: Clock,
  ban: Ban,
  search: SearchX,
  alert: AlertCircle,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const iconIntro = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] },
  },
};
export function OfertaEstadoMensaje({
  icon = 'alert',
  title,
  description,
  whatsappUrl,
  offerCase,
}: {
  icon?: OfertaEstadoIcon;
  title: string;
  description: string;
  /** Si se pasa, muestra un botón "Escríbenos por WhatsApp". */
  whatsappUrl?: string;
  /** offer_case del caller (si lo tiene disponible) — solo para tracking. */
  offerCase?: string;
}) {
  const Icon = ICONS[icon];
  const analytics = useAnalytics();

  // Funnel: click en "Escríbenos por WhatsApp" desde una pantalla de estado
  // (vencida/consumida/revocada/inválida/rechazada). Tracking inline aquí
  // (en vez de prop callback) para no tocar los 3 callers más que con un
  // offerCase opcional.
  const handleWhatsappClick = () => {
    analytics.track('offer_whatsapp_click', {
      offer_case: offerCase ?? 'unknown',
      location: 'estado_mensaje',
    });
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-neutral-50">
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          className="relative z-10 mx-auto max-w-lg text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Ícono grande: círculo relleno nítido con entrada suave. */}
          <div className="mb-8 flex justify-center">
            <motion.div
              className="flex h-28 w-28 items-center justify-center rounded-full border md:h-32 md:w-32"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 20%, transparent)',
              }}
              variants={iconIntro}
            >
              <Icon className="h-12 w-12 md:h-16 md:w-16" style={{ color: 'var(--color-primary, #4654CD)' }} />
            </motion.div>
          </div>

          <motion.h1
            className="mb-3 font-['Baloo_2'] text-2xl font-bold text-neutral-800 md:text-3xl"
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-md text-base text-neutral-500 md:text-lg"
            variants={itemVariants}
          >
            {description}
          </motion.p>

          {whatsappUrl ? (
            <motion.div className="flex items-center justify-center" variants={itemVariants}>
              <Button
                size="lg"
                as="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsappClick}
                className="cursor-pointer px-8 font-semibold text-white"
                style={{ backgroundColor: '#25D366' }}
                startContent={<MessageCircle className="h-5 w-5" />}
              >
                Escríbenos por WhatsApp
              </Button>
            </motion.div>
          ) : null}

          {/* Partículas decorativas flotantes (mismo lenguaje visual que la 404):
              círculos de marca con opacidad baja que orbitan suavemente. */}
          <motion.div
            className="pointer-events-none absolute -left-10 -top-10 h-4 w-4 rounded-full opacity-20"
            style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-5 -right-5 h-6 w-6 rounded-full bg-[#03DBD0] opacity-30"
            animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <motion.div
            className="pointer-events-none absolute -right-20 top-20 h-3 w-3 rounded-full opacity-15"
            style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
            animate={{ y: [0, 25, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        </motion.div>
      </div>
    </div>
  );
}
