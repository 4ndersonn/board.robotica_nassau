import {
  createEmptyProjectDocument,
  type BoardStateSnapshot,
  type ProjectDocument,
  type ProjectFilePort,
  type ProjectStoragePort,
} from '../domain';

export function saveProject(
  storage: ProjectStoragePort,
  document: ProjectDocument,
): void {
  storage.save(document);
}

export function loadProject(storage: ProjectStoragePort): ProjectDocument {
  return storage.load() ?? createEmptyProjectDocument();
}

export function exportProjectFile(
  fileAdapter: ProjectFilePort,
  document: ProjectDocument,
): void {
  fileAdapter.exportToFile(document);
}

export async function importProjectFile(
  fileAdapter: ProjectFilePort,
  file: File,
): Promise<ProjectDocument> {
  return fileAdapter.importFromFile(file);
}

export function resetProject(storage: ProjectStoragePort): ProjectDocument {
  storage.clear();
  return createEmptyProjectDocument();
}

/**
 * Gerenciador de histórico Undo/Redo baseado em Snapshots imutáveis.
 */
export interface HistoryStackState {
  readonly past: readonly BoardStateSnapshot[];
  readonly present: BoardStateSnapshot;
  readonly future: readonly BoardStateSnapshot[];
}

const MAX_HISTORY_SIZE = 50;

export function createInitialHistoryState(
  initialSnapshot: BoardStateSnapshot,
): HistoryStackState {
  return {
    past: [],
    present: initialSnapshot,
    future: [],
  };
}

export function areBoardSnapshotsEqual(
  a: BoardStateSnapshot,
  b: BoardStateSnapshot,
): boolean {
  return (
    a === b ||
    (a.placedComponents === b.placedComponents &&
      a.wires === b.wires &&
      a.customComponentDefinitions === b.customComponentDefinitions)
  );
}

export function recordHistorySnapshot(
  current: HistoryStackState,
  nextSnapshot: BoardStateSnapshot,
): HistoryStackState {
  if (areBoardSnapshotsEqual(current.present, nextSnapshot)) {
    return current;
  }

  const nextPast = [...current.past, current.present].slice(-MAX_HISTORY_SIZE);

  return {
    past: nextPast,
    present: nextSnapshot,
    future: [],
  };
}

export function undoHistorySnapshot(
  current: HistoryStackState,
): HistoryStackState {
  if (current.past.length === 0) {
    return current;
  }

  const previous = current.past[current.past.length - 1];
  const nextPast = current.past.slice(0, -1);

  return {
    past: nextPast,
    present: previous,
    future: [current.present, ...current.future],
  };
}

export function redoHistorySnapshot(
  current: HistoryStackState,
): HistoryStackState {
  if (current.future.length === 0) {
    return current;
  }

  const next = current.future[0];
  const nextFuture = current.future.slice(1);

  return {
    past: [...current.past, current.present],
    present: next,
    future: nextFuture,
  };
}
