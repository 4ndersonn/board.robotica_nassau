import { mirrorX, toDisplayCoordinate, formatHoleLabel } from '../features/board/domain';
import {
  rotateLocalPinOffset,
  resolveComponentFootprint,
  validateComponentPlacement,
} from '../features/components-catalog/domain';
import { placeComponent } from '../features/components-catalog/application';
import { defaultCatalogRepository } from '../features/components-catalog/infrastructure/defaultCatalogRepository';
import { buildRoutedWirePath, resolveNetlist } from '../features/wiring/domain';
import { WIRE_COLOR_MAP } from '../features/wiring/infrastructure/wireColorPresets';
import { generateCppDefines } from '../features/firmware-export/domain';
import { validateProjectDocument } from '../features/project-persistence/domain';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

export function runDomainSelfChecks(): void {
  // 1. Board mirroring & coordinates
  assert(mirrorX(0, 18) === 17, 'mirrorX(0)');
  assert(mirrorX(17, 18) === 0, 'mirrorX(17)');
  assert(formatHoleLabel({ col: 0, row: 0 }) === 'A1', 'formatHoleLabel A1');
  assert(toDisplayCoordinate({ col: 2, row: 3 }, 'top').displayCol === 2, 'top displayCol');
  assert(toDisplayCoordinate({ col: 2, row: 3 }, 'bottom').displayCol === 15, 'bottom displayCol');

  // 2. Pin rotation (90°, 180°, 270°)
  const pin = { col: 0, row: 1 };
  const r90 = rotateLocalPinOffset(pin, 3, 4, 90);
  const r180 = rotateLocalPinOffset(pin, 3, 4, 180);
  const r270 = rotateLocalPinOffset(pin, 3, 4, 270);
  assert(r90.col === 2 && r90.row === 0, 'rotate 90');
  assert(r180.col === 2 && r180.row === 2, 'rotate 180');
  assert(r270.col === 1 && r270.row === 2, 'rotate 270');

  // 3. Placement collision & duplicate alias avoidance
  const defs = defaultCatalogRepository.getAllDefinitions();
  const catalogMap = new Map(defs.map((d) => [d.id, d]));
  const kre2 = catalogMap.get('borne-kre-2v')!;
  const first = placeComponent({
    definition: kre2,
    anchorCol: 0,
    anchorRow: 0,
    rotation: 0,
    side: 'top',
    existingComponents: [],
    catalogMap,
    boardColumns: 18,
    boardRows: 24,
  });
  assert(first.ok && first.createdInstance?.alias === 'Borne KRE 2 vias', 'first placement');

  const collide = validateComponentPlacement({
    candidateDefinition: kre2,
    anchorCol: 0,
    anchorRow: 0,
    rotation: 0,
    side: 'top',
    existingComponents: first.nextComponents,
    catalogMap,
    boardColumns: 18,
    boardRows: 24,
  });
  assert(!collide.isValid && collide.reason === 'collision', 'collision detected');

  const second = placeComponent({
    definition: kre2,
    anchorCol: 5,
    anchorRow: 0,
    rotation: 0,
    side: 'top',
    existingComponents: first.nextComponents,
    catalogMap,
    boardColumns: 18,
    boardRows: 24,
  });
  const thirdAfterDeletingFirst = placeComponent({
    definition: kre2,
    anchorCol: 10,
    anchorRow: 0,
    rotation: 0,
    side: 'top',
    existingComponents: [second.createdInstance!],
    catalogMap,
    boardColumns: 18,
    boardRows: 24,
  });
  assert(
    thirdAfterDeletingFirst.createdInstance?.alias !== second.createdInstance?.alias,
    'unique alias after deleting earlier instance',
  );

  // 4. Wire orthogonal routing, netlist & C++ defines
  const path = buildRoutedWirePath([{ col: 0, row: 0 }, { col: 3, row: 4 }], 'orthogonal');
  assert(path.length === 3 && path[1].col === 3 && path[1].row === 0, 'orthogonal L bend');

  const esp32 = catalogMap.get('esp32-devkit-30p')!;
  const placedEsp = placeComponent({
    definition: esp32,
    anchorCol: 0,
    anchorRow: 0,
    rotation: 0,
    side: 'top',
    existingComponents: [],
    catalogMap,
    boardColumns: 18,
    boardRows: 24,
  }).createdInstance!;
  const d15Pin = resolveComponentFootprint(esp32, 0, 0, 0).pins.find((p) => p.label === 'D15')!;

  const netlist = resolveNetlist(
    [
      {
        id: 'w1',
        points: [
          { col: d15Pin.boardCol, row: d15Pin.boardRow },
          { col: 12, row: 12 },
        ],
        colorId: 'blue',
        routingStyle: 'orthogonal',
        side: 'bottom',
        note: 'PWM',
      },
    ],
    [placedEsp],
    catalogMap,
    WIRE_COLOR_MAP,
  );
  const cpp = generateCppDefines(netlist, { robotName: 'Bot', version: '1.0' });
  assert(cpp.defines.length === 1 && cpp.defines[0].gpioNumber === 15, 'ESP32 D15 -> GPIO 15');

  // 5. Schema validation rejects out-of-bounds coordinates
  const invalidDoc = validateProjectDocument({
    schemaVersion: 1,
    metadata: { robotName: 'A', category: 'B', version: '1', author: 'C', date: '2026-01-01', notes: '' },
    boardState: {
      placedComponents: [],
      wires: [
        {
          id: 'w',
          points: [
            { col: -1, row: 0 },
            { col: 99, row: 0 },
          ],
          colorId: 'red',
          routingStyle: 'free',
          side: 'top',
          note: '',
        },
      ],
    },
  });
  assert(!invalidDoc.isValid, 'reject out-of-bounds wire point');
}
