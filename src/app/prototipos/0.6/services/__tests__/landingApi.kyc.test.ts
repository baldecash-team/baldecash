import {
  getKycSteps,
  isKycEnabled,
  isKycStepEnabled,
  isSectionEnabled,
  KYC_STEP_TYPES,
  type SolicitarFlowConfig,
} from '../landingApi';

const withKyc = (enabled: boolean, steps: Array<[string, boolean, number]>): SolicitarFlowConfig => ({
  sections: [
    { type: 'wizard_steps', enabled: true, order: 1 },
    { type: 'kyc', enabled, order: 2, steps: steps.map(([type, en, order]) => ({ type: type as any, enabled: en, order })) },
  ],
});

describe('kyc helpers', () => {
  it('KYC_STEP_TYPES en orden canónico', () => {
    expect(KYC_STEP_TYPES).toEqual(['dni_selfie', 'payment_receipt', 'contract', 'documents']);
  });

  it('getKycSteps devuelve solo los sub-pasos habilitados, ordenados', () => {
    const cfg = withKyc(true, [['contract', true, 3], ['dni_selfie', true, 1], ['documents', false, 4]]);
    expect(getKycSteps(cfg).map((s) => s.type)).toEqual(['dni_selfie', 'contract']);
  });

  it('getKycSteps vacío si la sección kyc está apagada', () => {
    const cfg = withKyc(false, [['dni_selfie', true, 1]]);
    expect(getKycSteps(cfg)).toEqual([]);
  });

  it('getKycSteps vacío si no hay sección kyc', () => {
    const cfg: SolicitarFlowConfig = { sections: [{ type: 'wizard_steps', enabled: true, order: 1 }] };
    expect(getKycSteps(cfg)).toEqual([]);
  });

  it('isKycStepEnabled refleja el estado del sub-paso', () => {
    const cfg = withKyc(true, [['dni_selfie', true, 1], ['contract', false, 3]]);
    expect(isKycStepEnabled(cfg, 'dni_selfie')).toBe(true);
    expect(isKycStepEnabled(cfg, 'contract')).toBe(false);
  });

  it('isKycStepEnabled false si la sección kyc está apagada', () => {
    const cfg = withKyc(false, [['dni_selfie', true, 1]]);
    expect(isKycStepEnabled(cfg, 'dni_selfie')).toBe(false);
  });

  it('isSectionEnabled("kyc") sigue funcionando', () => {
    expect(isSectionEnabled(withKyc(true, []), 'kyc')).toBe(true);
    expect(isSectionEnabled(withKyc(false, []), 'kyc')).toBe(false);
  });

  describe('isKycEnabled (fail-safe: ausente/deshabilitada ⇒ false)', () => {
    it('false si la sección kyc está AUSENTE', () => {
      const cfg: SolicitarFlowConfig = { sections: [{ type: 'wizard_steps', enabled: true, order: 1 }] };
      expect(isKycEnabled(cfg)).toBe(false);
    });

    it('false si la sección kyc está presente pero deshabilitada', () => {
      expect(isKycEnabled(withKyc(false, []))).toBe(false);
    });

    it('true si la sección kyc está presente y habilitada', () => {
      expect(isKycEnabled(withKyc(true, []))).toBe(true);
    });
  });
});
