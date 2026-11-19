import {
  BOARD_5X7_SPEC,
  calculateBoardSvgMetrics,
  getHoleCenterPx,
  getOrderedColumnHeaders,
  getOrderedRowHeaders,
  type BoardViewMode,
  type DisplayHoleCoordinate,
} from '../../domain';
import styles from './BoardCoordinatesAxis.module.css';

export interface BoardCoordinatesAxisProps {
  readonly viewMode: BoardViewMode;
  readonly hoveredHole: DisplayHoleCoordinate | null;
}

export function BoardCoordinatesAxis({
  viewMode,
  hoveredHole,
}: BoardCoordinatesAxisProps) {
  const metrics = calculateBoardSvgMetrics(BOARD_5X7_SPEC);
  const columnHeaders = getOrderedColumnHeaders(viewMode, BOARD_5X7_SPEC);
  const rowHeaders = getOrderedRowHeaders(BOARD_5X7_SPEC);

  const baseToneClass =
    viewMode === 'bottom' ? styles.silkscreenBottom : styles.silkscreenTop;

  const topAxisY = 26;
  const bottomAxisY = metrics.heightPx - 26;
  const leftAxisX = 24;
  const rightAxisX = metrics.widthPx - 24;

  return (
    <g aria-label="Coordenadas da matriz da placa">
      {columnHeaders.map((colItem) => {
        const { cx } = getHoleCenterPx(colItem.displayCol, 0);
        const isHighlighted =
          hoveredHole?.displayCol === colItem.displayCol;

        const labelClass = [
          styles.axisLabel,
          baseToneClass,
          isHighlighted ? styles.highlightedAxis : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <g key={`col-${colItem.displayCol}`}>
            <text
              x={cx}
              y={topAxisY}
              className={labelClass}
            >
              {colItem.label}
            </text>
            <text
              x={cx}
              y={bottomAxisY}
              className={labelClass}
            >
              {colItem.label}
            </text>
          </g>
        );
      })}

      {rowHeaders.map((rowItem) => {
        const { cy } = getHoleCenterPx(0, rowItem.displayRow);
        const isHighlighted =
          hoveredHole?.displayRow === rowItem.displayRow;

        const labelClass = [
          styles.axisLabel,
          baseToneClass,
          isHighlighted ? styles.highlightedAxis : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <g key={`row-${rowItem.displayRow}`}>
            <text
              x={leftAxisX}
              y={cy}
              className={labelClass}
            >
              {rowItem.label}
            </text>
            <text
              x={rightAxisX}
              y={cy}
              className={labelClass}
            >
              {rowItem.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
