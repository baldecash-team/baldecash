'use client';

/**
 * Rechazo Section Landing Page
 * Section 16: Pantalla de Rechazo
 *
 * Links to all rejection screen variations
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Settings, Palette, Eye } from 'lucide-react';

const versions = [
  {
    id: 'preview',
    name: 'Preview Configurable',
    description: 'Configura todas las opciones con el modal de settings',
    href: '/prototipos/0.3/rechazo/rechazado-preview',
    icon: Settings,
    primary: true,
  },
  {
    id: 'v1',
    name: 'V1: Empático y Detallado',
    description: 'Neutros, persona pensativa, tips específicos, soporte prominente',
    href: '/prototipos/0.3/rechazo/rechazado-v1',
    icon: Eye,
  },
  {
    id: 'v2',
    name: 'V2: Cálido y Guiado',
    description: 'Colores cálidos, camino/bifurcación, modal al salir',
    href: '/prototipos/0.3/rechazo/rechazado-v2',
    icon: Palette,
  },
  {
    id: 'v3',
    name: 'V3: Minimalista',
    description: 'Marca suavizada, conversacional, enfocado en producto',
    href: '/prototipos/0.3/rechazo/rechazado-v3',
    icon: Eye,
  },
];

export default function RechazoPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/prototipos/0.3">
              <Button isIconOnly variant="light" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Pantalla de Rechazo
              </h1>
              <p className="text-neutral-500">Section #16 - PROMPT_16_RECHAZO</p>
            </div>
          </div>
          <p className="text-neutral-600 max-w-2xl">
            Cuando no podemos aprobar una solicitud, esta pantalla ofrece alternativas
            y mantiene al usuario comprometido con opciones como productos más accesibles,
            calculadora de inicial, y opción de aval.
          </p>
        </div>
      </div>

      {/* Versions Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Versiones Disponibles
        </h2>

        <div className="grid gap-4">
          {versions.map((version) => {
            const Icon = version.icon;
            return (
              <Link key={version.id} href={version.href}>
                <Card
                  isPressable
                  className={`border transition-all ${
                    version.primary
                      ? 'border-[#4654CD] bg-[#4654CD]/5 hover:bg-[#4654CD]/10'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            version.primary
                              ? 'bg-[#4654CD] text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              version.primary ? 'text-[#4654CD]' : 'text-neutral-800'
                            }`}
                          >
                            {version.name}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            {version.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-5 h-5 ${
                          version.primary ? 'text-[#4654CD]' : 'text-neutral-400'
                        }`}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
