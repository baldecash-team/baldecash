"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody, Switch } from "@nextui-org/react";
import { AlertCircle, Layers, Rocket, ArrowLeft, CheckCircle, Keyboard, Command, SearchX, Presentation, Settings2 } from "lucide-react";
import { VersionNav } from "../_shared/components/VersionNav";
import { getVersionByNumber } from "../_registry";

const version = getVersionByNumber("0.4")!;

// Presentation mode paths (optimized versions with mode=clean)
// Versiones seleccionadas documentadas en CLAUDE.md
const presentationPaths: Record<string, string> = {
  // Hero: Navbar V6, Hero V2, Social V1+V3, How V5, CTA V4, FAQ V2, Footer V2+V3
  hero: "/prototipos/0.4/hero/hero-preview?navbar=6&hero=2&social=1&how=5&cta=4&faq=2&footer=2&mode=clean",
  // Catalogo: Layout V4 desktop/V3 mobile, Brand V3, Card V6, TechFilters V3, 4 cols, Skeleton V2, LoadMore V3, Gallery V2, Size V3, Tags V1
  catalogo: "/prototipos/0.4/catalogo/catalog-preview?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=2&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1&pricingoptions=false&mode=clean",
  // Detalle: Header V3, Gallery V1, Tabs V1, Specs V2, Pricing V4, Cronograma V2, Similar V2, Limitations V6, Certifications V1
  detalle: "/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean",
  // Comparador: Layout V1, Access V1, MaxProducts V3, Fields V2, Highlight V1, PriceDiff V4, DiffHighlight V5, CardStyle V3
  comparador: "/prototipos/0.4/comparador/comparator-preview?layout=1&access=1&maxproducts=3&fields=2&highlight=1&pricediff=4&diffhighlight=5&cardstyle=3&mode=clean",
  // Quiz: Layout V5 desktop / V4 mobile
  quiz: "/prototipos/0.4/quiz/quiz-preview?layout=5&mode=clean",
  // Estados vacios: Illustration V5, Actions V6
  estados: "/prototipos/0.4/catalogo/empty-preview?illustration=5&actions=6&mode=clean",
  // Wizard: Input V4, Options V2, Progress V1, Navigation V1
  'wizard-solicitud': "/prototipos/0.4/wizard-solicitud/wizard-preview?input=4&options=2&progress=1&navigation=1&mode=clean",
  // Upsell: Modulo separado
  upsell: "/prototipos/0.4/upsell/upsell-preview?mode=clean",
  // Aprobacion: Celebration V1, Confetti V1, Sound V2, Summary V1, Time V3, Share V6, Referrals V1
  aprobacion: "/prototipos/0.4/resultado/aprobado-preview?celebration=1&confetti=1&sound=2&summary=1&time=3&share=6&referrals=1&mode=clean",
  // Rechazo/Pendiente: Mismo que aprobacion pero estado diferente
  rechazo: "/prototipos/0.4/resultado/rechazado-preview?mode=clean",
  // Convenio: Navbar V3 con CTA V4, Hero V2, Benefits V1, Testimonials V1, FAQ V2, CTA V6, Footer V2+V3
  convenio: "/prototipos/0.4/convenio/convenio-preview?navbar=3&hero=2&benefits=1&testimonials=1&faq=2&cta=6&footer=2&mode=clean",
};

// Configuration mode paths (V1 defaults, no mode=clean)
const configPaths: Record<string, string> = {
  hero: "/prototipos/0.4/hero/hero-preview?navbar=1&hero=1&social=1&how=1&cta=1&faq=1&footer=1",
  catalogo: "/prototipos/0.4/catalogo/catalog-preview?layout=1&brand=1&card=1&techfilters=1&cols=3&skeleton=1&duration=default&loadmore=1&gallery=1&gallerysize=3&tags=1&pricingoptions=false",
  detalle: "/prototipos/0.4/producto/detail-preview?infoHeader=1&gallery=1&tabs=1&specs=1&pricing=1&cronograma=1&similar=1&limitations=1&certifications=1",
  comparador: "/prototipos/0.4/comparador/comparator-preview?layout=1&access=1&maxproducts=4&fields=1&highlight=1&pricediff=1&diffhighlight=1&cardstyle=1",
  quiz: "/prototipos/0.4/quiz/quiz-preview",
  estados: "/prototipos/0.4/catalogo/empty-preview?illustration=1&actions=1",
  'wizard-solicitud': "/prototipos/0.4/wizard-solicitud/wizard-preview?input=1&options=1&progress=1&navigation=1",
  upsell: "/prototipos/0.4/upsell/upsell-preview",
  aprobacion: "/prototipos/0.4/resultado/aprobado-preview",
  rechazo: "/prototipos/0.4/resultado/rechazado-preview",
  convenio: "/prototipos/0.4/convenio/convenio-preview?navbar=1&hero=1&benefits=1&testimonials=1&faq=1&cta=1&footer=1",
};

const sectionIcons: Record<string, React.ElementType> = {
  hero: Rocket,
  catalogo: Layers,
  detalle: Layers,
  comparador: Layers,
  quiz: Layers,
  estados: SearchX,
  'wizard-solicitud': Layers,
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
  const [isPresentationMode, setIsPresentationMode] = useState(true);

  const getSectionPath = (section: { id: string; path: string }) => {
    const paths = isPresentationMode ? presentationPaths : configPaths;
    return paths[section.id] || section.path;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <VersionNav currentVersion="0.4" showSections={false} />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 text-[#4654CD] rounded-full text-sm mb-4">
            <Rocket className="w-4 h-4" />
            <span>Versión {version.version}</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 mb-4">{version.title}</h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">{version.description}</p>
        </header>

        {/* Mode Switch */}
        <section className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPresentationMode ? (
                  <div className="w-10 h-10 rounded-xl bg-[#4654CD] flex items-center justify-center">
                    <Presentation className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-neutral-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {isPresentationMode ? "Modo Presentación" : "Modo Configuración"}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {isPresentationMode
                      ? "Versiones optimizadas sin controles de configuración"
                      : "Todas las versiones V1 con controles visibles"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${!isPresentationMode ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  Config
                </span>
                <Switch
                  isSelected={isPresentationMode}
                  onValueChange={setIsPresentationMode}
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-[#4654CD]",
                  }}
                />
                <span className={`text-sm font-medium ${isPresentationMode ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  Presentación
                </span>
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
            Secciones Planificadas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {version.sections.map((section) => {
              const IconComponent = sectionIcons[section.id] || Layers;
              const status = statusStyles[section.status];
              const StatusIcon = status.icon;
              const isClickable = section.status === 'done' || section.status === 'in_progress';

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

              if (isClickable) {
                return (
                  <Card
                    key={section.id}
                    isPressable
                    onPress={() => router.push(getSectionPath(section))}
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
