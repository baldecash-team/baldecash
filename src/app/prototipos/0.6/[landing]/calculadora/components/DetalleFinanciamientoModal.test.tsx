/**
 * El texto legal del modal de detalle.
 *
 * Antes decia que la cuota "incluye las comisiones operativas" sin decir
 * cuales, y anunciaba una mora escrita a mano en el propio componente. Los dos
 * datos los entrega ahora el endpoint de simulacion, asi que cambiarlos deja de
 * ser un despliegue —y deja de poder desalinearse de lo que se cobra.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DetalleFinanciamientoModal } from './DetalleFinanciamientoModal';
import { perfilDe } from '../perfiles';
import type { SimulacionFinanciamiento } from '../api/simuladorApi';

const SIMULACION: SimulacionFinanciamiento = {
  montoFinanciado: 950,
  plazoMeses: 3,
  cuotaMensual: 373.98,
  cuotaBase: 348.98,
  comisionMensual: 25,
  comisionTotal: 75,
  comisionDesglose: [
    { concepto: 'Gestion del prestamo', monto: 8.93 },
    { concepto: 'Plataforma de pagos', monto: 5.36 },
    { concepto: 'Infraestructura digital / app', monto: 3.57 },
    { concepto: 'Gestion de cobranzas', monto: 7.14 },
  ],
  totalAPagar: 1121.94,
  interesTotal: 96.94,
  tea: 80,
  tcea: 201.81,
  // A proposito distinto de 1: el valor que estaba escrito a mano era S/ 1, y
  // una prueba con 1 no distinguiria si se lee del backend o de la constante.
  moraDiaria: 2.5,
  primerVencimiento: '2026-09-20',
  cronograma: [{ numero: 1, fechaVencimiento: '2026-09-20', total: 373.98 }],
};

// El perfil de matricula es el de una landing sin perfil propio: dos importes y
// la nota de cronograma de siempre.
const PERFIL_MATRICULA = perfilDe('prestamo-matricula');

function montar(simulacion: SimulacionFinanciamiento | null = SIMULACION) {
  return render(
    <DetalleFinanciamientoModal
      abierto
      onCerrar={() => {}}
      simulacion={simulacion}
      montos={{ matricula: 800, primeraCuota: 150 }}
      campos={PERFIL_MATRICULA.campos}
      notaCronograma={PERFIL_MATRICULA.notaCronograma}
    />
  );
}

describe('DetalleFinanciamientoModal', () => {
  it('detalla cada concepto de la comision con su importe', () => {
    montar();

    expect(screen.getByText('Gestion del prestamo')).toBeInTheDocument();
    expect(screen.getByText('Gestion de cobranzas')).toBeInTheDocument();
    expect(screen.getByText('S/ 8.93')).toBeInTheDocument();
    expect(screen.getByText('S/ 7.14')).toBeInTheDocument();
  });

  it('anuncia la mora que devolvio el backend, no una escrita en el componente', () => {
    montar();

    expect(screen.getByText(/S\/ 2\.50 por cada día/i)).toBeInTheDocument();
  });

  /**
   * Sin desglose el texto legal no puede enumerar nada, pero tampoco puede
   * desaparecer: la cuota igual incluye comisiones y hay que decirlo.
   */
  it('cae al texto general cuando el desglose no llego', () => {
    montar({ ...SIMULACION, comisionDesglose: [] });

    expect(screen.getByText(/comisiones operativas del financiamiento/i)).toBeInTheDocument();
  });
});
