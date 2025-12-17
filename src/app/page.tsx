"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Laptop, Wallet, LayoutDashboard, Palette, Sparkles, Layers, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { VERSION_REGISTRY, LEGACY_PROTOTYPES, getVersionProgress, type VersionConfig } from "./prototipos/_registry";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop, Wallet, LayoutDashboard, Palette, Sparkles, Layers,
};

const statusConfig = {
  draft: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-500/20", label: "Borrador" },
  in_progress: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/20", label: "En desarrollo" },
  ready: { icon: CheckCircle2, color: "text-[#22c55e]", bg: "bg-[#22c55e]/20", label: "Listo" },
  archived: { icon: AlertCircle, color: "text-neutral-500", bg: "bg-neutral-500/20", label: "Archivado" },
};

function VersionCard({ version }: { version: VersionConfig }) {
  const IconComponent = iconMap[version.icon] || Layers;
  const progress = getVersionProgress(version);
  const status = statusConfig[version.status];
  const StatusIcon = status.icon;

  return (
    <Link href={`/prototipos/${version.version}`}>
      <Card className="bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full relative group" isPressable>
        {version.badge && (
          <div className="absolute top-4 right-4 z-10">
            <span className={`px-3 py-1 ${status.bg} ${status.color} text-xs font-semibold rounded-full`}>{version.badge}</span>
          </div>
        )}
        <CardHeader className="flex flex-col items-center pt-8">
          <div className="absolute top-4 left-4">
            <span className="text-2xl font-bold text-neutral-300">v{version.version}</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#4654CD] flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#4654CD] text-center">{version.title}</h2>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <p className="text-neutral-500 text-center text-sm mb-4">{version.description}</p>
          {version.sections.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#4654CD] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {version.sections.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {version.sections.slice(0, 4).map((section) => (
                <span key={section.id} className={`px-2 py-0.5 rounded text-xs ${section.status === 'done' ? 'bg-[#22c55e]/20 text-[#22c55e]' : section.status === 'in_progress' ? 'bg-amber-500/20 text-amber-500' : 'bg-neutral-100 text-neutral-500'}`}>
                  {section.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StatusIcon className={`w-4 h-4 ${status.color}`} />
              <span className={`text-xs ${status.color}`}>{status.label}</span>
            </div>
            <div className="flex items-center gap-1 text-[#4654CD] text-sm group-hover:gap-2 transition-all">
              <span>Explorar</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function LegacyCard({ proto }: { proto: typeof LEGACY_PROTOTYPES[0] }) {
  const IconComponent = iconMap[proto.icon] || Layers;
  return (
    <Link href={proto.href}>
      <Card className="bg-neutral-50 border border-neutral-200 hover:border-[#4654CD]/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full" isPressable>
        <CardHeader className="flex flex-row items-center gap-4 pt-6 px-6">
          <div className="w-12 h-12 rounded-xl bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-[#4654CD]" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800">{proto.title}</h3>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-0">
          <p className="text-neutral-500 text-sm">{proto.description}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

export default function Home() {
  const activeVersions = VERSION_REGISTRY.filter((v) => v.status !== 'archived');
  const latestVersion = activeVersions[activeVersions.length - 1];

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="font-['Baloo_2'] text-5xl font-bold text-[#4654CD] mb-4">
            BaldeCash<span className="text-[#03DBD0]">.com</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Prototipos UI/UX para Financiamiento Estudiantil en Perú
          </p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <span className="px-3 py-1 bg-[#4654CD]/10 text-[#4654CD] rounded-full text-sm">NextUI</span>
            <span className="px-3 py-1 bg-[#22c55e]/10 text-[#22c55e] rounded-full text-sm">DaisyUI</span>
            <span className="px-3 py-1 bg-[#03DBD0]/10 text-[#03DBD0] rounded-full text-sm">Shadcn</span>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#4654CD]/20" />
            <h2 className="text-lg font-medium text-[#4654CD] flex items-center gap-2">
              <Sparkles className="w-5 h-5" />Última Versión
            </h2>
            <div className="h-px flex-1 bg-[#4654CD]/20" />
          </div>
          <div className="max-w-xl mx-auto">
            <VersionCard version={latestVersion} />
          </div>
        </section>

        {activeVersions.length > 1 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-neutral-300" />
              <h2 className="text-lg font-medium text-neutral-500 flex items-center gap-2">
                <Layers className="w-5 h-5" />Versiones Anteriores
              </h2>
              <div className="h-px flex-1 bg-neutral-300" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {activeVersions.slice(0, -1).reverse().map((version) => (
                <VersionCard key={version.version} version={version} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-neutral-200" />
            <h2 className="text-sm font-medium text-neutral-400">Prototipos Independientes</h2>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {LEGACY_PROTOTYPES.map((proto) => (
              <LegacyCard key={proto.id} proto={proto} />
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center text-neutral-500">
          <p>Diseño Mobile-First basado en estudio UI/UX - Diciembre 2025</p>
          <p className="mt-2 text-sm">KPIs Objetivo: &gt;70% completitud, &lt;3 min aplicación, 40-50% attach rate</p>
        </footer>
      </div>
    </main>
  );
}
