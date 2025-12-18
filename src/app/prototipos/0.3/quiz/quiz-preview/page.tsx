'use client';

/**
 * Quiz Preview Standalone Page - BaldeCash v0.3
 *
 * Pagina de preview fullscreen para el Quiz de Ayuda
 * usando V3 layout por defecto.
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import { HelpQuiz, QuizSettingsModal } from '../components/quiz';

// Types
import { QuizConfig, defaultQuizConfig } from '../types/quiz';

export default function QuizPreviewStandalonePage() {
  const [config, setConfig] = useState<QuizConfig>({
    ...defaultQuizConfig,
    layoutVersion: 3, // Default to fullpage layout for this preview
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(true); // Start open

  return (
    <div className="min-h-screen bg-white">
      {/* Floating controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Button
          variant="bordered"
          size="sm"
          startContent={<Settings className="w-4 h-4" />}
          onPress={() => setIsSettingsOpen(true)}
          className="cursor-pointer bg-white border-neutral-300 shadow-md"
        >
          Config
        </Button>
        <Link href="/prototipos/0.3/quiz">
          <Button
            variant="bordered"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="cursor-pointer bg-white border-neutral-300 shadow-md"
          >
            Salir
          </Button>
        </Link>
      </div>

      {/* Quiz with V3 layout (fullpage) */}
      {isQuizOpen ? (
        <HelpQuiz
          config={config}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onComplete={(results) => {
            console.log('Quiz completed with results:', results);
          }}
        />
      ) : (
        // Prompt to restart
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#4654CD]/5 to-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#4654CD]/10 rounded-2xl mb-6">
              <HelpCircle className="w-10 h-10 text-[#4654CD]" />
            </div>
            <h1 className="text-3xl font-black text-[#4654CD] mb-2">
              Quiz de Ayuda
            </h1>
            <p className="text-neutral-600 mb-6">
              Encuentra la laptop ideal para ti
            </p>
            <Button
              className="bg-[#4654CD] text-white font-semibold cursor-pointer"
              size="lg"
              onPress={() => setIsQuizOpen(true)}
            >
              Iniciar Quiz
            </Button>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      <QuizSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
