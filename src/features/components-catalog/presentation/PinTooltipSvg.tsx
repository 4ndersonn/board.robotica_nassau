import {
  BOARD_5X7_SPEC,
  getHoleCenterPx,
  toDisplayCoordinate,
  type BoardViewMode,
} from '@features/board/domain';
import type { HoveredPinTooltip } from '../application';
import styles from './PinTooltipSvg.module.css';

export interface PinTooltipSvgProps {
  readonly tooltip: HoveredPinTooltip;
  readonly viewMode: BoardViewMode;
}

export function PinTooltipSvg({
  tooltip,
  viewMode,
}: PinTooltipSvgProps) {
  const projected = toDisplayCoordinate(
    { col: tooltip.boardCol, row: tooltip.boardRow },
    viewMode,
    BOARD_5X7_SPEC,
  );
  const { cx, cy } = getHoleCenterPx(
    projected.displayCol,
    projected.displayRow,
    BOARD_5X7_SPEC,
  );

  const labelText = `${tooltip.componentAlias} — ${tooltip.pinLabel}`;
  const boxWidth = Math.max(96, labelText.length * 7 + 16);
  const boxHeight = 22;
  const boxX = cx - boxWidth / 2;
  const boxY = cy - 34;

  return (
    <g className={styles.tooltipGroup}>
      <rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx={4}
        ry={4}
        className={styles.tooltipBox}
      />
      <text
        x={cx}
        y={boxY + boxHeight / 2}
        className={styles.tooltipText}
      >
        {labelText}
      </text>
    </g>
  );
}
