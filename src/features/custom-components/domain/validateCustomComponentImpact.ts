import { BOARD_5X7_SPEC } from '@features/board/domain';
import {
  resolveComponentFootprint,
  validateComponentPlacement,
  type ComponentDefinition,
  type PlacedComponent,
} from '@features/components-catalog/domain';
import type { Wire } from '@features/wiring/domain';

export interface BoardDimensionsConfig {
  readonly columns: number;
  readonly rows: number;
  readonly catalogMap?: ReadonlyMap<string, ComponentDefinition>;
}

export interface CustomComponentUpdateImpact {
  readonly canSave: boolean;
  readonly blockingErrors: readonly string[];
  readonly warnings: readonly string[];
  readonly affectedInstancesCount: number;
}

export interface CustomComponentDeleteImpact {
  readonly inUse: boolean;
  readonly affectedInstancesCount: number;
  readonly affectedWiresCount: number;
}

function getWireEndpoints(
  wire: Wire,
): readonly { readonly col: number; readonly row: number }[] {
  if (wire.points.length === 0) {
    return [];
  }
  if (wire.points.length === 1) {
    return [wire.points[0]];
  }
  return [wire.points[0], wire.points[wire.points.length - 1]];
}

function wireConnectsToHole(wire: Wire, col: number, row: number): boolean {
  const endpoints = getWireEndpoints(wire);
  return endpoints.some((pt) => pt.col === col && pt.row === row);
}

/**
 * Avalia o impacto físico e elétrico de atualizar a definição de um componente customizado
 * que já possui instâncias posicionadas na placa.
 *
 * - Bloqueios rígidos (`blockingErrors`):
 *   - Instância ultrapassa os limites da placa (18x24) com as novas dimensões/rotação.
 *   - Instância passa a colidir com outro componente (corpo no mesmo lado ou pino THT).
 * - Avisos não-bloqueantes (`warnings`):
 *   - Pino que existia em `previousDef` foi removido ou mudou de coordenada `(col, row)`
 *     e possui fios conectados naquele furo físico.
 */
export function evaluateUpdateImpact(
  previousDef: ComponentDefinition,
  nextDef: ComponentDefinition,
  placedComponents: readonly PlacedComponent[],
  wires: readonly Wire[],
  boardConfig: BoardDimensionsConfig = {
    columns: BOARD_5X7_SPEC.columns,
    rows: BOARD_5X7_SPEC.rows,
  },
): CustomComponentUpdateImpact {
  const affectedInstances = placedComponents.filter(
    (item) => item.definitionId === previousDef.id,
  );

  if (affectedInstances.length === 0) {
    return {
      canSave: true,
      blockingErrors: [],
      warnings: [],
      affectedInstancesCount: 0,
    };
  }

  const boardColumns = boardConfig.columns;
  const boardRows = boardConfig.rows;

  const effectiveCatalogMap = new Map<string, ComponentDefinition>(
    boardConfig.catalogMap ?? [],
  );
  effectiveCatalogMap.set(previousDef.id, nextDef);
  effectiveCatalogMap.set(nextDef.id, nextDef);

  const blockingErrors: string[] = [];

  for (const instance of affectedInstances) {
    const validation = validateComponentPlacement({
      candidateDefinition: nextDef,
      anchorCol: instance.anchorCol,
      anchorRow: instance.anchorRow,
      rotation: instance.rotation,
      side: instance.side,
      existingComponents: placedComponents,
      catalogMap: effectiveCatalogMap,
      boardColumns,
      boardRows,
      ignoreInstanceId: instance.instanceId,
    });

    if (!validation.isValid) {
      if (validation.reason === 'out_of_bounds') {
        blockingErrors.push(
          `A instância "${instance.alias}" ultrapassa os limites da placa (${boardColumns}×${boardRows}) com o novo tamanho ${nextDef.widthHoles}×${nextDef.heightHoles} (rotação ${instance.rotation}°).`,
        );
      } else if (validation.reason === 'collision') {
        const collidingAliases = validation.collidingInstanceIds
          .map(
            (id) =>
              placedComponents.find((comp) => comp.instanceId === id)?.alias ??
              id,
          )
          .join(', ');
        const sideLabel = instance.side === 'top' ? 'Frente' : 'Verso';
        blockingErrors.push(
          `A instância "${instance.alias}" (${sideLabel}) passa a colidir com outro componente na placa (${collidingAliases}).`,
        );
      }
    }
  }

  const affectedWireIdsByPinLabel = new Map<string, Set<string>>();

  for (const instance of affectedInstances) {
    const prevFootprint = resolveComponentFootprint(
      previousDef,
      instance.anchorCol,
      instance.anchorRow,
      instance.rotation,
    );
    const nextFootprint = resolveComponentFootprint(
      nextDef,
      instance.anchorCol,
      instance.anchorRow,
      instance.rotation,
    );

    for (let i = 0; i < previousDef.pins.length; i += 1) {
      const prevPinDef = previousDef.pins[i];
      const prevResolvedPin = prevFootprint.pins[i];
      if (!prevResolvedPin) {
        continue;
      }

      const matchingNextPinDef = nextDef.pins.find(
        (candidate) =>
          candidate.id === prevPinDef.id ||
          (candidate.col === prevPinDef.col &&
            candidate.row === prevPinDef.row),
      );

      const localCoordinateChanged =
        !matchingNextPinDef ||
        matchingNextPinDef.col !== prevPinDef.col ||
        matchingNextPinDef.row !== prevPinDef.row;

      const stillOccupiesSameBoardHole = nextFootprint.pins.some(
        (nextResolved) =>
          nextResolved.boardCol === prevResolvedPin.boardCol &&
          nextResolved.boardRow === prevResolvedPin.boardRow,
      );

      if (!localCoordinateChanged && stillOccupiesSameBoardHole) {
        continue;
      }

      const connectedWires = wires.filter((wire) =>
        wireConnectsToHole(
          wire,
          prevResolvedPin.boardCol,
          prevResolvedPin.boardRow,
        ),
      );

      if (connectedWires.length > 0) {
        const pinKey = prevPinDef.label;
        const existingSet =
          affectedWireIdsByPinLabel.get(pinKey) ?? new Set<string>();
        for (const wire of connectedWires) {
          existingSet.add(wire.id);
        }
        affectedWireIdsByPinLabel.set(pinKey, existingSet);
      }
    }
  }

  const warnings: string[] = [];
  for (const [pinLabel, wireIds] of affectedWireIdsByPinLabel.entries()) {
    const count = wireIds.size;
    if (count === 1) {
      warnings.push(
        `1 fio deixará de apontar para o pino '${pinLabel}' e ficará vinculado ao furo físico.`,
      );
    } else if (count > 1) {
      warnings.push(
        `${count} fios deixarão de apontar para o pino '${pinLabel}' e ficarão vinculados ao furo físico.`,
      );
    }
  }

  return {
    canSave: blockingErrors.length === 0,
    blockingErrors,
    warnings,
    affectedInstancesCount: affectedInstances.length,
  };
}

/**
 * Avalia o impacto de excluir uma definição de componente customizado da biblioteca,
 * contabilizando instâncias posicionadas na placa e fios conectados aos seus pinos.
 */
export function evaluateDeleteImpact(
  componentId: string,
  placedComponents: readonly PlacedComponent[],
  wires: readonly Wire[],
  componentDefinition?: ComponentDefinition,
): CustomComponentDeleteImpact {
  const affectedInstances = placedComponents.filter(
    (item) => item.definitionId === componentId,
  );

  if (affectedInstances.length === 0) {
    return {
      inUse: false,
      affectedInstancesCount: 0,
      affectedWiresCount: 0,
    };
  }

  const occupiedPinHoles = new Set<string>();

  if (componentDefinition) {
    for (const instance of affectedInstances) {
      const footprint = resolveComponentFootprint(
        componentDefinition,
        instance.anchorCol,
        instance.anchorRow,
        instance.rotation,
      );
      for (const pin of footprint.pins) {
        occupiedPinHoles.add(`${pin.boardCol}:${pin.boardRow}`);
      }
    }
  } else {
    for (const instance of affectedInstances) {
      occupiedPinHoles.add(`${instance.anchorCol}:${instance.anchorRow}`);
    }
  }

  const affectedWireIds = new Set<string>();
  for (const wire of wires) {
    const endpoints = getWireEndpoints(wire);
    const touchesInstancePin = endpoints.some((pt) =>
      occupiedPinHoles.has(`${pt.col}:${pt.row}`),
    );
    if (touchesInstancePin) {
      affectedWireIds.add(wire.id);
    }
  }

  return {
    inUse: true,
    affectedInstancesCount: affectedInstances.length,
    affectedWiresCount: affectedWireIds.size,
  };
}
