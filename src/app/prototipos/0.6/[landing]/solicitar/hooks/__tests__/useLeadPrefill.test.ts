/**
 * Prellenado del wizard con el lead que un socio (A365) ya empujó.
 *
 * Se testea la lógica pura (`calcularPrellenado`) y la captura del `alk` desde
 * la URL, sin montar React: el resto del hook es un `fetch` y un `useEffect`.
 */
import { calcularPrellenado } from '../useLeadPrefill';
import { captureLandingParams, getLeadLinkCode } from '@/app/prototipos/0.6/utils/landingParams';
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
});
