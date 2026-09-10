'use client';

/**
 * Pantalla 3: la unidad ya quedó reservada.
 *
 * Se muestra en dos momentos que valen lo mismo para el cliente: justo después
 * de elegir, y al reabrir el link cuando ya había elegido antes (`selected_unit_id`).
 * Por eso no dice "acabas de" nada: dice qué unidad es suya y qué sigue.
 *
 * A diferencia del mockup, acá NO hay un "Volver a ver las unidades": la
 * reserva es definitiva (`elegir_por_token` devuelve siempre la unidad ya
 * reservada, sin importar qué `unit_id` se le mande) y al recargar el link el
 * backend devuelve una sola unidad. Ese botón prometía una elección que ya no
 * existe.
 */

import { useEffect, useState } from 'react';

import type { EleccionProducto, EleccionUnidad } from '../../services/eleccionEquipoApi';
import { getLinkDeFirma } from '../../services/eleccionEquipoApi';
import { BotonWhatsApp } from './Chrome';
import { etiquetaGrado, formatearCuota, nombreUnidad } from './formato';

export interface ConfirmacionProps {
  unidad: EleccionUnidad;
  producto: EleccionProducto;
  cuota: number | string | null;
  /** El token del link. Con él se pide el enlace de firma. */
  token: string;
  /** Se avisa cuando la persona toca el botón para ir a firmar. */
  onIrAFirmar?: () => void;
}

export function Confirmacion({ unidad, producto, cuota, token, onIrAFirmar }: ConfirmacionProps) {
  const titulo = nombreUnidad(unidad.display_number);
  const grado = etiquetaGrado(unidad.grado, unidad.grado_label);
  const cuotaTexto = formatearCuota(cuota);

  // El enlace de firma se pide al montar, no al hacer clic: el token de Keynua
  // expira, así que no se puede tener listo de antes, pero pedirlo recién al
  // tocar el botón dejaría a la persona mirando un botón que no responde
  // mientras viaja la llamada.
  //
  // `null` cubre dos estados que valen lo mismo para la pantalla —todavía no
  // llegó, y no hay— porque en ambos la respuesta es la misma: no mostrar el
  // botón y dejar los pasos que ya explican qué sigue.
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void getLinkDeFirma(token).then((url) => {
      if (vivo) setFirmaUrl(url);
    });
    return () => { vivo = false; };
  }, [token]);

  return (
    <div className="mx-auto max-w-[560px] pt-5 text-center">
      <div className="mx-auto mb-[18px] grid h-[76px] w-[76px] place-items-center rounded-full bg-[#e7faf3] text-[#0a8a5a]">
        <svg
          width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-3xl font-extrabold">¡Listo! 🎉</h1>
      <p className="mx-auto mt-2.5 max-w-[380px] text-[15px] leading-[1.5] text-[#5b5c6b]">
        Elegiste la <b>{titulo}</b>. La reservamos para ti.
      </p>

      <div className="my-[22px] rounded-2xl border border-[#e9e9ef] bg-white px-[18px] py-1.5 text-left shadow-[0_6px_20px_rgba(21,23,68,.06)]">
        {producto.name && <Fila etiqueta="Modelo" valor={producto.name} />}
        {grado && <Fila etiqueta="Grado" valor={grado} />}
        <Fila etiqueta="Unidad elegida" valor={titulo} />
        {cuotaTexto && <Fila etiqueta="Cuota" valor={cuotaTexto} />}
      </div>

      <div className="rounded-2xl bg-[#EEF0FC] p-[18px] text-left">
        <div className="mb-3.5 text-base font-extrabold">Próximos pasos</div>
        {/* El paso 1 cambia según haya botón o no. Prometer "te lo enviaremos a
            tu WhatsApp" cuando el contrato está a un clic manda a esperar algo
            que ya está; y prometerlo cuando el envío está apagado sería
            directamente falso. */}
        <Paso n={1}>
          {firmaUrl ? (
            <>Revisa y firma tu <b>contrato digital</b> desde el botón de abajo.</>
          ) : (
            <>Estamos preparando tu <b>contrato para firma digital</b>.</>
          )}
        </Paso>
        <Paso n={2}>
          Al firmar, coordinamos la <b>entrega o recojo</b> de tu equipo.
        </Paso>
      </div>

      {firmaUrl && (
        <a
          href={firmaUrl}
          // Otra pestaña: la firma es un proceso largo de Keynua —selfie,
          // documento, validaciones— y navegar en la misma pestaña destruiría
          // esta pantalla, que es el único lugar donde consta qué unidad quedó
          // reservada. `noopener` además evita que la pestaña nueva pueda tocar
          // esta por `window.opener`.
          target="_blank"
          rel="noopener noreferrer"
          onClick={onIrAFirmar}
          // Mismo radio y mismo alto que `BotonWhatsApp`, que va justo debajo:
          // son los dos botones de esta pantalla y con radios distintos se
          // ven como piezas de dos diseños.
          className="mt-[18px] block w-full rounded-2xl bg-[#4654CD] p-[15px] text-center text-[15px] font-bold text-white transition-opacity hover:opacity-90"
        >
          Revisar y firmar mi contrato
        </a>
      )}

      <BotonWhatsApp />
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e9e9ef] py-3 text-sm last:border-b-0">
      <span className="text-[#9a9aa8]">{etiqueta}</span>
      <b className="text-right text-[#151744]">{valor}</b>
    </div>
  );
}

function Paso({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-3 text-[13.5px] leading-[1.45] text-[#3a3c52] last:mb-0">
      <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#4654CD] text-[13px] font-bold text-white">
        {n}
      </span>
      <div>{children}</div>
    </div>
  );
}

export default Confirmacion;
