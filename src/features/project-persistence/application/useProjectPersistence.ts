import { useCallback, useEffect, useState } from 'react';
import type { ComponentDefinition } from '@features/components-catalog/domain';
import type {
  BoardStateSnapshot,
  ProjectDocument,
  ProjectFilePort,
  ProjectMetadata,
  ProjectStoragePort,
} from '../domain';
import {
  createInitialHistoryState,
  exportProjectFile,
  importProjectFile,
  loadProject,
  recordHistorySnapshot,
  redoHistorySnapshot,
  resetProject,
  saveProject,
  undoHistorySnapshot,
  type HistoryStackState,
} from './projectUseCases';

export interface ProjectPersistenceController {
  readonly metadata: ProjectMetadata;
  readonly updateMetadata: (patch: Partial<ProjectMetadata>) => void;
  readonly isMetadataModalOpen: boolean;
  readonly openMetadataModal: () => void;
  readonly closeMetadataModal: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly handleExportFile: () => void;
  readonly handleImportFile: (file: File) => Promise<void>;
  readonly handleResetProject: () => void;
  readonly persistenceFeedback: string | null;
  readonly clearPersistenceFeedback: () => void;
}

export function useProjectPersistence(params: {
  readonly storagePort: ProjectStoragePort;
  readonly filePort: ProjectFilePort;
  readonly currentBoardState: BoardStateSnapshot;
  readonly customComponentDefinitions: readonly ComponentDefinition[];
  readonly onApplyBoardState: (snapshot: BoardStateSnapshot) => void;
  readonly onApplyCustomDefinitions: (
    definitions: readonly ComponentDefinition[],
  ) => void;
}): ProjectPersistenceController {
  const {
    storagePort,
    filePort,
    currentBoardState,
    customComponentDefinitions,
    onApplyBoardState,
    onApplyCustomDefinitions,
  } = params;

  const [initialLoadedDoc] = useState<ProjectDocument>(() =>
    loadProject(storagePort),
  );

  const [metadata, setMetadata] = useState<ProjectMetadata>(
    initialLoadedDoc.metadata,
  );
  const [history, setHistory] = useState<HistoryStackState>(() =>
    createInitialHistoryState(initialLoadedDoc.boardState),
  );
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [persistenceFeedback, setPersistenceFeedback] = useState<string | null>(
    null,
  );
  const [hasHydratedInitial, setHasHydratedInitial] = useState(false);

  useEffect(() => {
    if (!hasHydratedInitial) {
      if (
        initialLoadedDoc.customComponentDefinitions &&
        initialLoadedDoc.customComponentDefinitions.length > 0
      ) {
        onApplyCustomDefinitions(initialLoadedDoc.customComponentDefinitions);
      }
      onApplyBoardState(initialLoadedDoc.boardState);
      setHasHydratedInitial(true);
    }
  }, [
    hasHydratedInitial,
    initialLoadedDoc.boardState,
    initialLoadedDoc.customComponentDefinitions,
    onApplyBoardState,
    onApplyCustomDefinitions,
  ]);

  useEffect(() => {
    if (!hasHydratedInitial) {
      return;
    }

    setHistory((prev) => recordHistorySnapshot(prev, currentBoardState));
  }, [currentBoardState, hasHydratedInitial]);

  useEffect(() => {
    if (!hasHydratedInitial) {
      return;
    }

    const doc: ProjectDocument = {
      schemaVersion: 1,
      metadata,
      boardState: currentBoardState,
      customComponentDefinitions,
    };

    saveProject(storagePort, doc);
  }, [
    currentBoardState,
    customComponentDefinitions,
    hasHydratedInitial,
    metadata,
    storagePort,
  ]);

  const updateMetadata = useCallback((patch: Partial<ProjectMetadata>) => {
    setMetadata((prev) => ({ ...prev, ...patch }));
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }
      const nextStack = undoHistorySnapshot(prev);
      onApplyBoardState(nextStack.present);
      return nextStack;
    });
  }, [onApplyBoardState]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }
      const nextStack = redoHistorySnapshot(prev);
      onApplyBoardState(nextStack.present);
      return nextStack;
    });
  }, [onApplyBoardState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      if (!isCtrlOrMeta) {
        return;
      }

      const lowerKey = event.key.toLowerCase();
      if (lowerKey === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (lowerKey === 'y' || (lowerKey === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [redo, undo]);

  const handleExportFile = useCallback(() => {
    const doc: ProjectDocument = {
      schemaVersion: 1,
      metadata,
      boardState: currentBoardState,
      customComponentDefinitions,
    };
    exportProjectFile(filePort, doc);
    setPersistenceFeedback('Arquivo .roboboard.json exportado com sucesso.');
  }, [currentBoardState, customComponentDefinitions, filePort, metadata]);

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const importedDoc = await importProjectFile(filePort, file);
        if (
          importedDoc.customComponentDefinitions &&
          importedDoc.customComponentDefinitions.length > 0
        ) {
          onApplyCustomDefinitions(importedDoc.customComponentDefinitions);
        }
        setMetadata(importedDoc.metadata);
        setHistory(createInitialHistoryState(importedDoc.boardState));
        onApplyBoardState(importedDoc.boardState);
        saveProject(storagePort, importedDoc);
        setPersistenceFeedback(
          `Projeto "${importedDoc.metadata.robotName}" carregado com sucesso.`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Falha ao importar arquivo .roboboard.json.';
        setPersistenceFeedback(message);
      }
    },
    [filePort, onApplyBoardState, onApplyCustomDefinitions, storagePort],
  );

  const handleResetProject = useCallback(() => {
    const freshDoc = resetProject(storagePort);
    setMetadata(freshDoc.metadata);
    setHistory(createInitialHistoryState(freshDoc.boardState));
    onApplyBoardState(freshDoc.boardState);
    setPersistenceFeedback('Placa reiniciada para um novo projeto limpo.');
  }, [onApplyBoardState, storagePort]);

  const openMetadataModal = useCallback(() => {
    setIsMetadataModalOpen(true);
  }, []);

  const closeMetadataModal = useCallback(() => {
    setIsMetadataModalOpen(false);
  }, []);

  const clearPersistenceFeedback = useCallback(() => {
    setPersistenceFeedback(null);
  }, []);

  return {
    metadata,
    updateMetadata,
    isMetadataModalOpen,
    openMetadataModal,
    closeMetadataModal,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    handleExportFile,
    handleImportFile,
    handleResetProject,
    persistenceFeedback,
    clearPersistenceFeedback,
  };
}
