import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type {
  NetlistEntry,
  Wire,
  WireColor,
  WireColorId,
} from '@features/wiring/domain';
import type { ProjectMetadata } from '@features/project-persistence/domain';
import { generateCppDefines } from '@features/firmware-export/domain';
import { buildBom, type TechnicalReport } from '../domain';

export function assembleTechnicalReport(params: {
  readonly metadata: ProjectMetadata;
  readonly placedComponents: readonly PlacedComponent[];
  readonly wires: readonly Wire[];
  readonly netlist: readonly NetlistEntry[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
  readonly includeCppDefines: boolean;
}): TechnicalReport {
  const bom = buildBom(params.placedComponents, params.catalogMap);

  const usedColorIds = new Set<WireColorId>(
    params.wires.map((wire) => wire.colorId),
  );
  const usedWireColors: WireColor[] = [];
  for (const colorId of usedColorIds) {
    const color = params.colorMap.get(colorId);
    if (color) {
      usedWireColors.push(color);
    }
  }

  const firmware = generateCppDefines(params.netlist, params.metadata);

  return {
    metadata: params.metadata,
    placedComponents: params.placedComponents,
    wires: params.wires,
    usedWireColors,
    bom,
    netlist: params.netlist,
    includeCppDefines: params.includeCppDefines,
    cppHeaderCode: firmware.headerCode,
  };
}
