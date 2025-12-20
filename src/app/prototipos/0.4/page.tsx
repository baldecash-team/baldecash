"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@nextui-org/react";
import { AlertCircle, Layers, Rocket, ArrowLeft, CheckCircle, Keyboard, Command } from "lucide-react";
import { VersionNav } from "../_shared/components/VersionNav";
import { getVersionByNumber } from "../_registry";

const version = getVersionByNumber("0.4")!;

const sectionIcons: Record<string, React.ElementType> = {
  hero: Rocket,
  catalogo: Layers,
  detalle: Layers,
  comparador: Layers,
  quiz: Layers,
  estados: Layers,
  wizard: Layers,
  solicitud: Layers,
  upsell: Layers,
  aprobacion: Layers,
  rechazo: Layers,
  convenio: Layers,
};

const statusStyles = {
  pending: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-200", label: "Pendiente" },
  in_progress: { icon: Rocket, color: "text-[#03DBD0]", bg: "bg-[#03DBD0]/20", label: "En desarrollo" },
  done: { icon: CheckCircle, color: "text-[#4654CD]", bg: "bg-[#4654CD]/20", label: "Completado" },
};

export default function Version04Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50">
      <VersionNav currentVersion="0.4" showSections={false} />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 text-[#4654CD] rounded-full text-sm mb-4">
            <Rocket className="w-4 h-4" />
            <span>Version {version.version}</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 mb-4">{version.title}</h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">{version.description}</p>
        </header>

        {/* Progress Overview */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Progreso General</h2>
              <span className="text-[#4654CD] font-bold">
                {version.sections.filter(s => s.status === 'done').length} / {version.sections.length} secciones
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4654CD] transition-all duration-500"
                style={{ width: `${(version.sections.filter(s => s.status === 'done').length / version.sections.length) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* Sections Grid */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-400" />
            Secciones Planificadas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {version.sections.map((section) => {
              const IconComponent = sectionIcons[section.id] || Layers;
              const status = statusStyles[section.status];
              const StatusIcon = status.icon;
              const isDone = section.status === 'done';

              const cardContent = (
                <CardBody className="p-4 flex flex-col">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center mb-3`}>
                    <IconComponent className={`w-5 h-5 ${status.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-sm font-semibold text-neutral-900 mb-0.5">{section.name}</h3>
                  <p className="text-neutral-400 text-xs mb-2">#{section.promptNumber}</p>

                  {/* Status */}
                  <div className="mt-auto flex items-center gap-1">
                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span className={`text-xs ${status.color}`}>{status.label}</span>
                  </div>
                </CardBody>
              );

              if (isDone) {
                return (
                  <Card
                    key={section.id}
                    isPressable
                    onPress={() => router.push(section.path)}
                    className="bg-white border border-neutral-100 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer h-full"
                  >
                    {cardContent}
                  </Card>
                );
              }

              return (
                <Card
                  key={section.id}
                  className="bg-white border border-neutral-100 opacity-60 pointer-events-none"
                >
                  {cardContent}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Keyboard Shortcuts Guide */}
        <section className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#4654CD]" />
              Atajos de Teclado
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Usa estos atajos en el preview para cambiar versiones rápidamente sin abrir el modal.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Windows */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-600">⊞</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Windows / Linux</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Cambiar versión componente</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">1</kbd>
                      <span className="text-neutral-400">-</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">6</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Cambiar subrayado</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">Shift</kbd>
                      <span className="text-neutral-400">+</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">1-6</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Siguiente componente</span>
                    <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">Tab</kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Componente anterior</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">Shift</kbd>
                      <span className="text-neutral-400">+</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">Tab</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Abrir/cerrar config</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">?</kbd>
                      <span className="text-neutral-400">o</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">K</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-600">Cerrar modal</span>
                    <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* Mac */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Command className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-700">macOS</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Cambiar versión componente</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">1</kbd>
                      <span className="text-neutral-400">-</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">6</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Cambiar subrayado</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">⇧</kbd>
                      <span className="text-neutral-400">+</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">1-6</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Siguiente componente</span>
                    <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">⇥</kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Componente anterior</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">⇧</kbd>
                      <span className="text-neutral-400">+</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">⇥</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Abrir/cerrar config</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">?</kbd>
                      <span className="text-neutral-400">o</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">K</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-600">Cerrar modal</span>
                    <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-700">⎋</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-[#4654CD]/5 rounded-lg border border-[#4654CD]/10">
              <p className="text-xs text-[#4654CD]">
                <strong>Nota:</strong> Los atajos se desactivan automáticamente cuando escribes en campos de búsqueda o formularios.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="max-w-4xl mx-auto mt-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/prototipos/0.3"
              className="px-4 py-2 bg-[#4654CD] hover:bg-[#3a47b3] text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver versión anterior (0.3)
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#4654CD] border border-neutral-200 rounded-lg text-sm transition-colors"
            >
              Volver al Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
