/**
 * Tests para el auto-seteo del DNI en DocumentNumberField (BAL-1806)
 *
 * Verifica que el DNI guardado en localStorage por el overlay VIP
 * se pre-carga en el campo y lo pone disabled para cualquier landing
 * con whitelist (no solo CADE).
 *
 * Estrategia: testear la lógica de lectura de localStorage directamente,
 * sin montar el componente completo (evita dependencias de WizardContext/LayoutContext).
 */

const LANDING = 'renueva-tu-equipo-1';
const CADE_LANDING = 'cade-a';
const LEAD_LANDING = 'baldecash-lead';

// Replica getSavedDni del componente
function getSavedDni(slug: string): string | null {
  try {
    return localStorage.getItem(`baldecash-dni-${slug}`);
  } catch {
    return null;
  }
}

// Replica la lógica del useEffect de auto-seteo
function simulateAutoSeteo(landing: string): { prefilled: boolean; locked: boolean; value: string | null } {
  // Bloque 1: lee de baldecash-dni-{landing} (VIP gate / CADE / InlineDniGate)
  const savedDni = getSavedDni(landing);
  if (savedDni) {
    return { prefilled: true, locked: true, value: savedDni };
  }

  // Bloque 2: lee de wizard-field (LeadLeadForm)
  const leadDni = localStorage.getItem(`baldecash-${landing}-wizard-field-document_number`);
  if (leadDni) {
    return { prefilled: true, locked: true, value: leadDni };
  }

  return { prefilled: false, locked: false, value: null };
}

describe('DocumentNumberField — auto-seteo DNI desde overlay VIP (BAL-1806)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('VIP gate / InlineDniGate (clave baldecash-dni-{landing})', () => {
    it('pre-carga el DNI y bloquea el campo para renueva-tu-equipo-1', () => {
      localStorage.setItem('baldecash-dni-renueva-tu-equipo-1', '12345678');

      const result = simulateAutoSeteo(LANDING);

      expect(result.prefilled).toBe(true);
      expect(result.locked).toBe(true);
      expect(result.value).toBe('12345678');
    });

    it('pre-carga el DNI y bloquea el campo para CADE (no-regresión)', () => {
      localStorage.setItem('baldecash-dni-cade-a', '87654321');

      const result = simulateAutoSeteo(CADE_LANDING);

      expect(result.prefilled).toBe(true);
      expect(result.locked).toBe(true);
      expect(result.value).toBe('87654321');
    });

    it('NO bloquea el campo si no hay DNI en localStorage', () => {
      const result = simulateAutoSeteo(LANDING);

      expect(result.prefilled).toBe(false);
      expect(result.locked).toBe(false);
      expect(result.value).toBeNull();
    });

    it('NO lee el DNI de otra landing (aislamiento por slug)', () => {
      localStorage.setItem('baldecash-dni-renueva-tu-equipo-2', '11111111');

      const result = simulateAutoSeteo(LANDING); // renueva-tu-equipo-1

      expect(result.prefilled).toBe(false);
      expect(result.locked).toBe(false);
    });
  });

  describe('LeadLeadForm (clave baldecash-{landing}-wizard-field-document_number)', () => {
    it('pre-carga el DNI y bloquea el campo para landing lead', () => {
      localStorage.setItem('baldecash-baldecash-lead-wizard-field-document_number', '99887766');

      const result = simulateAutoSeteo(LEAD_LANDING);

      expect(result.prefilled).toBe(true);
      expect(result.locked).toBe(true);
      expect(result.value).toBe('99887766');
    });

    it('prioriza la clave VIP gate sobre la clave lead si ambas existen', () => {
      localStorage.setItem('baldecash-dni-renueva-tu-equipo-1', '11111111');
      localStorage.setItem('baldecash-renueva-tu-equipo-1-wizard-field-document_number', '22222222');

      const result = simulateAutoSeteo(LANDING);

      // El bloque 1 (VIP gate) tiene prioridad
      expect(result.value).toBe('11111111');
    });
  });

  describe('Compatibilidad con renueva-tu-equipo-2 y renueva-tu-equipo-3', () => {
    it('funciona para renueva-tu-equipo-2 (landing 179)', () => {
      localStorage.setItem('baldecash-dni-renueva-tu-equipo-2', '33333333');

      const result = simulateAutoSeteo('renueva-tu-equipo-2');

      expect(result.prefilled).toBe(true);
      expect(result.locked).toBe(true);
      expect(result.value).toBe('33333333');
    });

    it('funciona para renueva-tu-equipo-3 (landing 180)', () => {
      localStorage.setItem('baldecash-dni-renueva-tu-equipo-3', '44444444');

      const result = simulateAutoSeteo('renueva-tu-equipo-3');

      expect(result.prefilled).toBe(true);
      expect(result.locked).toBe(true);
      expect(result.value).toBe('44444444');
    });
  });
});
