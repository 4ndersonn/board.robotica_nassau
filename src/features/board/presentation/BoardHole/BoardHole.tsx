import { memo } from 'react';
import {
  BOARD_5X7_SPEC,
  getHoleCenterPx,
  type BoardViewMode,
  type DisplayHoleCoordinate,
  type HoleCoordinate,
} from '../../domain';
import styles from './BoardHole.module.css';

export interface BoardHoleProps {
  readonly coordinate: DisplayHoleCoordinate;
  readonly viewMode: BoardViewMode;
  readonly isHovered: boolean;
  readonly onHover: (coord: HoleCoordinate | null) => void;
  readonly onClickHole?: (coord: HoleCoordinate) => void;
  readonly onDoubleClickHole?: (coord: HoleCoordinate) => void;
}

export const BoardHole = memo(function BoardHole({
  coordinate,
  viewMode,
  isHovered,
  onHover,
  onClickHole,
  onDoubleClickHole,
}: BoardHoleProps) {
  const { cx, cy } = getHoleCenterPx(
    coordinate.displayCol,
    coordinate.displayRow,
  );

  const basePadClass =
    viewMode === 'bottom' ? styles.padBottom : styles.padTop;

  const padClassName = [
    basePadClass,
    isHovered ? styles.padHovered : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleMouseEnter = () => {
    onHover(coordinate.logical);
  };

  const handleClick = () => {
    onClickHole?.(coordinate.logical);
  };

  const handleDoubleClick = () => {
    onDoubleClickHole?.(coordinate.logical);
  };

  return (
    <g
      className={styles.holeGroup}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-coord={coordinate.fullLabel}
    >
      {isHovered && (
        <circle
          cx={cx}
          cy={cy}
          r={BOARD_5X7_SPEC.padRadiusPx + 3.5}
          className={styles.hoverRing}
        />
      )}

      <circle
        cx={cx}
        cy={cy}
        r={BOARD_5X7_SPEC.padRadiusPx}
        className={padClassName}
      />

      <circle
        cx={cx}
        cy={cy}
        r={BOARD_5X7_SPEC.holeRadiusPx}
        className={styles.drill}
      />

      <circle
        cx={cx}
        cy={cy}
        r={BOARD_5X7_SPEC.pitchPx / 2}
        className={styles.hitTarget}
      />
    </g>
  );
});
