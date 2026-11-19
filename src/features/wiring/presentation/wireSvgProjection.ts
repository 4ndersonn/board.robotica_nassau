import {
  BOARD_5X7_SPEC,
  getHoleCenterPx,
  toDisplayCoordinate,
  type BoardViewMode,
} from '@features/board/domain';
import {
  buildRoutedWirePath,
  type WirePoint,
  type WireRoutingStyle,
} from '../domain';

export interface ProjectedSvgPoint {
  readonly col: number;
  readonly row: number;
  readonly x: number;
  readonly y: number;
}

export function projectWirePointsToSvg(
  waypoints: readonly WirePoint[],
  routingStyle: WireRoutingStyle,
  viewMode: BoardViewMode,
): {
  readonly routedPoints: readonly ProjectedSvgPoint[];
  readonly waypointCenters: readonly ProjectedSvgPoint[];
  readonly polylinePointsAttr: string;
} {
  const expanded = buildRoutedWirePath(waypoints, routingStyle);

  const projectSingle = (point: WirePoint): ProjectedSvgPoint => {
    const displayCoord = toDisplayCoordinate(
      { col: point.col, row: point.row },
      viewMode,
      BOARD_5X7_SPEC,
    );
    const { cx, cy } = getHoleCenterPx(
      displayCoord.displayCol,
      displayCoord.displayRow,
      BOARD_5X7_SPEC,
    );

    return {
      col: point.col,
      row: point.row,
      x: cx,
      y: cy,
    };
  };

  const routedPoints = expanded.map(projectSingle);
  const waypointCenters = waypoints.map(projectSingle);
  const polylinePointsAttr = routedPoints
    .map((pt) => `${pt.x},${pt.y}`)
    .join(' ');

  return {
    routedPoints,
    waypointCenters,
    polylinePointsAttr,
  };
}
