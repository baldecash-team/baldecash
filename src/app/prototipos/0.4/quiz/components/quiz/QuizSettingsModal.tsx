'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { Settings, RotateCcw, Layout, Hash, MessageSquare, Trophy, Target, Link2, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    onConfigChange(defaultQuizConfig);
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    params.set('layout', config.layoutVersion.toString());
    params.set('questionCount', config.questionCount.toString());
    params.set('questionStyle', config.questionStyle.toString());
    params.set('results', config.resultsVersion.toString());
    params.set('focus', config.focusVersion.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span className="text-lg font-semibold text-neutral-800">
            Configuración del Quiz
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño del quiz seleccionando diferentes versiones de cada componente.
          </p>

          {/* B.98 - Layout */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Layout del Quiz</h3>
            </div>
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
                <Radio
                  key={key}
                  value={key}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.layoutVersion === Number(key)
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={desc}
                >
                  Versión {key}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* B.99 - Question Count */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Cantidad de Preguntas</h3>
            </div>
            <RadioGroup
              value={String(config.questionCount)}
              onValueChange={(value) =>
                onConfigChange({
                  ...config,
                  questionCount: Number(value) as QuizConfig['questionCount'],
                })
              }
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {Object.entries(versionDescriptions.questionCount).map(([key, desc]) => (
                <Radio
                  key={key}
                  value={key}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.questionCount === Number(key)
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={desc}
                >
                  {key} preguntas
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* B.100 - Question Style */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Estilo de Preguntas</h3>
            </div>
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
                <Radio
                  key={key}
                  value={key}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.questionStyle === Number(key)
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={desc}
                >
                  Versión {key}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* B.101 - Results */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Resultados</h3>
            </div>
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
                <Radio
                  key={key}
                  value={key}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.resultsVersion === Number(key)
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={desc}
                >
                  Versión {key}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* B.102 - Focus */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Enfoque de Preguntas</h3>
            </div>
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
                <Radio
                  key={key}
                  value={key}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.focusVersion === Number(key)
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={desc}
                >
                  Versión {key}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white justify-between">
          <Button
            variant="flat"
            startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            onPress={handleGenerateUrl}
            className={`cursor-pointer transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            {copied ? 'Copiado!' : 'Generar URL'}
          </Button>
          <div className="flex gap-2">
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
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuizSettingsModal;
