// Types
export * from './types/config.types';

// Hooks
export { usePrototypeConfig } from './hooks/usePrototypeConfig';
export { useSectionSettings, generateSettingsGroups } from './hooks/useSectionSettings';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
export type { ShortcutConfig, ComponentVersion as ShortcutComponentVersion } from './hooks/useKeyboardShortcuts';

// Components
export { SettingsButton } from './components/SettingsButton';
export { SettingsModal } from './components/SettingsModal';
export { VersionNav } from './components/VersionNav';
