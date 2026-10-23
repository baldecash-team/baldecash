/**
 * BAL-4966 · Paso 4 · Resumen de Diseño 2: las reglas puras.
 */
import {
  segurosVanEnElPaso4,
  solicitudCreadaAntesDelPaso,
  hayComplementosDespues,
  seccionesDeComplementos,
  textoDelEnvio,
  nombreDelUltimoPaso,
  encabezadoDelPaso4,
  tieneSeccionDeSeguros,
  SUBTITULO_PASO4,
} from '../paso4/paso4';
import type { SolicitarSection } from '@/app/prototipos/0.6/services/landingApi';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

const SEGURO: SolicitarSection = { type: 'insurance', order: 3, enabled: true };
const ACCESORIOS: SolicitarSection = { type: 'accessories', order: 4, enabled: true };

const base = {
  diseno2: true,
  esResumen: true,
  esElQueEnvia: true,
  sectionsAfterWizard: [SEGURO],
  envioAnticipadoStep: null,
  indicePaso: 3,
  yaEnviada: false,
};

describe('segurosVanEnElPaso4', () => {
  it('Diseño 2, resumen que envía y sección insurance activa: sí', () => {
    expect(segurosVanEnElPaso4(base)).toBe(true);
  });

  it('sin la sección insurance: no', () => {
    expect(segurosVanEnElPaso4({ ...base, sectionsAfterWizard: [] })).toBe(false);
    expect(segurosVanEnElPaso4({ ...base, sectionsAfterWizard: undefined })).toBe(false);
  });

  it('Diseño 1: nunca (los seguros siguen en /complementos)', () => {
    expect(segurosVanEnElPaso4({ ...base, diseno2: false })).toBe(false);
  });

  it('un paso regular o un resumen que no envía: no', () => {
    expect(segurosVanEnElPaso4({ ...base, esResumen: false })).toBe(false);
    expect(segurosVanEnElPaso4({ ...base, esElQueEnvia: false })).toBe(false);
  });

  it('envío anticipado en una pantalla ANTERIOR: no (D5, no hay cómo agregarlos después)', () => {
    expect(segurosVanEnElPaso4({ ...base, envioAnticipadoStep: 2 })).toBe(false);
  });

  it('envío anticipado en ESTA pantalla: sí, el submit de acá los lleva', () => {
    expect(segurosVanEnElPaso4({ ...base, envioAnticipadoStep: 4 })).toBe(true);
  });

  it('ya hay solicitud de esta sesión (handoff): no', () => {
    expect(segurosVanEnElPaso4({ ...base, yaEnviada: true })).toBe(false);
  });
});

describe('solicitudCreadaAntesDelPaso', () => {
  it('cuenta solo pantallas anteriores (1-indexado contra índice 0)', () => {
    expect(solicitudCreadaAntesDelPaso(1, 1, false)).toBe(true);
    expect(solicitudCreadaAntesDelPaso(2, 1, false)).toBe(false);
    expect(solicitudCreadaAntesDelPaso(null, 1, false)).toBe(false);
    expect(solicitudCreadaAntesDelPaso(1, -1, false)).toBe(false);
    expect(solicitudCreadaAntesDelPaso(null, 1, true)).toBe(true);
  });
});

describe('hayComplementosDespues', () => {
  it('Diseño 2: los seguros solos no mandan a /complementos', () => {
    expect(hayComplementosDespues([SEGURO], true, true)).toBe(false);
  });
  it('Diseño 2: otra sección después del wizard sí', () => {
    expect(hayComplementosDespues([SEGURO, ACCESORIOS], true, true)).toBe(true);
  });
  it('Diseño 1: lo de siempre (`shouldShowComplementos`)', () => {
    expect(hayComplementosDespues([SEGURO], false, true)).toBe(true);
    expect(hayComplementosDespues([], false, false)).toBe(false);
  });
});

describe('seccionesDeComplementos', () => {
  it('Diseño 1: todas, igual que hoy', () => {
    expect(seccionesDeComplementos([SEGURO, ACCESORIOS], false, true)).toEqual([SEGURO, ACCESORIOS]);
  });
  it('Diseño 2 con paso resumen: sin los seguros (ya se ofrecieron)', () => {
    expect(seccionesDeComplementos([SEGURO, ACCESORIOS], true, true)).toEqual([ACCESORIOS]);
  });
  it('Diseño 2 sin paso resumen: los seguros siguen acá', () => {
    expect(seccionesDeComplementos([SEGURO, ACCESORIOS], true, false)).toEqual([SEGURO, ACCESORIOS]);
  });
});

describe('textoDelEnvio', () => {
  it('cambia con las protecciones elegidas', () => {
    expect(textoDelEnvio(0)).toBe('Enviar solicitud');
    expect(textoDelEnvio(1)).toBe('Enviar con 1 protección');
    expect(textoDelEnvio(3)).toBe('Enviar con 3 protecciones');
  });
});

describe('encabezado del Paso 4', () => {
  const PASO_DNI = {
    code: 'personal_data',
    is_summary_step: false,
    fields: [{ code: 'document_number', type: 'document_number', prefill_config: { fields_to_fill: ['first_name'] } }],
  } as unknown as WizardStep;
  const RESUMEN = { code: 'summary', is_summary_step: true, fields: [] } as unknown as WizardStep;

  it('con nombre del lookup: "¡Último paso, {Nombre}!" y el título de la BD debajo', () => {
    const nombre = nombreDelUltimoPaso([PASO_DNI, RESUMEN], {
      document_number: '70020010',
      _prefill_status_document_number: 'found',
      first_name: 'BRENDA LUCÍA',
    });
    expect(nombre).toBe('Brenda');
    expect(encabezadoDelPaso4({ title: 'Resumen de tu solicitud', description: 'De la BD' }, nombre)).toEqual({
      antetitulo: '¡Último paso, Brenda!',
      titulo: 'Resumen de tu solicitud',
      subtitulo: 'De la BD',
    });
  });

  it('sin nombre (no se encontró el documento): solo el título de la BD y el subtítulo de respaldo', () => {
    const nombre = nombreDelUltimoPaso([PASO_DNI, RESUMEN], {
      document_number: '70020010',
      _prefill_status_document_number: 'not_found',
      first_name: 'Brenda',
    });
    expect(nombre).toBeNull();
    expect(encabezadoDelPaso4({ title: 'Resumen', description: '' }, nombre)).toEqual({
      antetitulo: null,
      titulo: 'Resumen',
      subtitulo: SUBTITULO_PASO4,
    });
  });

  it('tieneSeccionDeSeguros mira solo `insurance`', () => {
    expect(tieneSeccionDeSeguros([ACCESORIOS])).toBe(false);
    expect(tieneSeccionDeSeguros([ACCESORIOS, SEGURO])).toBe(true);
  });
});
