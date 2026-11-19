export type {
  PinType,
  ComponentRotation,
  MountingSide,
  PinDefinition,
  ComponentDefinition,
  PlacedComponent,
  ResolvedPin,
  ResolvedComponentFootprint,
  PlacementValidationReason,
  PlacementValidationResult,
} from './entities';

export type { CatalogRepository } from './catalogRepositoryPort';

export {
  nextRotation90,
  getRotatedDimensions,
  rotateLocalPinOffset,
  resolveComponentFootprint,
  isFootprintWithinBoardBounds,
  doBoundingBoxesOverlap,
  doPinsCollide,
  validateComponentPlacement,
} from './placementRules';
