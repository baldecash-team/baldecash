'use client';

/**
 * Landing informativa de Multiasistencia (beneficio opcional gestionado por
 * Impulsa365 S.A.C. — A365).
 *
 * El diseño viene del mockup aprobado "Página Informativa Multiasistencia" y se
 * porta con un CSS Module (`multiasistencia.module.css`) para conservar la
 * fidelidad visual de la maqueta. El header y el footer sí son los componentes
 * de producción del sitio, para no duplicar la navegación.
 */

import React, { useState } from 'react';
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
  ChevronDown,
  Stethoscope,
  Brain,
} from 'lucide-react';
import { SegurosNavbar } from '../seguros/SegurosNavbar';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';
import styles from './multiasistencia.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baldecash.com';

const A365_PHONE = '(01) 625-3757';
const A365_PHONE_HREF = 'tel:+51016253757';
const A365_EMAIL = 'gestiondereclamos@a365.com.pe';
const BC_PHONE = '+51 908 849 330';
const BC_EMAIL = 'soportealestudiante@baldecash.com';

type AssistanceType = 'medica' | 'legal' | 'tec';

/** Ítem de "qué incluye": texto y, opcionalmente, la píldora de tope/copago. */
interface CoverItem {
  text: string;
  cost?: string;
}

/** Servicio del desglose que se abre con "Ver detalles". */
interface AssistanceService {
  num?: string;
  title: string;
  description: string;
  tag: string;
  /** El tag se pinta en lavanda cuando implica un pago o tope (copago, límite). */
  tagWarn?: boolean;
  note?: string;
}

interface AssistancePanel {
  title: string;
  subtitle: string;
  intro: string;
  covers: CoverItem[];
  notCovers: string[];
  services: AssistanceService[];
}

const TABS: { id: AssistanceType; label: string; icon: React.ElementType }[] = [
  { id: 'medica', label: 'Médica', icon: HeartPulse },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'tec', label: 'Tecnológica', icon: Laptop },
];

const PANELS: Record<AssistanceType, AssistancePanel> = {
  medica: {
    title: 'Asistencia médica',
    subtitle: 'Orientación, atención y traslado médico para ti y tu familia',
    intro:
      'Ocho servicios de salud disponibles por teléfono o a domicilio, con topes y copagos claros en cada caso.',
    covers: [
      { text: 'Orientación médica telefónica' },
      { text: 'Telemedicina con médico general' },
      { text: 'Traslado en ambulancia', cost: 'Hasta S/ 450 · Máx. 2 eventos' },
      { text: 'Médico a domicilio', cost: 'Copago S/ 45 · Máx. 4 eventos' },
      { text: 'Análisis de laboratorio y envío de medicamentos', cost: 'Costo a cargo del afiliado' },
      { text: 'Referencias de especialistas y apoyo psicológico' },
    ],
    notCovers: [
      'Accidentes en deportes de alto riesgo o competencias',
      'Estado de ebriedad o bajo efecto de drogas',
      'Intento de autolesión',
      'Servicios contratados sin autorización previa de A365',
    ],
    services: [
      {
        num: '01',
        title: 'Orientación médica telefónica',
        description:
          'Enlace telefónico con un médico para consultas que no sean emergencias, disponible las 24 horas del día, los 365 días del año. BaldeCash no responde por el diagnóstico o tratamiento.',
        tag: 'Sin costo · Sin límite',
      },
      {
        num: '02',
        title: 'Telemedicina con médico general',
        description:
          'Consulta por videollamada en consultorio virtual. No otorga descansos médicos.',
        tag: 'Sin costo · Máx. 6 eventos durante el período del crédito',
        note: 'Agenda 24/7 · Atención de 8 a. m. a 6 p. m.',
      },
      {
        num: '03',
        title: 'Traslado médico (ambulancia)',
        description:
          'Ante enfermedad grave o accidente que requiera estabilización o traslado de emergencia en ambulancia terrestre. En caso de no existir infraestructura privada disponible, se coordinará el traslado mediante los servicios médicos públicos.',
        tag: 'Hasta S/ 450 · Máx. 2 eventos',
        tagWarn: true,
      },
      {
        num: '04',
        title: 'Envío de médico a domicilio',
        description:
          'Evaluación médica general y emisión de receta médica en el domicilio, sujeta a infraestructura disponible. No incluye medicamentos.',
        tag: 'Copago S/ 45 · Máx. 4 eventos',
        tagWarn: true,
      },
      {
        num: '05',
        title: 'Análisis de laboratorio a domicilio',
        description:
          'Recojo de muestras y entrega de resultados cuando el médico considere necesarios análisis clínicos.',
        tag: 'En conexión · Sin límite',
        note: 'Costo asumido por el afiliado.',
      },
      {
        num: '06',
        title: 'Envío de medicamentos de farmacia',
        description: 'Entrega a domicilio de medicamentos recetados durante la visita médica.',
        tag: 'En conexión · Sin límite',
        note: 'Costo asumido por el afiliado.',
      },
      {
        num: '07',
        title: 'Referencias de especialistas y clínicas',
        description:
          'Información y contacto de especialistas, clínicas y hospitales, como odontólogos, cardiólogos, pediatras, ginecólogos y dermatólogos. No incluye diagnóstico ni honorarios médicos.',
        tag: 'Sin costo · Sin límite',
      },
      {
        num: '08',
        title: 'Orientación psicológica telefónica',
        description:
          'Apoyo telefónico brindado por un psicólogo especialista ante eventos traumáticos, acoso escolar, problemas familiares, despidos, enfermedades, entre otros.',
        tag: 'Sin costo · Máx. 2 eventos durante el período del crédito',
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
      { text: 'Orientación en divorcios, sucesiones y pensiones alimenticias' },
      { text: 'Orientación sobre cobro de cheques o pagarés' },
    ],
    notCovers: [
      'Honorarios o gestiones del abogado contratado por el afiliado',
      'Resultado de procesos judiciales',
    ],
    services: [
      {
        title: 'Asesoría legal telefónica',
        description:
          'Referencia y consultoría legal telefónica sobre divorcios, sucesiones, pensiones alimenticias, cobro de cheques o pagarés, entre otros. A365 no responde por el resultado de gestiones del abogado que el afiliado contrate directamente.',
        tag: 'Sin costo · Sin límite',
        note: 'Gastos por servicios profesionales de abogado a cargo del afiliado.',
      },
    ],
  },
  tec: {
    title: 'Asistencia tecnológica',
    subtitle: 'Soporte para tu equipo financiado y tus otros dispositivos',
    intro:
      'Seis servicios de soporte técnico telefónico y a domicilio para tu laptop, PC, tablet o smartphone.',
    covers: [
      { text: 'Atención telefónica y diagnóstico' },
      { text: 'Medición de calidad de señal WiFi', cost: 'Repetidor a costo del cliente, si se requiere' },
      { text: 'Visita de técnico a domicilio', cost: 'Copago S/ 60 · Máx. 2 eventos' },
      { text: 'Configuración de periféricos, antispyware y software' },
    ],
    notCovers: [
      'Licencias, software o accesos que requiera el afiliado',
      'Piezas o accesorios instalados en la visita técnica',
      'Garantía extendida sobre piezas cambiadas',
    ],
    services: [
      {
        num: '1',
        title: 'Atención telefónica tecnológica',
        description:
          'Orientación telefónica para consultas o problemas relacionados con el equipo tecnológico adquirido mediante el crédito, incluyendo instalación de software, uso básico de Office y Windows, y consultas sobre software y hardware. Aplica solo para una PC.',
        tag: 'Sin costo · Sin límite',
        note: 'Horario: 8 a. m. a 7 p. m., los 7 días de la semana.',
      },
      {
        num: '2',
        title: 'Diagnóstico y asesoramiento telefónico',
        description:
          'Orientación y diagnóstico telefónico para problemas en PC, laptop, tablet o smartphone.',
        tag: 'Sin costo · Sin límite',
      },
      {
        num: '3',
        title: 'Medición de calidad de señal WiFi',
        description:
          'Visita de un técnico especialista en redes para verificar el funcionamiento de las conexiones y medir la calidad de la señal WiFi.',
        tag: 'En conexión · Sin límite',
        note: 'Repetidor a costo del cliente, si se requiere.',
      },
      {
        num: '4',
        title: 'Visita de técnico a domicilio',
        description:
          'Asistencia técnica a domicilio para instalación y limpieza de PC, cambio de piezas básicas, configuración de periféricos, formateo de disco duro, reinstalación del sistema operativo e instalación de software estándar.',
        tag: 'Copago S/ 60 · Máx. 2 eventos',
        tagWarn: true,
        note: 'Accesorios y piezas a cargo del afiliado.',
      },
      {
        num: '5',
        title: 'Configuración de periféricos y antispyware',
        description:
          'Orientación telefónica para conectar periféricos a la computadora o instalar programas antispyware.',
        tag: 'Sin costo · Sin límite',
      },
      {
        num: '6',
        title: 'Configuración de software vía telefónica',
        description:
          'Asistencia remota para la configuración y parametrización básica de software, activación de herramientas y puesta en marcha de programas estándar.',
        tag: 'Sin costo · Sin límite',
        note: 'Licencias, accesos y software a cargo del afiliado.',
      },
    ],
  },
};

const HERO_LINKS = [
  { href: '#como-funciona', label: 'Cómo solicitar el servicio' },
  { href: '#responsables', label: 'Conoce cómo funciona tu Multiasistencia' },
  { href: '#cobertura', label: 'Cobertura geográfica' },
  { href: '#familiares', label: 'Cómo agregar un familiar' },
  { href: '#reclamos', label: 'Consultas o reclamos' },
];

const FEATURES = [
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

const REQUEST_STEPS = [
  { n: '1', title: 'Llama a la central', text: `Comunícate al ${A365_PHONE}, disponible los 365 días del año, Lima y provincias.` },
  { n: '2', title: 'Identifícate', text: 'Indica tus datos para que A365 valide tu vigencia como afiliado.' },
  { n: '3', title: 'Coordinación', text: 'A365 gestiona el servicio con su central o su red de proveedores autorizados.' },
  { n: '4', title: 'Atención', text: 'Recibes el servicio según los términos, límites y copagos de cada cobertura.' },
];

const FAMILY_STEPS = [
  { n: '1', title: 'El familiar se comunica', text: 'Llama a la línea de asistencia e indica que está afiliado a tu servicio.' },
  { n: '2', title: 'Se registran sus datos', text: 'El operador solicita su información y realiza el registro.' },
  { n: '3', title: 'Se asigna un cupo', text: 'Ese familiar ocupa uno de los 3 cupos disponibles.' },
  { n: '4', title: 'Quedan los restantes', text: 'Los siguientes familiares ocuparán los cupos que queden libres.' },
];

const USE_EXAMPLES = [
  { icon: Stethoscope, label: 'Telemedicina' },
  { icon: Scale, label: 'Asesoría legal telefónica' },
  { icon: Laptop, label: 'Soporte técnico' },
  { icon: Brain, label: 'Orientación psicológica' },
];

export default function MultiasistenciaPage() {
  const [activeTab, setActiveTab] = useState<AssistanceType>('medica');
  // El desglose de servicios arranca colapsado en cada pestaña y se abre con
  // "Ver detalles". Se guarda por pestaña para no perder el estado al cambiar.
  const [expanded, setExpanded] = useState<Record<AssistanceType, boolean>>({
    medica: false,
    legal: false,
    tec: false,
  });

  const panel = PANELS[activeTab];
  const isExpanded = expanded[activeTab];

  return (
    <>
      <SegurosNavbar />

      {/* pt-16 compensa el navbar fijo (h-16) de producción. El navbar y el
          footer quedan FUERA de `.page` para que los resets de la maqueta
          (tipografías, enlaces, svg) no toquen los componentes compartidos. */}
      <main className={`${styles.page} pt-16`}>
        {/* ============ HERO ============ */}
        <section className={styles.hero}>
          <div className={styles.wrap}>
            <span className={styles.pill}>Beneficio opcional para tu crédito</span>
            <h1>Multiasistencia BaldeCash</h1>
            <p>
              Asistencia médica, legal y tecnológica para el titular del crédito y hasta 3 personas
              más, disponibles las 24 horas, los 365 días del año.
            </p>
            <div className={styles.ctaRow}>
              <a className={`${styles.btn} ${styles.btnWhite}`} href="#coberturas">
                Ver coberturas
                <ArrowRight />
              </a>
              {HERO_LINKS.map((link) => (
                <a key={link.href} className={`${styles.btn} ${styles.btnHeroOutline}`} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============ AVISO A365 + FEATURES ============ */}
        <div className={styles.wrap}>
          <div className={styles.notice}>
            <Info />
            <span>
              Los servicios de Multiasistencia son brindados y gestionados por{' '}
              <strong>Impulsa365 S.A.C. (A365)</strong>, RUC 20506760721, junto con su red de
              proveedores autorizados. Si necesitas ayuda, puedes comunicarte a través de su central
              telefónica: {A365_PHONE}.
            </span>
          </div>

          <div className={styles.features}>
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className={styles.feature}>
                <div className={styles.icBox}><Icon /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============ COBERTURAS ============ */}
        <section className={`${styles.section} ${styles.gray}`} id="coberturas">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Conoce las 3 asistencias incluidas</h2>
            </div>

            <div className={styles.tabs}>
              <div className={styles.track} role="tablist">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={styles.tab}
                    role="tab"
                    aria-selected={activeTab === id}
                    onClick={() => setActiveTab(id)}
                  >
                    <Icon />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.panelCard}>
              <div className={styles.panel} key={activeTab}>
                <h3>{panel.title}</h3>
                <p className={styles.subttl}>{panel.subtitle}</p>
                <p className={styles.intro}>{panel.intro}</p>

                <div className={styles.incl}>
                  <div className={`${styles.box} ${styles.yes}`}>
                    <h4><CheckCircle2 />Qué incluye</h4>
                    <ul>
                      {panel.covers.map((item) => (
                        <li key={item.text}>
                          <CheckCircle2 />
                          <span className={styles.t}>
                            {item.text}
                            {item.cost && <span className={styles.cost}>{item.cost}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.box} ${styles.no}`}>
                    <h4><XCircle />Qué no cubre</h4>
                    <ul>
                      {panel.notCovers.map((item) => (
                        <li key={item}><XCircle />{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className={styles.verDetalles}
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded((prev) => ({ ...prev, [activeTab]: !prev[activeTab] }))}
                >
                  {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                  <ChevronDown />
                </button>

                {isExpanded && (
                  <div className={`${styles.svcGrid} ${panel.services.length === 1 ? styles.one : ''}`}>
                    {panel.services.map((service) => (
                      <div key={service.title} className={styles.svc}>
                        {service.num && <div className={styles.num}>{service.num}</div>}
                        <h5>{service.title}</h5>
                        <p>{service.description}</p>
                        <span className={`${styles.tag} ${service.tagWarn ? styles.tagWarn : ''}`}>
                          {service.tag}
                        </span>
                        {service.note && <p className={styles.note}>{service.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============ CÓMO FUNCIONA ============ */}
        <section className={styles.section} id="como-funciona">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Cómo solicitar el servicio</h2>
              <p className={styles.sub}>El mismo procedimiento aplica a las tres categorías de asistencia.</p>
            </div>
            <div className={styles.steps}>
              {REQUEST_STEPS.map((step) => (
                <div key={step.n} className={styles.step}>
                  <div className={styles.n}>{step.n}</div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
            <div className={styles.obl}>
              <div className={styles.lbl}>Datos obligatorios al llamar</div>
              <div className={styles.chips}>
                {['Nombre y apellidos*', 'DNI*', 'Dirección y teléfono', 'Tipo de servicio requerido'].map((c) => (
                  <span key={c} className={styles.chip}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ QUIÉN RESPONDE ============ */}
        <section className={`${styles.section} ${styles.gray}`} id="responsables">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Conoce cómo funciona tu Multiasistencia</h2>
              <p className={styles.sub}>
                BaldeCash te ayuda a acceder al beneficio y A365 se encarga de brindar la atención y
                coordinar los servicios disponibles para ti.
              </p>
            </div>
            <div className={styles.useBenefits}>
              <div className={`${styles.rcard} ${styles.indigo} ${styles.lead}`}>
                <h3>¿Necesitas usar alguno de tus beneficios?</h3>
                <p className={styles.leadTxt}>
                  Comunícate con A365, indícales que eres cliente de BaldeCash y el servicio que
                  necesitas.
                </p>
                <p className={styles.exLabel}>Por ejemplo:</p>
                <div className={styles.exGrid}>
                  {USE_EXAMPLES.map(({ icon: Icon, label }) => (
                    <div key={label} className={styles.ex}><Icon />{label}</div>
                  ))}
                </div>
                <p className={styles.leadFoot}>
                  A365 se encargará de coordinar tu atención y de conectarte con los profesionales o
                  especialistas correspondientes.
                </p>
              </div>
              <div className={styles.contactCol}>
                <div className={`${styles.rcard} ${styles.white} ${styles.ctc}`}>
                  <div className={styles.kicker}>Central de atención A365</div>
                  <a className={styles.pillBtn} href={A365_PHONE_HREF}>
                    <Phone /><span>{A365_PHONE}</span>
                  </a>
                </div>
                <div className={`${styles.rcard} ${styles.white} ${styles.ctc}`}>
                  <div className={styles.kicker}>Reclamos y consultas sobre la atención recibida</div>
                  <a className={styles.pillBtn} href={`mailto:${A365_EMAIL}`}>
                    <Mail /><span>{A365_EMAIL}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CÓMO AGREGAR A UN FAMILIAR ============ */}
        <section className={styles.section} id="familiares">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>¿Cómo agregar a un familiar?</h2>
              <p className={styles.sub}>
                Tu Multiasistencia puede ser utilizada por el titular y hasta 3 familiares.
              </p>
            </div>

            <p className={styles.famIntro}>
              No necesitas registrar a tus familiares al momento de adquirir el servicio.{' '}
              <strong>
                Los cupos se asignan conforme cada familiar hace uso de la asistencia por primera vez.
              </strong>
            </p>

            <div className={`${styles.notice} ${styles.famNotice}`}>
              <Users />
              <span>
                <strong>3 cupos disponibles:</strong> cónyuge, hijos menores de 18 años y padres del
                mismo hogar.
              </span>
            </div>

            <div className={styles.steps}>
              {FAMILY_STEPS.map((step) => (
                <div key={step.n} className={styles.step}>
                  <div className={styles.n}>{step.n}</div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>

            <div className={`${styles.notice} ${styles.famNotice} ${styles.important}`}>
              <Info />
              <span>
                <strong>Importante:</strong> solo los primeros 3 familiares que hagan uso de la
                Multiasistencia quedarán registrados como beneficiarios.
              </span>
            </div>
          </div>
        </section>

        {/* ============ COBERTURA GEOGRÁFICA ============ */}
        <section className={`${styles.section} ${styles.gray}`} id="cobertura">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Cobertura geográfica</h2>
              <p className={styles.sub}>
                Fuera de estas zonas, si no existe infraestructura disponible, A365 ofrece contratar
                un tercero con reembolso previa autorización.
              </p>
            </div>
            <div className={styles.geo}>
              <div className={styles.gcard}>
                <h4><MapPin />Lima Metropolitana, Callao y balnearios</h4>
                <ul>
                  <li>Norte: hasta Puente Piedra.</li>
                  <li>Sur: hasta Lurín (hasta el km 140 de la Panamericana Sur, de enero a marzo).</li>
                  <li>Este: hasta Chaclacayo, San Juan de Lurigancho y Chosica (puente Los Ángeles).</li>
                  <li>Oeste: La Punta — Callao.</li>
                </ul>
              </div>
              <div className={styles.gcard}>
                <h4><MapPin />Provincias</h4>
                <ul>
                  <li>Cobertura en los 24 departamentos del país.</li>
                  <li>Atención hasta 30 km a la redonda desde la plaza de armas de cada ciudad.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ RUTA DEL RECLAMO ============ */}
        <section className={styles.section} id="reclamos">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Te ayudamos a encontrar el canal adecuado</h2>
              <p className={styles.sub}>
                Cada solicitud es atendida por el equipo responsable. Aunque BaldeCash no gestiona
                los reclamos relacionados con la atención del servicio, te orientaremos para que
                puedas comunicarte con el canal correspondiente.
              </p>
            </div>
            <div className={styles.route}>
              <div className={`${styles.rcard} ${styles.white}`}>
                <span className={`${styles.mini} ${styles.lav}`}>Sobre la atención del servicio</span>
                <h4>Comunícate directamente con A365</h4>
                <p className={styles.desc}>
                  Si tu solicitud no fue atendida, hubo inconvenientes con la visita programada, el
                  cobro no coincide o no quedaste conforme con la atención recibida, A365 podrá
                  ayudarte a resolverlo.
                </p>
                <div className={styles.contact}>
                  <a className={styles.pillBtn} href={A365_PHONE_HREF}>{A365_PHONE}</a>
                  <a className={styles.pillBtn} href={`mailto:${A365_EMAIL}`}>{A365_EMAIL}</a>
                </div>
              </div>
              <div className={`${styles.rcard} ${styles.white}`}>
                <span className={`${styles.mini} ${styles.teal}`}>Sobre tu afiliación o cobro</span>
                <h4>Comunícate con BaldeCash</h4>
                <p className={styles.desc}>
                  Si tienes consultas sobre el cobro de Multiasistencia, la vigencia de tu crédito o
                  el estado de tu afiliación, nuestro equipo podrá ayudarte.
                </p>
                <div className={styles.contact}>
                  <a className={styles.pillBtn} href="tel:+51908849330">{BC_PHONE}</a>
                  <a className={styles.pillBtn} href={`mailto:${BC_EMAIL}`}>{BC_EMAIL}</a>
                </div>
              </div>
            </div>
            <div className={styles.legalbox}>
              <AlertTriangle />
              <span>
                Cualquier reclamo, denuncia o acción legal relacionada con la atención brindada será
                gestionada por Impulsa365 S.A.C., empresa responsable de la prestación del servicio.
                Si tu solicitud es recibida primero por BaldeCash, la derivaremos al equipo
                correspondiente para que pueda ser atendida.
              </span>
            </div>
          </div>
        </section>

        {/* ============ CTA FINAL ============ */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.finalcta}>
              <h2>Suma Multiasistencia a tu crédito</h2>
              <p>
                Solicita tu financiamiento y agrega el respaldo médico, legal y tecnológico para ti y
                tu familia. Y si ya eres afiliado, la central A365 te atiende las 24 horas.
              </p>
              <div className={styles.ctaRow}>
                <a className={`${styles.btn} ${styles.btnWhite}`} href={`${SITE_URL}/home`}>
                  Solicitar financiamiento
                </a>
                <a className={`${styles.btn} ${styles.btnLine}`} href={A365_PHONE_HREF}>
                  {A365_PHONE}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
