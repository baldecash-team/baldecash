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

// Como llega de la postulación: todo en un solo campo. Al tocar «Editar» el
// Dpto pasa al segundo renglón y departamento/provincia quedan elegidos.
const CON_DIRECCION: EntregaDireccionInicial = {
  direccion: 'Av. Benavides 1238 Dpto 301',
  calle: '',
  referencia: 'Frente al parque, edificio azul',
  ubicacion: 'Miraflores, Lima, Lima',
  distrito: 'Miraflores',
  distritoId: '1483',
  departamento: 'Lima',
  provincia: 'Lima',
};

// Dirección escrita pero sin id de distrito: abre en la pantalla de dirección
// con la vía, la Mz/Lt y la cascada ya completas a partir de los nombres.
const SOLO_TEXTO: EntregaDireccionInicial = {
  direccion: 'Av. Los Olivos 450 Mz A Lt 5',
  calle: '',
  referencia: '',
  distrito: 'San Martín de Porres',
  departamento: 'Lima',
  provincia: 'Lima',
};

const SIN_DIRECCION: EntregaDireccionInicial = {};

type Caso = 'con' | 'texto' | 'sin';

const INICIAL: Record<Caso, EntregaDireccionInicial> = {
  con: CON_DIRECCION,
  texto: SOLO_TEXTO,
  sin: SIN_DIRECCION,
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
          <Boton activo={caso === 'texto'} onClick={() => reiniciar('texto')}>
            Dirección sin ubigeo
          </Boton>
          <Boton activo={caso === 'sin'} onClick={() => reiniciar('sin')}>
            Sin dirección ni ubigeo
          </Boton>
        </div>
      </div>

      <FormularioEntrega
        key={caso}
        equipo={EQUIPO}
        direccionInicial={INICIAL[caso]}
        opcionesEnvio={OPCIONES}
        permiteEditarDireccion
        prellenarDireccion
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
