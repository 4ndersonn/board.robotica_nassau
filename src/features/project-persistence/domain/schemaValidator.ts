import type {
  ComponentDefinition,
  ComponentRotation,
  MountingSide,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type {
  Wire,
  WireColorId,
  WirePoint,
  WireRoutingStyle,
  WireSide,
} from '@features/wiring/domain';
import { parseCustomComponentDefinition } from '@features/custom-components/infrastructure/LocalStorageCustomCatalogRepository';
import type { ProjectDocument, ProjectMetadata } from './entities';

export interface ProjectValidationResult {
  readonly isValid: boolean;
  readonly document?: ProjectDocument;
  readonly error?: string;
}

const BOARD_COLS = 18;
const BOARD_ROWS = 24;
const VALID_ROTATIONS: ReadonlySet<number> = new Set([0, 90, 180, 270]);
const VALID_SIDES: ReadonlySet<string> = new Set(['top', 'bottom']);
const VALID_WIRE_COLORS: ReadonlySet<string> = new Set([
  'red',
  'black',
  'yellow',
  'white',
  'green',
  'blue',
  'orange',
  'purple',
]);
const VALID_ROUTING_STYLES: ReadonlySet<string> = new Set([
  'orthogonal',
  'free',
]);

function isValidGridCoord(col: unknown, row: unknown): boolean {
  return (
    typeof col === 'number' &&
    typeof row === 'number' &&
    Number.isInteger(col) &&
    Number.isInteger(row) &&
    col >= 0 &&
    col < BOARD_COLS &&
    row >= 0 &&
    row < BOARD_ROWS
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateMetadata(raw: unknown): ProjectMetadata | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (
    typeof raw.robotName !== 'string' ||
    typeof raw.category !== 'string' ||
    typeof raw.version !== 'string' ||
    typeof raw.author !== 'string' ||
    typeof raw.date !== 'string' ||
    typeof raw.notes !== 'string'
  ) {
    return null;
  }

  return {
    robotName: raw.robotName,
    category: raw.category,
    version: raw.version,
    author: raw.author,
    date: raw.date,
    notes: raw.notes,
  };
}

function validatePlacedComponent(raw: unknown): PlacedComponent | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (
    typeof raw.instanceId !== 'string' ||
    typeof raw.definitionId !== 'string' ||
    typeof raw.alias !== 'string' ||
    !isValidGridCoord(raw.anchorCol, raw.anchorRow) ||
    typeof raw.rotation !== 'number' ||
    !VALID_ROTATIONS.has(raw.rotation) ||
    typeof raw.side !== 'string' ||
    !VALID_SIDES.has(raw.side)
  ) {
    return null;
  }

  return {
    instanceId: raw.instanceId,
    definitionId: raw.definitionId,
    alias: raw.alias,
    anchorCol: raw.anchorCol as number,
    anchorRow: raw.anchorRow as number,
    rotation: raw.rotation as ComponentRotation,
    side: raw.side as MountingSide,
  };
}

function validateWirePoint(raw: unknown): WirePoint | null {
  if (!isRecord(raw) || !isValidGridCoord(raw.col, raw.row)) {
    return null;
  }

  return {
    col: raw.col as number,
    row: raw.row as number,
  };
}

function validateWire(raw: unknown): Wire | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (
    typeof raw.id !== 'string' ||
    !Array.isArray(raw.points) ||
    raw.points.length < 2 ||
    typeof raw.colorId !== 'string' ||
    !VALID_WIRE_COLORS.has(raw.colorId) ||
    typeof raw.routingStyle !== 'string' ||
    !VALID_ROUTING_STYLES.has(raw.routingStyle) ||
    typeof raw.side !== 'string' ||
    !VALID_SIDES.has(raw.side) ||
    typeof raw.note !== 'string'
  ) {
    return null;
  }

  const validatedPoints: WirePoint[] = [];
  for (const pt of raw.points) {
    const validPt = validateWirePoint(pt);
    if (!validPt) {
      return null;
    }
    validatedPoints.push(validPt);
  }

  return {
    id: raw.id,
    points: validatedPoints,
    colorId: raw.colorId as WireColorId,
    routingStyle: raw.routingStyle as WireRoutingStyle,
    side: raw.side as WireSide,
    note: raw.note,
  };
}

/**
 * Validador puro de schema para documentos `.roboboard.json` e LocalStorage.
 */
export function validateProjectDocument(
  candidate: unknown,
): ProjectValidationResult {
  if (!isRecord(candidate)) {
    return {
      isValid: false,
      error: 'O arquivo não é um objeto JSON válido.',
    };
  }

  if (candidate.schemaVersion !== 1) {
    return {
      isValid: false,
      error: 'Versão de schema incompatível (esperado schemaVersion: 1).',
    };
  }

  const metadata = validateMetadata(candidate.metadata);
  if (!metadata) {
    return {
      isValid: false,
      error: 'Metadados do projeto ausentes ou malformados.',
    };
  }

  if (!isRecord(candidate.boardState)) {
    return {
      isValid: false,
      error: 'Estado da placa (boardState) ausente ou inválido.',
    };
  }

  const rawComponents = candidate.boardState.placedComponents;
  const rawWires = candidate.boardState.wires;

  if (!Array.isArray(rawComponents) || !Array.isArray(rawWires)) {
    return {
      isValid: false,
      error: 'Listas de componentes ou fios inválidas no boardState.',
    };
  }

  const placedComponents: PlacedComponent[] = [];
  for (const item of rawComponents) {
    const validated = validatePlacedComponent(item);
    if (!validated) {
      return {
        isValid: false,
        error: 'Um ou mais componentes posicionados possuem formato inválido.',
      };
    }
    placedComponents.push(validated);
  }

  const wires: Wire[] = [];
  for (const item of rawWires) {
    const validated = validateWire(item);
    if (!validated) {
      return {
        isValid: false,
        error: 'Um ou mais fios possuem formato inválido.',
      };
    }
    wires.push(validated);
  }

  const customComponentDefinitions: ComponentDefinition[] = [];
  if (Array.isArray(candidate.customComponentDefinitions)) {
    for (const rawCustom of candidate.customComponentDefinitions) {
      const validCustom = parseCustomComponentDefinition(rawCustom);
      if (!validCustom) {
        return {
          isValid: false,
          error:
            'Uma ou mais definições de componentes customizados embutidas são inválidas.',
        };
      }
      customComponentDefinitions.push(validCustom);
    }
  }

  return {
    isValid: true,
    document: {
      schemaVersion: 1,
      metadata,
      boardState: {
        placedComponents,
        wires,
      },
      customComponentDefinitions,
    },
  };
}
