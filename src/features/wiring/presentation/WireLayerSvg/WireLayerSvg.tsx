import type { BoardViewMode } from '@features/board/domain';
import type {
  EditorToolMode,
  Wire,
  WireColor,
  WireColorId,
} from '../../domain';
import { projectWirePointsToSvg } from '../wireSvgProjection';
import styles from './WireLayerSvg.module.css';

export interface WireLayerSvgProps {
  readonly wires: readonly Wire[];
  readonly viewMode: BoardViewMode;
  readonly toolMode?: EditorToolMode;
  readonly isDrawingWire?: boolean;
  readonly showOppositeSideWires: boolean;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
  readonly selectedWireId: string | null;
  readonly hoveredWireId: string | null;
  readonly onSelectWire: (wireId: string) => void;
  readonly onHoverWire: (wireId: string | null) => void;
}

export function WireLayerSvg({
  wires,
  viewMode,
  toolMode = 'select',
  isDrawingWire = false,
  showOppositeSideWires,
  colorMap,
  selectedWireId,
  hoveredWireId,
  onSelectWire,
  onHoverWire,
}: WireLayerSvgProps) {
  const visibleWires = wires.filter(
    (wire) => wire.side === viewMode || showOppositeSideWires,
  );

  const isInteractive = toolMode === 'select';

  const layerClassName = [
    !isInteractive ? styles.nonInteractive : '',
    isDrawingWire ? styles.layerDimmedWhileDrawing : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={layerClassName || undefined}
      aria-label="Camada de Fios e Trilhas"
    >
      {visibleWires.map((wire) => {
        const isCurrentSide = wire.side === viewMode;
        const isSelected = wire.id === selectedWireId;
        const isHovered = wire.id === hoveredWireId;
        const isHighlighted = isSelected || isHovered;
        const colorHex = colorMap.get(wire.colorId)?.hex ?? '#eab308';

        const { waypointCenters, polylinePointsAttr } =
          projectWirePointsToSvg(
            wire.points,
            wire.routingStyle,
            viewMode,
          );

        const firstTerminal = waypointCenters[0];
        const lastTerminal = waypointCenters[waypointCenters.length - 1];

        return (
          <g
            key={wire.id}
            className={
              isInteractive ? styles.wireGroup : styles.nonInteractive
            }
            onClick={
              isInteractive
                ? (event) => {
                    event.stopPropagation();
                    onSelectWire(wire.id);
                  }
                : undefined
            }
            onMouseEnter={
              isInteractive ? () => onHoverWire(wire.id) : undefined
            }
            onMouseLeave={
              isInteractive ? () => onHoverWire(null) : undefined
            }
          >
            {isHighlighted && (
              <polyline
                points={polylinePointsAttr}
                className={styles.highlightHalo}
              />
            )}

            <polyline
              points={polylinePointsAttr}
              stroke={colorHex}
              className={
                isCurrentSide ? styles.wireSolid : styles.wireOpposite
              }
            />

            {isInteractive && (
              <polyline
                points={polylinePointsAttr}
                className={styles.hitPolyline}
              />
            )}

            {isCurrentSide &&
              waypointCenters.slice(1, -1).map((wp, idx) => (
                <circle
                  key={`wp-${wire.id}-${idx}`}
                  cx={wp.x}
                  cy={wp.y}
                  r={3.2}
                  fill={colorHex}
                  className={styles.waypointNode}
                />
              ))}

            {isCurrentSide && firstTerminal && (
              <g>
                <circle
                  cx={firstTerminal.x}
                  cy={firstTerminal.y}
                  r={5.8}
                  className={styles.solderPad}
                />
                <circle
                  cx={firstTerminal.x}
                  cy={firstTerminal.y}
                  r={2.4}
                  fill={colorHex}
                />
              </g>
            )}

            {isCurrentSide && lastTerminal && (
              <g>
                <circle
                  cx={lastTerminal.x}
                  cy={lastTerminal.y}
                  r={5.8}
                  className={styles.solderPad}
                />
                <circle
                  cx={lastTerminal.x}
                  cy={lastTerminal.y}
                  r={2.4}
                  fill={colorHex}
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
