'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import {
  HeartPulse,
  Scale,
  Laptop,
  ShieldCheck,
  Users,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Info,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { SegurosNavbar } from '../seguros/SegurosNavbar';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baldecash.com';

type AssistanceType = 'medica' | 'legal' | 'tecno';

interface AssistanceService {
  num: string;
  title: string;
  description: string;
  limit: string;
  paid?: boolean;
  note?: string;
}

const assistanceTabs: { id: AssistanceType; label: string; icon: React.ElementType }[] = [
  { id: 'medica', label: 'Médica', icon: HeartPulse },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'tecno', label: 'Tecnológica', icon: Laptop },
];

const assistanceData: Record<
  AssistanceType,
  {
    title: string;
    subtitle: string;
    intro: string;
    covers: string[];
    notCovers: string[];
    servicesLabel: string;
    services: AssistanceService[];
  }
> = {
  medica: {
    title: 'Asistencia médica',
    subtitle: 'Orientación, atención y traslado médico para ti y tu familia',
    intro:
      'Ocho servicios de salud disponibles por teléfono o a domicilio, con topes y copagos claros en cada caso.',
    covers: [
      'Orientación médica telefónica sin límite de eventos',
      'Telemedicina, traslado en ambulancia y médico a domicilio',
      'Envío de laboratorio y medicamentos en conexión',
      'Referencias médicas y apoyo psicológico',
    ],
    notCovers: [
      'Accidentes en deportes de alto riesgo o competencias',
      'Estado de ebriedad o bajo efecto de drogas',
      'Intento de autolesión',
      'Servicios contratados sin autorización previa de A365',
    ],
    servicesLabel: 'Desglose de los 8 servicios',
    services: [
      {
        num: '01',
        title: 'Orientación médica telefónica',
        description:
          'Enlace telefónico con un médico para consultas que no sean emergencias. Baldecash no responde por el diagnóstico o tratamiento.',
        limit: 'Sin costo · Sin límite',
      },
      {
        num: '02',
        title: 'Telemedicina con médico general',
        description:
          'Consulta por videollamada en consultorio virtual. No otorga descansos médicos.',
        limit: 'Sin costo · Máx. 6 eventos/año',
        note: 'Agenda 24/7 · atención de 8 a.m. a 6 p.m.',
      },
      {
        num: '03',
        title: 'Traslado médico (ambulancia)',
        description:
          'Ante enfermedad grave o accidente que requiera estabilización o traslado de emergencia.',
        limit: 'Hasta S/450 · Máx. 2 eventos',
        paid: true,
      },
      {
        num: '04',
        title: 'Envío de médico a domicilio',
        description:
          'Evaluación médica general en el domicilio, sujeta a infraestructura disponible. No incluye medicinas.',
        limit: 'Copago S/45 · Máx. 4 eventos',
        paid: true,
      },
      {
        num: '05',
        title: 'Análisis de laboratorio a domicilio',
        description:
          'Recojo de muestra y entrega de resultados cuando el médico a domicilio lo indique.',
        limit: 'En conexión · Sin límite',
        note: 'Costo asumido por el afiliado.',
      },
      {
        num: '06',
        title: 'Envío de medicamentos de farmacia',
        description: 'Entrega en domicilio de medicamentos recetados en la visita médica.',
        limit: 'En conexión · Sin límite',
        note: 'Costo asumido por el afiliado.',
      },
      {
        num: '07',
        title: 'Referencias de especialistas y clínicas',
        description:
          'Información y contacto de especialistas, clínicas y hospitales. No incluye diagnóstico ni honorarios.',
        limit: 'Sin costo · Sin límite',
      },
      {
        num: '08',
        title: 'Orientación psicológica telefónica',
        description:
          'Apoyo telefónico ante eventos traumáticos: acoso escolar, problemas familiares, despidos, entre otros.',
        limit: 'Sin costo · Máx. 2 eventos',
        note: 'Hasta 45 minutos por sesión.',
      },
    ],
  },
  legal: {
    title: 'Asistencia legal',
    subtitle: 'Orientación telefónica en materia civil, penal y familiar',
    intro:
      'Un servicio de asesoría legal telefónica, disponible las 24 horas los 365 días del año.',
    covers: [
      'Orientación en divorcios, sucesiones y pensiones alimenticias',
      'Orientación sobre cobro de cheques o pagarés',
    ],
    notCovers: [
      'Honorarios o gestiones del abogado contratado por el afiliado',
      'Resultado de procesos judiciales',
    ],
    servicesLabel: 'Desglose del servicio',
    services: [
      {
        num: '09',
        title: 'Asesoría legal telefónica',
        description:
          'Referencia y consultoría legal telefónica sobre divorcios, sucesiones, pensiones alimenticias, cobro de cheques o pagarés, entre otros. A365 no responde por el resultado de gestiones del abogado que el afiliado contrate directamente.',
        limit: 'Sin costo · Sin límite',
        note: 'Gastos por servicios profesionales de abogado a cargo del afiliado.',
      },
    ],
  },
  tecno: {
    title: 'Asistencia tecnológica',
    subtitle: 'Soporte para tu equipo financiado y tus otros dispositivos',
    intro:
      'Seis servicios de soporte técnico telefónico y a domicilio para tu laptop, PC, tablet o smartphone.',
    covers: [
      'Atención telefónica y diagnóstico sin límite de eventos',
      'Medición de señal WiFi en conexión',
      'Visita técnica a domicilio con copago',
      'Configuración remota de software y periféricos',
    ],
    notCovers: [
      'Licencias, software o accesos que requiera el afiliado',
      'Piezas o accesorios instalados en la visita técnica',
      'Garantía extendida sobre piezas cambiadas',
    ],
    servicesLabel: 'Desglose de los 6 servicios',
    services: [
      {
        num: '10',
        title: 'Atención telefónica tecnológica',
        description:
          'Instalación de software, uso básico de Office/Windows, consultas de software y hardware. Solo un equipo.',
        limit: 'Sin costo · Sin límite',
        note: 'Horario: 8 a.m. a 7 p.m., los 7 días.',
      },
      {
        num: '11',
        title: 'Diagnóstico y asesoramiento telefónico',
        description: 'Orientación para problemas en PC, laptop, tablet o smartphone.',
        limit: 'Sin costo · Sin límite',
      },
      {
        num: '12',
        title: 'Medición de calidad de señal WiFi',
        description:
          'Visita de un técnico de redes para verificar la conexión y medir la señal.',
        limit: 'En conexión · Sin límite',
        note: 'Repetidor a costo del cliente, si se requiere.',
      },
      {
        num: '13',
        title: 'Visita de técnico a domicilio',
        description:
          'Instalación, limpieza, cambio de partes básicas, configuración de periféricos, formateo e instalación de software estándar.',
        limit: 'Copago S/60 · Máx. 2 eventos',
        paid: true,
      },
      {
        num: '14',
        title: 'Configuración de periféricos y antispyware',
        description:
          'Orientación telefónica para conectar un periférico o instalar un antispyware.',
        limit: 'Sin costo · Sin límite',
      },
      {
        num: '15',
        title: 'Configuración de software vía telefónica',
        description: 'Asistencia remota para configuración básica de programas estándar.',
        limit: 'Sin costo · Sin límite',
        note: 'Licencias y accesos a cargo del afiliado.',
      },
    ],
  },
};

const features = [
  {
    icon: ShieldCheck,
    title: 'Sin costo por activación',
    description: 'Solo pagas la prima por crédito, sin cargos por usar el servicio.',
  },
  {
    icon: Users,
    title: 'Hasta 4 personas cubiertas',
    description: 'Titular, cónyuge, hijos menores de 18 o padres del mismo domicilio.',
  },
  {
    icon: Clock,
    title: 'Atención 24/7/365',
    description: 'Central disponible todos los días del año, en Lima y provincias.',
  },
  {
    icon: FileText,
    title: 'Transparencia total',
    description: 'Conoces coberturas, límites y exclusiones antes de contratar.',
  },
];

const steps = [
  {
    title: 'Llama a la central',
    description: 'Comunícate al (01) 625-3757, disponible los 365 días del año, Lima y provincias.',
  },
  {
    title: 'Identifícate',
    description: 'Indica tus datos para que A365 valide tu vigencia como afiliado.',
  },
  {
    title: 'Coordinación',
    description: 'A365 gestiona el servicio con su central o su red de proveedores autorizados.',
  },
  {
    title: 'Atención',
    description: 'Recibes el servicio según los términos, límites y copagos de cada cobertura.',
  },
];

const requiredData = [
  'Nombre y apellidos*',
  'DNI*',
  'Dirección y teléfono',
  'Tipo de servicio requerido',
];

const responsables = [
  {
    role: 'Canal de facilitación',
    name: 'BaldeCash',
    highlight: false,
    points: [
      'Ofrece el acceso a Multiasistencia junto con tu solicitud de financiamiento.',
      'Habilita a A365 el listado de afiliados vigentes.',
      'No coordina, no supervisa y no ejecuta ninguno de los 15 servicios.',
      'No responde por el diagnóstico, tratamiento, consejo, calidad o resultado de ningún servicio.',
    ],
    contact: [
      { icon: Phone, label: '+51 908 849 330', href: 'tel:+51908849330' },
      {
        icon: Mail,
        label: 'soportealestudiante@baldecash.com',
        href: 'mailto:soportealestudiante@baldecash.com',
      },
    ],
  },
  {
    role: 'Prestador y responsable del servicio',
    name: 'Impulsa365 S.A.C. (A365)',
    highlight: true,
    points: [
      'Opera la central de asistencias y coordina la red de proveedores.',
      'Responde por la calidad, oportunidad y resultado de cada servicio.',
      'Asume los reembolsos autorizados y gestiona los reclamos.',
      'Puede prestar directamente o a través de terceros, bajo su propia responsabilidad.',
    ],
    contact: [
      { icon: Phone, label: '(01) 625-3757', href: 'tel:+51016253757' },
      {
        icon: Mail,
        label: 'gestiondereclamos@a365.com.pe',
        href: 'mailto:gestiondereclamos@a365.com.pe',
      },
    ],
  },
];

const geoCoverage = [
  {
    title: 'Lima Metropolitana, Callao y balnearios',
    items: [
      'Norte: hasta Puente Piedra.',
      'Sur: hasta Lurín (hasta el km 140 de la Panamericana Sur, de enero a marzo).',
      'Este: hasta Chaclacayo, San Juan de Lurigancho y Chosica (puente Los Ángeles).',
      'Oeste: La Punta — Callao.',
    ],
  },
  {
    title: 'Provincias',
    items: [
      'Cobertura en los 24 departamentos del país.',
      'Atención hasta 30 km a la redonda desde la plaza de armas de cada ciudad.',
    ],
  },
];

const claims = [
  {
    badge: 'Sobre el servicio',
    title: 'Va directo a A365',
    description:
      'La llamada no fue atendida, el técnico no llegó, el copago cobrado no corresponde, o el resultado fue deficiente, negligente o doloso.',
    accent: 'a365' as const,
    contact: ['(01) 625-3757', 'gestiondereclamos@a365.com.pe'],
  },
  {
    badge: 'Sobre el cobro o la activación',
    title: 'Va a BaldeCash',
    description:
      'La prima cobrada, la vigencia del crédito, o la inclusión y exclusión del listado de afiliados habilitados.',
    accent: 'bc' as const,
    contact: ['+51 908 849 330', 'soportealestudiante@baldecash.com'],
  },
];

export default function MultiasistenciaPage() {
  const [activeTab, setActiveTab] = useState<AssistanceType>('medica');
  const assistance = assistanceData[activeTab];

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
              Beneficio opcional para tu crédito
            </Chip>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Multiasistencia BaldeCash
            </h1>
            <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-2xl">
              Asistencia médica, legal y tecnológica para el titular del crédito y hasta 3 personas
              más, disponibles las 24 horas, los 365 días del año.
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
                href="#responsables"
                size="lg"
                radius="lg"
                variant="bordered"
                className="border-white/40 text-white font-semibold cursor-pointer hover:bg-white/10"
              >
                Conocer quién responde
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
              <span className="font-semibold">BaldeCash no presta los servicios de asistencia.</span>{' '}
              La gestión, coordinación y atención está a cargo de{' '}
              <strong>Impulsa365 S.A.C. (A365)</strong>, RUC 20506760721, a través de su central (01)
              625-3757 y su red de proveedores autorizados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Beneficios resumen */}
      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
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
              Elige la asistencia que necesitas
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Tres categorías, quince servicios. Selecciona una para ver su desglose completo.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:bg-white sm:border sm:border-neutral-200 sm:rounded-2xl sm:p-1 max-w-2xl mx-auto mb-8">
            {assistanceTabs.map((tab) => {
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
                  {assistance.title}
                </h3>
                <p className="text-[#4654CD] font-medium mb-4">{assistance.subtitle}</p>
                <p className="text-neutral-600 leading-relaxed max-w-3xl">{assistance.intro}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Covers */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-neutral-900">Qué incluye</h4>
                  </div>
                  <ul className="space-y-3">
                    {assistance.covers.map((item) => (
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
                    {assistance.notCovers.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-4">
                  {assistance.servicesLabel}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assistance.services.map((service) => (
                    <div
                      key={service.num}
                      className="bg-neutral-50 border border-neutral-100 rounded-xl p-5"
                    >
                      <span className="text-xs font-bold text-[#4654CD]">{service.num}</span>
                      <h5 className="font-semibold text-neutral-900 mt-1 mb-2 leading-snug">
                        {service.title}
                      </h5>
                      <p className="text-sm text-neutral-500 leading-relaxed mb-3">
                        {service.description}
                      </p>
                      <span
                        className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-md ${
                          service.paid
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#4654CD]/10 text-[#4654CD]'
                        }`}
                      >
                        {service.limit}
                      </span>
                      {service.note && (
                        <p className="text-xs text-neutral-400 mt-2">{service.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Cómo activar */}
      <section id="como-activar" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 mb-4',
                content: 'text-[#4654CD] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Cómo funciona
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Cómo solicitar el servicio
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              El mismo procedimiento aplica a las tres categorías de asistencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="relative bg-neutral-50 rounded-xl p-6 border border-neutral-100"
              >
                <div className="w-9 h-9 rounded-lg bg-[#4654CD] text-white text-sm font-bold flex items-center justify-center mb-4">
                  {idx + 1}
                </div>
                <h4 className="font-semibold text-neutral-900 mb-1">{step.title}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <h4 className="text-sm font-semibold text-neutral-600 mb-4">
              Datos obligatorios al llamar
            </h4>
            <div className="flex flex-wrap justify-center gap-2.5">
              {requiredData.map((item) => (
                <span
                  key={item}
                  className="text-sm font-medium bg-white border border-neutral-200 rounded-full px-4 py-2 text-neutral-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Responsables */}
      <section id="responsables" className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 mb-4',
                content: 'text-[#4654CD] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Quién responde
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Roles claros, responsabilidad clara
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Multiasistencia no es un seguro. BaldeCash facilita el acceso; A365 presta y responde
              por el servicio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {responsables.map((resp) => (
              <motion.div
                key={resp.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-8 flex flex-col ${
                  resp.highlight
                    ? 'bg-gradient-to-br from-[#4654CD] to-[#333FAD] text-white'
                    : 'bg-white border border-neutral-200'
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    resp.highlight ? 'text-[#C9CFF7]' : 'text-[#4654CD]'
                  }`}
                >
                  {resp.role}
                </span>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    resp.highlight ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  {resp.name}
                </h3>
                <ul className="space-y-3 flex-1">
                  {resp.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          resp.highlight ? 'bg-[#C9CFF7]' : 'bg-[#4654CD]'
                        }`}
                      />
                      <span className={resp.highlight ? 'text-white/85' : 'text-neutral-600'}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mt-6">
                  {resp.contact.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
                        resp.highlight
                          ? 'bg-white/15 border border-white/25 text-white hover:bg-white/25'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-[#4654CD] hover:text-[#4654CD]'
                      }`}
                    >
                      <c.icon className="w-3.5 h-3.5" />
                      {c.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cobertura geográfica */}
      <section id="cobertura" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#03DBD0]/15 mb-4',
                content: 'text-[#0a8c83] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              Zona geográfica
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Cobertura geográfica
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Fuera de estas zonas, si no existe infraestructura disponible, A365 ofrece contratar un
              tercero con reembolso previa autorización.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {geoCoverage.map((zone) => (
              <div
                key={zone.title}
                className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6"
              >
                <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#4654CD]" />
                  {zone.title}
                </h4>
                <ul className="space-y-2.5">
                  {zone.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4654CD] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ruta del reclamo */}
      <section id="reclamos" className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 mb-4',
                content: 'text-[#4654CD] text-xs font-semibold tracking-wide uppercase',
              }}
            >
              A dónde va cada reclamo
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">Ruta del reclamo</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Baldecash no gestiona ni resuelve reclamos sobre la ejecución del servicio, pero te
              orienta al canal correcto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {claims.map((claim) => (
              <div
                key={claim.title}
                className="bg-white border border-neutral-200 rounded-2xl p-6"
              >
                <span
                  className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-4 ${
                    claim.accent === 'a365'
                      ? 'bg-[#4654CD]/10 text-[#4654CD]'
                      : 'bg-[#03DBD0]/15 text-[#0a8c83]'
                  }`}
                >
                  {claim.badge}
                </span>
                <h4 className="font-bold text-neutral-900 mb-2">{claim.title}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">{claim.description}</p>
                <div className="flex flex-wrap gap-2">
                  {claim.contact.map((c) => (
                    <span
                      key={c}
                      className="text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1.5 text-neutral-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 bg-white border border-neutral-200 rounded-2xl p-5">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              Toda acción legal (reclamo, denuncia, demanda) relacionada con la prestación del
              servicio —deficiente, negligente o dolosa, incluyendo culpa inexcusable— debe dirigirse
              directamente a Impulsa365 S.A.C. como responsable de su ejecución. Si un reclamo llega
              primero a BaldeCash, este lo deriva a A365 y no asume el costo ni la responsabilidad del
              caso.
            </p>
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
                Suma Multiasistencia a tu crédito
              </h2>
              <p className="text-white/85 text-lg">
                Solicita tu financiamiento y agrega el respaldo médico, legal y tecnológico para ti y
                tu familia. Y si ya eres afiliado, la central A365 te atiende las 24 horas.
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
                href="tel:+51016253757"
                size="lg"
                radius="lg"
                variant="bordered"
                className="border-white/40 text-white font-semibold cursor-pointer hover:bg-white/10"
                startContent={<Phone className="w-4 h-4" />}
              >
                (01) 625-3757
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
