'use client';

/**
 * Convenio Preview v0.5
 * Configuración fija con selector de convenio
 * Botones flotantes estándar v0.5
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, RadioGroup, Radio } from '@nextui-org/react';
import { ArrowLeft, Code, Loader2, Settings, Check, Link2, RotateCcw, Building2 } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { ConvenioLanding } from '../components/convenio/ConvenioLanding';
import { convenios, getConvenioBySlug, defaultConvenio } from '../data/mockConvenioData';

const FIXED_CONFIG = {
  navbar: 'V3 - Banner de descuento',
  hero: 'V2 - Imagen de campus',
  benefits: 'V1 - Cards Grid',
  testimonials: 'V1 - Cards Grid 3 columnas',
  faq: 'V2 - Acordeón con iconos',
  cta: 'V6 - WhatsApp directo',
  footer: 'V2 - Minimalista centrado',
};

function ConvenioPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfig, setShowConfig] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get convenio from URL or use default
  const convenioSlug = searchParams.get('convenio');
  const initialConvenio = convenioSlug ? getConvenioBySlug(convenioSlug) : defaultConvenio;
  const [selectedConvenio, setSelectedConvenio] = useState(initialConvenio || defaultConvenio);

  const handleConvenioChange = (slug: string) => {
    const newConvenio = getConvenioBySlug(slug);
    if (newConvenio) {
      setSelectedConvenio(newConvenio);
      const params = new URLSearchParams(searchParams.toString());
      params.set('convenio', slug);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleGenerateUrl = () => {
    const params = new URLSearchParams();
    if (selectedConvenio.slug !== defaultConvenio.slug) {
      params.set('convenio', selectedConvenio.slug);
    }
    const queryString = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedConvenio(defaultConvenio);
    router.replace(window.location.pathname, { scroll: false });
  };

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        <ConvenioLanding convenio={selectedConvenio} />
        <FeedbackButton
          sectionId="convenio"
          config={{ ...FIXED_CONFIG, convenio: selectedConvenio.nombreCorto } as unknown as Record<string, unknown>}
        />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      <ConvenioLanding convenio={selectedConvenio} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_CONVENIO" version="0.5" />
        <Button
          isIconOnly
          radius="md"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
          onPress={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => setShowConfig(!showConfig)}
        >
          <Code className="w-5 h-5 text-neutral-600" />
        </Button>
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.5')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="fixed bottom-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm">
          <p className="text-xs text-neutral-500 mb-2">Configuración fija v0.5:</p>
          <div className="space-y-1 text-xs">
            {Object.entries(FIXED_CONFIG).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="text-neutral-400 capitalize">{key}:</span>
                <span className="font-mono text-neutral-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
              Configuración del Convenio
            </span>
          </ModalHeader>

          <ModalBody className="py-6 bg-white">
            <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
              Selecciona una institución educativa para ver su landing personalizada con colores y beneficios exclusivos.
            </p>

            {/* Selector de Convenio */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[#4654CD]" />
                <h3 className="font-semibold text-neutral-800">Institución Educativa</h3>
              </div>
              <RadioGroup
                value={selectedConvenio.slug}
                onValueChange={(val) => handleConvenioChange(val)}
                classNames={{ wrapper: 'gap-2' }}
              >
                {convenios.map((conv) => (
                  <Radio
                    key={conv.slug}
                    value={conv.slug}
                    classNames={{
                      base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          selectedConvenio.slug === conv.slug
                            ? 'border-[#4654CD] bg-[#4654CD]/5'
                            : 'border-neutral-200 hover:border-[#4654CD]/50'
                        }`,
                      wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                      labelWrapper: 'ml-2',
                      label: 'text-sm font-medium',
                      description: 'text-xs text-neutral-500',
                    }}
                    description={`${conv.tipo === 'universidad' ? 'Universidad' : 'Instituto'} · ${conv.descuentoCuota}% descuento en cuotas`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: conv.colorPrimario }}
                      />
                      {conv.nombre}
                    </span>
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Nota informativa */}
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-400">
                <span className="font-medium">Nota:</span> Los componentes de la landing (navbar, hero, benefits, etc.)
                están fijos en esta versión. Solo cambian los colores y contenido según el convenio.
              </p>
            </div>
          </ModalBody>

          <ModalFooter className="bg-white justify-between">
            <Button
              variant="flat"
              startContent={
                copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )
              }
              onPress={handleGenerateUrl}
              className={`cursor-pointer transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {copied ? '¡Copiado!' : 'Generar URL'}
            </Button>
            <Button
              variant="light"
              startContent={<RotateCcw className="w-4 h-4" />}
              onPress={handleReset}
              className="cursor-pointer"
            >
              Restablecer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#4654CD]" />
    </div>
  );
}

export default function ConvenioPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConvenioPreviewContent />
    </Suspense>
  );
}
