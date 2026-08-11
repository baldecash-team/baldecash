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

import { useEffect, useMemo, useState } from 'react';
import { CheckboxField } from '../../components/solicitar/fields/CheckboxField';
import { useKycTracker, type KycTrack } from '../useKycTracker';
import { getContrato, type ContratoEmitido } from '@/app/prototipos/0.6/services/kycApi';
import {
  esFamilyFarms,
  esFamilyFarmsAdministrativo,
} from '@/app/prototipos/0.6/utils/familyFarms';

export interface ContratoStepProps {
  onDone: () => void;
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

export function ContratoStep({
  onDone, onBack, applicationCode, onTrack, documentNumber, resumeToken, landing,
}: ContratoStepProps) {
  const [accepted, setAccepted] = useState<'true' | 'false'>('false');
  const [autorizaciones, setAutorizaciones] = useState<Record<string, boolean>>({});
  const [contrato, setContrato] = useState<ContratoEmitido | null>(null);
  const [cargando, setCargando] = useState(true);
  const track = useKycTracker(onTrack);

  useEffect(() => {
    track('kyc_contract_view', { application_code: applicationCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // El contrato lo emite legacy al aprobar, y eso tarda unos segundos: en
    // producción el paso preguntó a las 03:27:30 y el documento se emitió a las
    // 03:27:31. Con una sola consulta al montar, esa ventana dejaba el paso en
    // «se está generando» para siempre aunque el contrato existiera un segundo
    // después.
    //
    // Se reintenta unas pocas veces y se abandona: antes de la aprobación el
    // contrato NO existe y puede tardar mucho más, así que insistir sin techo
    // sería pedir indefinidamente por algo que no va a llegar en esta pantalla.
    const INTENTOS = 6;
    const ESPERA_MS = 5000;

    void (async () => {
      if (!applicationCode) { setCargando(false); return; }

      for (let intento = 0; intento < INTENTOS && !cancelado; intento += 1) {
        const r = await getContrato({ applicationCode, documentNumber, resumeToken });
        if (cancelado) return;

        setContrato(r);
        setCargando(false);

        if (r?.disponible && (r.html || r.url)) return;

        if (intento < INTENTOS - 1) {
          await new Promise<void>((resolve) => { timer = setTimeout(resolve, ESPERA_MS); });
        }
      }
    })();

    return () => {
      cancelado = true;
      if (timer) clearTimeout(timer);
    };
  }, [applicationCode, documentNumber, resumeToken]);

  // Sin html no hay nada que aceptar. `getContrato` ya devuelve `null` ante un
  // error, así que la red caída y el "todavía no se emitió" caen al mismo lado:
  // esperar, nunca un documento equivocado.
  // El snapshot gana sobre el PDF: es el documento congelado, con su hash
  // detrás. Hoy llega el PDF, porque `contrato_emitido` no tiene escritor.
  const html = contrato?.disponible ? contrato.html : undefined;
  const pdf = contrato?.disponible && !html ? contrato.url : undefined;
  const hayDocumento = !!html || !!pdf;

  // Las que le corresponden a ESTE postulante. Fuera del convenio la lista
  // queda vacía y el paso se comporta igual que siempre.
  const autorizacionesAplicables = useMemo(() => {
    if (!esFamilyFarms(landing)) return [];
    const esAdministrativo = esFamilyFarmsAdministrativo(landing);
    return AUTORIZACIONES_FAMILY_FARMS.filter((a) => !a.soloAdministrativo || esAdministrativo);
  }, [landing]);

  const faltaAlgunaAutorizacion = autorizacionesAplicables.some((a) => !autorizaciones[a.id]);

  const handleAcceptChange = (value: string | string[]) => {
    const next = value as 'true' | 'false';
    setAccepted(next);
    if (next === 'true') {
      track('kyc_contract_accepted', { application_code: applicationCode });
    }
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1f2937]">Contrato</h2>
        <p className="text-[#6b7280] text-sm mt-1">
          Revisa y acepta los términos de tu contrato antes de continuar.
        </p>
      </div>

      {cargando ? (
        <div className="w-full h-80 rounded-xl border border-[#e5e7eb] bg-[#fafafa] animate-pulse" />
      ) : html ? (
        <div
          data-testid="contrato-documento"
          className="w-full h-80 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm leading-relaxed text-[#374151]"
          // El html viene del snapshot congelado en legacy, no de entrada del
          // usuario: es el mismo documento que quedó guardado al aprobar.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : pdf ? (
        <div className="space-y-2">
          <iframe
            data-testid="contrato-documento"
            src={pdf}
            title="Contrato"
            className="w-full h-80 rounded-xl border border-[#e5e7eb]"
          />
          {/* En movil el visor embebido de PDF es incomodo o directamente no
              carga: el link es la salida para poder leerlo antes de aceptar. */}
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold text-[#4654CD] hover:underline"
          >
            Abrir en pestaña nueva
          </a>
        </div>
      ) : (
        <div
          data-testid="contrato-esperando"
          className="w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6 text-center"
        >
          <p className="text-sm font-semibold text-[#374151]">
            Tu contrato se está generando
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            Se emite cuando aprobamos tu solicitud. Te avisamos apenas esté listo
            para que lo revises y lo firmes.
          </p>
        </div>
      )}

      {hayDocumento && (
        <div className="space-y-4">
          <CheckboxField
            id="accept-contract"
            label="He leído y acepto el contrato"
            value={accepted}
            onChange={handleAcceptChange}
            required
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
              onChange={(value) =>
                setAutorizaciones((prev) => ({ ...prev, [a.id]: value === 'true' }))
              }
              required
            />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-[#4654CD] text-[#4654CD] font-semibold py-2 rounded-xl hover:bg-[#ECECFB] transition-colors cursor-pointer"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          // Con documento hay que aceptarlo, y con él las autorizaciones del
          // convenio que le toquen a este perfil. Sin documento no hay nada que
          // aceptar y bloquear el botón dejaría el KYC trabado esperando algo
          // que solo llega con la aprobación.
          disabled={hayDocumento && (accepted !== 'true' || faltaAlgunaAutorizacion)}
          onClick={onDone}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default ContratoStep;
