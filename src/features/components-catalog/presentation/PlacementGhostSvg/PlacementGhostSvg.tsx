import type { BoardViewMode } from '@features/board/domain';
import type { ActivePlacementGhost } from '../../application';
import {
  calculateComponentSvgBodyBox,
  projectPinsToSvg,
} from '../svgProjection';
import styles from './PlacementGhostSvg.module.css';

export interface PlacementGhostSvgProps {
  readonly ghost: ActivePlacementGhost;
  readonly viewMode: BoardViewMode;
}

export function PlacementGhostSvg({
  ghost,
  viewMode,
}: PlacementGhostSvgProps) {
  const bodyBox = calculateComponentSvgBodyBox(
    ghost.footprint,
    viewMode,
  );
  const svgPins = projectPinsToSvg(ghost.footprint.pins, viewMode);

  const bodyStateClass = ghost.validation.isValid
    ? styles.ghostValidBody
    : ghost.validation.reason === 'collision'
      ? styles.ghostCollisionBody
      : styles.ghostOutOfBoundsBody;

  const pinClass = ghost.validation.isValid
    ? styles.ghostPinValid
    : styles.ghostPinInvalid;

  const statusText = ghost.validation.isValid
    ? `${ghost.definition.name} (${ghost.rotation}°)`
    : ghost.validation.reason === 'collision'
      ? 'COLISÃO DE FUROS / CORPO'
      : 'FORA DOS LIMITES (18×24)';

  return (
    <g className={styles.ghostGroup}>
      <rect
        x={bodyBox.x}
        y={bodyBox.y}
        width={bodyBox.width}
        height={bodyBox.height}
        rx={6}
        ry={6}
        className={bodyStateClass}
      />

      <text
        x={bodyBox.centerX}
        y={bodyBox.centerY}
        className={styles.ghostStatusLabel}
      >
        {statusText}
      </text>

      {svgPins.map((pin) => (
        <circle
          key={pin.pinId}
          cx={pin.cx}
          cy={pin.cy}
          r={5.5}
          className={pinClass}
        />
      ))}
    </g>
  );
}
