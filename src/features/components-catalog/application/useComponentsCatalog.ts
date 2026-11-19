import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BOARD_5X7_SPEC,
  type BoardViewMode,
  type HoleCoordinate,
} from '@features/board/domain';
import {
  nextRotation90,
  resolveComponentFootprint,
  validateComponentPlacement,
  type CatalogRepository,
  type ComponentDefinition,
  type ComponentRotation,
  type MountingSide,
  type PlacedComponent,
  type PlacementValidationResult,
  type ResolvedComponentFootprint,
} from '../domain';
import {
  getOccupiedHoles,
  placeComponent,
  removeComponent,
  renameComponentAlias,
  rotateComponent,
  toggleComponentSide,
  type OccupiedHoleEntry,
} from './componentUseCases';

export interface ActivePlacementGhost {
  readonly definition: ComponentDefinition;
  readonly rotation: ComponentRotation;
  readonly side: MountingSide;
  readonly anchor: HoleCoordinate;
  readonly footprint: ResolvedComponentFootprint;
  readonly validation: PlacementValidationResult;
}

export interface HoveredPinTooltip {
  readonly componentAlias: string;
  readonly pinLabel: string;
  readonly pinType: string;
  readonly boardCol: number;
  readonly boardRow: number;
}

export interface ComponentsCatalogController {
  readonly allDefinitions: readonly ComponentDefinition[];
  readonly filteredDefinitions: readonly ComponentDefinition[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly activePlacementDefId: string | null;
  readonly placementRotation: ComponentRotation;
  readonly placementSide: MountingSide;
  readonly startPlacement: (definitionId: string) => void;
  readonly cancelPlacement: () => void;
  readonly rotatePlacement90: () => void;
  readonly setPlacementSide: (side: MountingSide) => void;
  readonly placedComponents: readonly PlacedComponent[];
  readonly replacePlacedComponents: (
    next: readonly PlacedComponent[],
  ) => void;
  readonly selectedInstanceId: string | null;
  readonly selectedComponent: PlacedComponent | null;
  readonly selectedDefinition: ComponentDefinition | null;
  readonly selectComponent: (instanceId: string | null) => void;
  readonly ghostPreview: ActivePlacementGhost | null;
  readonly commitPlacementAt: (coord: HoleCoordinate) => void;
  readonly rotateSelectedComponent: () => void;
  readonly toggleSelectedComponentSide: () => void;
  readonly updateSelectedAlias: (alias: string) => void;
  readonly deleteSelectedComponent: () => void;
  readonly statusFeedback: string | null;
  readonly occupiedHoles: ReadonlyMap<string, OccupiedHoleEntry>;
  readonly hoveredPinTooltip: HoveredPinTooltip | null;
  readonly setHoveredPinTooltip: (tooltip: HoveredPinTooltip | null) => void;
}

export function useComponentsCatalog(
  repository: CatalogRepository,
  currentViewMode: BoardViewMode,
  hoveredHoleCoord: HoleCoordinate | null,
  customDefinitions: readonly ComponentDefinition[] = [],
): ComponentsCatalogController {
  const allDefinitions = useMemo(
    () => [...repository.getAllDefinitions(), ...customDefinitions],
    [customDefinitions, repository],
  );

  const catalogMap = useMemo(
    () => new Map(allDefinitions.map((item) => [item.id, item])),
    [allDefinitions],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activePlacementDefId, setActivePlacementDefId] = useState<
    string | null
  >(null);
  const [placementRotation, setPlacementRotation] =
    useState<ComponentRotation>(0);
  const [placementSide, setPlacementSide] = useState<MountingSide>('top');
  const [placedComponents, setPlacedComponents] = useState<
    readonly PlacedComponent[]
  >([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [hoveredPinTooltip, setHoveredPinTooltip] =
    useState<HoveredPinTooltip | null>(null);

  useEffect(() => {
    setPlacementSide(currentViewMode);
  }, [currentViewMode]);

  const filteredDefinitions = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return allDefinitions;
    }

    return allDefinitions.filter(
      (def) =>
        def.name.toLowerCase().includes(normalized) ||
        def.category.toLowerCase().includes(normalized) ||
        def.description.toLowerCase().includes(normalized),
    );
  }, [allDefinitions, searchQuery]);

  const startPlacement = useCallback(
    (definitionId: string) => {
      setActivePlacementDefId((prev) =>
        prev === definitionId ? null : definitionId,
      );
      setPlacementRotation(0);
      setPlacementSide(currentViewMode);
      setSelectedInstanceId(null);
      setStatusFeedback(null);
    },
    [currentViewMode],
  );

  const cancelPlacement = useCallback(() => {
    setActivePlacementDefId(null);
    setStatusFeedback(null);
  }, []);

  const rotatePlacement90 = useCallback(() => {
    setPlacementRotation((prev) => nextRotation90(prev));
  }, []);

  const selectComponent = useCallback((instanceId: string | null) => {
    setSelectedInstanceId(instanceId);
    if (instanceId) {
      setActivePlacementDefId(null);
      setStatusFeedback(null);
    }
  }, []);

  const rotateSelectedComponent = useCallback(() => {
    if (!selectedInstanceId) {
      return;
    }

    const outcome = rotateComponent({
      instanceId: selectedInstanceId,
      existingComponents: placedComponents,
      catalogMap,
      boardColumns: BOARD_5X7_SPEC.columns,
      boardRows: BOARD_5X7_SPEC.rows,
    });

    if (!outcome.ok) {
      setStatusFeedback(
        outcome.validation.reason === 'out_of_bounds'
          ? 'Rotação bloqueada: o módulo ultrapassa os limites da placa 18×24.'
          : 'Rotação bloqueada: colisão detectada com outro componente.',
      );
      return;
    }

    setPlacedComponents(outcome.nextComponents);
    setStatusFeedback(null);
  }, [catalogMap, placedComponents, selectedInstanceId]);

  const toggleSelectedComponentSide = useCallback(() => {
    if (!selectedInstanceId) {
      return;
    }

    const outcome = toggleComponentSide({
      instanceId: selectedInstanceId,
      existingComponents: placedComponents,
      catalogMap,
      boardColumns: BOARD_5X7_SPEC.columns,
      boardRows: BOARD_5X7_SPEC.rows,
    });

    if (!outcome.ok) {
      setStatusFeedback(
        'Mudança de lado bloqueada: há sobreposição física no lado de destino.',
      );
      return;
    }

    setPlacedComponents(outcome.nextComponents);
    setStatusFeedback(null);
  }, [catalogMap, placedComponents, selectedInstanceId]);

  const updateSelectedAlias = useCallback(
    (alias: string) => {
      if (!selectedInstanceId) {
        return;
      }

      setPlacedComponents((prev) =>
        renameComponentAlias(selectedInstanceId, alias, prev),
      );
    },
    [selectedInstanceId],
  );

  const deleteSelectedComponent = useCallback(() => {
    if (!selectedInstanceId) {
      return;
    }

    setPlacedComponents((prev) => removeComponent(selectedInstanceId, prev));
    setSelectedInstanceId(null);
    setHoveredPinTooltip(null);
    setStatusFeedback(null);
  }, [selectedInstanceId]);

  const replacePlacedComponents = useCallback(
    (next: readonly PlacedComponent[]) => {
      setPlacedComponents(next);
      setSelectedInstanceId(null);
      setActivePlacementDefId(null);
      setHoveredPinTooltip(null);
      setStatusFeedback(null);
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        if (activePlacementDefId) {
          rotatePlacement90();
        } else if (selectedInstanceId) {
          rotateSelectedComponent();
        }
      } else if (event.key === 'Escape') {
        if (activePlacementDefId) {
          cancelPlacement();
        } else if (selectedInstanceId) {
          setSelectedInstanceId(null);
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedInstanceId) {
          event.preventDefault();
          deleteSelectedComponent();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activePlacementDefId,
    cancelPlacement,
    deleteSelectedComponent,
    rotatePlacement90,
    rotateSelectedComponent,
    selectedInstanceId,
  ]);

  const ghostPreview = useMemo<ActivePlacementGhost | null>(() => {
    if (!activePlacementDefId || !hoveredHoleCoord) {
      return null;
    }

    const definition = catalogMap.get(activePlacementDefId);
    if (!definition) {
      return null;
    }

    const footprint = resolveComponentFootprint(
      definition,
      hoveredHoleCoord.col,
      hoveredHoleCoord.row,
      placementRotation,
    );

    const validation = validateComponentPlacement({
      candidateDefinition: definition,
      anchorCol: hoveredHoleCoord.col,
      anchorRow: hoveredHoleCoord.row,
      rotation: placementRotation,
      side: placementSide,
      existingComponents: placedComponents,
      catalogMap,
      boardColumns: BOARD_5X7_SPEC.columns,
      boardRows: BOARD_5X7_SPEC.rows,
    });

    return {
      definition,
      rotation: placementRotation,
      side: placementSide,
      anchor: hoveredHoleCoord,
      footprint,
      validation,
    };
  }, [
    activePlacementDefId,
    catalogMap,
    hoveredHoleCoord,
    placedComponents,
    placementRotation,
    placementSide,
  ]);

  const commitPlacementAt = useCallback(
    (coord: HoleCoordinate) => {
      if (!activePlacementDefId) {
        return;
      }

      const definition = catalogMap.get(activePlacementDefId);
      if (!definition) {
        return;
      }

      const outcome = placeComponent({
        definition,
        anchorCol: coord.col,
        anchorRow: coord.row,
        rotation: placementRotation,
        side: placementSide,
        existingComponents: placedComponents,
        catalogMap,
        boardColumns: BOARD_5X7_SPEC.columns,
        boardRows: BOARD_5X7_SPEC.rows,
      });

      if (!outcome.ok) {
        setStatusFeedback(
          outcome.validation.reason === 'out_of_bounds'
            ? 'Encaixe inválido: o componente excede os limites da placa 5×7 cm.'
            : 'Encaixe inválido: colisão de pinos ou sobreposição com outro módulo.',
        );
        return;
      }

      setPlacedComponents(outcome.nextComponents);
      if (outcome.createdInstance) {
        setSelectedInstanceId(outcome.createdInstance.instanceId);
      }
      setActivePlacementDefId(null);
      setStatusFeedback(null);
    },
    [
      activePlacementDefId,
      catalogMap,
      placedComponents,
      placementRotation,
      placementSide,
    ],
  );

  const selectedComponent = useMemo(
    () =>
      placedComponents.find(
        (item) => item.instanceId === selectedInstanceId,
      ) ?? null,
    [placedComponents, selectedInstanceId],
  );

  const selectedDefinition = useMemo(
    () =>
      selectedComponent
        ? (catalogMap.get(selectedComponent.definitionId) ?? null)
        : null,
    [catalogMap, selectedComponent],
  );

  const occupiedHoles = useMemo(
    () => getOccupiedHoles(placedComponents, catalogMap),
    [catalogMap, placedComponents],
  );

  return {
    allDefinitions,
    filteredDefinitions,
    catalogMap,
    searchQuery,
    setSearchQuery,
    activePlacementDefId,
    placementRotation,
    placementSide,
    startPlacement,
    cancelPlacement,
    rotatePlacement90,
    setPlacementSide,
    placedComponents,
    replacePlacedComponents,
    selectedInstanceId,
    selectedComponent,
    selectedDefinition,
    selectComponent,
    ghostPreview,
    commitPlacementAt,
    rotateSelectedComponent,
    toggleSelectedComponentSide,
    updateSelectedAlias,
    deleteSelectedComponent,
    statusFeedback,
    occupiedHoles,
    hoveredPinTooltip,
    setHoveredPinTooltip,
  };
}
