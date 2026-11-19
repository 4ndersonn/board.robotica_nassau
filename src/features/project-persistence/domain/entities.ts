import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type { Wire } from '@features/wiring/domain';

export interface ProjectMetadata {
  readonly robotName: string;
  readonly category: string;
  readonly version: string;
  readonly author: string;
  readonly date: string;
  readonly notes: string;
}

export interface BoardStateSnapshot {
  readonly placedComponents: readonly PlacedComponent[];
  readonly wires: readonly Wire[];
}

export interface ProjectDocument {
  readonly schemaVersion: 1;
  readonly metadata: ProjectMetadata;
  readonly boardState: BoardStateSnapshot;
  readonly customComponentDefinitions?: readonly ComponentDefinition[];
}

export function createDefaultProjectMetadata(): ProjectMetadata {
  return {
    robotName: 'Hockey Bot v2',
    category: 'Combate / Hockey',
    version: '1.0',
    author: 'Equipe de Robótica',
    date: new Date().toISOString().slice(0, 10),
    notes: 'Placa universal 5x7 cm com ESP32 e driver TB6612FNG.',
  };
}

export function createEmptyProjectDocument(): ProjectDocument {
  return {
    schemaVersion: 1,
    metadata: createDefaultProjectMetadata(),
    boardState: {
      placedComponents: [],
      wires: [],
    },
  };
}
