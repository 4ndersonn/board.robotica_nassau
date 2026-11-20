import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ComponentDefinition,
  PinDefinition,
  PinType,
  PlacedComponent,
} from '@features/components-catalog/domain';
import {
  clampPinsToDimensions,
  createInitialCustomDraft,
  generateQuickPinRow,
  validateCustomComponentDraft,
  type CustomCatalogStoragePort,
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

export interface CustomComponentsController {
  readonly customDefinitions: readonly ComponentDefinition[];
  readonly mergeEmbeddedDefinitions: (
    embedded: readonly ComponentDefinition[],
  ) => void;
  readonly isModalOpen: boolean;
  readonly draft: CustomComponentDraft;
  readonly selectedPinCoord: { readonly col: number; readonly row: number } | null;
  readonly selectedPin: PinDefinition | null;
  readonly validationErrors: readonly string[];
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
  readonly handleDuplicateCustom: (definitionId: string) => void;
  readonly handleDeleteCustom: (definitionId: string) => void;
  readonly handleExportLibrary: () => void;
  readonly handleImportLibrary: (file: File) => Promise<void>;
}

export function useCustomComponents(params: {
  readonly storagePort: CustomCatalogStoragePort;
  readonly filePort: CustomLibraryFilePort;
  readonly placedComponents: readonly PlacedComponent[];
  readonly onRemovePlacedByDefinitionId: (definitionId: string) => void;
}): CustomComponentsController {
  const {
    storagePort,
    filePort,
    placedComponents,
    onRemovePlacedByDefinitionId,
  } = params;

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
  const [libraryFeedback, setLibraryFeedback] = useState<string | null>(null);

  useEffect(() => {
    storagePort.saveCustomDefinitions(customDefinitions);
  }, [customDefinitions, storagePort]);

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
    setValidationErrors([]);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((definition: ComponentDefinition) => {
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
    setValidationErrors([]);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setValidationErrors([]);
  }, []);

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
    },
    [],
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
    },
    [],
  );

  const applyQuickPinRow = useCallback((preset: QuickPinRowPreset) => {
    setDraft((prev) => ({
      ...prev,
      pins: generateQuickPinRow(
        prev.pins,
        prev.widthHoles,
        prev.heightHoles,
        preset,
      ),
    }));
  }, []);

  const clearAllPins = useCallback(() => {
    setDraft((prev) => ({ ...prev, pins: [] }));
    setSelectedPinCoord(null);
  }, []);

  const handleMiniGridHoleClick = useCallback((col: number, row: number) => {
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
  }, []);

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
    },
    [selectedPinCoord],
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
  }, [selectedPinCoord]);

  const saveDraftComponent = useCallback(() => {
    const check = validateCustomComponentDraft(draft);
    if (!check.isValid) {
      setValidationErrors(check.errors);
      return;
    }

    if (draft.id) {
      const outcome = updateCustomComponent(draft, customDefinitions);
      if (outcome.ok) {
        setCustomDefinitions(outcome.nextDefinitions);
        setIsModalOpen(false);
        setLibraryFeedback(`Módulo "${draft.name}" atualizado.`);
      }
    } else {
      const outcome = createCustomComponent(draft, customDefinitions);
      if (outcome.ok) {
        setCustomDefinitions(outcome.nextDefinitions);
        setIsModalOpen(false);
        setLibraryFeedback(`Módulo "${draft.name}" adicionado ao catálogo.`);
      }
    }
  }, [customDefinitions, draft]);

  const handleDuplicateCustom = useCallback((definitionId: string) => {
    setCustomDefinitions((prev) =>
      duplicateCustomComponent(definitionId, prev),
    );
    setLibraryFeedback('Componente customizado duplicado.');
  }, []);

  const handleDeleteCustom = useCallback(
    (definitionId: string) => {
      const initialAttempt = deleteCustomComponent({
        targetId: definitionId,
        existingDefinitions: customDefinitions,
        placedComponents,
        forceIfInUse: false,
      });

      if (!initialAttempt.ok && initialAttempt.isInUseCount > 0) {
        const confirmed = window.confirm(
          `Este componente possui ${initialAttempt.isInUseCount} instância(s) posicionada(s) na placa. Deseja excluí-lo da biblioteca e removê-lo da placa?`,
        );
        if (!confirmed) {
          return;
        }

        const forced = deleteCustomComponent({
          targetId: definitionId,
          existingDefinitions: customDefinitions,
          placedComponents,
          forceIfInUse: true,
        });
        setCustomDefinitions(forced.nextDefinitions);
        onRemovePlacedByDefinitionId(definitionId);
        setLibraryFeedback(
          'Componente excluído da biblioteca e removido da placa.',
        );
        return;
      }

      setCustomDefinitions(initialAttempt.nextDefinitions);
      setLibraryFeedback('Componente customizado excluído.');
    },
    [customDefinitions, onRemovePlacedByDefinitionId, placedComponents],
  );

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
        setLibraryFeedback('Biblioteca importada.');
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
    handleDuplicateCustom,
    handleDeleteCustom,
    handleExportLibrary,
    handleImportLibrary,
  };
}
