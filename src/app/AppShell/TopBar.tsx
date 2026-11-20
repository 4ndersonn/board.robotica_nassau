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

  return (
    <header className={styles.topBar}>
      <h1 className={styles.projectName}>
        {`${metadata.robotName} (v${metadata.version})`}
      </h1>

      <ProjectToolbarActions
        persistenceController={persistenceController}
        onOpenFirmwareModal={onOpenFirmwareModal}
        onOpenPdfPreview={onOpenPdfPreview}
      />

      <WireToolbarControls wiringController={wiringController} />

      <nav
        className={styles.viewSwitcher}
        aria-label="Alternador de vista da placa"
      >
        <Button
          variant={viewMode === 'top' ? 'activeConfirm' : 'secondary'}
          onClick={() => setViewMode('top')}
          aria-pressed={viewMode === 'top'}
        >
          ◉ Superior
        </Button>

        <Button
          variant={viewMode === 'bottom' ? 'activeSelection' : 'secondary'}
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
          onClick={resetViewport}
        >
          100%
        </Button>
      </div>
    </header>
  );
}
