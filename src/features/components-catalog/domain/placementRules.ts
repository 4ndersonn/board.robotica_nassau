import type {
  ComponentDefinition,
  ComponentRotation,
  MountingSide,
  PinDefinition,
  PlacedComponent,
  PlacementValidationResult,
  ResolvedComponentFootprint,
  ResolvedPin,
} from './entities';

/**
 * Avança a rotação em 90 graus no sentido horário.
 */
export function nextRotation90(rotation: ComponentRotation): ComponentRotation {
  switch (rotation) {
    case 0:
      return 90;
    case 90:
      return 180;
    case 180:
      return 270;
    case 270:
      return 0;
  }
}

/**
 * Calcula as dimensões em furos (largura e altura) após aplicar a rotação.
 */
export function getRotatedDimensions(
  widthHoles: number,
  heightHoles: number,
  rotation: ComponentRotation,
): { readonly widthHoles: number; readonly heightHoles: number } {
  if (rotation === 90 || rotation === 270) {
    return {
      widthHoles: heightHoles,
      heightHoles: widthHoles,
    };
  }

  return {
    widthHoles,
    heightHoles,
  };
}

/**
 * Rotaciona o offset local (col, row) de um pino dentro da caixa delimitadora
 * original (widthHoles x heightHoles) em incrementos de 90° no sentido horário.
 */
export function rotateLocalPinOffset(
  pin: Pick<PinDefinition, 'col' | 'row'>,
  widthHoles: number,
  heightHoles: number,
  rotation: ComponentRotation,
): { readonly col: number; readonly row: number } {
  const maxCol = widthHoles - 1;
  const maxRow = heightHoles - 1;

  switch (rotation) {
    case 0:
      return { col: pin.col, row: pin.row };
    case 90:
      return { col: maxRow - pin.row, row: pin.col };
    case 180:
      return { col: maxCol - pin.col, row: maxRow - pin.row };
    case 270:
      return { col: pin.row, row: maxCol - pin.col };
  }
}

/**
 * Resolve a pegada (footprint) completa e as coordenadas absolutas na placa
 * para um componente posicionado ou em pré-visualização (ghost).
 */
export function resolveComponentFootprint(
  definition: ComponentDefinition,
  anchorCol: number,
  anchorRow: number,
  rotation: ComponentRotation,
): ResolvedComponentFootprint {
  const { widthHoles: rotatedWidthHoles, heightHoles: rotatedHeightHoles } =
    getRotatedDimensions(
      definition.widthHoles,
      definition.heightHoles,
      rotation,
    );

  const pins: ResolvedPin[] = definition.pins.map((pin) => {
    const rotatedOffset = rotateLocalPinOffset(
      pin,
      definition.widthHoles,
      definition.heightHoles,
      rotation,
    );

    return {
      pinId: pin.id,
      label: pin.label,
      type: pin.type,
      boardCol: anchorCol + rotatedOffset.col,
      boardRow: anchorRow + rotatedOffset.row,
    };
  });

  return {
    anchorCol,
    anchorRow,
    rotatedWidthHoles,
    rotatedHeightHoles,
    minCol: anchorCol,
    maxCol: anchorCol + rotatedWidthHoles - 1,
    minRow: anchorRow,
    maxRow: anchorRow + rotatedHeightHoles - 1,
    pins,
  };
}

/**
 * Verifica se a caixa delimitadora e todos os pinos do componente estão dentro
 * dos limites físicos da matriz da placa (18 colunas x 24 linhas).
 */
export function isFootprintWithinBoardBounds(
  footprint: ResolvedComponentFootprint,
  boardColumns: number,
  boardRows: number,
): boolean {
  const boxInside =
    footprint.minCol >= 0 &&
    footprint.minRow >= 0 &&
    footprint.maxCol < boardColumns &&
    footprint.maxRow < boardRows;

  if (!boxInside) {
    return false;
  }

  return footprint.pins.every(
    (pin) =>
      pin.boardCol >= 0 &&
      pin.boardCol < boardColumns &&
      pin.boardRow >= 0 &&
      pin.boardRow < boardRows,
  );
}

/**
 * Verifica se duas caixas delimitadoras (footprints) se sobrepõem.
 */
export function doBoundingBoxesOverlap(
  a: ResolvedComponentFootprint,
  b: ResolvedComponentFootprint,
): boolean {
  const separatedHorizontally = a.maxCol < b.minCol || b.maxCol < a.minCol;
  const separatedVertically = a.maxRow < b.minRow || b.maxRow < a.minRow;
  return !(separatedHorizontally || separatedVertically);
}

/**
 * Verifica se dois componentes compartilham algum furo de pino (THT atravessa a placa,
 * portanto furos de pino colidem independentemente do lado de montagem).
 */
export function doPinsCollide(
  a: ResolvedComponentFootprint,
  b: ResolvedComponentFootprint,
): boolean {
  const occupiedKeys = new Set(
    a.pins.map((pin) => `${pin.boardCol}:${pin.boardRow}`),
  );

  return b.pins.some((pin) =>
    occupiedKeys.has(`${pin.boardCol}:${pin.boardRow}`),
  );
}

/**
 * Valida se um componente pode ser posicionado/rotacionado na âncora informada:
 * - Verifica limites da placa (18x24).
 * - Verifica colisão de furos de pinos (ambos os lados, pois pinos THT atravessam a placa).
 * - Verifica sobreposição física do corpo do módulo quando montados no mesmo lado ('top' ou 'bottom').
 */
export function validateComponentPlacement(params: {
  readonly candidateDefinition: ComponentDefinition;
  readonly anchorCol: number;
  readonly anchorRow: number;
  readonly rotation: ComponentRotation;
  readonly side: MountingSide;
  readonly existingComponents: readonly PlacedComponent[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly boardColumns: number;
  readonly boardRows: number;
  readonly ignoreInstanceId?: string;
}): PlacementValidationResult {
  const candidateFootprint = resolveComponentFootprint(
    params.candidateDefinition,
    params.anchorCol,
    params.anchorRow,
    params.rotation,
  );

  if (
    !isFootprintWithinBoardBounds(
      candidateFootprint,
      params.boardColumns,
      params.boardRows,
    )
  ) {
    return {
      isValid: false,
      reason: 'out_of_bounds',
      collidingInstanceIds: [],
    };
  }

  const collidingInstanceIds: string[] = [];

  for (const placed of params.existingComponents) {
    if (
      params.ignoreInstanceId &&
      placed.instanceId === params.ignoreInstanceId
    ) {
      continue;
    }

    const placedDef = params.catalogMap.get(placed.definitionId);
    if (!placedDef) {
      continue;
    }

    const placedFootprint = resolveComponentFootprint(
      placedDef,
      placed.anchorCol,
      placed.anchorRow,
      placed.rotation,
    );

    const sameSideBodyOverlap =
      placed.side === params.side &&
      doBoundingBoxesOverlap(candidateFootprint, placedFootprint);

    const throughHolePinCollision = doPinsCollide(
      candidateFootprint,
      placedFootprint,
    );

    if (sameSideBodyOverlap || throughHolePinCollision) {
      collidingInstanceIds.push(placed.instanceId);
    }
  }

  if (collidingInstanceIds.length > 0) {
    return {
      isValid: false,
      reason: 'collision',
      collidingInstanceIds,
    };
  }

  return {
    isValid: true,
    reason: 'valid',
    collidingInstanceIds: [],
  };
}
