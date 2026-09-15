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
import {
  FormularioEntrega,
  type EntregaDireccionInicial,
  type OpcionEnvio,
  type ValoresEntrega,
} from '../components/FormularioEntrega';

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
  { id: 'express', nombre: 'Envío Express', condicion: 'Envío hasta 2 días hábiles.', costo: 25, disponible: false },
];

const CON_DIRECCION: EntregaDireccionInicial = {
  direccion: 'Av. Benavides 1238',
  calle: 'Dpto 301',
  referencia: 'Frente al parque, edificio azul',
  ubicacion: 'Miraflores, Lima, Lima',
  distrito: 'Miraflores',
  distritoId: '1508',
};

const SIN_DIRECCION: EntregaDireccionInicial = {};

type Caso = 'con' | 'sin';

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

  return (
    <main className="min-h-screen bg-[#F7F7FB] px-4 py-8">
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
      </div>

      <FormularioEntrega
        key={caso}
        equipo={EQUIPO}
        direccionInicial={caso === 'con' ? CON_DIRECCION : SIN_DIRECCION}
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
    </main>
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
