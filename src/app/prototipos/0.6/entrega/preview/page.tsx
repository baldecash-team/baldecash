'use client';

/**
 * Vista de muestra del formulario de entrega — `/prototipos/0.6/entrega/preview`.
 *
 * Sirve para ver y probar la pantalla sin token, sin backend y sin una solicitud
 * real: los datos de abajo son de ejemplo y el envío no registra nada. Cuando el
 * formulario se enganche al flujo por token, esta página se puede borrar sin
 * tocar el componente.
 */

import { useState } from 'react';
import { EntregaLayout } from '../components/EntregaLayout';
import {
  FormularioEntrega,
  type EntregaDireccionInicial,
  type OpcionEnvio,
  type ValoresEntrega,
} from '../components/FormularioEntrega';
import { CASOS_COURIER, type MotivoCourier } from './casosCourier';

const EQUIPO = {
  nombre: 'ExpertBook P1',
  cuotaMensual: '168.00',
  cuotas: 24,
  cuotaInicial: null,
  accesorios: ['Mouse inalámbrico'],
  specs: [
    { label: 'Procesador', valor: 'Intel Core i5-1235U' },
    { label: 'Memoria RAM', valor: '16 GB' },
    { label: 'Almacenamiento', valor: '512 GB' },
    { label: 'Tamaño de Pantalla', valor: '14 pulgadas' },
  ],
};

const OPCIONES: OpcionEnvio[] = [
  { id: 'gratis', nombre: 'Envío gratis', condicion: 'Envío hasta 5 días hábiles.', costo: 0 },
];

const CON_DIRECCION: EntregaDireccionInicial = {
  direccion: 'Av. Benavides 1238',
  calle: 'Dpto 301',
  referencia: 'Frente al parque, edificio azul',
  ubicacion: 'Miraflores, Lima, Lima',
  distrito: 'Miraflores',
  distritoId: '1483',
};

const SIN_DIRECCION: EntregaDireccionInicial = {};

/** `con`, `sin` o el id de un caso del courier. */
type Caso = string;

const MOTIVOS: MotivoCourier[] = Array.from(new Set(CASOS_COURIER.map((c) => c.motivo)));

const direccionDe = (caso: Caso): EntregaDireccionInicial => {
  if (caso === 'con') return CON_DIRECCION;
  if (caso === 'sin') return SIN_DIRECCION;
  return CASOS_COURIER.find((c) => c.id === caso)?.direccion ?? SIN_DIRECCION;
};

export default function EntregaPreviewPage() {
  const [caso, setCaso] = useState<Caso>('con');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [ultimo, setUltimo] = useState<ValoresEntrega | null>(null);

  const reiniciar = (siguiente: Caso) => {
    setCaso(siguiente);
    setEnviando(false);
    setListo(false);
    setUltimo(null);
  };

  const enviar = (valores: ValoresEntrega) => {
    setUltimo(valores);
    setEnviando(true);
    // Sin backend: el retraso solo existe para ver el estado de carga.
    setTimeout(() => {
      setEnviando(false);
      setListo(true);
    }, 1200);
  };

  const casoCourier = CASOS_COURIER.find((c) => c.id === caso);

  return (
    <EntregaLayout>
      <div className="mx-auto mb-6 w-full max-w-[600px]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8A8B99]">
          Muestra · datos de ejemplo, no registra nada
        </p>
        <div className="flex flex-wrap gap-2">
          <Boton activo={caso === 'con'} onClick={() => reiniciar('con')}>
            Con dirección
          </Boton>
          <Boton activo={caso === 'sin'} onClick={() => reiniciar('sin')}>
            Sin dirección ni ubigeo
          </Boton>
        </div>

        <p className="mb-1 mt-6 text-xs font-semibold uppercase tracking-widest text-[#8A8B99]">
          Casos que el courier no pudo entregar · 24 y 25 set
        </p>
        <p className="mb-3 text-[13px] text-[#8A8B99]">
          Anonimizados: sin nombres ni teléfonos, con los números de lote cambiados.
        </p>
        <div className="flex flex-col gap-3">
          {MOTIVOS.map((motivo) => (
            <div key={motivo}>
              <p className="mb-1.5 text-[13px] font-semibold text-[#5F6070]">{motivo}</p>
              <div className="flex flex-wrap gap-2">
                {CASOS_COURIER.filter((c) => c.motivo === motivo).map((c) => (
                  <Boton key={c.id} activo={caso === c.id} onClick={() => reiniciar(c.id)}>
                    {c.zona}
                  </Boton>
                ))}
              </div>
            </div>
          ))}
        </div>

        {casoCourier && (
          <div className="mt-4 rounded-xl border border-[#E3E4EC] bg-white p-4 text-sm leading-snug">
            <p className="text-[13px] font-semibold text-[#4654CD]">
              {casoCourier.motivo} · {casoCourier.zona}
            </p>
            <p className="mt-1.5 text-[#222226]">
              <span className="text-[#8A8B99]">Qué pasó: </span>{casoCourier.problema}
            </p>
            <p className="mt-1 text-[#222226]">
              <span className="text-[#8A8B99]">Qué hace el formulario: </span>{casoCourier.ahora}
            </p>
          </div>
        )}
      </div>

      <FormularioEntrega
        key={caso}
        equipo={EQUIPO}
        direccionInicial={direccionDe(caso)}
        opcionesEnvio={OPCIONES}
        permiteEditarDireccion
        enviando={enviando}
        listo={listo}
        onEnviar={enviar}
        onVerSolicitud={() => reiniciar(caso)}
      />

      {ultimo && (
        <div className="mx-auto mt-8 w-full max-w-[600px]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8A8B99]">
            Lo que devolvió el formulario
          </p>
          <pre className="overflow-x-auto rounded-xl border border-[#E3E4EC] bg-white p-4 text-[12px] leading-relaxed text-[#5F6070]">
            {JSON.stringify(ultimo, null, 2)}
          </pre>
        </div>
      )}
    </EntregaLayout>
  );
}

function Boton({
  activo, onClick, children,
}: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
        activo
          ? 'border-[#4654CD] bg-[#4654CD] text-white'
          : 'border-[#C9CBD8] bg-white text-[#5F6070] hover:border-[#4654CD]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
