export type PinType = 'power' | 'gnd' | 'signal' | 'motor';

export type ComponentRotation = 0 | 90 | 180 | 270;

export type MountingSide = 'top' | 'bottom';

export interface PinDefinition {
  readonly id: string;
  readonly col: number;
  readonly row: number;
  readonly label: string;
  readonly type: PinType;
}

export interface ComponentDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly widthHoles: number;
  readonly heightHoles: number;
  readonly color: string;
  readonly accentColor: string;
  readonly pins: readonly PinDefinition[];
  readonly isCustom?: boolean;
}

export interface PlacedComponent {
  readonly instanceId: string;
  readonly definitionId: string;
  readonly alias: string;
  /** Coordenada lógica da âncora (canto superior-esquerdo na Vista Superior) */
  readonly anchorCol: number;
  readonly anchorRow: number;
  readonly rotation: ComponentRotation;
  readonly side: MountingSide;
}

export interface ResolvedPin {
  readonly pinId: string;
  readonly label: string;
  readonly type: PinType;
  /** Coordenada lógica na placa (Vista Superior 0..17, 0..23) */
  readonly boardCol: number;
  readonly boardRow: number;
}

export interface ResolvedComponentFootprint {
  readonly anchorCol: number;
  readonly anchorRow: number;
  readonly rotatedWidthHoles: number;
  readonly rotatedHeightHoles: number;
  readonly minCol: number;
  readonly maxCol: number;
  readonly minRow: number;
  readonly maxRow: number;
  readonly pins: readonly ResolvedPin[];
}

export type PlacementValidationReason =
  | 'valid'
  | 'out_of_bounds'
  | 'collision';

export interface PlacementValidationResult {
  readonly isValid: boolean;
  readonly reason: PlacementValidationReason;
  readonly collidingInstanceIds: readonly string[];
}
