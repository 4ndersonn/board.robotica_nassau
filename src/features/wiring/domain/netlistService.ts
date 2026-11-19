import { formatHoleLabel } from '@features/board/domain';
import {
  resolveComponentFootprint,
  type ComponentDefinition,
  type PlacedComponent,
} from '@features/components-catalog/domain';
import type {
  NetlistEndpointInfo,
  NetlistEntry,
  Wire,
  WireColor,
  WireColorId,
  WirePoint,
} from './entities';

interface PinLookupRecord {
  readonly componentAlias: string;
  readonly pinLabel: string;
}

function buildBoardPinLookup(
  placedComponents: readonly PlacedComponent[],
  catalogMap: ReadonlyMap<string, ComponentDefinition>,
): ReadonlyMap<string, PinLookupRecord> {
  const lookup = new Map<string, PinLookupRecord>();

  for (const placed of placedComponents) {
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
      const holeKey = `${pin.boardCol}:${pin.boardRow}`;
      lookup.set(holeKey, {
        componentAlias: placed.alias,
        pinLabel: pin.label,
      });
    }
  }

  return lookup;
}

function resolveEndpoint(
  point: WirePoint,
  pinLookup: ReadonlyMap<string, PinLookupRecord>,
): NetlistEndpointInfo {
  const holeLabel = formatHoleLabel({ col: point.col, row: point.row });
  const pinMatch = pinLookup.get(`${point.col}:${point.row}`);

  if (pinMatch) {
    return {
      holeLabel,
      componentAlias: pinMatch.componentAlias,
      pinLabel: pinMatch.pinLabel,
      formattedEndpoint: `${pinMatch.componentAlias} : ${pinMatch.pinLabel} (${holeLabel})`,
    };
  }

  return {
    holeLabel,
    componentAlias: null,
    pinLabel: null,
    formattedEndpoint: `Furo ${holeLabel}`,
  };
}

/**
 * Serviço puro de domínio:
 * Cruza as coordenadas (col, row) das pontas (origem e destino) de cada fio
 * com os pinos dos componentes posicionados na placa (independentemente de o
 * componente estar na frente e o fio no verso).
 */
export function resolveNetlist(
  wires: readonly Wire[],
  placedComponents: readonly PlacedComponent[],
  catalogMap: ReadonlyMap<string, ComponentDefinition>,
  colorMap: ReadonlyMap<WireColorId, WireColor>,
): readonly NetlistEntry[] {
  const pinLookup = buildBoardPinLookup(placedComponents, catalogMap);

  return wires
    .filter((wire) => wire.points.length >= 2)
    .map((wire) => {
      const firstPoint = wire.points[0];
      const lastPoint = wire.points[wire.points.length - 1];

      const origin = resolveEndpoint(firstPoint, pinLookup);
      const destination = resolveEndpoint(lastPoint, pinLookup);
      const wireColor = colorMap.get(wire.colorId);

      return {
        wireId: wire.id,
        origin,
        destination,
        colorId: wire.colorId,
        colorName: wireColor?.name ?? wire.colorId,
        colorHex: wireColor?.hex ?? '#eab308',
        side: wire.side,
        sideLabel: wire.side === 'top' ? 'Frente' : 'Verso',
        note: wire.note,
      };
    });
}
