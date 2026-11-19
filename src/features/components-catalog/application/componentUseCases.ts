import {
  nextRotation90,
  resolveComponentFootprint,
  validateComponentPlacement,
  type ComponentDefinition,
  type ComponentRotation,
  type MountingSide,
  type PinType,
  type PlacedComponent,
  type PlacementValidationResult,
} from '../domain';

export interface OccupiedHoleEntry {
  readonly col: number;
  readonly row: number;
  readonly instanceId: string;
  readonly componentAlias: string;
  readonly pinId: string;
  readonly pinLabel: string;
  readonly pinType: PinType;
}

export interface PlaceComponentOutcome {
  readonly ok: boolean;
  readonly validation: PlacementValidationResult;
  readonly nextComponents: readonly PlacedComponent[];
  readonly createdInstance?: PlacedComponent;
}

export function placeComponent(params: {
  readonly definition: ComponentDefinition;
  readonly anchorCol: number;
  readonly anchorRow: number;
  readonly rotation: ComponentRotation;
  readonly side: MountingSide;
  readonly existingComponents: readonly PlacedComponent[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly boardColumns: number;
  readonly boardRows: number;
}): PlaceComponentOutcome {
  const validation = validateComponentPlacement({
    candidateDefinition: params.definition,
    anchorCol: params.anchorCol,
    anchorRow: params.anchorRow,
    rotation: params.rotation,
    side: params.side,
    existingComponents: params.existingComponents,
    catalogMap: params.catalogMap,
    boardColumns: params.boardColumns,
    boardRows: params.boardRows,
  });

  if (!validation.isValid) {
    return {
      ok: false,
      validation,
      nextComponents: params.existingComponents,
    };
  }

  const sameTypeCount = params.existingComponents.filter(
    (item) => item.definitionId === params.definition.id,
  ).length;

  const createdInstance: PlacedComponent = {
    instanceId: `${params.definition.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    definitionId: params.definition.id,
    alias:
      sameTypeCount === 0
        ? params.definition.name
        : `${params.definition.name} #${sameTypeCount + 1}`,
    anchorCol: params.anchorCol,
    anchorRow: params.anchorRow,
    rotation: params.rotation,
    side: params.side,
  };

  return {
    ok: true,
    validation,
    nextComponents: [...params.existingComponents, createdInstance],
    createdInstance,
  };
}

export interface RotateComponentOutcome {
  readonly ok: boolean;
  readonly validation: PlacementValidationResult;
  readonly nextComponents: readonly PlacedComponent[];
}

export function rotateComponent(params: {
  readonly instanceId: string;
  readonly existingComponents: readonly PlacedComponent[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly boardColumns: number;
  readonly boardRows: number;
}): RotateComponentOutcome {
  const target = params.existingComponents.find(
    (item) => item.instanceId === params.instanceId,
  );

  if (!target) {
    return {
      ok: false,
      validation: {
        isValid: false,
        reason: 'out_of_bounds',
        collidingInstanceIds: [],
      },
      nextComponents: params.existingComponents,
    };
  }

  const definition = params.catalogMap.get(target.definitionId);
  if (!definition) {
    return {
      ok: false,
      validation: {
        isValid: false,
        reason: 'out_of_bounds',
        collidingInstanceIds: [],
      },
      nextComponents: params.existingComponents,
    };
  }

  const candidateRotation = nextRotation90(target.rotation);
  const validation = validateComponentPlacement({
    candidateDefinition: definition,
    anchorCol: target.anchorCol,
    anchorRow: target.anchorRow,
    rotation: candidateRotation,
    side: target.side,
    existingComponents: params.existingComponents,
    catalogMap: params.catalogMap,
    boardColumns: params.boardColumns,
    boardRows: params.boardRows,
    ignoreInstanceId: target.instanceId,
  });

  if (!validation.isValid) {
    return {
      ok: false,
      validation,
      nextComponents: params.existingComponents,
    };
  }

  const nextComponents = params.existingComponents.map((item) =>
    item.instanceId === target.instanceId
      ? { ...item, rotation: candidateRotation }
      : item,
  );

  return {
    ok: true,
    validation,
    nextComponents,
  };
}

export function toggleComponentSide(params: {
  readonly instanceId: string;
  readonly existingComponents: readonly PlacedComponent[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly boardColumns: number;
  readonly boardRows: number;
}): RotateComponentOutcome {
  const target = params.existingComponents.find(
    (item) => item.instanceId === params.instanceId,
  );

  if (!target) {
    return {
      ok: false,
      validation: {
        isValid: false,
        reason: 'out_of_bounds',
        collidingInstanceIds: [],
      },
      nextComponents: params.existingComponents,
    };
  }

  const definition = params.catalogMap.get(target.definitionId);
  if (!definition) {
    return {
      ok: false,
      validation: {
        isValid: false,
        reason: 'out_of_bounds',
        collidingInstanceIds: [],
      },
      nextComponents: params.existingComponents,
    };
  }

  const candidateSide: MountingSide = target.side === 'top' ? 'bottom' : 'top';
  const validation = validateComponentPlacement({
    candidateDefinition: definition,
    anchorCol: target.anchorCol,
    anchorRow: target.anchorRow,
    rotation: target.rotation,
    side: candidateSide,
    existingComponents: params.existingComponents,
    catalogMap: params.catalogMap,
    boardColumns: params.boardColumns,
    boardRows: params.boardRows,
    ignoreInstanceId: target.instanceId,
  });

  if (!validation.isValid) {
    return {
      ok: false,
      validation,
      nextComponents: params.existingComponents,
    };
  }

  const nextComponents = params.existingComponents.map((item) =>
    item.instanceId === target.instanceId
      ? { ...item, side: candidateSide }
      : item,
  );

  return {
    ok: true,
    validation,
    nextComponents,
  };
}

export function renameComponentAlias(
  instanceId: string,
  nextAlias: string,
  existingComponents: readonly PlacedComponent[],
): readonly PlacedComponent[] {
  return existingComponents.map((item) =>
    item.instanceId === instanceId ? { ...item, alias: nextAlias } : item,
  );
}

export function removeComponent(
  instanceId: string,
  existingComponents: readonly PlacedComponent[],
): readonly PlacedComponent[] {
  return existingComponents.filter((item) => item.instanceId !== instanceId);
}

export function getOccupiedHoles(
  existingComponents: readonly PlacedComponent[],
  catalogMap: ReadonlyMap<string, ComponentDefinition>,
): ReadonlyMap<string, OccupiedHoleEntry> {
  const map = new Map<string, OccupiedHoleEntry>();

  for (const placed of existingComponents) {
    const definition = catalogMap.get(placed.definitionId);
    if (!definition) {
      continue;
    }

    const footprint = resolveComponentFootprint(
      definition,
      placed.anchorCol,
      placed.anchorRow,
      placed.rotation,
    );

    for (const pin of footprint.pins) {
      const key = `${pin.boardCol}:${pin.boardRow}`;
      map.set(key, {
        col: pin.boardCol,
        row: pin.boardRow,
        instanceId: placed.instanceId,
        componentAlias: placed.alias,
        pinId: pin.pinId,
        pinLabel: pin.label,
        pinType: pin.type,
      });
    }
  }

  return map;
}
