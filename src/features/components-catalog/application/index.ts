export {
  placeComponent,
  rotateComponent,
  toggleComponentSide,
  renameComponentAlias,
  removeComponent,
  getOccupiedHoles,
  type OccupiedHoleEntry,
  type PlaceComponentOutcome,
  type RotateComponentOutcome,
} from './componentUseCases';

export {
  useComponentsCatalog,
  type ActivePlacementGhost,
  type HoveredPinTooltip,
  type ComponentsCatalogController,
} from './useComponentsCatalog';
