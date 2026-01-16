'use client';

/**
 * Política de Privacidad - BaldeCash v0.5
 * Basado en contenido de https://www.baldecash.com/politica-de-privacidad-baldecash
 */

import React from 'react';
import { LegalPageLayout } from '../components';

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPageLayout
      title="Políticas de Privacidad"
      lastUpdated="Junio 2023"
    >
      <p className="text-neutral-600 mb-8">
        Balde K S.A.C. (RUC N° 20605530509) con domicilio en Av. El Ejército N° 1146, Magdalena del Mar, Lima,
        se compromete a proteger la privacidad y cumplir las leyes sobre protección de datos personales recopilados
        a través de su plataforma web baldecash.com.
      </p>

      <Section title="1. Objetivo">
        <p>
          BaldeCash proporciona financiamientos mediante: (i) arrendamiento operativo para equipos de cómputo y
          (ii) créditos de consumo para gastos educativos. Los servicios van dirigidos a estudiantes universitarios
          e institutos técnicos, prestados directamente o mediante &quot;Entidades Vinculadas&quot;. La presente política
          detalla cómo se tratan los datos personales en sus actividades comerciales.
        </p>
      </Section>

      <Section title="2. Información General">
        <p>
          BaldeCash administra la plataforma www.baldecash.com y está vinculada con Campus Control Sociedad
          Gestora de Fondos de Inversión S.A.C. Trata datos personales conforme a: Ley 29733, su Reglamento
          (DS 003-2013-JUS) y normas complementarias.
        </p>
      </Section>

      <Section title="3. Normativa de Protección de Datos Personales">
        <p>
          Se rige por: Constitución Política del Perú, Ley N° 29733, Decreto Supremo N° 003-2013-JUS y
          Resolución Directoral N° 019-2013-JUS/DGPDP. Define datos personales como &quot;información sobre
          persona natural que la identifica o hace identificable&quot;.
        </p>
      </Section>

      <Section title="4. Principios Rectores del Tratamiento">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Legalidad:</strong> Rechaza recopilación fraudulenta</li>
          <li><strong>Consentimiento:</strong> Mediará consentimiento del usuario</li>
          <li><strong>Finalidad:</strong> Determinada, explícita y lícita</li>
          <li><strong>Proporcionalidad:</strong> Adecuado y no excesivo</li>
          <li><strong>Calidad:</strong> Veraces, exactos, actualizados</li>
          <li><strong>Seguridad:</strong> Medidas técnicas, organizativas y legales garantizando confidencialidad</li>
        </ul>
      </Section>

      <Section title="5. Derechos del Usuario">
        <p>
          Derecho a conocer qué datos personales se poseen, exigir eliminación o actualización de información
          incompleta, incorrecta o desactualizada, solicitar detención del tratamiento. Pueden contactar a{' '}
          <a href="mailto:prestamos@baldecash.com" className="text-[#4654CD] hover:underline">
            prestamos@baldecash.com
          </a>{' '}
          para ejercer derechos de información, acceso, rectificación, cancelación y oposición.
        </p>
      </Section>

      <Section title="6. Tiempo de Conservación de Datos">
        <p>
          Los datos se conservan solo lo necesario para cumplir la finalidad. No se almacenan cuando:
          (i) se conoce su carácter inexacto o incompleto, o (ii) han dejado de ser necesarios,
          salvo procesos de anonimización.
        </p>
      </Section>

      <Section title="7. Información Recolectada">
        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">a) Información proporcionada por clientes:</h4>
        <p>
          Nombre, fecha de nacimiento, dirección, ubicación geográfica, documentos de identidad,
          fotografía, teléfono, firma, datos académicos.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">b) Información recopilada automáticamente:</h4>
        <p>
          Dirección IP, información de navegador, tipo de sistema operativo, búsquedas realizadas,
          información de contacto con servicio al cliente.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">c) Información de terceros:</h4>
        <p>
          De otras webs asociadas, agencias de historial crediticio, proveedores de análisis de datos,
          negocios aliados.
        </p>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">d) Cookies:</h4>
        <p>
          Se utilizan para gestionar solicitudes de usuarios y mejorar la experiencia de navegación.
          Pueden ser aceptadas o rechazadas según Política de Cookies.
        </p>
      </Section>

      <Section title="8. Usos de la Información Recolectada">
        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Información proporcionada:</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cumplir obligaciones contractuales</li>
          <li>Comunicarse por cualquier medio</li>
          <li>Notificar cambios en servicios</li>
          <li>Presentar contenido efectivamente</li>
          <li>Cumplir requerimientos legales</li>
        </ul>

        <h4 className="font-semibold text-neutral-800 mt-4 mb-2">Información recopilada automáticamente:</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Administrar operaciones internas</li>
          <li>Mejorar la plataforma</li>
          <li>Asegurar seguridad</li>
        </ul>
      </Section>

      <Section title="9. Finalidad del Tratamiento">
        <p>
          Los datos se utilizan para la ejecución correcta de servicios, absolver consultas, peticiones,
          reclamos y quejas. Se almacenan en banco de datos de BaldeCash ubicado en Alfredo Benavides 1238,
          Oficina 404, Lima. Solo personal necesario accede a esta información.
        </p>
      </Section>

      <Section title="10. Consentimiento y Consecuencias">
        <p>
          Al aceptar los Términos y Condiciones, la Política de Privacidad y Cookies, acepta el tratamiento descrito.
          Sin aceptación no puede acceder a servicios ni usar la plataforma correctamente.
        </p>
      </Section>

      <Section title="11. Revelación de Información">
        <p>
          Se puede compartir con miembros del grupo, subsidiarias, holding u autoridades por mandato legal,
          vinculadas exclusivamente a servicios brindados.
        </p>
      </Section>

      <Section title="12. Compartir Información con Terceros">
        <p>
          Los datos se pueden compartir con: negocios aliados, proveedores contratados, entidades relacionadas,
          entidades financieras, proveedores de análisis de datos, potenciales compradores/vendedores en
          caso de transacciones, y según requerimientos legales o protección contra fraudes.
        </p>
      </Section>

      <Section title="13. Flujo Transfronterizo de Datos">
        <p>
          Los datos se almacenan en servidores de Amazon Com Inc (RUC 911646860) en Estados Unidos
          (410 Terry Avenue North). Se realiza transferencia exclusivamente para almacenamiento.
          Terceras compañías pueden acceder mediante cookies, conforme Política de Cookies.
        </p>
      </Section>

      <Section title="14. Almacenamiento de Información Personal">
        <p>
          La información se puede transferir y almacenar fuera de Perú. Al enviar datos, acepta esta transferencia.
          Se toman medidas de seguridad, aunque la transmisión por internet no es completamente segura.
          El acceso está restringido a empleados con necesidad de conocerla. El personal recibe capacitación continua
          sobre confidencialidad.
        </p>
      </Section>

      <Section title="15. Derechos de Clientes/Usuarios">
        <p>
          Pueden revocar consentimiento o ejercer derechos como titulares de datos presentando solicitud a{' '}
          <a href="mailto:prestamos@baldecash.com" className="text-[#4654CD] hover:underline">
            prestamos@baldecash.com
          </a>
          . La plataforma contiene enlaces a terceros con políticas propias; BaldeCash no asume responsabilidad por ellas.
        </p>
      </Section>

      <Section title="16. Enlaces Externos">
        <p>
          BaldeCash no es responsable por contenido publicado en enlaces externos, políticas de privacidad
          ni servicios accesibles en esas páginas. Los enlaces no implican recomendación de productos o servicios.
        </p>
      </Section>

      <Section title="17. Acceso a Información">
        <p>
          Los usuarios tienen derecho de acceso a los datos personales que BaldeCash posea sobre ellos y las condiciones
          del tratamiento, según Normativa de Protección de Datos Personales.
        </p>
      </Section>

      <Section title="18. Cambios, Vigencia y Modificación">
        <p>
          La política fue actualizada en junio de 2023. BaldeCash se reserva el derecho de modificarla ante cambios
          normativos. Las modificaciones se publican en la plataforma. Se recomienda revisar cada vez que use la plataforma.
        </p>
      </Section>

      <Section title="19. Privacidad de Menores de Edad">
        <p>
          La plataforma no está diseñada para menores. No se tratan conscientemente datos de menores sin
          consentimiento de padres/tutores. Si se detecta, se eliminarán datos lo antes posible.
        </p>
      </Section>

      <Section title="20. Calidad de Datos">
        <p>
          Se mantienen datos exactos y se eliminan incorrectos o innecesarios. Es responsabilidad del
          usuario actualizar información proporcionada.
        </p>
      </Section>

      <Section title="21. Medidas de Salvaguarda">
        <p>
          Privacidad y seguridad son consideraciones clave. Responsabilidades específicas asignadas,
          cumplimiento de políticas internas, gestión de riesgos, ingeniería de seguridad, capacitación
          y evaluaciones. Se abordan seguridad en línea, física, riesgo de pérdida de datos.
          Acceso a bases de datos restringido a personas autorizadas.
        </p>
      </Section>

      <Section title="22. Legislación Aplicable y Jurisdicción">
        <p>
          Política normada por ley peruana. Cualquier disputa o reclamo se rige por esta legislación.
        </p>
      </Section>

      <Section title="23. Contacto">
        <p>
          Preguntas, solicitudes y comentarios dirigidos a:{' '}
          <a href="mailto:prestamos@baldecash.com" className="text-[#4654CD] hover:underline">
            prestamos@baldecash.com
          </a>
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
