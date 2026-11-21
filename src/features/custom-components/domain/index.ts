export {
  MIN_COMPONENT_WIDTH,
  MAX_COMPONENT_WIDTH,
  MIN_COMPONENT_HEIGHT,
  MAX_COMPONENT_HEIGHT,
  PCB_COLOR_PRESETS,
  createInitialCustomDraft,
  validateCustomComponentDraft,
  clampPinsToDimensions,
  generateQuickPinRow,
  buildCustomComponentDefinition,
  type CustomComponentDraft,
  type CustomComponentValidationResult,
  type QuickPinRowPreset,
} from './customComponentRules';

export {
  evaluateUpdateImpact,
  evaluateDeleteImpact,
  type BoardDimensionsConfig,
  type CustomComponentUpdateImpact,
  type CustomComponentDeleteImpact,
} from './validateCustomComponentImpact';

export type {
  CustomCatalogStoragePort,
  CustomLibraryFilePort,
} from './ports';
