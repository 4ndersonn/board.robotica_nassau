import { useCallback, useEffect, useMemo, useState } from 'react';
import { BOARD_5X7_SPEC } from '@features/board/domain';
import type {
  ComponentDefinition,
  PinDefinition,
  PinType,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type { Wire } from '@features/wiring/domain';
import {
  clampPinsToDimensions,
  createInitialCustomDraft,
  generateQuickPinRow,
  type CustomCatalogStoragePort,
  type CustomComponentDeleteImpact,
  type CustomComponentDraft,
  type CustomLibraryFilePort,
  type QuickPinRowPreset,
} from '../domain';
import {
  createCustomComponent,
  deleteCustomComponent,
  duplicateCustomComponent,
  exportLibrary,
  importLibrary,
  mergeCustomDefinitions,
  updateCustomComponent,
} from './customComponentUseCases';

export interface PendingCustomDeleteConfirmation {
  readonly definitionId: string;
  readonly componentName: string;
  readonly impact: CustomComponentDeleteImpact;
}

export interface CustomComponentsController {
  readonly customDefinitions: readonly ComponentDefinition[];
  readonly mergeEmbeddedDefinitions: (
    embedded: readonly ComponentDefinition[],
  ) => void;
  readonly isModalOpen: boolean;
  readonly draft: CustomComponentDraft;
  readonly selectedPinCoord: {
    readonly col: number;
    readonly row: number;
  } | null;
  readonly selectedPin: PinDefinition | null;
  readonly validationErrors: readonly string[];
  readonly blockingErrors: readonly string[];
  readonly pendingUpdateWarnings: readonly string[];
  readonly pendingDeleteConfirmation: PendingCustomDeleteConfirmation | null;
  readonly libraryFeedback: string | null;
  readonly openCreateModal: () => void;
  readonly openEditModal: (definition: ComponentDefinition) => void;
  readonly closeModal: () => void;
  readonly updateDraftMeta: (
    patch: Partial<
      Pick<
        CustomComponentDraft,
        'name' | 'category' | 'description' | 'color' | 'accentColor'
      >
    >,
  ) => void;
  readonly updateDraftDimensions: (
    widthHoles: number,
    heightHoles: number,
  ) => void;
  readonly applyQuickPinRow: (preset: QuickPinRowPreset) => void;
  readonly clearAllPins: () => void;
  readonly handleMiniGridHoleClick: (col: number, row: number) => void;
  readonly updateSelectedPin: (
    patch: Partial<Pick<PinDefinition, 'label' | 'type'>>,
  ) => void;
  readonly removeSelectedPin: () => void;
  readonly saveDraftComponent: () => void;
  readonly confirmUpdateWithWarnings: () => void;
  readonly dismissUpdateWarnings: () => void;
  readonly handleDuplicateCustom: (definitionId: string) => void;
  readonly handleDeleteCustom: (definitionId: string) => void;
  readonly confirmDeleteCustom: () => void;
  readonly cancelDeleteCustom: () => void;
  readonly handleExportLibrary: () => void;
  readonly handleImportLibrary: (file: File) => Promise<void>;
}

export function useCustomComponents(params: {
  readonly storagePort: CustomCatalogStoragePort;
  readonly filePort: CustomLibraryFilePort;
  readonly placedComponents:
    | readonly PlacedComponent[]
    | (() => readonly PlacedComponent[]);
  readonly wires?: readonly Wire[] | (() => readonly Wire[]);
  readonly catalogMap?:
    | ReadonlyMap<string, ComponentDefinition>
    | (() => ReadonlyMap<string, ComponentDefinition>);
  readonly onRemovePlacedByDefinitionId: (definitionId: string) => void;
  readonly onTouchPlacedByDefinitionId?: (definitionId: string) => void;
}): CustomComponentsController {
  const {
    storagePort,
    filePort,
    placedComponents,
    wires = [],
    catalogMap,
    onRemovePlacedByDefinitionId,
    onTouchPlacedByDefinitionId,
  } = params;

  const getPlacedComponents = useCallback(
    () =>
      typeof placedComponents === 'function'
        ? placedComponents()
        : placedComponents,
    [placedComponents],
  );

  const getWires = useCallback(
    () => (typeof wires === 'function' ? wires() : wires),
    [wires],
  );

  const getCatalogMap = useCallback(
    () => (typeof catalogMap === 'function' ? catalogMap() : catalogMap),
    [catalogMap],
  );

  const [customDefinitions, setCustomDefinitions] = useState<
    readonly ComponentDefinition[]
  >(() => storagePort.loadCustomDefinitions());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<CustomComponentDraft>(
    createInitialCustomDraft,
  );
  const [selectedPinCoord, setSelectedPinCoord] = useState<{
    readonly col: number;
    readonly row: number;
  } | null>({ col: 0, row: 0 });
  const [validationErrors, setValidationErrors] = useState<readonly string[]>(
    [],
  );
  const [blockingErrors, setBlockingErrors] = useState<readonly string[]>([]);
  const [pendingUpdateWarnings, setPendingUpdateWarnings] = useState<
    readonly string[]
  >([]);
  const [pendingDeleteConfirmation, setPendingDeleteConfirmation] =
    useState<PendingCustomDeleteConfirmation | null>(null);
  const [libraryFeedback, setLibraryFeedback] = useState<string | null>(null);

  useEffect(() => {
    storagePort.saveCustomDefinitions(customDefinitions);
  }, [customDefinitions, storagePort]);

  const clearModalFeedback = useCallback(() => {
    setValidationErrors([]);
    setBlockingErrors([]);
    setPendingUpdateWarnings([]);
  }, []);

  const mergeEmbeddedDefinitions = useCallback(
    (embedded: readonly ComponentDefinition[]) => {
      if (embedded.length === 0) {
        return;
      }
      setCustomDefinitions((prev) => mergeCustomDefinitions(prev, embedded));
    },
    [],
  );

  const openCreateModal = useCallback(() => {
    const fresh = createInitialCustomDraft();
    setDraft(fresh);
    setSelectedPinCoord({ col: 0, row: 0 });
    clearModalFeedback();
    setIsModalOpen(true);
  }, [clearModalFeedback]);

  const openEditModal = useCallback(
    (definition: ComponentDefinition) => {
      setDraft({
        id: definition.id,
        name: definition.name,
        category: definition.category,
        description: definition.description,
        widthHoles: definition.widthHoles,
        heightHoles: definition.heightHoles,
        color: definition.color,
        accentColor: definition.accentColor,
        pins: definition.pins,
      });
      const firstPin = definition.pins[0];
      setSelectedPinCoord(
        firstPin ? { col: firstPin.col, row: firstPin.row } : null,
      );
      clearModalFeedback();
      setIsModalOpen(true);
    },
    [clearModalFeedback],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    clearModalFeedback();
  }, [clearModalFeedback]);

  const updateDraftMeta = useCallback(
    (
      patch: Partial<
        Pick<
          CustomComponentDraft,
          'name' | 'category' | 'description' | 'color' | 'accentColor'
        >
      >,
    ) => {
      setDraft((prev) => ({ ...prev, ...patch }));
      clearModalFeedback();
    },
    [clearModalFeedback],
  );

  const updateDraftDimensions = useCallback(
    (widthHoles: number, heightHoles: number) => {
      const safeW = Number.isNaN(widthHoles) ? 1 : widthHoles;
      const safeH = Number.isNaN(heightHoles) ? 1 : heightHoles;

      setDraft((prev) => ({
        ...prev,
        widthHoles: safeW,
        heightHoles: safeH,
        pins: clampPinsToDimensions(prev.pins, safeW, safeH),
      }));
      clearModalFeedback();
    },
    [clearModalFeedback],
  );

  const applyQuickPinRow = useCallback(
    (preset: QuickPinRowPreset) => {
      setDraft((prev) => ({
        ...prev,
        pins: generateQuickPinRow(
          prev.pins,
          prev.widthHoles,
          prev.heightHoles,
          preset,
        ),
      }));
      clearModalFeedback();
    },
    [clearModalFeedback],
  );

  const clearAllPins = useCallback(() => {
    setDraft((prev) => ({ ...prev, pins: [] }));
    setSelectedPinCoord(null);
    clearModalFeedback();
  }, [clearModalFeedback]);

  const handleMiniGridHoleClick = useCallback(
    (col: number, row: number) => {
      setSelectedPinCoord({ col, row });
      setDraft((prev) => {
        const exists = prev.pins.some(
          (pin) => pin.col === col && pin.row === row,
        );
        if (exists) {
          return prev;
        }

        const newPin: PinDefinition = {
          id: `pin-${col}-${row}`,
          col,
          row,
          label: `P${prev.pins.length + 1}`,
          type: 'signal',
        };

        return {
          ...prev,
          pins: [...prev.pins, newPin],
        };
      });
      clearModalFeedback();
    },
    [clearModalFeedback],
  );

  const updateSelectedPin = useCallback(
    (patch: Partial<Pick<PinDefinition, 'label' | 'type'>>) => {
      if (!selectedPinCoord) {
        return;
      }

      setDraft((prev) => ({
        ...prev,
        pins: prev.pins.map((pin) =>
          pin.col === selectedPinCoord.col && pin.row === selectedPinCoord.row
            ? {
                ...pin,
                label: patch.label ?? pin.label,
                type: (patch.type ?? pin.type) as PinType,
              }
            : pin,
        ),
      }));
      clearModalFeedback();
    },
    [clearModalFeedback, selectedPinCoord],
  );

  const removeSelectedPin = useCallback(() => {
    if (!selectedPinCoord) {
      return;
    }

    setDraft((prev) => ({
      ...prev,
      pins: prev.pins.filter(
        (pin) =>
          !(
            pin.col === selectedPinCoord.col &&
            pin.row === selectedPinCoord.row
          ),
      ),
    }));
    setSelectedPinCoord(null);
    clearModalFeedback();
  }, [clearModalFeedback, selectedPinCoord]);

  const executeSaveDraft = useCallback(
    (confirmWarnings: boolean) => {
      setValidationErrors([]);
      setBlockingErrors([]);

      if (draft.id) {
        const currentPlaced = getPlacedComponents();
        const currentWires = getWires();
        const currentCatalogMap = getCatalogMap();

        const outcome = updateCustomComponent(draft, customDefinitions, {
          placedComponents: currentPlaced,
          wires: currentWires,
          boardConfig: {
            columns: BOARD_5X7_SPEC.columns,
            rows: BOARD_5X7_SPEC.rows,
            catalogMap: currentCatalogMap,
          },
          confirmWarnings,
        });

        if (!outcome.validation.isValid) {
          setValidationErrors(outcome.validation.errors);
          setPendingUpdateWarnings([]);
          return;
        }

        if (!outcome.impact.canSave) {
          setBlockingErrors(outcome.impact.blockingErrors);
          setPendingUpdateWarnings([]);
          return;
        }

        if (outcome.requiresConfirmation) {
          setPendingUpdateWarnings(outcome.impact.warnings);
          return;
        }

        if (outcome.ok) {
          setCustomDefinitions(outcome.nextDefinitions);
          if (outcome.impact.affectedInstancesCount > 0 && draft.id) {
            onTouchPlacedByDefinitionId?.(draft.id);
          }
          setPendingUpdateWarnings([]);
          setIsModalOpen(false);
          setLibraryFeedback(`Módulo "${draft.name}" atualizado.`);
        }
      } else {
        const outcome = createCustomComponent(draft, customDefinitions);
        if (!outcome.validation.isValid) {
          setValidationErrors(outcome.validation.errors);
          return;
        }
        if (outcome.ok) {
          setCustomDefinitions(outcome.nextDefinitions);
          setIsModalOpen(false);
          setLibraryFeedback(`Módulo "${draft.name}" adicionado ao catálogo.`);
        }
      }
    },
    [
      customDefinitions,
      draft,
      getCatalogMap,
      getPlacedComponents,
      getWires,
      onTouchPlacedByDefinitionId,
    ],
  );

  const saveDraftComponent = useCallback(() => {
    executeSaveDraft(false);
  }, [executeSaveDraft]);

  const confirmUpdateWithWarnings = useCallback(() => {
    executeSaveDraft(true);
  }, [executeSaveDraft]);

  const dismissUpdateWarnings = useCallback(() => {
    setPendingUpdateWarnings([]);
  }, []);

  const handleDuplicateCustom = useCallback((definitionId: string) => {
    setCustomDefinitions((prev) =>
      duplicateCustomComponent(definitionId, prev),
    );
    setLibraryFeedback('Componente customizado duplicado.');
  }, []);

  const handleDeleteCustom = useCallback(
    (definitionId: string) => {
      const targetDef = customDefinitions.find(
        (item) => item.id === definitionId,
      );
      const currentPlaced = getPlacedComponents();
      const currentWires = getWires();

      const initialAttempt = deleteCustomComponent({
        targetId: definitionId,
        existingDefinitions: customDefinitions,
        placedComponents: currentPlaced,
        wires: currentWires,
        forceIfInUse: false,
      });

      setPendingDeleteConfirmation({
        definitionId,
        componentName: targetDef?.name ?? definitionId,
        impact: initialAttempt.impact,
      });
    },
    [customDefinitions, getPlacedComponents, getWires],
  );

  const confirmDeleteCustom = useCallback(() => {
    if (!pendingDeleteConfirmation) {
      return;
    }

    const { definitionId, impact } = pendingDeleteConfirmation;
    const currentPlaced = getPlacedComponents();
    const currentWires = getWires();

    const forced = deleteCustomComponent({
      targetId: definitionId,
      existingDefinitions: customDefinitions,
      placedComponents: currentPlaced,
      wires: currentWires,
      forceIfInUse: true,
    });

    if (impact.inUse) {
      onRemovePlacedByDefinitionId(definitionId);
    }
    setCustomDefinitions(forced.nextDefinitions);
    setPendingDeleteConfirmation(null);
    setLibraryFeedback(
      impact.inUse
        ? 'Componente excluído da biblioteca e removido da placa.'
        : 'Componente customizado excluído.',
    );
  }, [
    customDefinitions,
    getPlacedComponents,
    getWires,
    onRemovePlacedByDefinitionId,
    pendingDeleteConfirmation,
  ]);

  const cancelDeleteCustom = useCallback(() => {
    setPendingDeleteConfirmation(null);
  }, []);

  const handleExportLibrary = useCallback(() => {
    exportLibrary(filePort, customDefinitions);
    setLibraryFeedback('Arquivo biblioteca-equipe.json exportado.');
  }, [customDefinitions, filePort]);

  const handleImportLibrary = useCallback(
    async (file: File) => {
      try {
        const merged = await importLibrary(
          filePort,
          file,
          customDefinitions,
        );
        setCustomDefinitions(merged);
        setLibraryFeedback('Biblioteca da equipe importada com sucesso!');
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : 'Falha ao importar biblioteca-equipe.json.';
        setLibraryFeedback(msg);
      }
    },
    [customDefinitions, filePort],
  );

  const selectedPin = useMemo(() => {
    if (!selectedPinCoord) {
      return null;
    }
    return (
      draft.pins.find(
        (pin) =>
          pin.col === selectedPinCoord.col && pin.row === selectedPinCoord.row,
      ) ?? null
    );
  }, [draft.pins, selectedPinCoord]);

  return {
    customDefinitions,
    mergeEmbeddedDefinitions,
    isModalOpen,
    draft,
    selectedPinCoord,
    selectedPin,
    validationErrors,
    blockingErrors,
    pendingUpdateWarnings,
    pendingDeleteConfirmation,
    libraryFeedback,
    openCreateModal,
    openEditModal,
    closeModal,
    updateDraftMeta,
    updateDraftDimensions,
    applyQuickPinRow,
    clearAllPins,
    handleMiniGridHoleClick,
    updateSelectedPin,
    removeSelectedPin,
    saveDraftComponent,
    confirmUpdateWithWarnings,
    dismissUpdateWarnings,
    handleDuplicateCustom,
    handleDeleteCustom,
    confirmDeleteCustom,
    cancelDeleteCustom,
    handleExportLibrary,
    handleImportLibrary,
  };
}
