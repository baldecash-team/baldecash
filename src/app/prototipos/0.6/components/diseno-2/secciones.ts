/**
 * Secciones del paso en Diseño 2 (BAL-4964, F5): reglas puras.
 *
 * Nada acá conoce códigos de campo: todo sale del snapshot del paso
 * (`step.groups`, `dependency_groups`, `options`). `DynamicWizardStep` arma los
 * bloques y `SeccionPlegable` los pinta. F6 reutiliza lo mismo.
 */

import { formatearMonto } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/fields/montoFormato';
import type { DependencyGroup, WizardField, WizardStep, WizardStepGroup } from '@/app/prototipos/0.6/services/wizardApi';
import { campoPendiente, valorVacio } from './useGuiaDeCampos';
import { normalizarBusqueda } from './campos/busquedaV2';

type Valores = Record<string, string | string[] | undefined>;

/** Tipos que pueden destapar un "Otra (escríbela)". */
const TIPOS_DE_LISTA = new Set<WizardField['type']>(['select', 'autocomplete', 'radio']);
/** Tipos de texto que se pegan bajo su lista. */
const TIPOS_DE_TEXTO = new Set<WizardField['type']>(['text', 'textarea', 'number']);

/**
 * Los valores de la lista que destapan el campo, juntando todos sus grupos
 * `show` (BAL-5205: «¿Cuál institución?» la destapa un «Otros» por cada tipo
 * de institución). `null` si algún operador no compara contra un valor fijo
 * (`is_empty`, `greater_than`, etc.): ese campo nunca puede ser una "Otra".
 */
export function valoresQueMuestran(muestran: DependencyGroup[]): string[] | null {
  const valores = new Set<string>();
  for (const g of muestran) {
    for (const c of g.conditions) {
      if (c.operator !== 'equals' && c.operator !== 'in') return null;
      if (c.value == null) return null;
      for (const v of Array.isArray(c.value) ? c.value : [c.value]) valores.add(String(v));
    }
  }
  return valores.size > 0 ? Array.from(valores) : null;
}

/**
 * ¿La etiqueta de la opción (sin tildes ni mayúsculas) es una "Otra"?
 * "Otra", "Otro", "Otros", "Otra (escríbela)"... todas empiezan con "otr".
 * Nunca se mira el código/value de la opción, solo su etiqueta (BAL-4965).
 */
function etiquetaEsOtra(etiqueta: string): boolean {
  return normalizarBusqueda(etiqueta).startsWith('otr');
}

/** Lo elegido en una lista, con su etiqueta (`formData[codigo]`). */
export type OpcionElegida = (codigoLista: string) => { value?: string; label?: string } | undefined;

/**
 * "Otra (escríbela)": el campo de texto que aparece por condición de una
 * lista del MISMO paso (requisito 4) Y cuyos valores que lo destapan son
 * TODOS opciones «Otr…» de esa lista (BAL-4965; BAL-5205: pueden ser varias,
 * como los «Otros» de universidad e instituto). Devuelve
 * `hijo → lista que lo destapa`.
 *
 * Listas remotas (institución, carrera: `options_source` sin `options` en el
 * paso): el paso no trae las etiquetas. Ahí se mira la opción ELEGIDA
 * (`opcionElegida`, la etiqueta que guardó el formulario): si es una de las
 * que destapan el campo, tiene que llamarse «Otr…»; si no lo es, el campo
 * está oculto y queda pegado. Sin `opcionElegida`, no se pegan.
 *
 * Un campo de texto condicionado a una lista que NO es su "Otra" (Rubro bajo
 * "Negocio", Empleador bajo "Sueldo", Número de RUC bajo "¿Tienes RUC?"...)
 * no es una "Otra" pegada: es una pregunta de seguimiento normal, y se pinta
 * y resume como cualquier otro campo. Solo cuenta si TODAS las condiciones
 * de sus grupos `show` miran a la misma lista y a opciones «Otr…» de esa
 * lista; un campo que depende de dos campos, o de una opción que no es
 * «Otr…» (`in` con «Negocio» y «Otro»), no es "Otra" de ninguna.
 */
export function camposPegados(step: Pick<WizardStep, 'fields'>, opcionElegida?: OpcionElegida): Map<string, string> {
  const porCodigo = new Map(step.fields.map((f) => [f.code, f]));
  const pegados = new Map<string, string>();
  for (const f of step.fields) {
    if (!TIPOS_DE_TEXTO.has(f.type)) continue;
    const muestran = (f.dependency_groups ?? []).filter((g) => g.action === 'show');
    if (muestran.length === 0) continue;
    if ((f.dependency_groups ?? []).some((g) => g.action === 'hide')) continue;
    const padres = new Set(muestran.flatMap((g) => g.conditions.map((c) => c.depends_on_field)));
    if (padres.size !== 1) continue;
    const [padre] = Array.from(padres);
    const lista = porCodigo.get(padre);
    if (!lista || lista.code === f.code || !TIPOS_DE_LISTA.has(lista.type)) continue;
    const valores = valoresQueMuestran(muestran);
    if (!valores) continue;
    const opciones = lista.options ?? [];
    if (opciones.length === 0 && lista.options_source) {
      if (!opcionElegida) continue;
      const elegida = opcionElegida(padre);
      const laDestapa = elegida?.value != null && valores.includes(String(elegida.value));
      if (laDestapa && !(elegida?.label && etiquetaEsOtra(elegida.label))) continue;
    } else {
      const todosSonOtra = valores.every((v) => {
        const o = opciones.find((op) => String(op.value) === v);
        return !!o && etiquetaEsOtra(o.label);
      });
      if (!todosSonOtra) continue;
    }
    pegados.set(f.code, padre);
  }
  return pegados;
}

/**
 * BAL-5227: de las "Otra" pegadas (`camposPegados`), las que Diseño 2 escribe
 * DENTRO del campo de su lista (`OtraEnElCampoV2`, BAL-5205). Es un ajuste
 * por campo del paso (`other_inline`, admin2): sin la llave cuenta como
 * prendido. Las apagadas siguen en `camposPegados` (orden y sección junto a
 * su lista) pero se pintan como campo aparte, debajo de la lista, como antes
 * de BAL-5205 y como en Diseño 1.
 */
export function otrasEnElCampo(step: Pick<WizardStep, 'fields'>, pegados: Map<string, string>): Map<string, string> {
  const apagados = new Set(step.fields.filter((f) => f.other_inline === false).map((f) => f.code));
  const enElCampo = new Map<string, string>();
  pegados.forEach((lista, codigo) => {
    if (!apagados.has(codigo)) enElCampo.set(codigo, lista);
  });
  return enElCampo;
}

/**
 * Orden del paso con cada "Otra" justo después de su lista. Si la lista
 * también tiene su propia "Otra" pegada, se respeta el orden del paso entre
 * hermanos.
 */
export function ordenConPegados(fields: WizardField[], pegados: Map<string, string>): WizardField[] {
  const hijosDe = new Map<string, WizardField[]>();
  for (const f of fields) {
    const padre = pegados.get(f.code);
    if (padre) hijosDe.set(padre, [...(hijosDe.get(padre) ?? []), f]);
  }
  const orden: WizardField[] = [];
  const agregar = (f: WizardField) => {
    orden.push(f);
    for (const h of hijosDe.get(f.code) ?? []) agregar(h);
  };
  for (const f of fields) if (!pegados.has(f.code)) agregar(f);
  return orden;
}

export type BloqueDelPaso =
  | { tipo: 'seccion'; grupo: WizardStepGroup; campos: WizardField[] }
  | { tipo: 'sueltos'; campos: WizardField[] };

/**
 * Los campos del paso agrupados por sección (requisito 1):
 * - secciones en el orden de `groups` (`order`, y a igualdad el del arreglo);
 * - dentro de cada una, el orden del paso;
 * - los campos sin sección, al final y sin título;
 * - una "Otra" va siempre con su lista, aunque su sección diga otra cosa.
 *
 * Sin `groups` sale un solo bloque `sueltos` con todo: el paso se pinta como
 * antes (requisito 2).
 */
export function armarBloques(
  step: Pick<WizardStep, 'fields' | 'groups'>,
  pegados: Map<string, string> = camposPegados(step),
): BloqueDelPaso[] {
  const orden = ordenConPegados(step.fields, pegados);
  const grupos = [...(step.groups ?? [])]
    .map((g, i) => ({ g, i }))
    .sort((a, b) => a.g.order - b.g.order || a.i - b.i)
    .map(({ g }) => g);
  if (grupos.length === 0) return orden.length ? [{ tipo: 'sueltos', campos: orden }] : [];

  const grupoDe = new Map<string, string>();
  for (const g of grupos) for (const c of g.field_codes) if (!grupoDe.has(c)) grupoDe.set(c, g.code);
  const raizDe = (codigo: string): string => {
    let actual = codigo;
    const vistos = new Set<string>();
    while (pegados.has(actual) && !vistos.has(actual)) {
      vistos.add(actual);
      actual = pegados.get(actual)!;
    }
    return actual;
  };
  const seccionDe = (f: WizardField) => grupoDe.get(raizDe(f.code)) ?? null;

  const bloques: BloqueDelPaso[] = [];
  for (const g of grupos) {
    const campos = orden.filter((f) => seccionDe(f) === g.code);
    if (campos.length) bloques.push({ tipo: 'seccion', grupo: g, campos });
  }
  const sueltos = orden.filter((f) => seccionDe(f) === null);
  if (sueltos.length) bloques.push({ tipo: 'sueltos', campos: sueltos });
  return bloques;
}

/**
 * ¿La sección se puede cerrar? Todos sus campos VISIBLES obligatorios llenos
 * y todo lo que tiene valor, válido (la misma regla que la guía de campos).
 */
export function seccionCompleta(
  visibles: WizardField[],
  esValido: (f: WizardField) => boolean,
  valores: Valores,
): boolean {
  if (visibles.length === 0) return false;
  return visibles.every(
    (f) => !campoPendiente({ codigo: f.code, obligatorio: !!f.required, vacio: valorVacio(valores[f.code]), valido: esValido(f) }),
  );
}

/** Lo que se ve de un campo en el resumen. Vacío = no sale. */
export function textoDelCampo(f: WizardField, valor: unknown, etiquetaGuardada?: string): string {
  if (valorVacio(valor)) return '';
  if (f.type === 'checkbox' || f.type === 'hidden' || f.type === 'file') return '';
  const unValor = (v: string) => {
    const opcion = (f.options ?? []).find((o) => String(o.value) === v);
    if (opcion) return opcion.label;
    return v;
  };
  if (Array.isArray(valor)) {
    if (etiquetaGuardada) return etiquetaGuardada;
    return valor.map((v) => unValor(String(v))).join(', ');
  }
  const v = String(valor).trim();
  if (f.type === 'currency') {
    const monto = formatearMonto(v);
    return `${f.prefix?.trim() || 'S/'} ${monto}`;
  }
  // La etiqueta guardada (listas del sistema, buscadores) gana sobre el id.
  if (TIPOS_DE_LISTA.has(f.type)) return (f.options ?? []).length ? unValor(v) : etiquetaGuardada || v;
  return v;
}

/**
 * Palabras de relleno que se quitan de los extremos de una etiqueta para
 * armar su versión corta ("¿Tiene beca?" → "Beca", "¿Cuál ciclo?" → "Ciclo").
 * Son palabras genéricas del idioma, no etiquetas: la etiqueta sale de la BD.
 */
const RELLENO = new Set([
  'cual', 'cuales', 'que', 'como', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'donde', 'cuando', 'quien',
  'tiene', 'tienes', 'tienen', 'es', 'eres', 'esta', 'estas', 'son',
  'tu', 'tus', 'su', 'sus', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'con', 'por', 'para',
]);

/**
 * La etiqueta del campo sin signos de pregunta ni palabras de relleno en
 * los extremos, con mayúscula inicial. Si no queda nada, la etiqueta sin
 * signos.
 */
export function etiquetaCorta(etiqueta: string): string {
  const limpia = etiqueta.replace(/[¿?¡!:*]/g, '').replace(/\s+/g, ' ').trim();
  const palabras = limpia.split(' ');
  const relleno = (p: string) => RELLENO.has(normalizarBusqueda(p));
  let i = 0;
  let j = palabras.length;
  while (i < j && relleno(palabras[i])) i++;
  while (j > i && relleno(palabras[j - 1])) j--;
  const corta = palabras.slice(i, j).join(' ') || limpia;
  return corta.charAt(0).toLocaleUpperCase('es') + corta.slice(1);
}

/** Lista de dos opciones "Sí" / "No". */
function esSiNo(f: WizardField): boolean {
  const opciones = f.options ?? [];
  if (opciones.length !== 2) return false;
  const etiquetas = new Set(opciones.map((o) => normalizarBusqueda(o.label)));
  return etiquetas.has('si') && etiquetas.has('no');
}

/**
 * Lo que el campo aporta al resumen. Las respuestas Sí/No y lo escrito a
 * mano (una "Otra" o un texto libre) llevan su etiqueta corta adelante
 * ("Beca: No", "Ciclo: 11"); un "No" o un "11" sueltos no se entienden.
 * Las opciones de listas y buscadores van solas.
 */
export function parteDelResumen(f: WizardField, valor: unknown, etiquetaGuardada?: string): string {
  const texto = textoDelCampo(f, valor, etiquetaGuardada);
  if (!texto) return '';
  if (esSiNo(f) || TIPOS_DE_TEXTO.has(f.type)) {
    // Una etiqueta que es solo signos ("¿?") no deja nada: va el valor solo,
    // nunca ": No".
    const etiqueta = etiquetaCorta(f.label ?? '');
    return etiqueta ? `${etiqueta}: ${texto}` : texto;
  }
  return texto;
}

/**
 * El resumen de una línea de la sección cerrada: los valores mostrados, no
 * los ids, separados por " · ". Una "Otra" con texto reemplaza a la opción
 * que la destapó ("Otro" → "Ciclo: 11").
 */
export function resumenDeSeccion(
  visibles: WizardField[],
  valores: Valores,
  etiquetaDe: (codigo: string) => string | undefined,
  pegados: Map<string, string>,
): string {
  const textos = new Map<string, string>();
  for (const f of visibles) textos.set(f.code, parteDelResumen(f, valores[f.code], etiquetaDe(f.code)));
  const partes: string[] = [];
  for (const f of visibles) {
    if (pegados.has(f.code)) continue;
    const hijos = visibles.filter((h) => pegados.get(h.code) === f.code && textos.get(h.code));
    const texto = hijos.length ? hijos.map((h) => textos.get(h.code)!).join(' · ') : textos.get(f.code);
    if (texto) partes.push(texto);
  }
  return partes.join(' · ');
}
