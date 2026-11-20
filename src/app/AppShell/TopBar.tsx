import { Button } from '@core/ui/Button/Button';
import { IconButton } from '@core/ui/IconButton/IconButton';
import type {
  BoardViewModeController,
  BoardViewportController,
} from '@features/board/application';
import type { WiringController } from '@features/wiring/application';
import { WireToolbarControls } from '@features/wiring/presentation';
import type { ProjectPersistenceController } from '@features/project-persistence/application';
import { ProjectToolbarActions } from '@features/project-persistence/presentation';
import styles from './TopBar.module.css';

export interface TopBarProps {
  readonly viewModeController: BoardViewModeController;
  readonly viewportController: BoardViewportController;
  readonly wiringController: WiringController;
  readonly persistenceController: ProjectPersistenceController;
  readonly onOpenFirmwareModal: () => void;
  readonly onOpenPdfPreview: () => void;
}

export function TopBar({
  viewModeController,
  viewportController,
  wiringController,
  persistenceController,
  onOpenFirmwareModal,
  onOpenPdfPreview,
}: TopBarProps) {
  const { viewMode, setViewMode } = viewModeController;
  const {
    zoomPercentageLabel,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    resetViewport,
  } = viewportController;

  const { metadata } = persistenceController;
  const fullTitleText = `${metadata.robotName} (v${metadata.version})`;
  const fullSpecText = `${metadata.category} • 5×7 cm (18×24)`;

  return (
    <header className={styles.topBar}>
      <div className={styles.brandGroup}>
        <span className={styles.brandBadge}>ROBOBOARD</span>
        <div className={styles.projectInfo}>
          <h1
            className={styles.projectName}
            title={fullTitleText}
          >
            {fullTitleText}
          </h1>
          <span
            className={styles.projectSpec}
            title={fullSpecText}
          >
            {fullSpecText}
          </span>
        </div>
      </div>

      <div className={styles.toolsScrollArea}>
        <ProjectToolbarActions
          persistenceController={persistenceController}
          onOpenFirmwareModal={onOpenFirmwareModal}
          onOpenPdfPreview={onOpenPdfPreview}
        />

        <WireToolbarControls
          wiringController={wiringController}
          isSpaceTemporaryHand={viewportController.isSpacePressed}
        />
      </div>

      <div className={styles.rightControlsGroup}>
        <nav
          className={styles.viewSwitcher}
          aria-label="Alternador de vista da placa"
        >
          <Button
            variant={viewMode === 'top' ? 'activeConfirm' : 'secondary'}
            className={styles.compactBtn}
            onClick={() => setViewMode('top')}
            aria-pressed={viewMode === 'top'}
          >
            ◉ Superior
          </Button>

          <Button
            variant={viewMode === 'bottom' ? 'activeSelection' : 'secondary'}
            className={styles.compactBtn}
            onClick={() => setViewMode('bottom')}
            aria-pressed={viewMode === 'bottom'}
          >
            ⇄ Inferior
          </Button>
        </nav>

        <div
          className={styles.zoomControls}
          aria-label="Controles de zoom"
        >
          <IconButton
            label="Diminuir zoom"
            onClick={zoomOut}
            disabled={!canZoomOut}
          >
            −
          </IconButton>

          <span className={styles.zoomReadout}>{zoomPercentageLabel}</span>

          <IconButton
            label="Aumentar zoom"
            onClick={zoomIn}
            disabled={!canZoomIn}
          >
            +
          </IconButton>

          <Button
            variant="secondary"
            className={styles.compactBtn}
            onClick={resetViewport}
          >
            100%
          </Button>
        </div>
      </div>
    </header>
  );
}
