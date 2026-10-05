'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import {
  Shield,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  AlertTriangle,
  FileText,
  Clock,
  Info,
  ArrowRight,
} from 'lucide-react';
import { SegurosNavbar } from './SegurosNavbar';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baldecash.com';

type CoverageType = 'robo' | 'garantia';

const coverageTabs: { id: CoverageType; label: string; icon: React.ElementType }[] = [
  { id: 'robo', label: 'Seguro contra Robo', icon: ShieldCheck },
  { id: 'garantia', label: 'Garantía Extendida', icon: Wrench },
];

const coverageData: Record<
  CoverageType,
  {
    title: string;
    subtitle: string;
    intro: string;
    covers: string[];
    notCovers: string[];
    process: { step: string; description: string }[];
    docs: string[];
    note?: string;
  }
> = {
  robo: {
    title: 'Seguro contra Robo',
    subtitle: 'Protege tu equipo financiado ante apropiaciones ilegales',
    intro:
      'Cubre el robo o hurto de tu equipo durante la vigencia del contrato. La respuesta puede ser reposición o reparación según corresponda, sin deducible y según el valor del equipo asegurado.',
    covers: [
      'Apropiación ilegal del equipo asegurado',
      'Reposición o reparación según corresponda',
      'Sin deducible ni copago',
      'Vigencia alineada al contrato BaldeCash',
    ],
    notCovers: [
      'Delitos cometidos por el asegurado o con cómplices',
      'Pérdida o extravío del equipo',
      'Equipo bajo custodia no autorizada',
      'Robo de accesorios sin el equipo principal',
      'Robo en vehículo sin cerrar ni alarmar',
      'Equipo en tránsito por terceros (excepto traslado personal)',
      'Desastres naturales, guerra, terrorismo o disturbios',
    ],
    process: [
      {
        step: 'Reporta el evento',
        description: 'Comunícate con Insurama dentro de los 3 días hábiles siguientes al robo.',
      },
      {
        step: 'Envía la documentación',
        description: 'Adjunta el contrato BaldeCash y la denuncia policial original.',
      },
      {
        step: 'Validación',
        description: 'Insurama y La Positiva validan tu reclamo en hasta 30 días hábiles.',
      },
      {
        step: 'Reposición o reparación',
        description: 'Recibe tu equipo de reemplazo o la reparación según corresponda.',
      },
    ],
    docs: [
      'Contrato BaldeCash',
      'Denuncia policial original',
      'Copia de DNI',
      'Datos del equipo (marca, modelo, número de serie)',
    ],
    note:
      'También puedes contratar un seguro con otro proveedor siempre que cumpla los mínimos: cobertura de robo y hurto, suma asegurada adecuada y vigencia equivalente a la del contrato.',
  },
  garantia: {
    title: 'Garantía Extendida',
    subtitle: 'Extiende la protección del fabricante por defectos de fábrica',
    intro:
      'Amplía la cobertura del fabricante para defectos de fábrica que impidan el funcionamiento del equipo. Aplica una vez vencida la garantía del fabricante y se puede contratar hasta 6 meses antes de su vencimiento.',
    covers: [
      'Defectos de fábrica que impiden el correcto funcionamiento',
      'Reposición por equipo igual, similar o de mejores características',
      'Aplica al vencer la garantía del fabricante',
      'Contratable hasta 6 meses antes del vencimiento',
    ],
    notCovers: [
      'Mal uso, negligencia o accidentes',
      'Modificaciones no autorizadas',
      'Daños estéticos (rayones, desgaste normal)',
      'Reinstalación de software (excepto SO de fábrica)',
      'Pérdida de datos',
      'Daños intencionales',
      'Defectos cubiertos por el fabricante',
    ],
    process: [
      {
        step: 'Reporta el caso',
        description: 'Comunícate con Insurama apenas detectes el defecto.',
      },
      {
        step: 'Coordina la entrega',
        description: 'Coordina la entrega del equipo para verificación técnica.',
      },
      {
        step: 'Respuesta en 2 días',
        description: 'Insurama responde en hasta 2 días hábiles tras la verificación.',
      },
      {
        step: 'Reposición',
        description: 'Recibe tu equipo de reemplazo (siempre que tus pagos estén al día).',
      },
    ],
    docs: [
      'Evidencia del evento (partes dañadas)',
      'Copia de DNI',
      'Copia del contrato BaldeCash',
      'Factura del equipo',
      'Garantía del fabricante',
      'Datos del equipo (marca, modelo, número de serie)',
    ],
  },
};

const partners = [
  {
    role: 'Canal de promoción',
    name: 'BaldeCash',
    description: 'Promociona y facilita la contratación durante tu solicitud de financiamiento.',
    contact: [
      { icon: Phone, label: '+51 915 236 029', href: 'tel:+51915236029' },
      { icon: Mail, label: 'prestamos@baldecash.com', href: 'mailto:prestamos@baldecash.com' },
    ],
  },
  {
    role: 'Corredor de seguros',
    name: 'Insurama Broker Perú',
    description: 'Intermedia y gestiona la contratación, atención y trámite de siniestros.',
    contact: [
      { icon: Phone, label: '(01) 705-6341', href: 'tel:+5117056341' },
      { icon: Mail, label: 'info@insur.com.pe', href: 'mailto:info@insur.com.pe' },
      { icon: Globe, label: 'insurama.pe', href: 'https://insurama.pe/' },
    ],
  },
  {
    role: 'Compañía de seguros',
    name: 'La Positiva Seguros y Reaseguros',
    description: 'Emite las pólizas y asume la cobertura de los siniestros validados.',
    contact: [],
  },
];

const faqs = [
  {
    question: '¿Es obligatorio contratar el seguro?',
    answer:
      'Depende de tu evaluación. La obligatoriedad se determina por criterios objetivos y verificables; no se consideran características personales protegidas.',
  },
  {
    question: '¿Qué pasa con mi cobertura si me atraso en los pagos?',
    answer:
      'La cobertura continúa según los términos de la póliza. Si necesitas tramitar un reclamo, BaldeCash entregará la documentación requerida una vez regularizados los pagos.',
  },
  {
    question: '¿Puedo contratar la garantía extendida después de comprar mi equipo?',
    answer:
      'Sí. Puedes contratarla durante la vigencia de tu contrato o hasta 6 meses antes de que venza la garantía del fabricante.',
  },
  {
    question: '¿BaldeCash es una compañía de seguros?',
    answer:
      'No. BaldeCash es solo el canal de promoción. La intermediación está a cargo de Insurama Broker Perú y las pólizas son emitidas por La Positiva Seguros y Reaseguros.',
  },
  {
    question: '¿Puedo contratar el seguro con otra aseguradora?',
    answer:
      'Sí, siempre que el seguro cumpla los requisitos mínimos: cobertura contra robo y hurto, suma asegurada adecuada al valor del equipo y vigencia equivalente al contrato BaldeCash.',
  },
  {
    question: '¿Qué información recibo antes de contratar?',
    answer:
      'Antes de firmar recibes el detalle de coberturas, suma asegurada, prima comercial, exclusiones y la documentación de la póliza (certificado, condiciones e informes resumidos) según los protocolos de Insurama.',
  },
];

export default function SegurosPage() {
  const [activeTab, setActiveTab] = useState<CoverageType>('robo');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const coverage = coverageData[activeTab];

  return (
    <div className="min-h-screen bg-white">
      <SegurosNavbar />

      {/* Spacer for fixed navbar (sin barra promocional) */}
      <div className="h-16" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#4654CD] to-[#3a47b3] text-white">
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#03DBD0]/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-white/15 border border-white/20 mb-5',
                content: 'text-white text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Protección para tu equipo
            </Chip>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Seguros y garantía extendida para tu equipo
            </h1>
            <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-2xl">
              Protege tu laptop, tablet o celular durante toda la vigencia de tu contrato.
              Cobertura sin deducible, reposición o reparación, y atención a cargo de Insurama y La
              Positiva Seguros.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                as="a"
                href="#coberturas"
                size="lg"
                radius="lg"
                className="bg-white text-[#4654CD] font-semibold cursor-pointer hover:bg-neutral-100"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Ver coberturas
              </Button>
              <Button
                as="a"
                href="#participantes"
                size="lg"
                radius="lg"
                variant="bordered"
                className="border-white/40 text-white font-semibold cursor-pointer hover:bg-white/10"
              >
                Conocer participantes
              </Button>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex items-start gap-3 bg-white/10 border border-white/20 rounded-xl p-4 max-w-3xl backdrop-blur-sm"
          >
            <Info className="w-5 h-5 text-[#03DBD0] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/90">
              <span className="font-semibold">BaldeCash no es una compañía de seguros.</span> La
              intermediación es realizada por <strong>Insurama Broker Perú</strong> y las pólizas
              son emitidas por <strong>La Positiva Seguros y Reaseguros</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Beneficios resumen */}
      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Sin deducible',
                description: 'No pagas copago al activar tu cobertura.',
              },
              {
                icon: Wrench,
                title: 'Reposición o reparación',
                description: 'Según corresponda al evento y al equipo.',
              },
              {
                icon: Clock,
                title: 'Validación rápida',
                description: 'Hasta 30 días hábiles para casos de robo.',
              },
              {
                icon: FileText,
                title: 'Transparencia total',
                description: 'Recibes coberturas, primas y exclusiones antes de firmar.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4654CD]/10 flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6 text-[#4654CD]" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coberturas */}
      <section id="coberturas" className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 mb-4',
                content: 'text-[#4654CD] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Coberturas disponibles
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Elige la protección que necesitas
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Dos productos diseñados para acompañarte durante toda la vida útil de tu equipo
              financiado.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:bg-white sm:border sm:border-neutral-200 sm:rounded-2xl sm:p-1 max-w-2xl mx-auto mb-8">
            {coverageTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4654CD] text-white shadow-md'
                      : 'bg-white sm:bg-transparent text-neutral-600 hover:text-[#4654CD] border border-neutral-200 sm:border-0'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-10"
            >
              <div className="mb-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
                  {coverage.title}
                </h3>
                <p className="text-[#4654CD] font-medium mb-4">{coverage.subtitle}</p>
                <p className="text-neutral-600 leading-relaxed max-w-3xl">{coverage.intro}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Covers */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-neutral-900">Qué cubre</h4>
                  </div>
                  <ul className="space-y-3">
                    {coverage.covers.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Not covers */}
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-neutral-900">Qué no cubre</h4>
                  </div>
                  <ul className="space-y-3">
                    {coverage.notCovers.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Process */}
              <div className="mb-10">
                <h4 className="font-bold text-neutral-900 mb-5 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4654CD]" />
                  Cómo activar tu cobertura
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {coverage.process.map((step, idx) => (
                    <div
                      key={step.step}
                      className="relative bg-neutral-50 rounded-xl p-5 border border-neutral-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#4654CD] text-white text-sm font-bold flex items-center justify-center mb-3">
                        {idx + 1}
                      </div>
                      <h5 className="font-semibold text-neutral-900 text-sm mb-1">{step.step}</h5>
                      <p className="text-xs text-neutral-500 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required docs */}
              <div className="bg-[#4654CD]/5 border border-[#4654CD]/15 rounded-xl p-6">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4654CD]" />
                  Documentación requerida
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {coverage.docs.map((doc) => (
                    <div key={doc} className="flex items-center gap-2 text-sm text-neutral-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4654CD] flex-shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {coverage.note && (
                <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">{coverage.note}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Transparencia */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Chip
                radius="sm"
                classNames={{
                  base: 'bg-[#03DBD0]/15 mb-4',
                  content: 'text-[#0a8c83] text-xs font-semibold tracking-wide uppercase',
                }}
              >
                Transparencia
              </Chip>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                Toda la información antes de contratar
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Antes de firmar recibes el detalle completo de tu cobertura, suma asegurada, prima
                comercial y exclusiones. La documentación contractual (póliza o certificado,
                condiciones e informes resumidos) se entrega siguiendo los protocolos de Insurama.
              </p>
              <ul className="space-y-3">
                {[
                  'Detalle de coberturas y exclusiones',
                  'Suma asegurada y prima comercial',
                  'Póliza, certificado y condiciones',
                  'Resumen informativo claro y simple',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-neutral-700">
                    <div className="w-6 h-6 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4654CD]" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#4654CD]/10 to-[#03DBD0]/10 rounded-3xl" />
              <div className="relative bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-[#4654CD] flex items-center justify-center mb-5">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  ¿Qué incluye tu documentación?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                    <span className="text-neutral-600">Detalle de coberturas</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                    <span className="text-neutral-600">Suma asegurada</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                    <span className="text-neutral-600">Prima comercial</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                    <span className="text-neutral-600">Exclusiones</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-start justify-between py-3">
                    <span className="text-neutral-600">Póliza / certificado</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Participantes */}
      <section id="participantes" className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 mb-4',
                content: 'text-[#4654CD] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Quiénes participan
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Una red especializada respaldando tu equipo
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Cada actor cumple un rol claro: BaldeCash promueve, Insurama intermedia y La Positiva
              asume la cobertura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col"
              >
                <Chip
                  radius="sm"
                  classNames={{
                    base: 'bg-[#4654CD]/10 mb-4 self-start',
                    content: 'text-[#4654CD] text-[10px] font-bold tracking-wider uppercase',
                  }}
                >
                  {partner.role}
                </Chip>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-neutral-500 mb-5 flex-1">{partner.description}</p>
                {partner.contact.length > 0 && (
                  <ul className="space-y-2 pt-4 border-t border-neutral-100">
                    {partner.contact.map((c) => (
                      <li key={c.label}>
                        <a
                          href={c.href}
                          target={c.href.startsWith('http') ? '_blank' : undefined}
                          rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2 text-sm text-neutral-700 hover:text-[#4654CD] transition-colors"
                        >
                          <c.icon className="w-4 h-4 text-[#4654CD]" />
                          <span>{c.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 mb-4',
                content: 'text-[#4654CD] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Preguntas frecuentes
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Resolvemos tus dudas más comunes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen ? 'border-[#4654CD] bg-[#4654CD]/5' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                  >
                    <span className="font-semibold text-neutral-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#4654CD] flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-[#4654CD] text-white">
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#03DBD0]/40 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Protege tu equipo desde el primer día
              </h2>
              <p className="text-white/85 text-lg">
                Solicita tu financiamiento y agrega tu seguro al momento de armar tu solicitud.
                Tranquilidad para ti, respaldo para tu equipo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button
                as="a"
                href={`${SITE_URL}/home`}
                size="lg"
                radius="lg"
                className="bg-white text-[#4654CD] font-semibold cursor-pointer hover:bg-neutral-100"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Solicitar financiamiento
              </Button>
              <Button
                as="a"
                href="tel:+5117056341"
                size="lg"
                radius="lg"
                variant="bordered"
                className="border-white/40 text-white font-semibold cursor-pointer hover:bg-white/10"
                startContent={<Phone className="w-4 h-4" />}
              >
                (01) 705-6341
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
