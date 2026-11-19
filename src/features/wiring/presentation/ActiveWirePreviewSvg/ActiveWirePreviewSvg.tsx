import type { BoardViewMode, HoleCoordinate } from '@features/board/domain';
import type { WireColor, WireColorId, WirePoint } from '../../domain';
import type { ActiveWireDraft } from '../../application';
import { projectWirePointsToSvg } from '../wireSvgProjection';
import styles from './ActiveWirePreviewSvg.module.css';

export interface ActiveWirePreviewSvgProps {
  readonly draft: ActiveWireDraft;
  readonly cursorHole: HoleCoordinate | null;
  readonly viewMode: BoardViewMode;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
}

export function ActiveWirePreviewSvg({
  draft,
  cursorHole,
  viewMode,
  colorMap,
}: ActiveWirePreviewSvgProps) {
  const previewWaypoints: readonly WirePoint[] = cursorHole
    ? [...draft.waypoints, { col: cursorHole.col, row: cursorHole.row }]
    : draft.waypoints;

  const { waypointCenters, polylinePointsAttr } = projectWirePointsToSvg(
    previewWaypoints,
    draft.routingStyle,
    viewMode,
  );

  const colorHex = colorMap.get(draft.colorId)?.hex ?? '#eab308';
  const originCenter = waypointCenters[0];

  return (
    <g className={styles.previewGroup}>
      {polylinePointsAttr && (
        <polyline
          points={polylinePointsAttr}
          stroke={colorHex}
          className={styles.previewPolyline}
        />
      )}

      {originCenter && (
        <circle
          cx={originCenter.x}
          cy={originCenter.y}
          r={8}
          className={styles.originPulse}
        />
      )}

      {waypointCenters.map((pt, index) => (
        <circle
          key={`draft-pt-${index}`}
          cx={pt.x}
          cy={pt.y}
          r={4.2}
          fill={colorHex}
          className={styles.waypointDot}
        />
      ))}
    </g>
  );
}
