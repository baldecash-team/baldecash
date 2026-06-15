'use client';

/**
 * ContactInfo - Información de contacto
 * Adapted from v0.5 for v0.6
 */

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, HelpCircle, Home, ArrowRight } from 'lucide-react';
import { useEventTrackerOptional } from '../../../../context/EventTrackerContext';
import { sendEventsBatch } from '../../../../../../services/eventsApi';

function getStoredSessionUuid(landing: string): string | null {
  try {
    return (
      localStorage.getItem(`baldecash-${landing}-wizard-session-uuid`) ||
      localStorage.getItem('baldecash-wizard-session-uuid') ||
      null
    );
  } catch {
    return null;
  }
}

interface ContactInfoProps {
  onGoToHome?: () => void;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ onGoToHome }) => {
  const tracker = useEventTrackerOptional();
  const params = useParams();
  const landing = (params?.landing as string) || 'home';

  const trackCtaClick = (ctaType: string) => {
    const sessionId = getStoredSessionUuid(landing);
    if (sessionId) {
      sendEventsBatch(sessionId, [
        {
          event_type: 'confirmation_cta_click',
          client_ts: Date.now(),
          page_url: window.location.pathname,
          properties: { cta_type: ctaType },
        },
      ]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-4"
    >
      {/* Help section */}
      <div className="bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border-soft,#e5e7eb)] p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-strong,#1f2937)] mb-0.5 text-sm sm:text-base">¿Tienes alguna duda?</p>
          <p className="text-xs sm:text-sm text-[var(--text-muted,#6b7280)] mb-3 break-words">
            Nuestro equipo está disponible para ayudarte con cualquier consulta sobre tu solicitud.
          </p>
          <button
            onClick={() => {
              tracker?.track('cta_click', { cta_name: 'whatsapp_support', location: 'confirmacion' });
              trackCtaClick('whatsapp');
              window.open('https://wa.link/osgxjf', '_blank', 'noopener,noreferrer');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">Escríbenos por WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Home CTA */}
      <button
        onClick={() => {
          tracker?.track('cta_click', { cta_name: 'go_home', location: 'confirmacion' });
          onGoToHome?.();
        }}
        className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] text-sm text-[var(--text-faint,#9ca3af)] hover:text-[var(--text-muted,#4b5563)] cursor-pointer transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>
    </motion.div>
  );
};

export default ContactInfo;
