/**
 * Tests for Solicitar Flow Configuration
 */

import {
  DEFAULT_SOLICITAR_FLOW,
  getEnabledSections,
  isSectionEnabled,
  type SolicitarFlowConfig,
} from '../services/landingApi';
import {
  getNextSection,
  getPreviousSection,
} from '../hooks/useSolicitarFlow';

describe('Solicitar Flow Config - Helper Functions', () => {
  describe('getEnabledSections', () => {
    it('returns all sections when all are enabled', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'accessories', enabled: true, order: 1 },
          { type: 'wizard_steps', enabled: true, order: 2 },
          { type: 'insurance', enabled: true, order: 3 },
        ],
      };

      const result = getEnabledSections(config);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('accessories');
      expect(result[1].type).toBe('wizard_steps');
      expect(result[2].type).toBe('insurance');
    });

    it('filters out disabled sections', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'accessories', enabled: false, order: 1 },
          { type: 'wizard_steps', enabled: true, order: 2 },
          { type: 'insurance', enabled: true, order: 3 },
        ],
      };

      const result = getEnabledSections(config);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('wizard_steps');
      expect(result[1].type).toBe('insurance');
    });

    it('returns empty array when all sections are disabled', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'accessories', enabled: false, order: 1 },
          { type: 'wizard_steps', enabled: false, order: 2 },
          { type: 'insurance', enabled: false, order: 3 },
        ],
      };

      const result = getEnabledSections(config);

      expect(result).toHaveLength(0);
    });

    it('sorts sections by order', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'insurance', enabled: true, order: 3 },
          { type: 'accessories', enabled: true, order: 1 },
          { type: 'wizard_steps', enabled: true, order: 2 },
        ],
      };

      const result = getEnabledSections(config);

      expect(result[0].type).toBe('accessories');
      expect(result[1].type).toBe('wizard_steps');
      expect(result[2].type).toBe('insurance');
    });

    it('respects custom order', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'insurance', enabled: true, order: 1 },
          { type: 'wizard_steps', enabled: true, order: 2 },
          { type: 'accessories', enabled: true, order: 3 },
        ],
      };

      const result = getEnabledSections(config);

      expect(result[0].type).toBe('insurance');
      expect(result[1].type).toBe('wizard_steps');
      expect(result[2].type).toBe('accessories');
    });
  });

  describe('isSectionEnabled', () => {
    it('returns true when section is enabled', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'accessories', enabled: true, order: 1 },
          { type: 'wizard_steps', enabled: true, order: 2 },
          { type: 'insurance', enabled: false, order: 3 },
        ],
      };

      expect(isSectionEnabled(config, 'accessories')).toBe(true);
      expect(isSectionEnabled(config, 'wizard_steps')).toBe(true);
    });

    it('returns false when section is disabled', () => {
      const config: SolicitarFlowConfig = {
        sections: [
          { type: 'accessories', enabled: true, order: 1 },
          { type: 'wizard_steps', enabled: true, order: 2 },
          { type: 'insurance', enabled: false, order: 3 },
        ],
      };

      expect(isSectionEnabled(config, 'insurance')).toBe(false);
    });

    it('returns true as default when section not found', () => {
      const config: SolicitarFlowConfig = {
        sections: [],
      };

      // Should default to true for safety (show section if config missing)
      expect(isSectionEnabled(config, 'accessories')).toBe(true);
    });
  });

  describe('getNextSection', () => {
    it('returns next enabled section', () => {
      const enabledSections = [
        { type: 'accessories' as const, enabled: true, order: 1 },
        { type: 'wizard_steps' as const, enabled: true, order: 2 },
        { type: 'insurance' as const, enabled: true, order: 3 },
      ];

      expect(getNextSection(enabledSections, 'accessories')).toBe('wizard_steps');
      expect(getNextSection(enabledSections, 'wizard_steps')).toBe('insurance');
    });

    it('returns null when at last section', () => {
      const enabledSections = [
        { type: 'accessories' as const, enabled: true, order: 1 },
        { type: 'wizard_steps' as const, enabled: true, order: 2 },
        { type: 'insurance' as const, enabled: true, order: 3 },
      ];

      expect(getNextSection(enabledSections, 'insurance')).toBe(null);
    });

    it('returns null when section not found', () => {
      const enabledSections = [
        { type: 'wizard_steps' as const, enabled: true, order: 2 },
        { type: 'insurance' as const, enabled: true, order: 3 },
      ];

      expect(getNextSection(enabledSections, 'accessories')).toBe(null);
    });
  });

  describe('getPreviousSection', () => {
    it('returns previous enabled section', () => {
      const enabledSections = [
        { type: 'accessories' as const, enabled: true, order: 1 },
        { type: 'wizard_steps' as const, enabled: true, order: 2 },
        { type: 'insurance' as const, enabled: true, order: 3 },
      ];

      expect(getPreviousSection(enabledSections, 'wizard_steps')).toBe('accessories');
      expect(getPreviousSection(enabledSections, 'insurance')).toBe('wizard_steps');
    });

    it('returns null when at first section', () => {
      const enabledSections = [
        { type: 'accessories' as const, enabled: true, order: 1 },
        { type: 'wizard_steps' as const, enabled: true, order: 2 },
        { type: 'insurance' as const, enabled: true, order: 3 },
      ];

      expect(getPreviousSection(enabledSections, 'accessories')).toBe(null);
    });

    it('returns null when section not found', () => {
      const enabledSections = [
        { type: 'wizard_steps' as const, enabled: true, order: 2 },
        { type: 'insurance' as const, enabled: true, order: 3 },
      ];

      expect(getPreviousSection(enabledSections, 'accessories')).toBe(null);
    });
  });

  describe('DEFAULT_SOLICITAR_FLOW', () => {
    it('has correct default structure', () => {
      expect(DEFAULT_SOLICITAR_FLOW.sections).toHaveLength(3);
    });

    it('has all sections enabled by default', () => {
      DEFAULT_SOLICITAR_FLOW.sections.forEach(section => {
        expect(section.enabled).toBe(true);
      });
    });

    it('has sections in correct default order', () => {
      const sections = DEFAULT_SOLICITAR_FLOW.sections;
      expect(sections[0].type).toBe('accessories');
      expect(sections[0].order).toBe(1);
      expect(sections[1].type).toBe('wizard_steps');
      expect(sections[1].order).toBe(2);
      expect(sections[2].type).toBe('insurance');
      expect(sections[2].order).toBe(3);
    });
  });
});

/**
 * Tests for section ordering helpers (sectionsBeforeWizard, sectionsAfterWizard)
 * These test the logic that will be used in useSolicitarFlow hook
 */
describe('Section Ordering Helpers', () => {
  // Helper function to calculate sections before wizard (mirrors hook logic)
  function getSectionsBeforeWizard(enabledSections: { type: string; order: number }[]) {
    const wizardOrder = enabledSections.find(s => s.type === 'wizard_steps')?.order ?? 999;
    return enabledSections
      .filter(s => s.type !== 'wizard_steps' && s.order < wizardOrder)
      .sort((a, b) => a.order - b.order);
  }

  // Helper function to calculate sections after wizard (mirrors hook logic)
  function getSectionsAfterWizard(enabledSections: { type: string; order: number }[]) {
    const wizardOrder = enabledSections.find(s => s.type === 'wizard_steps')?.order ?? 999;
    return enabledSections
      .filter(s => s.type !== 'wizard_steps' && s.order > wizardOrder)
      .sort((a, b) => a.order - b.order);
  }

  describe('getSectionsBeforeWizard', () => {
    it('returns accessories when order is acc:1, wiz:2, ins:3', () => {
      const enabledSections = [
        { type: 'accessories', order: 1 },
        { type: 'wizard_steps', order: 2 },
        { type: 'insurance', order: 3 },
      ];

      const result = getSectionsBeforeWizard(enabledSections);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('accessories');
    });

    it('returns insurance when order is ins:1, wiz:2, acc:3', () => {
      const enabledSections = [
        { type: 'insurance', order: 1 },
        { type: 'wizard_steps', order: 2 },
        { type: 'accessories', order: 3 },
      ];

      const result = getSectionsBeforeWizard(enabledSections);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('insurance');
    });

    it('returns empty when wizard is first (wiz:1, acc:2, ins:3)', () => {
      const enabledSections = [
        { type: 'wizard_steps', order: 1 },
        { type: 'accessories', order: 2 },
        { type: 'insurance', order: 3 },
      ];

      const result = getSectionsBeforeWizard(enabledSections);

      expect(result).toHaveLength(0);
    });

    it('returns both acc and ins when wizard is last (acc:1, ins:2, wiz:3)', () => {
      const enabledSections = [
        { type: 'accessories', order: 1 },
        { type: 'insurance', order: 2 },
        { type: 'wizard_steps', order: 3 },
      ];

      const result = getSectionsBeforeWizard(enabledSections);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('accessories');
      expect(result[1].type).toBe('insurance');
    });

    it('maintains correct order when ins:1, acc:2, wiz:3', () => {
      const enabledSections = [
        { type: 'insurance', order: 1 },
        { type: 'accessories', order: 2 },
        { type: 'wizard_steps', order: 3 },
      ];

      const result = getSectionsBeforeWizard(enabledSections);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('insurance');
      expect(result[1].type).toBe('accessories');
    });
  });

  describe('getSectionsAfterWizard', () => {
    it('returns insurance when order is acc:1, wiz:2, ins:3', () => {
      const enabledSections = [
        { type: 'accessories', order: 1 },
        { type: 'wizard_steps', order: 2 },
        { type: 'insurance', order: 3 },
      ];

      const result = getSectionsAfterWizard(enabledSections);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('insurance');
    });

    it('returns accessories when order is ins:1, wiz:2, acc:3', () => {
      const enabledSections = [
        { type: 'insurance', order: 1 },
        { type: 'wizard_steps', order: 2 },
        { type: 'accessories', order: 3 },
      ];

      const result = getSectionsAfterWizard(enabledSections);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('accessories');
    });

    it('returns both acc and ins when wizard is first (wiz:1, acc:2, ins:3)', () => {
      const enabledSections = [
        { type: 'wizard_steps', order: 1 },
        { type: 'accessories', order: 2 },
        { type: 'insurance', order: 3 },
      ];

      const result = getSectionsAfterWizard(enabledSections);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('accessories');
      expect(result[1].type).toBe('insurance');
    });

    it('returns empty when wizard is last (acc:1, ins:2, wiz:3)', () => {
      const enabledSections = [
        { type: 'accessories', order: 1 },
        { type: 'insurance', order: 2 },
        { type: 'wizard_steps', order: 3 },
      ];

      const result = getSectionsAfterWizard(enabledSections);

      expect(result).toHaveLength(0);
    });

    it('maintains correct order when wiz:1, ins:2, acc:3', () => {
      const enabledSections = [
        { type: 'wizard_steps', order: 1 },
        { type: 'insurance', order: 2 },
        { type: 'accessories', order: 3 },
      ];

      const result = getSectionsAfterWizard(enabledSections);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('insurance');
      expect(result[1].type).toBe('accessories');
    });
  });

  describe('shouldShowComplementos', () => {
    it('returns true when there are sections after wizard', () => {
      const enabledSections = [
        { type: 'accessories', order: 1 },
        { type: 'wizard_steps', order: 2 },
        { type: 'insurance', order: 3 },
      ];

      const sectionsAfter = getSectionsAfterWizard(enabledSections);
      const shouldShowComplementos = sectionsAfter.length > 0;

      expect(shouldShowComplementos).toBe(true);
    });

    it('returns false when all sections are before wizard', () => {
      const enabledSections = [
        { type: 'accessories', order: 1 },
        { type: 'insurance', order: 2 },
        { type: 'wizard_steps', order: 3 },
      ];

      const sectionsAfter = getSectionsAfterWizard(enabledSections);
      const shouldShowComplementos = sectionsAfter.length > 0;

      expect(shouldShowComplementos).toBe(false);
    });

    it('returns false when only wizard is enabled', () => {
      const enabledSections = [
        { type: 'wizard_steps', order: 1 },
      ];

      const sectionsAfter = getSectionsAfterWizard(enabledSections);
      const shouldShowComplementos = sectionsAfter.length > 0;

      expect(shouldShowComplementos).toBe(false);
    });
  });
});
