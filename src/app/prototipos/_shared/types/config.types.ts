/**
 * Tipos de configuración para el sistema de versionado de prototipos
 * BaldeCash Web 3.0
 */

// ============================================
// CONFIGURACIÓN DE COMPONENTES
// ============================================

export type ComponentVersion = 1 | 2 | 3 | 4;

export interface ComponentConfig {
  version: ComponentVersion;
  notes?: string;
  updatedAt?: string;
}

// ============================================
// CONFIGURACIÓN POR SECCIÓN
// ============================================

export interface HeroConfig {
  brandIdentity: ComponentConfig;
  profileIdentification: ComponentConfig;
  institutionalBanner: ComponentConfig;
  socialProof: ComponentConfig;
  navbar: ComponentConfig;
  heroCta: ComponentConfig;
}

export interface CatalogLayoutConfig {
  layout: ComponentConfig;
  brandFilter: ComponentConfig;
}

export interface CatalogCardsConfig {
  cardEnfoque: ComponentConfig;
  badgePosition: ComponentConfig;
  badgeColors: ComponentConfig;
  keyFeatures: ComponentConfig;
  stockDisplay: ComponentConfig;
  favoriteButton: ComponentConfig;
  hoverBehavior: ComponentConfig;
  imageStyle: ComponentConfig;
  multipleImages: ComponentConfig;
}

export interface WizardConfig {
  layout: ComponentConfig;
  progress: ComponentConfig;
  navigation: ComponentConfig;
  motivation: ComponentConfig;
  celebration: ComponentConfig;
  stepLayout: ComponentConfig;
}

export interface ResultsConfig {
  approval: ComponentConfig;
  rejection: ComponentConfig;
}

// ============================================
// CONFIGURACIÓN DE SECCIÓN
// ============================================

export interface SectionConfig<T = Record<string, ComponentConfig>> {
  enabled: boolean;
  components: T;
  lastUpdated?: string;
}

// ============================================
// CONFIGURACIÓN DE PROTOTIPO
// ============================================

export type PrototypeStatus = 'draft' | 'testing' | 'approved' | 'archived';

export interface PrototypeConfig {
  version: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: PrototypeStatus;
  sections: {
    hero: SectionConfig<HeroConfig>;
    catalogoLayout: SectionConfig<CatalogLayoutConfig>;
    catalogoCards: SectionConfig<CatalogCardsConfig>;
    detalleProducto: SectionConfig;
    wizard: SectionConfig<WizardConfig>;
    results: SectionConfig<ResultsConfig>;
    upsell: SectionConfig;
    comparador: SectionConfig;
    quiz: SectionConfig;
    estadoVacio: SectionConfig;
  };
  testingNotes: TestingNote[];
}

// ============================================
// HISTÓRICO
// ============================================

export interface TestingNote {
  date: string;
  note: string;
  author?: string;
}

export interface VersionResults {
  completionRate?: string;
  avgTimeOnPage?: string;
  notes?: string;
}

export interface HistoryEntry {
  version: string;
  date: string;
  status: PrototypeStatus;
  summary: string;
  keyDecisions: Record<string, ComponentVersion>;
  results: VersionResults | null;
}

export interface VersionsHistory {
  versions: HistoryEntry[];
  componentEvolution: Record<string, Record<string, {
    version: ComponentVersion;
    type: string;
  }>>;
}

// ============================================
// SETTINGS MODAL
// ============================================

export interface SettingsOption {
  value: ComponentVersion;
  label: string;
  description: string;
}

export interface SettingsGroup {
  id: string;
  label: string;
  currentVersion: ComponentVersion;
  options: SettingsOption[];
}

export interface SectionSettingsProps {
  sectionName: string;
  groups: SettingsGroup[];
  onSave: (config: Record<string, ComponentVersion>) => void;
  onReset: () => void;
}

// ============================================
// HELPERS
// ============================================

export const DEFAULT_COMPONENT_CONFIG: ComponentConfig = {
  version: 1,
  notes: '',
};

export const createSectionConfig = <T extends Record<string, ComponentConfig>>(
  components: T,
  enabled = false
): SectionConfig<T> => ({
  enabled,
  components,
  lastUpdated: new Date().toISOString(),
});
