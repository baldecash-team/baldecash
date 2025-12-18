"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, Layers, Monitor, ShoppingCart, FileText, Search, HelpCircle, AlertTriangle, Trophy, PackagePlus, PartyPopper, XCircle } from "lucide-react";
import { VersionNav } from "../_shared/components/VersionNav";
import { getVersionByNumber } from "../_registry";

const version = getVersionByNumber("0.3")!;

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Monitor,
  catalogo: ShoppingCart,
  detalle: Search,
  comparador: Layers,
  quiz: HelpCircle,
  estados: AlertTriangle,
  wizard: FileText,
  upsell: PackagePlus,
  aprobacion: PartyPopper,
  rechazo: XCircle,
};

const statusStyles = {
  pending: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-200", label: "Pendiente" },
  in_progress: { icon: Clock, color: "text-[#03DBD0]", bg: "bg-[#03DBD0]/20", label: "En desarrollo" },
  done: { icon: CheckCircle2, color: "text-[#4654CD]", bg: "bg-[#4654CD]/20", label: "Completado" },
};

export default function Version03Page() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <VersionNav currentVersion="0.3" showSections={false} />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 text-[#4654CD] rounded-full text-sm mb-4">
            <Layers className="w-4 h-4" />
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
            Secciones
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {version.sections.map((section) => {
              const IconComponent = sectionIcons[section.id] || Layers;
              const status = statusStyles[section.status];
              const StatusIcon = status.icon;
              const isClickable = section.status !== 'pending';

              const cardContent = (
                <Card
                  className={`bg-white border transition-all duration-300 w-full h-full ${
                    isClickable
                      ? 'border-neutral-200 hover:border-[#4654CD] hover:scale-[1.02] cursor-pointer shadow-sm'
                      : 'border-neutral-100 opacity-60'
                  }`}
                  isPressable={isClickable}
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

              return isClickable ? (
                <Link key={section.id} href={section.path} className="block w-full h-full">
                  {cardContent}
                </Link>
              ) : (
                <div key={section.id} className="w-full h-full">{cardContent}</div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="max-w-4xl mx-auto mt-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/prototipos/0.2"
              className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#4654CD] border border-neutral-200 rounded-lg text-sm transition-colors"
            >
              Ver version anterior (0.2)
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
