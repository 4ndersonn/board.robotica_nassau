import { useMemo, type ReactNode } from 'react';
import {
  BOARD_5X7_SPEC,
  calculateBoardSvgMetrics,
  generateBoardGrid,
  getHoleCenterPx,
  type BoardViewMode,
  type DisplayHoleCoordinate,
  type HoleCoordinate,
} from '../../domain';
import { BoardCoordinatesAxis } from '../BoardCoordinatesAxis/BoardCoordinatesAxis';
import { BoardHole } from '../BoardHole/BoardHole';
import styles from './BoardSvg.module.css';

export interface BoardSvgProps {
  readonly viewMode: BoardViewMode;
  readonly hoveredHole: DisplayHoleCoordinate | null;
  readonly onHoverHole: (coord: HoleCoordinate | null) => void;
  readonly onClickHole?: (coord: HoleCoordinate) => void;
  readonly onDoubleClickHole?: (coord: HoleCoordinate) => void;
  readonly children?: ReactNode;
}

export function BoardSvg({
  viewMode,
  hoveredHole,
  onHoverHole,
  onClickHole,
  onDoubleClickHole,
  children,
}: BoardSvgProps) {
  const metrics = useMemo(
    () => calculateBoardSvgMetrics(BOARD_5X7_SPEC),
    [],
  );

  const gridHoles = useMemo(
    () => generateBoardGrid(viewMode, BOARD_5X7_SPEC),
    [viewMode],
  );

  const substrateClass =
    viewMode === 'bottom' ? styles.substrateBottom : styles.substrateTop;

  const innerBorderClass =
    viewMode === 'bottom'
      ? styles.innerSilkBorderBottom
      : styles.innerSilkBorderTop;

  const hoveredCenter = hoveredHole
    ? getHoleCenterPx(hoveredHole.displayCol, hoveredHole.displayRow)
    : null;

  const handleMouseLeaveBoard = () => {
    onHoverHole(null);
  };

  const mountingCorners = [
    { x: 14, y: 14 },
    { x: metrics.widthPx - 14, y: 14 },
    { x: 14, y: metrics.heightPx - 14 },
    { x: metrics.widthPx - 14, y: metrics.heightPx - 14 },
  ];

  return (
    <svg
      width={metrics.widthPx}
      height={metrics.heightPx}
      viewBox={`0 0 ${metrics.widthPx} ${metrics.heightPx}`}
      className={styles.boardSvg}
      onMouseLeave={handleMouseLeaveBoard}
      role="img"
      aria-label={`Placa Perfurada 5x7 cm - ${
        viewMode === 'bottom'
          ? 'Vista Inferior Espelhada'
          : 'Vista Superior'
      }`}
    >
      <rect
        x={2}
        y={2}
        width={metrics.widthPx - 4}
        height={metrics.heightPx - 4}
        rx={12}
        ry={12}
        className={substrateClass}
      />

      <rect
        x={38}
        y={38}
        width={metrics.widthPx - 76}
        height={metrics.heightPx - 76}
        rx={4}
        ry={4}
        className={innerBorderClass}
      />

      {mountingCorners.map((corner, index) => (
        <circle
          key={`mount-${index}`}
          cx={corner.x}
          cy={corner.y}
          r={6}
          className={styles.mountingHole}
        />
      ))}

      <BoardCoordinatesAxis
        viewMode={viewMode}
        hoveredHole={hoveredHole}
      />

      {hoveredCenter && (
        <g>
          <line
            x1={38}
            y1={hoveredCenter.cy}
            x2={metrics.widthPx - 38}
            y2={hoveredCenter.cy}
            className={styles.crosshairGuide}
          />
          <line
            x1={hoveredCenter.cx}
            y1={38}
            x2={hoveredCenter.cx}
            y2={metrics.heightPx - 38}
            className={styles.crosshairGuide}
          />
        </g>
      )}

      <g>
        {gridHoles.map((hole) => {
          const isHovered =
            hoveredHole?.logical.col === hole.logical.col &&
            hoveredHole?.logical.row === hole.logical.row;

          return (
            <BoardHole
              key={hole.fullLabel}
              coordinate={hole}
              viewMode={viewMode}
              isHovered={isHovered}
              onHover={onHoverHole}
              onClickHole={onClickHole}
              onDoubleClickHole={onDoubleClickHole}
            />
          );
        })}
      </g>

      {children}
    </svg>
  );
}
