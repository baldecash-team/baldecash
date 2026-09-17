'use client';

/**
 * Sub-paso KYC: contrato.
 *
 * Muestra el contrato EMITIDO de la solicitud —el que legacy congela al
 * aprobar— y exige aceptación explícita antes de continuar. Antes embebía un
 * PDF estático de S3: el mismo documento para todas las solicitudes, sin el
 * nombre, el equipo ni el cronograma de quien firma. Aceptar ese contrato no
 * era aceptar el propio.
 *
 * `disponible: false` no es un error: el contrato nace con la aprobación, así
 * que antes de eso su ausencia es el estado normal del flujo y el paso muestra
 * que se está generando. Lo que no puede pasar es mostrar un documento ajeno.
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
// Del módulo del hook y no del barril `_shared`: media pantalla de tests mockea
// el barril entero, y de ahí `useIsMobile` volvería undefined.
import { useIsMobile } from '@/app/prototipos/_shared/hooks/useIsMobile';
import { CheckboxField } from '../../components/solicitar/fields/CheckboxField';
import { useKycTracker, type KycTrack } from '../useKycTracker';
import { useContratoKyc } from '../useContratoKyc';
import { ConfirmarDatosCard } from './ConfirmarDatosCard';
import { ContratoEsperando } from './ContratoEsperando';
import { ResumenOperacionCard } from './ResumenOperacionCard';
import {
  getResumenOperacion,
  type ResumenOperacion,
} from '@/app/prototipos/0.6/services/kycApi';
import {
  esFamilyFarms,
  esFamilyFarmsAdministrativo,
} from '@/app/prototipos/0.6/utils/familyFarms';

/** Lo que el paso expone al orquestador: reabrirlo cuando el backend dice
 *  que el contrato aceptado quedo viejo (409 / `contrato_vencido`). */
export interface ContratoStepHandle {
  marcarVencido: () => void;
}

export interface ContratoStepProps {
  /** Con firma por aceptacion lleva el hash de lo aceptado; si no, nada. */
  onDone: (datos?: { contractHash?: string; externalId?: string }) => void;
  onBack?: () => void;
  /** application_code, para que los eventos de este sub-paso sean rastreables. */
  applicationCode?: string;
  /** Emisor de eventos alternativo (ruta tokenizada /kyc/[token]); ver useKycTracker. */
  onTrack?: KycTrack;
  /** Prueba de titularidad del flujo en sesión. */
  documentNumber?: string;
  /** Prueba de titularidad del flujo por link. Gana sobre el DNI. */
  resumeToken?: string;
  /**
   * Slug de la landing. Decide qué autorizaciones del convenio se piden: sin
   * él no se muestran, que es el comportamiento correcto fuera de Family Farms.
   */
  landing?: string;
  /**
   * El contrato de esta solicitud YA fue aceptado: el sub-paso está cerrado en
   * el estado del KYC, o se aceptó recién en esta sesión.
   *
   * Pasa cuando la persona retrocede desde un sub-paso posterior. Volver a
   * pedirle la casilla le diría que lo que ya hizo no contó, y cada Continuar
   * sería una firma nueva sobre el mismo documento. Acá la pantalla queda de
   * lectura: el contrato sigue a la vista para releerlo y el botón continúa.
   */
  yaAceptado?: boolean;
}

/**
 * Autorizaciones del convenio Family Farms, aparte de la aceptación del
 * contrato: son permisos que el trabajador da sobre su remuneración y su
 * liquidación, así que se marcan una por una y no se pueden dar por incluidas
 * en un "acepto todo".
 *
 * `soloAdministrativo` existe porque el descuento por planilla solo aplica al
 * perfil G1 —el único quincenal, donde Valle y Pampa retiene y transfiere—; a
 * los otros dos se les cobra directo y pedirles esa autorización sería pedir
 * permiso para algo que no va a pasar.
 */
interface AutorizacionConvenio {
  id: string;
  texto: string;
  soloAdministrativo?: boolean;
}

/**
 * Lo que dice el botón mientras ws2 todavía no mandó su texto.
 *
 * El mismo de siempre y no un "Continuar" de transición: el botón hace una sola
 * cosa en esta pantalla, y cambiarle el nombre según si el documento ya llegó
 * hace dudar de si se está por firmar o por avanzar.
 */
const TEXTO_BOTON_FIRMA = 'Firmar electrónicamente';

const AUTORIZACIONES_FAMILY_FARMS: AutorizacionConvenio[] = [
  {
    // Primero: es la que condiciona cómo se cobra todos los meses, mientras que
    // la de liquidación solo entra en juego si hay cese.
    id: 'descuento-planilla',
    soloAdministrativo: true,
    texto:
      'Autorizo a Family Farms Perú a retener de mi remuneración la cuota quincenal '
      + 'establecida en el cronograma de pagos del Contrato y a transferirla a BaldeCash.',
  },
  {
    id: 'fondo-liquidacion',
    texto:
      'Autorizo que, en caso de cese, se aplique al saldo pendiente de este financiamiento '
      + 'el importe que me corresponda por vacaciones truncas y días pendientes de pago, '
      + 'conforme al Anexo 1-A del Contrato. La presente autorización no comprende la '
      + 'Compensación por Tiempo de Servicios.',
  },
];

export const ContratoStep = forwardRef<ContratoStepHandle, ContratoStepProps>(function ContratoStep({
  onDone, onBack, applicationCode, onTrack, documentNumber, resumeToken, landing, yaAceptado,
}: ContratoStepProps, ref) {
  const [accepted, setAccepted] = useState<'true' | 'false'>('false');
  // El contrato aceptado quedó viejo (409 / `contrato_vencido`): lo que se
  // aceptó ya no existe, así que la aceptación previa deja de valer y la
  // pantalla vuelve a pedirla sobre el documento nuevo.
  const [vencidoTrasAceptar, setVencidoTrasAceptar] = useState(false);
  // El clic final no puede ejecutarse dos veces (§4 paso 9): un doble toque en
  // móvil crearía dos aceptaciones de la misma operación.
  const [enviando, setEnviando] = useState(false);
  // Los números de la operación, para que aceptar el contrato no sea aceptar
  // cifras que la persona nunca vio ordenadas (§5). Fail-safe: sin resumen la
  // tarjeta no se pinta y el paso sigue igual.
  const [resumen, setResumen] = useState<ResumenOperacion | null>(null);
  const [autorizaciones, setAutorizaciones] = useState<Record<string, boolean>>({});
  const track = useKycTracker(onTrack);

  /** Se volvió a este paso con el contrato ya firmado: nada que aceptar de nuevo. */
  const aceptadoPreviamente = Boolean(yaAceptado) && !vencidoTrasAceptar;

  // La espera del contrato vive en el hook: polling, tope y reintento. Acá solo
  // se decide qué se pinta con cada estado.
  const {
    contrato, estado, hayDocumento, exigeAceptar, sinRegistro, reintentar, marcarVencido,
  } = useContratoKyc({ applicationCode, documentNumber, resumeToken, track });

  useEffect(() => {
    // `ya_aceptado` separa la primera lectura de la revisita: sin eso, quien
    // mire los eventos ve dos vistas del contrato y una sola firma.
    track('kyc_contract_view', {
      application_code: applicationCode,
      ya_aceptado: aceptadoPreviamente,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Sin código de solicitud no hay qué resumir: el paso se puede montar
    // antes de que exista (los prototipos lo hacen).
    if (!applicationCode) return;

    let vivo = true;
    getResumenOperacion({ applicationCode, documentNumber, resumeToken })
      .then((r) => { if (vivo) setResumen(r); });

    return () => { vivo = false; };
  }, [applicationCode, documentNumber, resumeToken]);

  /**
   * El orquestador reabre el paso cuando el backend dice que lo aceptado ya no
   * es el contrato vigente. Se desmarca la aceptación: lo que se aceptó dejó de
   * existir, y dejar el check puesto sobre un documento nuevo sería mentir.
   */
  useImperativeHandle(ref, () => ({
    marcarVencido: () => {
      // Se suelta el botón: por este camino `onDone` no vuelve y el paso se
      // reabre con la casilla de nuevo. Sin esto quedaba en "Firmando…",
      // deshabilitado, sobre un contrato que sí hay que volver a aceptar.
      setEnviando(false);
      setAccepted('false');
      // Y se cae la aceptación previa: el documento que se aceptó ya no es el
      // vigente, así que la pantalla vuelve a exigir la casilla.
      setVencidoTrasAceptar(true);
      marcarVencido();
    },
  }), [marcarVencido]);

  // Los textos los sirve ws2 y se pintan tal cual: la redacción que la persona
  // ve es la que después queda sellada como evidencia de qué aceptó. Si el
  // front la compusiera, podría desviarse de lo aprobado sin que nadie se
  // entere. Cuando no vienen —un ws2 sin desplegar— el paso se comporta como
  // siempre en vez de mostrar media pantalla con relleno.
  const textos = contrato?.aceptacion;

  // El snapshot gana sobre el PDF: es el documento congelado, con su hash
  // detrás. El camino `aceptacion` trae PDF; el `emitido` puede traer los dos.
  const html = hayDocumento ? contrato?.html : undefined;
  const pdf = hayDocumento && !html ? contrato?.url : undefined;

  // En móvil el visor arranca al 75%: a tamaño completo la hoja A4 entra por la
  // mitad y el contrato se lee a fuerza de arrastrar de costado. El `#zoom` es
  // un fragmento, así que no viaja al servidor ni invalida la firma del enlace.
  const isMobile = useIsMobile();
  const pdfSrc = pdf && isMobile ? `${pdf}#zoom=75` : pdf;

  // Las que le corresponden a ESTE postulante. Fuera del convenio la lista
  // queda vacía y el paso se comporta igual que siempre.
  const autorizacionesAplicables = useMemo(() => {
    if (!esFamilyFarms(landing)) return [];
    const esAdministrativo = esFamilyFarmsAdministrativo(landing);
    return AUTORIZACIONES_FAMILY_FARMS.filter((a) => !a.soloAdministrativo || esAdministrativo);
  }, [landing]);

  const faltaAlgunaAutorizacion = autorizacionesAplicables.some((a) => !autorizaciones[a.id]);

  // Sin documento no hay nada que firmar: ahí el botón sí queda deshabilitado,
  // porque no es que falte marcar algo, es que todavía no existe el contrato.
  const sinQueFirmar = exigeAceptar && !hayDocumento;

  // En `emitido` el contrato lo emite legacy AL APROBAR, y en el KYC la
  // aprobación corre después de esta pantalla: acá no hay nada que esperar.
  // Antes se pintaba «Tu contrato se está generando» y, a los 90 s, «No pudimos
  // preparar tu contrato» con un botón Reintentar. Las dos cosas prometían un
  // documento que en este paso no puede llegar. Ahora no se pinta nada: el paso
  // queda con los datos, los números y el Continuar habilitado, que es lo único
  // que hay para hacer.
  //
  // `contrato === null` NO entra acá: mientras no llegó la primera respuesta no
  // se sabe el modo, y ahí esperar es lo correcto.
  const nadaQueEsperar = contrato?.modo === 'emitido' && !hayDocumento;
  // Con el contrato ya aceptado no falta nada que marcar: las casillas ni se
  // muestran, y exigirlas dejaría el botón señalando en rojo campos que no
  // están en pantalla.
  const faltaAceptacion = hayDocumento && !aceptadoPreviamente && accepted !== 'true';
  const faltaAutorizacion = hayDocumento && !aceptadoPreviamente && faltaAlgunaAutorizacion;

  // El botón queda clickeable con las casillas sin marcar, y es el click el que
  // las señala en rojo. Deshabilitado, la persona no tiene forma de saber qué le
  // falta: el botón apagado no dice nada y la casilla tampoco. Se limpia solo al
  // marcar, porque el error se deriva del estado actual, no de un flag pegado.
  const [intentoIncompleto, setIntentoIncompleto] = useState(false);

  const handleAcceptChange = (value: string | string[]) => {
    const next = value as 'true' | 'false';
    setAccepted(next);
    if (next === 'true') {
      track('kyc_contract_accepted', { application_code: applicationCode });
    }
  };

  const handleAutorizacionChange = (id: string, value: string | string[]) => {
    const marcada = value === 'true';
    setAutorizaciones((prev) => ({ ...prev, [id]: marcada }));
    // Solo al marcar: desmarcar y volver a marcar no es una autorización nueva,
    // y emitir en ambos sentidos convertiría el conteo en ruido.
    if (marcada) {
      track('kyc_contract_authorization_accepted', {
        autorizacion: id,
        application_code: applicationCode,
      });
    }
  };

  /**
   * La firma: el Continuar con el contrato aceptado y las autorizaciones que le
   * tocan a este perfil.
   *
   * Se emite ADEMÁS de `kyc_contract_accepted` y del `kyc_step_complete` que
   * manda el wizard — no reemplaza a ninguno. Existe porque ninguno de los dos
   * dice QUÉ autorizó: uno solo mira el check del contrato y el otro solo el
   * avance de paso. Sin esto, lo único que quedaba de las autorizaciones era
   * que el botón se había habilitado.
   */
  const handleContinuar = () => {
    if (enviando) return;
    if (faltaAceptacion || faltaAutorizacion) {
      setIntentoIncompleto(true);
      return;
    }
    setEnviando(true);
    // En la revisita no se firma nada nuevo: no se emite otra firma. El avance
    // queda igual en `kyc_step_complete`, que lo manda el orquestador.
    if (!aceptadoPreviamente) {
      track('kyc_contract_signed', {
        application_code: applicationCode,
        contract_hash: contrato?.hash,
        external_id: contrato?.external_id,
        autorizaciones: autorizacionesAplicables
          .filter((a) => autorizaciones[a.id])
          .map((a) => a.id),
        // La redacción que estaba en pantalla. Queda en el evento además de en
        // la firma: si algún día no coinciden, se ve dónde se rompió.
        declaracion_version: textos?.version,
      });
    }
    // El hash solo viaja en el camino de firma por aceptación: es lo que ata
    // esta aceptación al PDF que se mostró. En `emitido` no hay hash que atar.
    onDone(
      exigeAceptar
        ? { contractHash: contrato?.hash, externalId: contrato?.external_id }
        : undefined,
    );
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1f2937]">Contrato</h2>
        <p className="text-[#6b7280] text-sm mt-1">
          {aceptadoPreviamente
            ? 'Ya aceptaste este contrato. Puedes releerlo y seguir con tu solicitud.'
            : 'Revisa y acepta los términos de tu contrato antes de continuar.'}
        </p>
      </div>

      {/* El orden del §5: primero quién es (identidad bloqueada, contacto
          editable), después cuánto (los números), y recién ahí el documento.
          Los dos van arriba y no debajo: son lo que la persona necesita para
          leer el contrato con criterio, no un resumen de lo que ya leyó. */}
      <ConfirmarDatosCard
        applicationCode={applicationCode}
        documentNumber={documentNumber}
        resumeToken={resumeToken}
      />
      <ResumenOperacionCard resumen={resumen} />

      {/* El aviso va ANTES de la casilla (§4 paso 7): dice qué se está por
          hacer y a qué queda asociado, para que marcarla no sea un clic a
          ciegas.

          Antes era un párrafo gris de 12px entre dos tarjetas, y se leía como
          la letra chica que se saltea. Es lo contrario: es lo único de la
          pantalla que explica qué significa aceptar. Ahora lleva título, un
          el cuerpo al mismo tamaño que se lee todo lo demás. Sin barra de color
          al costado: el título y el ícono ya lo distinguen, y la barra lo hacía
          leer como una alerta cuando es una explicación. */}
      {/* Retroceder con el contrato ya firmado: se dice que ya está aceptado en
          vez de volver a pedir la casilla, que es lo que haría dudar de si la
          aceptación anterior contó. */}
      {aceptadoPreviamente && (
        <div
          data-testid="contrato-ya-aceptado"
          className="rounded-xl border border-[#BBE7CE] bg-[#F1FAF5] p-4"
        >
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 flex-shrink-0 text-[#1E7F50]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 3 3 5-6" />
            </svg>
            <p className="text-sm font-semibold text-[#14603B]">
              Ya aceptaste este contrato
            </p>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[#1f2937]">
            Tu aceptación quedó registrada. Lo dejamos acá para que puedas
            releerlo; no hace falta aceptarlo otra vez para continuar.
          </p>
        </div>
      )}

      {textos && !aceptadoPreviamente && (
        <div
          data-testid="contrato-aviso"
          className="rounded-xl border border-[#DDDFF7] bg-[#F5F6FE] p-4"
        >
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 flex-shrink-0 text-[#4654CD]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <p className="text-sm font-semibold text-[#1f2937]">
              Aviso de aceptación electrónica
            </p>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
            {textos.aviso}
          </p>
        </div>
      )}

      {/* La espera tiene UN solo estado, y dice lo que está pasando desde el
          primer segundo. Antes había un skeleton gris para la primera carga y
          recién después el bloque con el texto: el resultado era una caja en
          blanco que a los segundos cambiaba de forma, como si algo hubiera
          fallado y se hubiera recuperado. */}
      {html ? (
        <div
          data-testid="contrato-documento"
          className="w-full h-[60vh] md:h-80 overflow-auto overscroll-contain rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm leading-relaxed text-[#374151]"
          // Scroll en los dos ejes y no solo vertical: el snapshot de legacy
          // trae tablas (el cronograma) más anchas que un teléfono, y
          // recortadas no hay forma de leerlas. `overscroll-contain` evita que
          // al llegar al final del documento el gesto arrastre la página.
          style={{ WebkitOverflowScrolling: 'touch' }}
          // El html viene del snapshot congelado en legacy, no de entrada del
          // usuario: es el mismo documento que quedó guardado al aprobar.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : pdf ? (
        <div className="space-y-2">
          <iframe
            data-testid="contrato-documento"
            src={pdfSrc}
            title="Contrato"
            className="w-full h-[60vh] md:h-80 rounded-xl border border-[#e5e7eb]"
          />
          {/* En movil el visor embebido de PDF es incomodo o directamente no
              carga: el link es la salida para poder leerlo antes de aceptar. */}
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('kyc_contract_opened_external', {
              application_code: applicationCode,
              external_id: contrato?.external_id,
            })}
            className="inline-block text-xs font-semibold text-[#4654CD] hover:underline"
          >
            Abrir en pestaña nueva
          </a>
        </div>
      ) : sinRegistro ? (
        /* El único error que no se resuelve reintentando: la solicitud no llegó
           al sistema que emite el contrato. Por eso no lleva botón, lleva
           contacto. */
        <div
          data-testid="contrato-sin-registro"
          className="w-full rounded-xl border border-[#fecaca] bg-[#fef2f2] p-6 text-center"
        >
          <p className="text-sm font-semibold text-[#991b1b]">
            Tu solicitud no quedó registrada
          </p>
          <p className="mt-1 text-xs text-[#7f1d1d]">
            No podemos preparar tu contrato hasta resolverlo. Escríbenos al
            957 082 347 y lo vemos.
          </p>
        </div>
      ) : nadaQueEsperar ? null : estado === 'error' ? (
        <div
          data-testid="contrato-error"
          className="w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6 text-center"
        >
          <p className="text-sm font-semibold text-[#374151]">
            No pudimos preparar tu contrato
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            Puede ser algo momentáneo. Inténtalo de nuevo.
          </p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-3 rounded-xl border border-[#4654CD] px-4 py-2 text-sm font-semibold text-[#4654CD] hover:bg-[#ECECFB] transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ContratoEsperando outdated={estado === 'outdated'} />
      )}


      {/* Las casillas van DEBAJO del documento: marcarlas sin haberlo tenido
          delante es exactamente lo que el §4 evita. Agrupadas en su propio
          bloque para que se lean como una unidad —lo que se acepta— y no como
          dos campos sueltos del formulario. */}
      {hayDocumento && !aceptadoPreviamente && (
        <div
          data-testid="contrato-casillas"
          className="space-y-1 rounded-xl border border-[#DDDFF7] bg-white p-4"
        >
          <CheckboxField
            id="accept-contract"
            // `||` y no `??`: una declaración vacía (ws2 sin desplegar, o un
            // texto que no llegó) dejaba la casilla sin nada al lado, y una
            // casilla sin texto no dice qué se está aceptando.
            label={textos?.declaracion || 'He leído y acepto el contrato'}
            value={accepted}
            onChange={handleAcceptChange}
            required
            error={
              intentoIncompleto && accepted !== 'true'
                ? 'Necesitamos que aceptes el contrato para continuar'
                : undefined
            }
            // La declaración del §6 son varias líneas: centrada, la casilla
            // queda flotando a mitad del párrafo.
            alignTop
          />

          {/* Autorizaciones del convenio: van DEBAJO de la aceptación del
              contrato porque se refieren a él (el Anexo 1-A, el cronograma de
              pagos), y entre ellas manda el orden de la lista. Cada una es un
              permiso distinto sobre el dinero del trabajador: se marcan de a
              una, nunca en bloque. */}
          {autorizacionesAplicables.map((a) => (
            <CheckboxField
              key={a.id}
              id={`autorizacion-${a.id}`}
              label={a.texto}
              value={autorizaciones[a.id] ? 'true' : 'false'}
              onChange={(value) => handleAutorizacionChange(a.id, value)}
              required
              error={
                intentoIncompleto && !autorizaciones[a.id]
                  ? 'Necesitamos esta autorización para continuar'
                  : undefined
              }
              alignTop
            />
          ))}
        </div>
      )}

      {/* En el teléfono uno encima del otro y no dos botones a medio ancho: la
          acción principal arriba, con el ancho completo para el pulgar.
          `flex-col-reverse` mantiene "Atrás" primero en el DOM (orden de
          tabulación) y lo pinta debajo. Desde `sm` vuelve la fila de siempre. */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {/* Firmó: no hay a dónde volver dentro del wizard (gate G2). El botón
            desaparece acá y el indicador de pasos se bloquea en `StepClient` —
            las dos superficies por las que se podía intentar retroceder. */}
        {onBack && !aceptadoPreviamente && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-3 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          // Con firma por aceptación el documento es OBLIGATORIO: aceptarlo ES
          // firmarlo, así que sin leerlo no hay nada que firmar.
          //
          // En el camino `emitido` el contrato nace con la aprobación —después
          // de esta pantalla—, así que su ausencia no puede trabar el flujo:
          // ahí solo se exige aceptar cuando SÍ hay documento.
          disabled={enviando || sinQueFirmar}
          onClick={handleContinuar}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {/* Firmar no es instantáneo: el paso del contrato es el ÚNICO que
              espera la respuesta del backend (un 409 no puede avanzar), y eso
              tarda. Sin esto la única señal era el botón bajando a opacidad 50,
              que se lee como "deshabilitado" y no como "estoy trabajando" — y
              la persona vuelve a tocarlo. */}
          {enviando ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin motion-reduce:animate-none"
              />
              Firmando…
            </span>
          ) : (
            /* El texto también lo manda ws2: "ACEPTAR Y CONTRATAR" dice qué hace
               el botón, y "Continuar" no. Solo cuando hay documento que aceptar:
               en la espera y en el error sigue siendo un Continuar. */
            aceptadoPreviamente ? 'Continuar' : (textos?.boton || TEXTO_BOTON_FIRMA)
          )}
        </button>
      </div>
    </div>
  );
});

export default ContratoStep;
