/**
 * `solicitarConfirmacion` con token — BAL-4188 Task 6.
 *
 * El link público de confirmación deja de abrirse con el `application_code`
 * (consecutivo, adivinable: `APP-2026-…`) y pasa a usar el `public_token`
 * (UUID) cuando está disponible. Sin token, cae al comportamiento de
 * siempre (`code`) — así un handoff viejo (o el flag apagado) no se rompe.
 */
import { solicitarConfirmacion } from '../routes';

describe('solicitarConfirmacion con token', () => {
  it('con token, el code es el token', () => {
    expect(solicitarConfirmacion('home', 'APP-1', false, 'db8aedd5-a9b5-4ecf-98ce-c376baf955e1'))
      .toMatch(/\?code=db8aedd5-a9b5-4ecf-98ce-c376baf955e1$/);
  });

  it('sin token queda igual que antes', () => {
    expect(solicitarConfirmacion('home', 'APP-1')).toMatch(/\?code=APP-1$/);
  });
});
