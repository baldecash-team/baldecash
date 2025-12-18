'use client';

/**
 * Personal Data Step Preview - v0.3
 *
 * Pagina de preview para el paso de datos personales
 * con configuracion de versiones A/B
 */

import React, { useState } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Settings, ArrowLeft, Home, Check } from 'lucide-react';
import Link from 'next/link';

import { PersonalDataStep } from './PersonalDataStep';
import { PersonalSettingsModal } from './PersonalSettingsModal';
import {
  PersonalStepConfig,
  defaultPersonalStepConfig,
  PersonalFormData,
} from './types';

export default function PersonalStepPreviewPage() {
  const [config, setConfig] = useState<PersonalStepConfig>(defaultPersonalStepConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [completedData, setCompletedData] = useState<PersonalFormData | null>(null);

  const handleComplete = (data: PersonalFormData) => {
    setCompletedData(data);
    console.log('Form completed:', data);
  };

  const handleReset = () => {
    setCompletedData(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/prototipos/0.3/wizard" className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-neutral-800">
                Datos Personales
              </h1>
              <p className="text-xs text-neutral-500">
                Seccion 10 - Form Datos Personales v0.3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/prototipos/0.3">
              <Button
                isIconOnly
                variant="light"
                className="cursor-pointer"
              >
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsSettingsOpen(true)}
              className="cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {!completedData ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <PersonalDataStep
              config={config}
              onComplete={handleComplete}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success state */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#22c55e]" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                Datos guardados
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                El paso de datos personales se completo correctamente
              </p>
              <Button
                variant="bordered"
                onPress={handleReset}
                className="cursor-pointer"
              >
                Probar de nuevo
              </Button>
            </div>

            {/* Data summary */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-800 mb-4">
                Resumen de datos
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">DNI</span>
                  <span className="text-neutral-800 font-medium">{completedData.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nombres</span>
                  <span className="text-neutral-800 font-medium">{completedData.nombres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Apellidos</span>
                  <span className="text-neutral-800 font-medium">{completedData.apellidos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Celular</span>
                  <span className="text-neutral-800 font-medium">{completedData.celular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Email</span>
                  <span className="text-neutral-800 font-medium">{completedData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ubicacion</span>
                  <span className="text-neutral-800 font-medium">
                    {completedData.distrito}, {completedData.provincia}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Direccion</span>
                  <span className="text-neutral-800 font-medium">{completedData.direccion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Terminos</span>
                  <Chip
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto',
                      content: 'text-[#22c55e] text-xs font-medium',
                    }}
                  >
                    Aceptados
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Config indicator */}
        <div className="mt-6 p-3 bg-neutral-100 rounded-lg">
          <p className="text-xs text-neutral-500 text-center">
            <strong>Config actual:</strong>{' '}
            DNI Loading: V{config.dniLoadingVersion} |{' '}
            Data Appear: V{config.dataAppearVersion} |{' '}
            Map: V{config.mapConfirmVersion} |{' '}
            Fallback: V{config.addressFallbackVersion} |{' '}
            Terms: V{config.termsLinkVersion}
          </p>
        </div>
      </main>

      {/* Settings Modal */}
      <PersonalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
