/**
 * `entregaPorToken` — la URL del formulario de entrega.
 *
 * `volver` (a dónde sigue al terminar) y `atras` (a dónde vuelve el control
 * "Volver al contrato" si se arrepiente antes de terminar) son independientes:
 * cualquiera de los dos puede faltar sin romper al otro.
 */
import { entregaPorToken, BASE_PATH } from '../routes';

it('sin volver ni atras: solo el token', () => {
  expect(entregaPorToken('TOK')).toBe(`${BASE_PATH}/entrega/TOK`);
});

it('con volver, sin atras', () => {
  const url = entregaPorToken('TOK', '/renueva-tu-equipo-1-a/solicitar/confirmacion');
  expect(url).toBe(
    `${BASE_PATH}/entrega/TOK?volver=%2Frenueva-tu-equipo-1-a%2Fsolicitar%2Fconfirmacion`,
  );
});

it('con atras, sin volver', () => {
  const url = entregaPorToken('TOK', undefined, '/renueva-tu-equipo-1-a/solicitar/kyc');
  expect(url).toBe(`${BASE_PATH}/entrega/TOK?atras=%2Frenueva-tu-equipo-1-a%2Fsolicitar%2Fkyc`);
});

it('con volver y atras: los dos viajan', () => {
  const url = entregaPorToken(
    'TOK',
    '/renueva-tu-equipo-1-a/solicitar/confirmacion',
    '/renueva-tu-equipo-1-a/solicitar/resumen',
  );
  expect(url).toContain('volver=%2Frenueva-tu-equipo-1-a%2Fsolicitar%2Fconfirmacion');
  expect(url).toContain('atras=%2Frenueva-tu-equipo-1-a%2Fsolicitar%2Fresumen');
});
