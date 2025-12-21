'use client';

/**
 * QuizSettingsModal - Modal de configuracion A/B testing
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Divider,
} from '@nextui-org/react';
import { Settings, RotateCcw } from 'lucide-react';
import {
  QuizSettingsModalProps,
  QuizConfig,
  defaultQuizConfig,
  versionDescriptions,
} from '../../types/quiz';

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
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white',
        header: 'border-b border-neutral-200',
        body: 'py-6',
        footer: 'border-t border-neutral-200',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Configuracion Quiz A/B</h2>
            <p className="text-sm text-neutral-500 font-normal">
              Ajusta las versiones para probar diferentes combinaciones
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* B.98 - Layout */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">
              B.98 - Layout del Quiz
            </h3>
            <RadioGroup
              value={String(config.layoutVersion)}
              onValueChange={(value) =>
                onConfigChange({
                  ...config,
                  layoutVersion: Number(value) as QuizConfig['layoutVersion'],
                })
              }
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {Object.entries(versionDescriptions.layout).map(([key, desc]) => (
                <Radio key={key} value={key} classNames={{ label: 'text-sm' }}>
                  V{key} - {desc}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <Divider />

          {/* B.99 - Question Count */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">
              B.99 - Cantidad de Preguntas
            </h3>
            <RadioGroup
              value={String(config.questionCount)}
              onValueChange={(value) =>
                onConfigChange({
                  ...config,
                  questionCount: Number(value) as QuizConfig['questionCount'],
                })
              }
              orientation="horizontal"
              classNames={{
                wrapper: 'gap-4',
              }}
            >
              {Object.entries(versionDescriptions.questionCount).map(([key, desc]) => (
                <Radio key={key} value={key} classNames={{ label: 'text-sm' }}>
                  {desc}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <Divider />

          {/* B.100 - Question Style */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">
              B.100 - Estilo de Preguntas
            </h3>
            <RadioGroup
              value={String(config.questionStyle)}
              onValueChange={(value) =>
                onConfigChange({
                  ...config,
                  questionStyle: Number(value) as QuizConfig['questionStyle'],
                })
              }
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {Object.entries(versionDescriptions.questionStyle).map(([key, desc]) => (
                <Radio key={key} value={key} classNames={{ label: 'text-sm' }}>
                  V{key} - {desc}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <Divider />

          {/* B.101 - Results */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">
              B.101 - Resultados
            </h3>
            <RadioGroup
              value={String(config.resultsVersion)}
              onValueChange={(value) =>
                onConfigChange({
                  ...config,
                  resultsVersion: Number(value) as QuizConfig['resultsVersion'],
                })
              }
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {Object.entries(versionDescriptions.results).map(([key, desc]) => (
                <Radio key={key} value={key} classNames={{ label: 'text-sm' }}>
                  V{key} - {desc}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <Divider />

          {/* B.102 - Focus */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">
              B.102 - Enfoque de Preguntas
            </h3>
            <RadioGroup
              value={String(config.focusVersion)}
              onValueChange={(value) =>
                onConfigChange({
                  ...config,
                  focusVersion: Number(value) as QuizConfig['focusVersion'],
                })
              }
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {Object.entries(versionDescriptions.focus).map(([key, desc]) => (
                <Radio key={key} value={key} classNames={{ label: 'text-sm' }}>
                  V{key} - {desc}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
            className="cursor-pointer"
          >
            Restaurar preferidos
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
