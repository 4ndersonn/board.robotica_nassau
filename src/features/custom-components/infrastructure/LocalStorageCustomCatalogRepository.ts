import type {
  ComponentDefinition,
  PinDefinition,
  PinType,
} from '@features/components-catalog/domain';
import type { CustomCatalogStoragePort } from '../domain';

const CUSTOM_CATALOG_STORAGE_KEY = 'roboboard_docs_custom_catalog_v1';

const VALID_PIN_TYPES: ReadonlySet<string> = new Set([
  'power',
  'gnd',
  'signal',
  'motor',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCustomComponentDefinition(
  raw: unknown,
): ComponentDefinition | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (
    typeof raw.id !== 'string' ||
    typeof raw.name !== 'string' ||
    typeof raw.category !== 'string' ||
    typeof raw.description !== 'string' ||
    typeof raw.widthHoles !== 'number' ||
    typeof raw.heightHoles !== 'number' ||
    typeof raw.color !== 'string' ||
    typeof raw.accentColor !== 'string' ||
    !Array.isArray(raw.pins) ||
    raw.pins.length < 1
  ) {
    return null;
  }

  const pins: PinDefinition[] = [];

  for (const rawPin of raw.pins) {
    if (!isRecord(rawPin)) {
      return null;
    }

    if (
      typeof rawPin.id !== 'string' ||
      typeof rawPin.col !== 'number' ||
      typeof rawPin.row !== 'number' ||
      typeof rawPin.label !== 'string' ||
      typeof rawPin.type !== 'string' ||
      !VALID_PIN_TYPES.has(rawPin.type)
    ) {
      return null;
    }

    pins.push({
      id: rawPin.id,
      col: rawPin.col,
      row: rawPin.row,
      label: rawPin.label,
      type: rawPin.type as PinType,
    });
  }

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    description: raw.description,
    widthHoles: raw.widthHoles,
    heightHoles: raw.heightHoles,
    color: raw.color,
    accentColor: raw.accentColor,
    pins,
    isCustom: true,
  };
}

export class LocalStorageCustomCatalogRepository
  implements CustomCatalogStoragePort
{
  public loadCustomDefinitions(): readonly ComponentDefinition[] {
    try {
      const serialized = window.localStorage.getItem(
        CUSTOM_CATALOG_STORAGE_KEY,
      );
      if (!serialized) {
        return [];
      }

      const parsed: unknown = JSON.parse(serialized);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const definitions: ComponentDefinition[] = [];
      for (const item of parsed) {
        const valid = parseCustomComponentDefinition(item);
        if (valid) {
          definitions.push(valid);
        }
      }
      return definitions;
    } catch {
      return [];
    }
  }

  public saveCustomDefinitions(
    definitions: readonly ComponentDefinition[],
  ): void {
    try {
      const serialized = JSON.stringify(definitions);
      window.localStorage.setItem(CUSTOM_CATALOG_STORAGE_KEY, serialized);
    } catch {
      // Silencia falha de quota do LocalStorage
    }
  }
}

export const localStorageCustomCatalogRepository =
  new LocalStorageCustomCatalogRepository();
