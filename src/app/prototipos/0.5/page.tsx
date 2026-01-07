"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@nextui-org/react";
import { Palette, Layers, Rocket, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { VersionNav } from "../_shared/components/VersionNav";
import { getVersionByNumber } from "../_registry";

const version = getVersionByNumber("0.5")!;

const sectionIcons: Record<string, React.ElementType> = {
  catalogo: Layers,
};

const statusStyles = {
  pending: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-200", label: "Pendiente" },
  in_progress: { icon: Rocket, color: "text-[#03DBD0]", bg: "bg-[#03DBD0]/20", label: "En desarrollo" },
  done: { icon: CheckCircle, color: "text-[#4654CD]", bg: "bg-[#4654CD]/20", label: "Completado" },
};

export default function Version05Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50">
      <VersionNav currentVersion="0.5" showSections={false} />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 text-[#4654CD] rounded-full text-sm mb-4">
            <Palette className="w-4 h-4" />
            <span>Versión {version.version}</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 mb-4">{version.title}</h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">{version.description}</p>
        </header>

        {/* Info Banner */}
        <section className="max-w-4xl mx-auto mb-8">
          <div className="bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 text-[#4654CD]" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Enfoque de esta versión</h3>
                <p className="text-sm text-neutral-600">
                  v0.5 itera sobre el catálogo de v0.4 con configuración fija, permitiendo solo iterar el
                  <strong> ColorSelector</strong> (V1 Dots / V2 Swatches). Incluye sistema de feedback
                  con screenshots para recolectar opiniones en modo presentación.
                </p>
              </div>
            </div>
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
            Secciones
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {version.sections.map((section) => {
              const IconComponent = sectionIcons[section.id] || Layers;
              const status = statusStyles[section.status];
              const StatusIcon = status.icon;
              const isClickable = section.status === 'done' || section.status === 'in_progress';

              const cardContent = (
                <CardBody className="p-5 flex flex-col">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-6 h-6 ${status.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">{section.name}</h3>
                  <p className="text-neutral-400 text-sm mb-3">#{section.promptNumber}</p>

                  {/* Status */}
                  <div className="mt-auto flex items-center gap-1.5">
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-sm ${status.color}`}>{status.label}</span>
                  </div>
                </CardBody>
              );

              if (isClickable) {
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

        {/* Quick Actions */}
        <section className="max-w-4xl mx-auto mt-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/prototipos/0.4"
              className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#4654CD] border border-neutral-200 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver versión anterior (0.4)
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-[#4654CD] hover:bg-[#3a47b3] text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              Volver al Home
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
