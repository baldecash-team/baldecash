'use client';

/**
 * Términos y Condiciones - BaldeCash v0.6
 * Basado en contenido de https://www.baldecash.com/terminos-y-condiciones-baldecash
 */

import React from 'react';
import { LegalPageLayout } from '../components';

export function TerminosYCondicionesClient() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      lastUpdated="Junio 2023"
    >
      <p className="text-neutral-600 mb-8">
        La empresa Baldecash es titular de la plataforma www.baldecash.com y está vinculada a Campus Control
        Sociedad Gestora de Fondos de Inversión S.A.C. El presente documento establece los términos para
        acceder y usar la plataforma, subdominios y cuentas en redes sociales. Los usuarios aceptan
        implícitamente estos términos al usar la plataforma, reconociendo que se rigen por la legislación peruana.
      </p>

      <Section title="PRIMERO: Respecto de Baldecash">
        <p>Baldecash ofrece dos servicios principales:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Financiamiento para equipos de cómputo mediante leasing operativo</li>
          <li>Créditos de consumo para gastos educativos</li>
        </ul>
        <p className="mt-3">
          Los servicios se dirigen a estudiantes universitarios e institutos técnicos. Baldecash puede
          prestar servicios directamente o a través de sus entidades vinculadas. Los solicitantes deben
          completar una solicitud y pasar evaluación previa para calificar.
        </p>
      </Section>

      <Section title="SEGUNDO: Compromiso y Responsabilidad">
        <p>
          La empresa se compromete a proteger derechos de usuarios e investigar reclamos. Procura mantener
          la plataforma disponible sin interrupciones, aunque no puede garantizarlo debido a la naturaleza de Internet.
        </p>
        <p className="mt-3">
          <strong>Limitaciones de responsabilidad:</strong> La empresa no responde por pérdidas no atribuibles
          a incumplimiento, pérdidas indirectas o consecuenciales no previsibles, demoras por circunstancias
          ajenas a su control, o fallos en servicios de entidades vinculadas. El usuario debe dirigir
          reclamaciones sobre servicios de terceros directamente a esas entidades.
        </p>
        <p className="mt-3">
          <strong>Excepción:</strong> La empresa sí responde por falsedad, fallecimiento o daños personales
          por negligencia o dolo.
        </p>
      </Section>

      <Section title="TERCERO: Contratación y Capacidad Legal">
        <p>
          Los servicios solo pueden ser contratados por personas naturales mayores de edad con plena
          capacidad legal, que sean estudiantes y requieran los servicios ofrecidos.
        </p>
      </Section>

      <Section title="CUARTO: Registro y Participación">
        <p>
          <strong>Requisitos:</strong> Completar formulario con datos válidos, exactos y verdaderos.
          El usuario debe mantener información actualizada.
        </p>
        <p className="mt-3">
          <strong>Declaración Jurada:</strong> La información proporcionada se entiende como declaración jurada.
          El usuario garantiza la exactitud y veracidad de sus datos personales.
        </p>
        <p className="mt-3">
          <strong>Medidas de control:</strong> La empresa puede verificar información, solicitar comprobantes
          adicionales y suspender o dar de baja cuentas si los datos no se confirman.
        </p>
        <p className="mt-3">
          <strong>Prohibiciones de uso:</strong> No podrá utilizarse ningún Servicio: (i) en forma alguna
          que cause daño a la Empresa; (ii) para fin fraudulento o ilícito; (iii) para generar molestia en terceros.
        </p>
        <p className="mt-3">
          <strong>Responsabilidad del equipo:</strong> El usuario asume responsabilidad total sobre la calidad
          del equipo elegido y su garantía de fábrica.
        </p>
      </Section>

      <Section title="QUINTA: Procedimiento para Solicitud de Servicios">
        <p>
          Los procedimientos específicos se detallan en el Anexo 1. Presentar solicitud implica aceptar
          haber cumplido con los términos y condiciones.
        </p>
      </Section>

      <Section title="SEXTA: Consentimiento en Contratos Celebrados">
        <p>
          Las ofertas se aceptan electrónicamente a través de la plataforma. La aceptación está condicionada
          a validación por las entidades vinculadas.
        </p>
        <p className="mt-3">
          <strong>Formalización:</strong> Se envía contrato para firma electrónica y se requiere grabar un
          video-selfie de aceptación. El consentimiento se forma cuando el usuario firma el contrato.
        </p>
        <p className="mt-3">
          La oferta es irrevocable salvo por falsedad en información del usuario. La empresa puede anular
          transacciones si la validación de datos es insatisfactoria.
        </p>
      </Section>

      <Section title="SÉPTIMA: Validez de la Oferta">
        <p>
          Las ofertas son válidas hasta la fecha de terminación indicada en la promoción. Si no se especifica
          fecha, la validez es de 30 días desde la publicación.
        </p>
      </Section>

      <Section title="OCTAVA: Reembolsos">
        <p>
          No se permiten devoluciones ni reembolsos de montos pagados, excepto si Baldecash o las entidades
          vinculadas no suministran los servicios en plazo razonable por causas ajenas a su control.
        </p>
      </Section>

      <Section title="NOVENA: Aspectos Generales">
        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Derechos de Autor y Propiedad Intelectual</h4>
        <p>
          Las marcas, diseños y elementos de propiedad intelectual pertenecen a la empresa o proveedores.
          Está prohibida la reproducción sin autorización expresa. No pueden usarse en conexión con productos
          o servicios no autorizados.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Procedimiento de Vulneración de Derechos</h4>
        <p>
          Reportar al correo:{' '}
          <a href="mailto:prestamos@baldecash.com" className="hover:underline" style={{ color: 'var(--color-primary, #4654CD)' }}>
            prestamos@baldecash.com
          </a>
          . La empresa puede suprimir contenido tras notificación sin admitir responsabilidad.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Prohibición de Ingeniería Inversa</h4>
        <p>
          Prohibido copiar, descompilar, desensamblar o manipular la plataforma total o parcialmente,
          ni crear obras derivadas.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Actualizaciones Automáticas</h4>
        <p>
          La empresa ofrece actualizaciones sin notificación previa, procurando minimizar inconvenientes.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Opiniones y Comentarios</h4>
        <p>
          Los usuarios pueden publicar contenido siempre que no sea ilícito, obsceno, abusivo, amenazante,
          difamatorio, invasor de privacidad, infractor de derechos intelectuales u ofensivo. No permitidos:
          correos falsos, suplantación de identidad, virus, propaganda política, spam.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Terminación de Términos y Condiciones</h4>
        <p>
          La empresa puede resolver unilateralmente sin responsabilidad mediante notificación con 15 días
          de anticipación.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Comunicaciones</h4>
        <p>
          Las comunicaciones son electrónicas (correo, SMS, notificaciones en app). El usuario acepta que
          contratos, avisos y notificaciones electrónicas satisfacen requisitos formales.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Régimen de Responsabilidad</h4>
        <p>El usuario asume íntegramente los costos por daños a equipos entregados.</p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Notificaciones</h4>
        <p>
          Dirección para comentarios y reclamaciones: Av. El Ejército N° 1146 Int. 708, Magdalena del Mar, Lima.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Renuncia</h4>
        <p>
          El no ejercicio de derechos en un incumplimiento no impide ejercerlos en incumplimientos posteriores.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Modificación de Servicio y Términos</h4>
        <p>
          Las entidades vinculadas pueden modificar sus servicios. Baldecash se reserva el derecho de modificar
          términos, publicándolos en la plataforma. Las modificaciones entran en vigor 10 días hábiles después.
        </p>
        <p className="mt-2">
          <strong>Derecho de rechazo:</strong> El usuario tiene 5 días hábiles para notificar desacuerdo
          enviando correo a{' '}
          <a href="mailto:prestamos@baldecash.com" className="hover:underline" style={{ color: 'var(--color-primary, #4654CD)' }}>
            prestamos@baldecash.com
          </a>
          . Si no responde, se presume aceptación.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Servicios de Terceros</h4>
        <p>El uso de servicios de terceros puede estar sujeto a políticas adicionales y tasas propias.</p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Separabilidad</h4>
        <p>Si alguna disposición es ilegal o inaplicable, no afecta la validez de otras provisiones.</p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Validez de Documentos Electrónicos</h4>
        <p>
          Las partes aceptan que el contrato sea firmado electrónicamente conforme a artículos 141 y 141-A
          del Código Civil peruano. El documento surtirá efecto desde la aceptación.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Ley y Jurisdicción</h4>
        <p>
          Los términos se rigen por leyes de la República del Perú. Controversias se someten a tribunales
          competentes de Lima.
        </p>
      </Section>

      <Section title="Protección de Datos Personales">
        <p>
          Baldecash recopila y trata datos personales conforme a Ley N°29733 - Ley de Protección de Datos
          Personales y su Reglamento.
        </p>
        <p className="mt-3">
          <strong>Finalidad:</strong> Ejecución de relación contractual y resolución de consultas.
        </p>
        <p className="mt-3">
          <strong>Compartición de datos:</strong> Se pueden entregar a la Sociedad Gestora y a Equifax Perú
          S.A. (RUC 20265681299) para evaluación de riesgo.
        </p>
        <p className="mt-3">
          <strong>Almacenamiento:</strong> Servidores web contratados con Amazon Com Inc (Estados Unidos,
          RUC 911646860, dirección: 410 Terry Avenue North).
        </p>
        <p className="mt-3">
          <strong>Derechos del usuario:</strong> Acceso, actualización, rectificación, inclusión, oposición,
          supresión o cancelación de datos enviando correo a{' '}
          <a href="mailto:prestamos@baldecash.com" className="hover:underline" style={{ color: 'var(--color-primary, #4654CD)' }}>
            prestamos@baldecash.com
          </a>
          .
        </p>
      </Section>

      <Section title="ANEXO 1: Procedimiento para Solicitud de Servicios">
        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">a) Remisión de Solicitud</h4>
        <p>
          El usuario solicita servicios a través de la plataforma. Para financiamientos de laptops, debe
          especificar el equipo. La plataforma remite solicitudes directamente a entidades vinculadas.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">b) Análisis del Perfil</h4>
        <p>
          Baldecash y entidades vinculadas analizan el perfil en máximo 2 días, considerando criterios
          académicos y personales. Pueden requerir información adicional.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">c) Aceptación o Rechazo</h4>
        <p>
          Tras análisis, se contacta al usuario requiriendo información adicional o enviando documentación
          para formalizar. Es discreción absoluta aceptar o rechazar la solicitud.
        </p>
        <p className="mt-3">
          Los contratos se firman electrónicamente y el usuario graba un video-selfie. La entrega de equipos
          o desembolso ocurre conforme al contrato.
        </p>
      </Section>
    </LegalPageLayout>
  );
}

// Helper component for sections
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-neutral-900 mb-3 font-['Asap']">{title}</h3>
      <div className="text-neutral-600 space-y-3">{children}</div>
    </section>
  );
}
