/**
 * El link de continuar-después abre también la landing.
 *
 * El acceso vive en el navegador que lo obtuvo, así que abrir el link en el
 * celular caía en el gate del DNI: le pedía a la persona exactamente lo que el
 * token ya había probado.
 */

const claveDelGate = (slug: string) => `baldecash-vip-token-${slug}`;

/** Réplica de lo que hace el cliente al resolver el link. */
function guardarAcceso(
  respuesta: { landing_slug?: string; landing_access_token?: string },
  store: Record<string, string>,
): void {
  if (!respuesta.landing_slug || !respuesta.landing_access_token) return;
  store[claveDelGate(respuesta.landing_slug)] = respuesta.landing_access_token;
}

describe('acceso desde el link', () => {
  it('guarda el token bajo la clave que el gate lee', () => {
    const store: Record<string, string> = {};
    guardarAcceso(
      { landing_slug: 'family-farms-baldecash-c', landing_access_token: 'abc-123' },
      store,
    );
    expect(store['baldecash-vip-token-family-farms-baldecash-c']).toBe('abc-123');
  });

  it('sin token no guarda nada: la landing no tiene gate', () => {
    const store: Record<string, string> = {};
    guardarAcceso({ landing_slug: 'home' }, store);
    expect(Object.keys(store)).toHaveLength(0);
  });

  it('sin slug tampoco', () => {
    const store: Record<string, string> = {};
    guardarAcceso({ landing_access_token: 'abc' }, store);
    expect(Object.keys(store)).toHaveLength(0);
  });
});
