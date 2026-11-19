import { formatHoleLabel } from '@features/board/domain';
import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type {
  NetlistEntry,
  Wire,
  WireColor,
} from '@features/wiring/domain';
import type { ProjectMetadata } from '@features/project-persistence/domain';

export interface BomItem {
  readonly definitionId: string;
  readonly modelName: string;
  readonly category: string;
  readonly footprintLabel: string;
  readonly quantity: number;
  readonly instancesSummary: string;
}

export interface TechnicalReport {
  readonly metadata: ProjectMetadata;
  readonly placedComponents: readonly PlacedComponent[];
  readonly wires: readonly Wire[];
  readonly usedWireColors: readonly WireColor[];
  readonly bom: readonly BomItem[];
  readonly netlist: readonly NetlistEntry[];
  readonly includeCppDefines: boolean;
  readonly cppHeaderCode: string;
}

/**
 * Serviço puro de domínio:
 * Agrupa os componentes posicionados na placa por modelo (`definitionId`),
 * contabilizando quantidade e listando os apelidos e coordenadas de âncora.
 */
export function buildBom(
  placedComponents: readonly PlacedComponent[],
  catalogMap: ReadonlyMap<string, ComponentDefinition>,
): readonly BomItem[] {
  const grouped = new Map<
    string,
    {
      readonly definition: ComponentDefinition;
      readonly instances: PlacedComponent[];
    }
  >();

  for (const placed of placedComponents) {
    const definition = catalogMap.get(placed.definitionId);
    if (!definition) {
      continue;
    }

    const existing = grouped.get(placed.definitionId);
    if (existing) {
      existing.instances.push(placed);
    } else {
      grouped.set(placed.definitionId, {
        definition,
        instances: [placed],
      });
    }
  }

  const items: BomItem[] = [];

  for (const [definitionId, entry] of grouped.entries()) {
    const instancesSummary = entry.instances
      .map((inst) => {
        const hole = formatHoleLabel({
          col: inst.anchorCol,
          row: inst.anchorRow,
        });
        const sideShort = inst.side === 'top' ? 'Frente' : 'Verso';
        return `${inst.alias} (${hole}, ${sideShort})`;
      })
      .join('; ');

    items.push({
      definitionId,
      modelName: entry.definition.name,
      category: entry.definition.category,
      footprintLabel: `${entry.definition.widthHoles}×${entry.definition.heightHoles} (${entry.definition.pins.length}p)`,
      quantity: entry.instances.length,
      instancesSummary,
    });
  }

  return items.sort((a, b) => a.modelName.localeCompare(b.modelName));
}
