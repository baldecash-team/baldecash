/**
 * Prellenado del wizard con el lead que un socio (A365) ya empujó.
 *
 * Se testea la lógica pura (`calcularPrellenado`) y la captura del `alk` desde
 * la URL, sin montar React: el resto del hook es un `fetch` y un `useEffect`.
 */
import { calcularPrellenado, marcadoresDeBloqueo, leadLockKey } from '../useLeadPrefill';
import {
  captureLandingParams,
  getLeadLinkCode,
  getPendingCoupon,
  readCouponParam,
} from '@/app/prototipos/0.6/utils/landingParams';
import type { WizardStep } from '../../../../services/wizardApi';
import type { LeadPrefill } from '@/app/prototipos/0.6/services/leadPrefillApi';

const LEAD: LeadPrefill = {
  document_type: 'dni',
  document_number: '70123456',
  first_name: 'Ana',
  last_name: 'Quispe Rojas',
  phone: '999888777',
  email: 'ana@ejemplo.com',
};

/** Lead con institución y sede declaradas por el socio. */
const LEAD_ACADEMICO: LeadPrefill = {
  ...LEAD,
  institution_id: 812,
  institution_name: 'Universidad Privada del Norte',
  institution_type: 'university',
  sede_id: 45,
  sede_name: 'UCV Norte',
};

const pasos = (...codes: string[]): WizardStep[] =>
  [{ fields: codes.map(code => ({ code })) }] as unknown as WizardStep[];

const vacio = () => '';

describe('calcularPrellenado', () => {
  it('completa los campos que el wizard declara', () => {
    const updates = calcularPrellenado(LEAD, pasos('document_number', 'email'), vacio);

    expect(updates).toEqual([
      { fieldId: 'document_number', value: '70123456' },
      { fieldId: 'email', value: 'ana@ejemplo.com' },
    ]);
  });

  it('reconoce los codigos en español del form builder', () => {
    const updates = calcularPrellenado(LEAD, pasos('numero_documento', 'celular', 'correo'), vacio);

    expect(updates.map(u => u.fieldId)).toEqual(['numero_documento', 'celular', 'correo']);
  });

  it('ignora los datos que el wizard no pide', () => {
    // Un form sin teléfono no debe recibir un `phone` fantasma en formData:
    // el submit manda lo que hay, y un campo que nadie declaró viaja igual.
    const updates = calcularPrellenado(LEAD, pasos('document_number'), vacio);

    expect(updates).toHaveLength(1);
  });

  it('no pisa lo que la persona ya escribio', () => {
    const yaEscrito = (code: string) => (code === 'document_number' ? '87654321' : '');

    const updates = calcularPrellenado(LEAD, pasos('document_number', 'phone'), yaEscrito);

    expect(updates).toEqual([{ fieldId: 'phone', value: '999888777' }]);
  });

  it('omite los datos que el lead no trajo', () => {
    const sinContacto = { ...LEAD, phone: null, email: '   ' };

    const updates = calcularPrellenado(sinContacto, pasos('document_number', 'phone', 'email'), vacio);

    expect(updates).toEqual([{ fieldId: 'document_number', value: '70123456' }]);
  });

  it('pone el id de institucion y sede con su nombre como etiqueta', () => {
    // Los dos son selects sobre catálogos: guardan id, muestran nombre. Sin la
    // etiqueta el campo queda con el id puesto, bloqueado y en blanco.
    const updates = calcularPrellenado(
      LEAD_ACADEMICO,
      pasos('institution_type', 'institution', 'sede'),
      vacio,
    );

    expect(updates).toEqual([
      { fieldId: 'institution_type', value: 'university' },
      { fieldId: 'institution', value: '812', label: 'Universidad Privada del Norte' },
      { fieldId: 'sede', value: '45', label: 'UCV Norte' },
    ]);
  });

  it('un lead sin institucion ni sede no toca esos campos', () => {
    // El backend viejo ni siquiera manda las claves: el hook no puede asumirlas.
    const updates = calcularPrellenado(LEAD, pasos('institution_type', 'institution', 'sede'), vacio);

    expect(updates).toEqual([]);
  });

  it('sin tipo de institucion no prellena la institucion', () => {
    // `institution` se limpia cuando cambia `institution_type`. Prellenarla sin
    // el tipo la deja lista para que el primer toque de la persona la borre —y
    // como queda bloqueada, vacía y sin arreglo. El backend manda el tipo en
    // null justo cuando el catálogo trae uno que el formulario no ofrece.
    const sinTipo = { ...LEAD_ACADEMICO, institution_type: null };

    const updates = calcularPrellenado(sinTipo, pasos('institution_type', 'institution', 'sede'), vacio);

    expect(updates.map(u => u.fieldId)).toEqual(['sede']);
  });

  it('si el form no pide el tipo, la institucion se prellena igual', () => {
    // Sin campo `institution_type` no hay quién limpie la institución.
    const sinTipo = { ...LEAD_ACADEMICO, institution_type: null };

    const updates = calcularPrellenado(sinTipo, pasos('institution'), vacio);

    expect(updates).toEqual([
      { fieldId: 'institution', value: '812', label: 'Universidad Privada del Norte' },
    ]);
  });

  it('si la persona ya eligio el tipo, deja la institucion a su cargo', () => {
    // Mismo callejón sin salida: cambiar el tipo después borraría la
    // institución bloqueada. La sede no depende de nada, así que sí se pone.
    const yaEligio = (code: string) => (code === 'institution_type' ? 'institute' : '');

    const updates = calcularPrellenado(
      LEAD_ACADEMICO,
      pasos('institution_type', 'institution', 'sede'),
      yaEligio,
    );

    expect(updates.map(u => u.fieldId)).toEqual(['sede']);
  });

  it('reconoce `institucion` y `campus` del form builder', () => {
    const updates = calcularPrellenado(
      LEAD_ACADEMICO,
      pasos('tipo_institucion', 'institucion', 'campus'),
      vacio,
    );

    expect(updates.map(u => u.fieldId)).toEqual(['tipo_institucion', 'institucion', 'campus']);
  });

  it('no reparte los apellidos en paterno y materno', () => {
    // Partir "Quispe Rojas" por el espacio inventa datos: hay apellidos
    // compuestos y personas con uno solo. Los separados los trae la consulta
    // por DNI, que sí los distingue.
    const updates = calcularPrellenado(LEAD, pasos('apellido_paterno', 'apellido_materno'), vacio);

    expect(updates).toEqual([]);
  });
});

describe('captura del alk', () => {
  const conUrl = (search: string) => {
    Object.defineProperty(window, 'location', {
      value: { search },
      writable: true,
    });
  };

  beforeEach(() => localStorage.clear());

  it('guarda el codigo del link y lo devuelve por landing', () => {
    conUrl('?utm_source=partner&alk=C4rsBKad&cupon=A365001');

    captureLandingParams('lead-flujo-normal');

    expect(getLeadLinkCode('lead-flujo-normal')).toBe('C4rsBKad');
    expect(getLeadLinkCode('otra-landing')).toBeNull();
  });

  it('sin alk en la URL no guarda nada', () => {
    conUrl('?utm_source=meta');

    captureLandingParams('lead-flujo-normal');

    expect(getLeadLinkCode('lead-flujo-normal')).toBeNull();
  });

  it('captura el cupon escrito como `cupon`, que es el que emite el backend', () => {
    // Los links de activación (difusiones y socios) traen `cupon`, no `coupon`.
    conUrl('?alk=C4rsBKad&cupon=A365001');

    captureLandingParams('lead-flujo-normal');

    expect(getPendingCoupon('lead-flujo-normal')).toBe('A365001');
  });
});

describe('readCouponParam', () => {
  it('acepta las dos escrituras y normaliza', () => {
    expect(readCouponParam('?coupon=univ2026')).toBe('UNIV2026');
    expect(readCouponParam('?cupon=a365001')).toBe('A365001');
    expect(readCouponParam('?cupon=%20A365001%20')).toBe('A365001');
  });

  it('devuelve null cuando no hay cupon', () => {
    expect(readCouponParam('?utm_source=meta')).toBeNull();
    expect(readCouponParam('?cupon=')).toBeNull();
  });

  it('es el guardia que decide si el catalogo descarta el cupon pendiente', () => {
    // Regresión: el catálogo miraba solo `coupon`, así que con un link de
    // activación (`cupon`) daba false, borraba el pendiente recién capturado y
    // el cupón nunca llegaba a aplicarse.
    expect(!!readCouponParam('?alk=C4rsBKad&cupon=A365001')).toBe(true);
  });
});

describe('marcadoresDeBloqueo', () => {
  it('bloquea exactamente los campos que se prellenaron', () => {
    const updates = [
      { fieldId: 'document_number', value: '70123456' },
      { fieldId: 'email', value: 'ana@ejemplo.com' },
    ];

    expect(marcadoresDeBloqueo(updates)).toEqual([
      { fieldId: '_lead_locked_document_number', value: 'true' },
      { fieldId: '_lead_locked_email', value: 'true' },
    ]);
  });

  it('no bloquea nada si no se prellenó nada', () => {
    // Si la persona ya había escrito todo, `calcularPrellenado` devuelve vacío
    // y ningún campo debe quedar atrapado.
    expect(marcadoresDeBloqueo([])).toEqual([]);
  });

  it('el marcador empieza con `_`, que es lo que el submit descarta', () => {
    expect(leadLockKey('phone').startsWith('_')).toBe(true);
  });
});
