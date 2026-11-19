export type WireColorId =
  | 'red'
  | 'black'
  | 'yellow'
  | 'white'
  | 'green'
  | 'blue'
  | 'orange'
  | 'purple';

export interface WireColor {
  readonly id: WireColorId;
  readonly name: string;
  readonly hex: string;
  readonly usageHint: string;
}

export type WireRoutingStyle = 'orthogonal' | 'free';

export type WireSide = 'top' | 'bottom';

export type EditorToolMode = 'select' | 'wire';

/**
 * Ponto lógico de um fio no grid da placa (sempre em coordenadas da Vista Superior: col 0..17, row 0..23).
 */
export interface WirePoint {
  readonly col: number;
  readonly row: number;
}

export interface Wire {
  readonly id: string;
  readonly points: readonly WirePoint[];
  readonly colorId: WireColorId;
  readonly routingStyle: WireRoutingStyle;
  readonly side: WireSide;
  readonly note: string;
}

export interface NetlistEndpointInfo {
  readonly holeLabel: string;
  readonly componentAlias: string | null;
  readonly pinLabel: string | null;
  readonly formattedEndpoint: string;
}

export interface NetlistEntry {
  readonly wireId: string;
  readonly origin: NetlistEndpointInfo;
  readonly destination: NetlistEndpointInfo;
  readonly colorId: WireColorId;
  readonly colorName: string;
  readonly colorHex: string;
  readonly side: WireSide;
  readonly sideLabel: string;
  readonly note: string;
}
