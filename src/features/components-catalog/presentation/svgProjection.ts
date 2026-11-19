import {
  BOARD_5X7_SPEC,
  getHoleCenterPx,
  toDisplayCoordinate,
  type BoardViewMode,
} from '@features/board/domain';
import type {
  PinType,
  ResolvedComponentFootprint,
  ResolvedPin,
} from '../domain';

export interface SvgBodyBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
}

export interface SvgPinRenderItem {
  readonly pinId: string;
  readonly label: string;
  readonly type: PinType;
  readonly boardCol: number;
  readonly boardRow: number;
  readonly cx: number;
  readonly cy: number;
  readonly fullHoleLabel: string;
}

export function calculateComponentSvgBodyBox(
  footprint: ResolvedComponentFootprint,
  viewMode: BoardViewMode,
): SvgBodyBox {
  const cornerA = toDisplayCoordinate(
    { col: footprint.minCol, row: footprint.minRow },
    viewMode,
    BOARD_5X7_SPEC,
  );
  const cornerB = toDisplayCoordinate(
    { col: footprint.maxCol, row: footprint.maxRow },
    viewMode,
    BOARD_5X7_SPEC,
  );

  const minDisplayCol = Math.min(cornerA.displayCol, cornerB.displayCol);
  const maxDisplayCol = Math.max(cornerA.displayCol, cornerB.displayCol);
  const minDisplayRow = Math.min(cornerA.displayRow, cornerB.displayRow);
  const maxDisplayRow = Math.max(cornerA.displayRow, cornerB.displayRow);

  const topLeftCenter = getHoleCenterPx(
    minDisplayCol,
    minDisplayRow,
    BOARD_5X7_SPEC,
  );
  const bottomRightCenter = getHoleCenterPx(
    maxDisplayCol,
    maxDisplayRow,
    BOARD_5X7_SPEC,
  );

  const margin = 11;
  const x = topLeftCenter.cx - margin;
  const y = topLeftCenter.cy - margin;
  const width = bottomRightCenter.cx - topLeftCenter.cx + margin * 2;
  const height = bottomRightCenter.cy - topLeftCenter.cy + margin * 2;

  return {
    x,
    y,
    width,
    height,
    centerX: x + width / 2,
    centerY: y + height / 2,
  };
}

export function projectPinsToSvg(
  pins: readonly ResolvedPin[],
  viewMode: BoardViewMode,
): readonly SvgPinRenderItem[] {
  return pins.map((pin) => {
    const projected = toDisplayCoordinate(
      { col: pin.boardCol, row: pin.boardRow },
      viewMode,
      BOARD_5X7_SPEC,
    );
    const { cx, cy } = getHoleCenterPx(
      projected.displayCol,
      projected.displayRow,
      BOARD_5X7_SPEC,
    );

    return {
      pinId: pin.pinId,
      label: pin.label,
      type: pin.type,
      boardCol: pin.boardCol,
      boardRow: pin.boardRow,
      cx,
      cy,
      fullHoleLabel: projected.fullLabel,
    };
  });
}
