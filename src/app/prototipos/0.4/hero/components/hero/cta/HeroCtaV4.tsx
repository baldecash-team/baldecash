'use client';

/**
 * HeroCtaV4 - WhatsApp Directo + Ver productos
 *
 * Concepto: Botón WhatsApp + link al catálogo
 * Estilo: Verde WhatsApp, genera confianza y cercanía
 * Uso: Cuando se quiere comunicación directa con opción de ver catálogo
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Laptop, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HelpQuiz } from '@/app/prototipos/0.4/quiz/components/quiz/HelpQuiz';
import type { QuizConfig } from '@/app/prototipos/0.4/quiz/types/quiz';

interface HeroCtaV4Props {
  onCtaClick?: () => void;
}

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Quiz config with layout V5 (modal wizard style)
const quizConfig: QuizConfig = {
  layoutVersion: 5,
  questionCount: 7,
  questionStyle: 1,
  resultsVersion: 1,
  focusVersion: 1,
};

export const HeroCtaV4: React.FC<HeroCtaV4Props> = ({ onCtaClick }) => {
  const router = useRouter();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleWhatsApp = () => {
    window.open('https://wa.link/osgxjf', '_blank');
    onCtaClick?.();
  };

  const handleCatalogo = () => {
    onCtaClick?.();
    router.push('/prototipos/0.4/catalogo');
  };

  const handleQuiz = () => {
    onCtaClick?.();
    setIsQuizOpen(true);
  };

  const handleQuizComplete = () => {
    setIsQuizOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          size="lg"
          radius="lg"
          className="bg-[#4654CD] text-white font-semibold px-8 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25"
          startContent={<Laptop className="w-5 h-5" />}
          onPress={handleCatalogo}
        >
          Ver productos
        </Button>
        <Button
          size="lg"
          radius="lg"
          className="bg-[#03DBD0] text-neutral-900 font-semibold px-8 h-14 text-base cursor-pointer hover:bg-[#02c4ba] transition-colors shadow-lg shadow-[#03DBD0]/25"
          startContent={<HelpCircle className="w-5 h-5" />}
          onPress={handleQuiz}
        >
          Quiz
        </Button>
        <Button
          size="lg"
          radius="lg"
          variant="bordered"
          className="border-2 border-[#25D366] text-[#25D366] font-semibold px-8 h-14 text-base cursor-pointer hover:bg-[#25D366] hover:text-white transition-colors"
          startContent={<WhatsAppIcon />}
          onPress={handleWhatsApp}
        >
          WhatsApp
        </Button>
      </div>
      <p className="text-sm text-neutral-400">
        Respuesta en menos de 5 minutos
      </p>

      {/* Quiz Modal */}
      <HelpQuiz
        config={quizConfig}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};

export default HeroCtaV4;
