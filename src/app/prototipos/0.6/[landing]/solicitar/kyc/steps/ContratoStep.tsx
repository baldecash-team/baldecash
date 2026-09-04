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
import { CheckboxField } from '../../components/solicitar/fields/CheckboxField';
import { useKycTracker, type KycTrack } from '../useKycTracker';
import { useContratoKyc } from '../useContratoKyc';
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

export const ContratoStep = forwardRef<ContratoStepHandle, ContratoStepProps>(function ContratoStep({
  onDone, onBack, applicationCode, onTrack, documentNumber, resumeToken, landing,
}: ContratoStepProps, ref) {
  const [accepted, setAccepted] = useState<'true' | 'false'>('false');
  const [autorizaciones, setAutorizaciones] = useState<Record<string, boolean>>({});
  const track = useKycTracker(onTrack);

  // La espera del contrato vive en el hook: polling, tope y reintento. Acá solo
  // se decide qué se pinta con cada estado.
  const {
    contrato, estado, hayDocumento, exigeAceptar, sinRegistro, reintentar, marcarVencido,
  } = useContratoKyc({ applicationCode, documentNumber, resumeToken, track });

  useEffect(() => {
    track('kyc_contract_view', { application_code: applicationCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * El orquestador reabre el paso cuando el backend dice que lo aceptado ya no
   * es el contrato vigente. Se desmarca la aceptación: lo que se aceptó dejó de
   * existir, y dejar el check puesto sobre un documento nuevo sería mentir.
   */
  useImperativeHandle(ref, () => ({
    marcarVencido: () => {
      setAccepted('false');
      marcarVencido();
    },
  }), [marcarVencido]);

  // El snapshot gana sobre el PDF: es el documento congelado, con su hash
  // detrás. El camino `aceptacion` trae PDF; el `emitido` puede traer los dos.
  const html = hayDocumento ? contrato?.html : undefined;
  const pdf = hayDocumento && !html ? contrato?.url : undefined;

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
    track('kyc_contract_signed', {
      application_code: applicationCode,
      contract_hash: contrato?.hash,
      external_id: contrato?.external_id,
      autorizaciones: autorizacionesAplicables
        .filter((a) => autorizaciones[a.id])
        .map((a) => a.id),
    });
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
          Revisa y acepta los términos de tu contrato antes de continuar.
        </p>
      </div>

      {/* El skeleton es solo la PRIMERA carga (todavía no contestó nadie). Una
          vez que hay respuesta, "generando" tiene su propio bloque, que explica
          la espera en vez de simular que el documento está por pintarse. */}
      {!contrato && estado === 'generando' ? (
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
      ) : estado === 'error' ? (
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
        <div
          data-testid="contrato-esperando"
          className="w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6 text-center"
        >
          <p className="text-sm font-semibold text-[#374151]">
            {estado === 'outdated'
              ? 'Tu contrato se actualizó'
              : 'Tu contrato se está generando'}
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            {estado === 'outdated'
              ? 'Preparamos una versión nueva. Revísala y acéptala de nuevo.'
              : 'Tarda unos segundos. Te lo mostramos apenas esté listo para que lo revises y lo firmes.'}
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
              onChange={(value) => handleAutorizacionChange(a.id, value)}
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
          // Con firma por aceptación el documento es OBLIGATORIO: aceptarlo ES
          // firmarlo, así que sin leerlo no hay nada que firmar.
          //
          // En el camino `emitido` el contrato nace con la aprobación —después
          // de esta pantalla—, así que su ausencia no puede trabar el flujo:
          // ahí solo se exige aceptar cuando SÍ hay documento.
          disabled={
            exigeAceptar
              ? !hayDocumento || accepted !== 'true' || faltaAlgunaAutorizacion
              : hayDocumento && (accepted !== 'true' || faltaAlgunaAutorizacion)
          }
          onClick={handleContinuar}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
});

export default ContratoStep;
