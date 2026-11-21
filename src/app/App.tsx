import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useBoardViewMode,
  useBoardViewport,
} from '@features/board/application';
import type { PlacedComponent } from '@features/components-catalog/domain';
import { useComponentsCatalog } from '@features/components-catalog/application';
import { defaultCatalogRepository } from '@features/components-catalog/infrastructure/defaultCatalogRepository';
import { useWiring } from '@features/wiring/application';
import type { BoardStateSnapshot } from '@features/project-persistence/domain';
import { useProjectPersistence } from '@features/project-persistence/application';
import { localStorageProjectRepository } from '@features/project-persistence/infrastructure/LocalStorageProjectRepository';
import { jsonFileProjectAdapter } from '@features/project-persistence/infrastructure/JsonFileProjectAdapter';
import { useFirmwareExport } from '@features/firmware-export/application';
import { usePdfExport } from '@features/pdf-export/application';
import { printPdfAdapter } from '@features/pdf-export/infrastructure/PrintPdfAdapter';
import { useCustomComponents } from '@features/custom-components/application';
import { localStorageCustomCatalogRepository } from '@features/custom-components/infrastructure/LocalStorageCustomCatalogRepository';
import { jsonLibraryAdapter } from '@features/custom-components/infrastructure/JsonLibraryAdapter';
import { AppShell } from './AppShell/AppShell';

export function App() {
  const viewModeController = useBoardViewMode();
  const viewportController = useBoardViewport();

  const placedComponentsRef = useRef<readonly PlacedComponent[]>([]);
  const wiresRef = useRef<readonly import('@features/wiring/domain').Wire[]>([]);
  const catalogMapRef = useRef<
    ReadonlyMap<string, import('@features/components-catalog/domain').ComponentDefinition>
  >(new Map());
  const replacePlacedRef = useRef<
    ((next: readonly PlacedComponent[]) => void) | null
  >(null);

  const handleRemovePlacedByDefinitionId = useCallback(
    (definitionId: string) => {
      if (replacePlacedRef.current) {
        const filtered = placedComponentsRef.current.filter(
          (item) => item.definitionId !== definitionId,
        );
        replacePlacedRef.current(filtered);
      }
    },
    [],
  );

  const handleTouchPlacedByDefinitionId = useCallback(
    (definitionId: string) => {
      if (replacePlacedRef.current) {
        const updated = placedComponentsRef.current.map((item) =>
          item.definitionId === definitionId ? { ...item } : item,
        );
        replacePlacedRef.current(updated);
      }
    },
    [],
  );

  const getPlacedComponents = useCallback(
    () => placedComponentsRef.current,
    [],
  );
  const getWires = useCallback(() => wiresRef.current, []);
  const getCatalogMap = useCallback(() => catalogMapRef.current, []);

  const customController = useCustomComponents({
    storagePort: localStorageCustomCatalogRepository,
    filePort: jsonLibraryAdapter,
    placedComponents: getPlacedComponents,
    wires: getWires,
    catalogMap: getCatalogMap,
    onRemovePlacedByDefinitionId: handleRemovePlacedByDefinitionId,
    onTouchPlacedByDefinitionId: handleTouchPlacedByDefinitionId,
  });

  const catalogController = useComponentsCatalog(
    defaultCatalogRepository,
    viewModeController.viewMode,
    viewModeController.hoveredHole?.logical ?? null,
    customController.customDefinitions,
  );

  placedComponentsRef.current = catalogController.placedComponents;
  catalogMapRef.current = catalogController.catalogMap;
  replacePlacedRef.current = catalogController.replacePlacedComponents;

  const wiringController = useWiring({
    currentViewMode: viewModeController.viewMode,
    placedComponents: catalogController.placedComponents,
    catalogMap: catalogController.catalogMap,
    isComponentPlacementActive: Boolean(
      catalogController.activePlacementDefId,
    ),
    onExitComponentPlacement: catalogController.cancelPlacement,
    onClearComponentSelection: () => catalogController.selectComponent(null),
  });

  wiresRef.current = wiringController.wires;

  useEffect(() => {
    viewportController.setIsHandToolActive(
      wiringController.toolMode === 'hand',
    );
  }, [viewportController, wiringController.toolMode]);

  const currentBoardState = useMemo<BoardStateSnapshot>(
    () => ({
      placedComponents: catalogController.placedComponents,
      wires: wiringController.wires,
    }),
    [catalogController.placedComponents, wiringController.wires],
  );

  const handleApplyBoardState = useCallback(
    (snapshot: BoardStateSnapshot) => {
      catalogController.replacePlacedComponents(snapshot.placedComponents);
      wiringController.replaceWires(snapshot.wires);
    },
    [catalogController, wiringController],
  );

  const persistenceController = useProjectPersistence({
    storagePort: localStorageProjectRepository,
    filePort: jsonFileProjectAdapter,
    currentBoardState,
    customComponentDefinitions: customController.customDefinitions,
    onApplyBoardState: handleApplyBoardState,
    onApplyCustomDefinitions: customController.mergeEmbeddedDefinitions,
  });

  const firmwareController = useFirmwareExport(
    wiringController.netlist,
    persistenceController.metadata,
  );

  const pdfController = usePdfExport({
    printPort: printPdfAdapter,
    metadata: persistenceController.metadata,
    placedComponents: catalogController.placedComponents,
    wires: wiringController.wires,
    netlist: wiringController.netlist,
    catalogMap: catalogController.catalogMap,
    colorMap: wiringController.colorMap,
  });

  return (
    <AppShell
      viewModeController={viewModeController}
      viewportController={viewportController}
      catalogController={catalogController}
      wiringController={wiringController}
      persistenceController={persistenceController}
      firmwareController={firmwareController}
      pdfController={pdfController}
      customController={customController}
    />
  );
}
