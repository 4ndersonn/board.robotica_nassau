import type { HoleCoordinate } from '@features/board/domain';
import type {
  BoardViewModeController,
  BoardViewportController,
} from '@features/board/application';
import { BoardCanvas } from '@features/board/presentation';
import type { ComponentsCatalogController } from '@features/components-catalog/application';
import {
  CatalogSidebar,
  ComponentInspector,
  PinTooltipSvg,
  PlacedComponentSvg,
  PlacementGhostSvg,
} from '@features/components-catalog/presentation';
import type { WiringController } from '@features/wiring/application';
import {
  ActiveWirePreviewSvg,
  NetlistTable,
  WireInspector,
  WireLayerSvg,
} from '@features/wiring/presentation';
import type { ProjectPersistenceController } from '@features/project-persistence/application';
import { ProjectMetadataModal } from '@features/project-persistence/presentation';
import type { FirmwareExportController } from '@features/firmware-export/application';
import { FirmwareExportModal } from '@features/firmware-export/presentation';
import type { PdfExportController } from '@features/pdf-export/application';
import { PdfPreviewModal } from '@features/pdf-export/presentation';
import type { CustomComponentsController } from '@features/custom-components/application';
import { CustomComponentModal } from '@features/custom-components/presentation';
import { TopBar } from './TopBar';
import styles from './AppShell.module.css';

export interface AppShellProps {
  readonly viewModeController: BoardViewModeController;
  readonly viewportController: BoardViewportController;
  readonly catalogController: ComponentsCatalogController;
  readonly wiringController: WiringController;
  readonly persistenceController: ProjectPersistenceController;
  readonly firmwareController: FirmwareExportController;
  readonly pdfController: PdfExportController;
  readonly customController: CustomComponentsController;
}

export function AppShell({
  viewModeController,
  viewportController,
  catalogController,
  wiringController,
  persistenceController,
  firmwareController,
  pdfController,
  customController,
}: AppShellProps) {
  const { viewMode, hoveredHole, hoverHole } = viewModeController;
  const {
    placedComponents,
    catalogMap,
    selectedInstanceId,
    selectComponent,
    activePlacementDefId,
    ghostPreview,
    commitPlacementAt,
    hoveredPinTooltip,
    setHoveredPinTooltip,
    occupiedHoles,
  } = catalogController;

  const {
    toolMode,
    wires,
    activeDraft,
    showOppositeSideWires,
    colorMap,
    selectedWireId,
    hoveredWireId,
    selectWire,
    setHoveredWireId,
    handleHoleClickInWireMode,
    handleHoleDoubleClickInWireMode,
    netlist,
  } = wiringController;

  const hoveredHoleOccupancy = hoveredHole
    ? occupiedHoles.get(
        `${hoveredHole.logical.col}:${hoveredHole.logical.row}`,
      )
    : undefined;

  const activePinTooltipText = hoveredPinTooltip
    ? `${hoveredPinTooltip.componentAlias}: ${hoveredPinTooltip.pinLabel}`
    : hoveredHoleOccupancy
      ? `${hoveredHoleOccupancy.componentAlias}: ${hoveredHoleOccupancy.pinLabel}`
      : null;

  const activePinHoleCoord = hoveredPinTooltip
    ? { col: hoveredPinTooltip.boardCol, row: hoveredPinTooltip.boardRow }
    : hoveredHoleOccupancy
      ? { col: hoveredHoleOccupancy.col, row: hoveredHoleOccupancy.row }
      : null;

  const handleHoleClick = (coord: HoleCoordinate) => {
    if (activePlacementDefId) {
      commitPlacementAt(coord);
      return;
    }

    if (toolMode === 'wire') {
      const isEndpointPin = occupiedHoles.has(`${coord.col}:${coord.row}`);
      handleHoleClickInWireMode(coord, isEndpointPin);
    }
  };

  return (
    <div className={styles.shellRoot}>
      <TopBar
        viewModeController={viewModeController}
        viewportController={viewportController}
        wiringController={wiringController}
        persistenceController={persistenceController}
        onOpenFirmwareModal={firmwareController.openFirmwareModal}
        onOpenPdfPreview={pdfController.openPreview}
      />

      <main className={styles.workspaceBody}>
        <aside
          className={styles.leftPanel}
          aria-label="Catálogo de Componentes"
        >
          <CatalogSidebar
            catalogController={catalogController}
            customController={customController}
          />
        </aside>

        <BoardCanvas
          viewModeController={viewModeController}
          viewportController={viewportController}
          onClickHole={handleHoleClick}
          onDoubleClickHole={handleHoleDoubleClickInWireMode}
          pinTooltipText={activePinTooltipText}
          pinHoleCoord={activePinHoleCoord}
          overlayChildren={
            <>
              <g aria-label="Componentes posicionados">
                {placedComponents.map((component) => {
                  const definition = catalogMap.get(component.definitionId);
                  if (!definition) {
                    return null;
                  }

                  return (
                    <PlacedComponentSvg
                      key={component.instanceId}
                      component={component}
                      definition={definition}
                      viewMode={viewMode}
                      isSelected={component.instanceId === selectedInstanceId}
                      isWireMode={toolMode === 'wire'}
                      onSelect={selectComponent}
                      onHoverPin={setHoveredPinTooltip}
                      onHoverHole={hoverHole}
                      onClickPinHole={(coord) =>
                        handleHoleClickInWireMode(coord, true)
                      }
                      onDoubleClickPinHole={handleHoleDoubleClickInWireMode}
                    />
                  );
                })}
              </g>

              <WireLayerSvg
                wires={wires}
                viewMode={viewMode}
                showOppositeSideWires={showOppositeSideWires}
                colorMap={colorMap}
                selectedWireId={selectedWireId}
                hoveredWireId={hoveredWireId}
                onSelectWire={selectWire}
                onHoverWire={setHoveredWireId}
              />

              {activeDraft && (
                <ActiveWirePreviewSvg
                  draft={activeDraft}
                  cursorHole={hoveredHole?.logical ?? null}
                  viewMode={viewMode}
                  colorMap={colorMap}
                />
              )}

              {ghostPreview && (
                <PlacementGhostSvg
                  ghost={ghostPreview}
                  viewMode={viewMode}
                />
              )}

              {hoveredPinTooltip && (
                <PinTooltipSvg
                  tooltip={hoveredPinTooltip}
                  viewMode={viewMode}
                />
              )}
            </>
          }
        />

        <aside
          className={styles.rightPanel}
          aria-label="Inspetor e Netlist"
        >
          {selectedWireId ? (
            <WireInspector wiringController={wiringController} />
          ) : (
            <ComponentInspector catalogController={catalogController} />
          )}

          <NetlistTable
            entries={netlist}
            selectedWireId={selectedWireId}
            hoveredWireId={hoveredWireId}
            onSelectWire={selectWire}
            onHoverWire={setHoveredWireId}
          />
        </aside>
      </main>

      <ProjectMetadataModal persistenceController={persistenceController} />
      <FirmwareExportModal firmwareController={firmwareController} />
      <PdfPreviewModal
        pdfController={pdfController}
        catalogMap={catalogMap}
        colorMap={colorMap}
      />
      <CustomComponentModal controller={customController} />
    </div>
  );
}
