"use client";

import Link from "next/link";
import { Card, CardBody } from "@nextui-org/react";
import { AlertCircle, Clock, Layers, Rocket, ArrowLeft } from "lucide-react";
import { VersionNav } from "../_shared/components/VersionNav";
import { getVersionByNumber } from "../_registry";

const version = getVersionByNumber("0.4")!;

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

const statusStyles = {
  pending: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-200", label: "Pendiente" },
  in_progress: { icon: Clock, color: "text-[#03DBD0]", bg: "bg-[#03DBD0]/20", label: "En desarrollo" },
  done: { icon: Layers, color: "text-[#4654CD]", bg: "bg-[#4654CD]/20", label: "Completado" },
};

export default function Version04Page() {
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

        {/* Coming Soon Banner */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] rounded-2xl p-8 text-white text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
            <p className="text-white/80 max-w-md mx-auto">
              Esta versión está en desarrollo. Las secciones estarán disponibles pronto con mejoras y optimizaciones basadas en los aprendizajes de la v0.3.
            </p>
          </div>
        </section>

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

              return (
                <Card
                  key={section.id}
                  className="bg-white border border-neutral-100 opacity-60 pointer-events-none"
                >
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
                </Card>
              );
            })}
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
