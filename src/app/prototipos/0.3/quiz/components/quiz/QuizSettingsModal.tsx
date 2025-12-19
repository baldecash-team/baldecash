'use client';

/**
 * QuizSettingsModal - Modal de configuracion de versiones
 *
 * Permite seleccionar las versiones de cada componente
 * para pruebas A/B y demos
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
import {
  defaultQuizConfig,
  versionDescriptions,
  QuizSettingsModalProps,
} from '../../types/quiz';

interface VersionSelectorProps {
  label: string;
  value: number;
  options: number[];
  descriptions: Record<number, string>;
  onChange: (value: number) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  label,
  value,
  options,
  descriptions,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-neutral-700 mb-2 block">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
              value === option
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            V{option}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">{descriptions[value]}</p>
    </div>
  );
};

export const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange(defaultQuizConfig);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="outside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-white my-8',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-200 bg-white py-4 pr-12',
        body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
        footer: 'border-t border-neutral-200 bg-white',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-[#4654CD]" />
          </div>
          <span className="text-lg font-semibold text-neutral-800">Configuracion del Quiz</span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Selecciona las versiones de cada componente para crear diferentes
            combinaciones y probar cual funciona mejor.
          </p>

          {/* B.98 - Layout Version */}
          <VersionSelector
            label="B.98 - Layout del Quiz"
            value={config.layoutVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.layout}
            onChange={(v) => onConfigChange({ ...config, layoutVersion: v as 1 | 2 | 3 })}
          />

          {/* B.99 - Question Count */}
          <VersionSelector
            label="B.99 - Numero de Preguntas"
            value={config.questionCount}
            options={[3, 5, 7]}
            descriptions={versionDescriptions.questionCount}
            onChange={(v) => onConfigChange({ ...config, questionCount: v as 3 | 5 | 7 })}
          />

          {/* Question Style */}
          <VersionSelector
            label="B.100 - Estilo de Preguntas"
            value={config.questionStyle}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.questionStyle}
            onChange={(v) => onConfigChange({ ...config, questionStyle: v as 1 | 2 | 3 })}
          />

          {/* B.101 - Results Version */}
          <VersionSelector
            label="B.101 - Formato de Resultados"
            value={config.resultsVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.results}
            onChange={(v) => onConfigChange({ ...config, resultsVersion: v as 1 | 2 | 3 })}
          />

          {/* B.102 - Focus Version */}
          <VersionSelector
            label="B.102 - Enfoque de Preguntas"
            value={config.focusVersion}
            options={[1, 2, 3]}
            descriptions={versionDescriptions.focus}
            onChange={(v) => onConfigChange({ ...config, focusVersion: v as 1 | 2 | 3 })}
          />

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500">
                <strong>Nota:</strong> Las preguntas siempre incluyen iconos
                ilustrativos segun lo definido en B.100 del documento de
                especificaciones.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
            className="cursor-pointer"
          >
            Restablecer
          </Button>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer"
            onPress={onClose}
          >
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuizSettingsModal;
