/// <reference types="jest" />
/**
 * BAL-4964 (F5) — reglas puras de las secciones y de los buscadores.
 */
import type { WizardField } from '@/app/prototipos/0.6/services/wizardApi';
import {
  armarBloques,
  cascadasEnFila,
  columnasDeCascada,
  camposPegados,
  ordenConPegados,
  etiquetaCorta,
  parteDelResumen,
  resumenDeSeccion,
  seccionCompleta,
  textoDelCampo,
} from '../secciones';
import { coincide, eleccionAutomatica, minimoDeLetras, normalizarBusqueda } from '../campos/busquedaV2';

function campo(code: string, extra: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code,
    label: code,
    type: 'text',
    required: true,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    options: [],
    validations: [],
    dependency_groups: [],
    max_files: null,
    ...extra,
  } as WizardField;
}

const SITUACION = campo('situacion_actual', { type: 'select', options: [{ value: 'si', label: 'Estoy estudiando' }] } as Partial<WizardField>);
const CICLO = campo('semester', {
  type: 'select',
  options: [
    { value: '8', label: '8vo Ciclo' },
    { value: 'otro', label: 'Otro' },
  ],
} as Partial<WizardField>);
const OTRO_CICLO = campo('other_semester', {
  label: '¿Cuál ciclo?',
  hidden: true,
  dependency_groups: [{ action: 'show', logic: 'and', conditions: [{ depends_on_field: 'semester', operator: 'equals', value: 'otro' }] }],
});
const MONTO = campo('tuition_amount', { type: 'currency' });
const CORREO = campo('email', { type: 'email' });
const INSTITUCION = campo('institution', { type: 'autocomplete', options_source: 'study-centers', min_search_length: 3 } as Partial<WizardField>);

describe('camposPegados / ordenConPegados', () => {
  it('un texto que solo aparece por una lista del paso se pega a ella', () => {
    expect(camposPegados({ fields: [CICLO, MONTO, OTRO_CICLO] })).toEqual(new Map([['other_semester', 'semester']]));
    const orden = ordenConPegados([CICLO, MONTO, OTRO_CICLO], camposPegados({ fields: [CICLO, MONTO, OTRO_CICLO] }));
    expect(orden.map((f) => f.code)).toEqual(['semester', 'other_semester', 'tuition_amount']);
  });

  it('no se pega si depende de dos campos, de un texto, o si la condición es de ocultar', () => {
    const dosPadres = campo('x', {
      dependency_groups: [{
        action: 'show',
        logic: 'and',
        conditions: [
          { depends_on_field: 'semester', operator: 'equals', value: 'otro' },
          { depends_on_field: 'situacion_actual', operator: 'equals', value: 'si' },
        ],
      }],
    });
    const deUnTexto = campo('y', {
      dependency_groups: [{ action: 'show', logic: 'and', conditions: [{ depends_on_field: 'email', operator: 'is_not_empty', value: null }] }],
    });
    const ocultar = campo('z', {
      dependency_groups: [{ action: 'hide', logic: 'and', conditions: [{ depends_on_field: 'semester', operator: 'equals', value: '8' }] }],
    });
    expect(camposPegados({ fields: [CICLO, SITUACION, CORREO, dosPadres, deUnTexto, ocultar] }).size).toBe(0);
  });

  // BAL-4965: F6 encontró que la regla de arriba pegaba a CUALQUIER texto
  // condicionado a una sola lista, no solo a una "Otra" real. "Rubro",
  // "Empleador", "Cargo" y "Número de RUC" (todos preguntas de seguimiento
  // normales) caían en la misma regla que "¿Cuál ciclo?" (una "Otra" real).
  const INCOME_SOURCE = campo('income_source', {
    type: 'select',
    options: [
      { value: 'negocio_personal', label: 'Negocio Personal' },
      { value: 'sueldo_trabajo', label: 'Sueldo de Trabajo' },
      { value: 'otro', label: 'Otro' },
    ],
  } as Partial<WizardField>);
  const RUBRO = campo('business_sector', {
    label: 'Rubro',
    dependency_groups: [{ action: 'show', logic: 'and', conditions: [{ depends_on_field: 'income_source', operator: 'equals', value: 'negocio_personal' }] }],
  });
  const OTRA_FUENTE = campo('other_income_description', {
    label: '¿Cuál es tu otra fuente de ingreso?',
    dependency_groups: [{ action: 'show', logic: 'and', conditions: [{ depends_on_field: 'income_source', operator: 'equals', value: 'otro' }] }],
  });

  it('BAL-4965: "Rubro" bajo "Negocio Personal" NO se pega — es una pregunta normal, no una "Otra"', () => {
    const pegados = camposPegados({ fields: [INCOME_SOURCE, RUBRO] });
    expect(pegados.size).toBe(0);
    expect(pegados.has('business_sector')).toBe(false);
    // En el resumen se suma después de la opción, no la reemplaza.
    expect(
      resumenDeSeccion([INCOME_SOURCE, RUBRO], { income_source: 'negocio_personal', business_sector: 'Venta de ropa' }, () => undefined, pegados),
    ).toBe('Negocio Personal · Rubro: Venta de ropa');
  });

  it('BAL-4965: una "Otra" real (etiqueta "Otro"/"Otra...") sigue pegada y reemplazando', () => {
    const pegados = camposPegados({ fields: [INCOME_SOURCE, OTRA_FUENTE] });
    expect(pegados).toEqual(new Map([['other_income_description', 'income_source']]));
  });

  it('BAL-4965: una condición con varias opciones no pega, aunque una de ellas sea "Otro"', () => {
    const variasOpciones = campo('x', {
      dependency_groups: [{
        action: 'show',
        logic: 'and',
        conditions: [{ depends_on_field: 'income_source', operator: 'in', value: ['negocio_personal', 'otro'] }],
      }],
    });
    expect(camposPegados({ fields: [INCOME_SOURCE, variasOpciones] }).size).toBe(0);
  });
});

describe('armarBloques', () => {
  it('agrupa en el orden de groups, cada sección en el orden del paso, sin sección al final', () => {
    const bloques = armarBloques({
      fields: [CORREO, SITUACION, MONTO, CICLO, OTRO_CICLO],
      groups: [
        { code: 'mensualidad', name: 'Mensualidad de tus estudios', order: 2, is_collapsible: true, field_codes: ['tuition_amount'] },
        { code: 'tus_estudios', name: 'Tus estudios', order: 1, is_collapsible: true, field_codes: ['semester', 'situacion_actual'] },
      ],
    });
    expect(bloques.map((b) => (b.tipo === 'seccion' ? b.grupo.code : 'sin-seccion'))).toEqual(['tus_estudios', 'mensualidad', 'sin-seccion']);
    expect(bloques[0].campos.map((f) => f.code)).toEqual(['situacion_actual', 'semester', 'other_semester']);
    expect(bloques[1].campos.map((f) => f.code)).toEqual(['tuition_amount']);
    expect(bloques[2].campos.map((f) => f.code)).toEqual(['email']);
  });

  it('una "Otra" va con su lista aunque su sección diga otra cosa', () => {
    const bloques = armarBloques({
      fields: [CICLO, OTRO_CICLO, MONTO],
      groups: [
        { code: 'a', name: 'A', order: 0, is_collapsible: true, field_codes: ['semester'] },
        { code: 'b', name: 'B', order: 1, is_collapsible: true, field_codes: ['tuition_amount', 'other_semester'] },
      ],
    });
    expect(bloques[0].campos.map((f) => f.code)).toEqual(['semester', 'other_semester']);
    expect(bloques[1].campos.map((f) => f.code)).toEqual(['tuition_amount']);
  });

  it('sin groups: un solo bloque sin sección (como hoy)', () => {
    const bloques = armarBloques({ fields: [CORREO, CICLO] });
    expect(bloques).toHaveLength(1);
    expect(bloques[0].tipo).toBe('sueltos');
  });
});

describe('seccionCompleta', () => {
  const valido = () => true;
  it('obligatorios llenos y válidos', () => {
    expect(seccionCompleta([CICLO, MONTO], valido, { semester: '8', tuition_amount: '450' })).toBe(true);
    expect(seccionCompleta([CICLO, MONTO], valido, { semester: '8' })).toBe(false);
    expect(seccionCompleta([CICLO], () => false, { semester: '8' })).toBe(false);
  });
  it('un opcional vacío no la frena; sin campos visibles no se cierra', () => {
    const opcional = campo('beca', { required: false });
    expect(seccionCompleta([CICLO, opcional], valido, { semester: '8' })).toBe(true);
    expect(seccionCompleta([], valido, {})).toBe(false);
  });
});

describe('resumenDeSeccion / textoDelCampo', () => {
  it('etiquetas, no ids, separadas por " · "', () => {
    const texto = resumenDeSeccion(
      [SITUACION, INSTITUCION, CICLO, MONTO],
      { situacion_actual: 'si', institution: '123', semester: '8', tuition_amount: '1250' },
      (c) => (c === 'institution' ? 'Universidad del Pacífico' : undefined),
      new Map(),
    );
    expect(texto).toBe('Estoy estudiando · Universidad del Pacífico · 8vo Ciclo · S/ 1,250');
  });

  it('una "Otra" con texto reemplaza a la opción que la destapó', () => {
    const pegados = new Map([['other_semester', 'semester']]);
    expect(resumenDeSeccion([CICLO, OTRO_CICLO], { semester: 'otro', other_semester: '11' }, () => undefined, pegados)).toBe('Ciclo: 11');
    expect(resumenDeSeccion([CICLO, OTRO_CICLO], { semester: 'otro' }, () => undefined, pegados)).toBe('Otro');
  });

  it('Sí/No y lo escrito a mano llevan su etiqueta corta; las opciones de listas, no', () => {
    const beca = campo('has_scholarship', {
      label: '¿Tiene beca?',
      type: 'select',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    } as Partial<WizardField>);
    const empresa = campo('employer_name', { label: 'Empleador' });
    expect(parteDelResumen(beca, 'no')).toBe('Beca: No');
    expect(parteDelResumen(empresa, 'Tottus')).toBe('Empleador: Tottus');
    expect(parteDelResumen(CICLO, '8')).toBe('8vo Ciclo');
    expect(parteDelResumen(INSTITUCION, '123', 'Universidad del Pacífico')).toBe('Universidad del Pacífico');
    expect(parteDelResumen(MONTO, '1250')).toBe('S/ 1,250');
    expect(
      resumenDeSeccion([SITUACION, CICLO, beca], { situacion_actual: 'si', semester: '8', has_scholarship: 'no' }, () => undefined, new Map()),
    ).toBe('Estoy estudiando · 8vo Ciclo · Beca: No');
  });

  it('etiqueta corta: sin signos ni relleno en los extremos; si no queda nada, la etiqueta', () => {
    expect(etiquetaCorta('¿Tiene beca?')).toBe('Beca');
    expect(etiquetaCorta('¿Cuál ciclo?')).toBe('Ciclo');
    expect(etiquetaCorta('¿Tienes RUC?')).toBe('RUC');
    expect(etiquetaCorta('¿Qué beca tienes?')).toBe('Beca');
    expect(etiquetaCorta('Nombre de tu empresa')).toBe('Nombre de tu empresa');
    expect(etiquetaCorta('¿Cuál?')).toBe('Cuál');
    expect(etiquetaCorta('¿?')).toBe('');
  });

  it('una etiqueta que es solo signos no deja ": valor"; va el valor solo', () => {
    const raro = campo('raro', { type: 'text', label: '¿?' });
    expect(parteDelResumen(raro, 'algo')).toBe('algo');
  });

  it('vacíos, casillas y archivos no salen', () => {
    expect(textoDelCampo(campo('c', { type: 'checkbox' }), 'true')).toBe('');
    expect(textoDelCampo(CORREO, '')).toBe('');
  });
});

describe('Buscador de Diseño 2', () => {
  it('sin tildes y sin mayúsculas', () => {
    expect(normalizarBusqueda('  Universidad  del PACÍFICO ')).toBe('universidad del pacifico');
    expect(coincide('Universidad del Pacífico', 'pacifico')).toBe(true);
    expect(coincide('Ingeniería Empresarial', 'INGENIERIA emp')).toBe(true);
    expect(coincide('UPC', 'pacif')).toBe(false);
  });

  it('desde 3 letras, o lo que diga la BD', () => {
    expect(minimoDeLetras(null)).toBe(3);
    expect(minimoDeLetras(0)).toBe(3);
    expect(minimoDeLetras(4)).toBe(4);
  });

  it('se elige sola con una sola coincidencia, o una sola exacta', () => {
    const una = [{ label: 'Universidad del Pacífico' }];
    expect(eleccionAutomatica(una, 'pacif', 3)).toBe(una[0]);
    const varias = [{ label: 'Ingeniería' }, { label: 'Ingeniería Civil' }];
    expect(eleccionAutomatica(varias, 'ingenieria', 3)).toBe(varias[0]);
    expect(eleccionAutomatica(varias, 'ingen', 3)).toBeNull();
    expect(eleccionAutomatica(una, 'pa', 3)).toBeNull();
    expect(eleccionAutomatica([{ label: 'A', disabled: true }], 'aaa', 3)).toBeNull();
  });
});

describe('cascadasEnFila (Departamento / Provincia / Distrito en una fila)', () => {
  const dep = campo('department', { type: 'select' });
  const prov = campo('province', { type: 'select', cascade_from: 'department' });
  const dist = campo('district', { type: 'select', cascade_from: 'province' });

  it('marca las tres listas encadenadas con su lugar', () => {
    const fila = cascadasEnFila([campo('payment_day', { type: 'select' }), dep, prov, dist, campo('address')]);
    expect(fila.get('department')).toEqual({ largo: 3, indice: 0 });
    expect(fila.get('district')).toEqual({ largo: 3, indice: 2 });
    expect(fila.has('payment_day')).toBe(false);
    expect(fila.has('address')).toBe(false);
  });

  it('si algo se mete en medio, no hay fila', () => {
    expect(cascadasEnFila([dep, campo('x'), prov]).size).toBe(0);
  });

  it('clases: 2 + 1 en celular y 3 en escritorio', () => {
    expect(columnasDeCascada(3, 0)).toBe('col-span-6 md:col-span-4');
    expect(columnasDeCascada(3, 2)).toBe('col-span-12 md:col-span-4');
    expect(columnasDeCascada(2, 1)).toBe('col-span-6');
  });
});
