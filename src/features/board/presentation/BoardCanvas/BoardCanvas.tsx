import type { ReactNode } from 'react';
import type { HoleCoordinate } from '../../domain';
import type {
  BoardViewModeController,
  BoardViewportController,
} from '../../application';
import { BoardStatusHud } from '../BoardStatusHud/BoardStatusHud';
import { BoardSvg } from '../BoardSvg/BoardSvg';
import styles from './BoardCanvas.module.css';

export interface BoardCanvasProps {
  readonly viewModeController: BoardViewModeController;
  readonly viewportController: BoardViewportController;
  readonly onClickHole?: (coord: HoleCoordinate) => void;
  readonly onDoubleClickHole?: (coord: HoleCoordinate) => void;
  readonly pinTooltipText?: string | null;
  readonly pinHoleCoord?: { readonly col: number; readonly row: number } | null;
  readonly overlayChildren?: ReactNode;
}

export function BoardCanvas({
  viewModeController,
  viewportController,
  onClickHole,
  onDoubleClickHole,
  pinTooltipText,
  pinHoleCoord,
  overlayChildren,
}: BoardCanvasProps) {
  const { viewMode, hoveredHole, hoverHole } = viewModeController;
  const {
    cssTransform,
    isPanning,
    isSpacePressed,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  } = viewportController;

  const cursorClass = isPanning
    ? styles.cursorGrabbing
    : isSpacePressed
      ? styles.cursorGrab
      : styles.cursorDefault;

  const containerClassName = [styles.canvasViewport, cursorClass].join(' ');

  return (
    <section
      className={containerClassName}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      aria-label="Área de trabalho CAD da placa 5x7 cm"
    >
      <div
        className={styles.transformStage}
        style={{ transform: cssTransform }}
      >
        <BoardSvg
          viewMode={viewMode}
          hoveredHole={hoveredHole}
          onHoverHole={hoverHole}
          onClickHole={onClickHole}
          onDoubleClickHole={onDoubleClickHole}
        >
          {overlayChildren}
        </BoardSvg>
      </div>

      <BoardStatusHud
        viewMode={viewMode}
        hoveredHole={hoveredHole}
        pinTooltipText={pinTooltipText}
        pinHoleCoord={pinHoleCoord}
      />
    </section>
  );
}
