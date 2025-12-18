'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, Tabs, Tab, Chip } from '@nextui-org/react';
import { ArrowLeft, Play, Settings, Eye, Code } from 'lucide-react';
import Link from 'next/link';
import type { WizardConfig, WizardStep } from '../types/wizard';
import { WIZARD_STEPS } from '../data/wizardSteps';

// Import all components for preview
import { WizardLayoutV1, WizardLayoutV2, WizardLayoutV3 } from '../components/wizard/structure';
import { ProgressIndicatorV1, ProgressIndicatorV2, ProgressIndicatorV3 } from '../components/wizard/progress';
import { WizardButtonsV1, WizardButtonsV2, WizardButtonsV3 } from '../components/wizard/navigation';
import { MotivationalMessageV1, MotivationalMessageV2, MotivationalMessageV3 } from '../components/wizard/motivation';
import { StepLayoutV1, StepLayoutV2, StepLayoutV3 } from '../components/wizard/step';
import { StepCelebrationV1, StepCelebrationV2, StepCelebrationV3, MilestoneAnimation } from '../components/wizard/celebration';

interface ComponentPreview {
  id: string;
  name: string;
  description: string;
  versions: {
    version: number;
    name: string;
    description: string;
    component: React.ReactNode;
  }[];
}

export default function WizardPreviewPage() {
  const [selectedTab, setSelectedTab] = useState('layout');
  const [activeVersion, setActiveVersion] = useState<Record<string, number>>({
    layout: 1,
    progress: 1,
    navigation: 1,
    motivation: 1,
    step: 1,
    celebration: 1,
  });
  const [showCelebration, setShowCelebration] = useState<number | null>(null);

  // Mock data for previews
  const mockStep: WizardStep = WIZARD_STEPS[1]; // Académico
  const mockConfig: WizardConfig = {
    layoutVersion: 1,
    progressVersion: 1,
    navigationVersion: 1,
    stepLayoutVersion: 1,
    motivationVersion: 1,
    celebrationVersion: 1,
    allowFreeNavigation: false,
    autoSave: true,
    showTimeEstimate: true,
  };

  const componentPreviews: ComponentPreview[] = [
    {
      id: 'layout',
      name: 'Layout del Wizard',
      description: 'Estructura general del formulario',
      versions: [
        {
          version: 1,
          name: 'Fullscreen',
          description: 'Sin distracciones, enfoque total',
          component: (
            <div className="h-[400px] border rounded-lg overflow-hidden relative">
              <WizardLayoutV1 steps={WIZARD_STEPS} currentStep={1} showTimeEstimate={true} estimatedMinutesRemaining={5}>
                <div className="text-center text-neutral-400 py-8">Contenido del wizard</div>
              </WizardLayoutV1>
            </div>
          ),
        },
        {
          version: 2,
          name: 'Header minimalista',
          description: 'Logo + botón cerrar',
          component: (
            <div className="h-[400px] border rounded-lg overflow-hidden relative">
              <WizardLayoutV2 steps={WIZARD_STEPS} currentStep={1} showTimeEstimate={true} estimatedMinutesRemaining={5}>
                <div className="text-center text-neutral-400 py-8">Contenido del wizard</div>
              </WizardLayoutV2>
            </div>
          ),
        },
        {
          version: 3,
          name: 'Header + Progress sticky',
          description: 'Progreso siempre visible',
          component: (
            <div className="h-[400px] border rounded-lg overflow-hidden relative">
              <WizardLayoutV3 steps={WIZARD_STEPS} currentStep={1} showTimeEstimate={true} estimatedMinutesRemaining={5}>
                <div className="text-center text-neutral-400 py-8">Contenido del wizard</div>
              </WizardLayoutV3>
            </div>
          ),
        },
      ],
    },
    {
      id: 'progress',
      name: 'Indicador de Progreso',
      description: 'Muestra el avance en el formulario',
      versions: [
        {
          version: 1,
          name: 'Steps numerados',
          description: 'Iconos con checkmarks',
          component: (
            <div className="p-6 bg-white rounded-lg border">
              <ProgressIndicatorV1
                steps={WIZARD_STEPS}
                currentStep={1}
                completedSteps={[0]}
                allowFreeNavigation={false}
              />
            </div>
          ),
        },
        {
          version: 2,
          name: 'Barra con porcentaje',
          description: 'Progreso visual con %',
          component: (
            <div className="p-6 bg-white rounded-lg border">
              <ProgressIndicatorV2
                steps={WIZARD_STEPS}
                currentStep={1}
                completedSteps={[0]}
                allowFreeNavigation={false}
              />
            </div>
          ),
        },
        {
          version: 3,
          name: 'Dots collapsible',
          description: 'Expandible con detalles',
          component: (
            <div className="p-6 bg-white rounded-lg border">
              <ProgressIndicatorV3
                steps={WIZARD_STEPS}
                currentStep={1}
                completedSteps={[0]}
                allowFreeNavigation={false}
              />
            </div>
          ),
        },
      ],
    },
    {
      id: 'navigation',
      name: 'Botones de Navegación',
      description: 'Controles para avanzar/retroceder',
      versions: [
        {
          version: 1,
          name: 'Fixed bottom',
          description: 'Siempre visibles abajo',
          component: (
            <div className="h-[200px] bg-white rounded-lg border relative overflow-hidden">
              <div className="p-4 text-neutral-400 text-sm">Contenido del formulario...</div>
              <WizardButtonsV1
                onBack={() => {}}
                onNext={() => {}}
                onSave={() => {}}
                canGoBack={true}
                canGoForward={true}
                isSubmitting={false}
                isLastStep={false}
              />
            </div>
          ),
        },
        {
          version: 2,
          name: 'Inline con form',
          description: 'Al final del contenido',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-neutral-400 text-sm mb-4">Contenido del formulario...</div>
              <WizardButtonsV2
                onBack={() => {}}
                onNext={() => {}}
                onSave={() => {}}
                canGoBack={true}
                canGoForward={true}
                isSubmitting={false}
                isLastStep={false}
              />
            </div>
          ),
        },
        {
          version: 3,
          name: 'Adaptive',
          description: 'Fixed móvil, inline desktop',
          component: (
            <div className="h-[200px] bg-white rounded-lg border relative overflow-hidden">
              <div className="p-4 text-neutral-400 text-sm">Contenido del formulario...</div>
              <WizardButtonsV3
                onBack={() => {}}
                onNext={() => {}}
                onSave={() => {}}
                canGoBack={true}
                canGoForward={true}
                isSubmitting={false}
                isLastStep={false}
              />
            </div>
          ),
        },
      ],
    },
    {
      id: 'motivation',
      name: 'Mensaje Motivacional',
      description: 'Feedback y ánimo al usuario',
      versions: [
        {
          version: 1,
          name: 'Estático',
          description: 'Frase fija por paso',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <MotivationalMessageV1
                currentStep={1}
                stepCode="academico"
                remainingMinutes={5}
                completedSteps={1}
                totalSteps={4}
              />
            </div>
          ),
        },
        {
          version: 2,
          name: 'Dinámico',
          description: 'Cambia según progreso',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <MotivationalMessageV2
                currentStep={2}
                stepCode="economico"
                remainingMinutes={3}
                completedSteps={2}
                totalSteps={4}
              />
            </div>
          ),
        },
        {
          version: 3,
          name: 'Avatar con tips',
          description: 'Personaje que ayuda',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <MotivationalMessageV3
                currentStep={1}
                stepCode="academico"
                remainingMinutes={5}
                completedSteps={1}
                totalSteps={4}
              />
            </div>
          ),
        },
      ],
    },
    {
      id: 'step',
      name: 'Layout del Paso',
      description: 'Organización de campos',
      versions: [
        {
          version: 1,
          name: 'Single column',
          description: 'Una pregunta a la vez',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <StepLayoutV1 step={mockStep}>
                <div className="h-24 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-sm">
                  Campos del formulario
                </div>
              </StepLayoutV1>
            </div>
          ),
        },
        {
          version: 2,
          name: 'Secciones',
          description: 'Campos agrupados',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <StepLayoutV2 step={mockStep}>
                <div className="h-24 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-sm">
                  Campos del formulario
                </div>
              </StepLayoutV2>
            </div>
          ),
        },
        {
          version: 3,
          name: 'Cards',
          description: 'Card por grupo',
          component: (
            <div className="p-4 bg-white rounded-lg border">
              <StepLayoutV3 step={mockStep}>
                <div className="h-24 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-sm">
                  Campos del formulario
                </div>
              </StepLayoutV3>
            </div>
          ),
        },
      ],
    },
    {
      id: 'celebration',
      name: 'Celebración de Paso',
      description: 'Feedback al completar paso',
      versions: [
        {
          version: 1,
          name: 'Check rápido',
          description: 'Micro-celebración sutil',
          component: (
            <div className="p-4 bg-white rounded-lg border text-center">
              <Button
                className="bg-[#4654CD] text-white cursor-pointer"
                onPress={() => setShowCelebration(1)}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver V1
              </Button>
            </div>
          ),
        },
        {
          version: 2,
          name: 'Mensaje + check',
          description: 'Con texto motivacional',
          component: (
            <div className="p-4 bg-white rounded-lg border text-center">
              <Button
                className="bg-[#4654CD] text-white cursor-pointer"
                onPress={() => setShowCelebration(2)}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver V2
              </Button>
            </div>
          ),
        },
        {
          version: 3,
          name: 'Confetti',
          description: 'Animación celebratoria',
          component: (
            <div className="p-4 bg-white rounded-lg border text-center">
              <Button
                className="bg-[#4654CD] text-white cursor-pointer"
                onPress={() => setShowCelebration(3)}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver V3
              </Button>
            </div>
          ),
        },
      ],
    },
  ];

  const currentPreview = componentPreviews.find((p) => p.id === selectedTab);
  const currentVersionIndex = (activeVersion[selectedTab] || 1) - 1;

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/prototipos/0.3/solicitud"
                className="flex items-center gap-2 text-neutral-500 hover:text-[#4654CD] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver al wizard</span>
              </Link>
              <div className="w-px h-6 bg-neutral-200" />
              <div>
                <h1 className="text-lg font-bold text-neutral-800">Wizard Preview</h1>
                <p className="text-xs text-neutral-500">PROMPT_08 - Estructura del Formulario</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD]/10 px-2.5 py-1 h-auto',
                  content: 'text-[#4654CD] text-xs font-medium',
                }}
              >
                v0.3
              </Chip>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Component selector */}
          <div className="lg:col-span-1">
            <Card className="border border-neutral-200 sticky top-24">
              <CardBody className="p-4">
                <h3 className="text-sm font-semibold text-neutral-800 mb-4">Componentes</h3>
                <div className="space-y-1">
                  {componentPreviews.map((preview) => (
                    <button
                      key={preview.id}
                      onClick={() => setSelectedTab(preview.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        selectedTab === preview.id
                          ? 'bg-[#4654CD] text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {preview.name}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main - Preview area */}
          <div className="lg:col-span-3">
            {currentPreview && (
              <motion.div
                key={currentPreview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-800">{currentPreview.name}</h2>
                  <p className="text-neutral-500">{currentPreview.description}</p>
                </div>

                {/* Version tabs */}
                <div className="flex items-center gap-2 mb-6">
                  {currentPreview.versions.map((v) => (
                    <Button
                      key={v.version}
                      size="sm"
                      variant={activeVersion[selectedTab] === v.version ? 'solid' : 'bordered'}
                      className={`cursor-pointer ${
                        activeVersion[selectedTab] === v.version
                          ? 'bg-[#4654CD] text-white'
                          : 'border-neutral-300'
                      }`}
                      onPress={() =>
                        setActiveVersion((prev) => ({ ...prev, [selectedTab]: v.version }))
                      }
                    >
                      V{v.version}
                    </Button>
                  ))}
                </div>

                {/* Preview card */}
                <Card className="border border-neutral-200">
                  <CardBody className="p-0">
                    {/* Version info */}
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-800">
                            {currentPreview.versions[currentVersionIndex]?.name}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            {currentPreview.versions[currentVersionIndex]?.description}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          radius="sm"
                          classNames={{
                            base: 'bg-neutral-200 px-2 py-0.5 h-auto',
                            content: 'text-neutral-600 text-xs font-medium',
                          }}
                        >
                          Versión {activeVersion[selectedTab]}
                        </Chip>
                      </div>
                    </div>

                    {/* Component preview */}
                    <div className="p-6 bg-neutral-50">
                      {currentPreview.versions[currentVersionIndex]?.component}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Celebration overlays */}
      {showCelebration === 1 && (
        <StepCelebrationV1
          stepName="Datos Académicos"
          stepNumber={2}
          onComplete={() => setShowCelebration(null)}
        />
      )}
      {showCelebration === 2 && (
        <StepCelebrationV2
          stepName="Datos Académicos"
          stepNumber={2}
          onComplete={() => setShowCelebration(null)}
        />
      )}
      {showCelebration === 3 && (
        <StepCelebrationV3
          stepName="Datos Académicos"
          stepNumber={2}
          onComplete={() => setShowCelebration(null)}
        />
      )}
    </div>
  );
}
