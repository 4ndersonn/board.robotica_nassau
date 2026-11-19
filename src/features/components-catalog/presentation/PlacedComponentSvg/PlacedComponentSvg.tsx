import { useMemo } from 'react';
import type { BoardViewMode, HoleCoordinate } from '@features/board/domain';
import {
  resolveComponentFootprint,
  type ComponentDefinition,
  type PinType,
  type PlacedComponent,
} from '../../domain';
import type { HoveredPinTooltip } from '../../application';
import {
  calculateComponentSvgBodyBox,
  projectPinsToSvg,
} from '../svgProjection';
import styles from './PlacedComponentSvg.module.css';

export interface PlacedComponentSvgProps {
  readonly component: PlacedComponent;
  readonly definition: ComponentDefinition;
  readonly viewMode: BoardViewMode;
  readonly isSelected: boolean;
  readonly isWireMode: boolean;
  readonly onSelect: (instanceId: string) => void;
  readonly onHoverPin: (tooltip: HoveredPinTooltip | null) => void;
  readonly onHoverHole: (coord: HoleCoordinate | null) => void;
  readonly onClickPinHole?: (coord: HoleCoordinate) => void;
  readonly onDoubleClickPinHole?: (coord: HoleCoordinate) => void;
}

function getPinTypeClassName(type: PinType): string {
  switch (type) {
    case 'power':
      return styles.pinPower;
    case 'gnd':
      return styles.pinGnd;
    case 'motor':
      return styles.pinMotor;
    case 'signal':
      return styles.pinSignal;
  }
}

export function PlacedComponentSvg({
  component,
  definition,
  viewMode,
  isSelected,
  isWireMode,
  onSelect,
  onHoverPin,
  onHoverHole,
  onClickPinHole,
  onDoubleClickPinHole,
}: PlacedComponentSvgProps) {
  const footprint = useMemo(
    () =>
      resolveComponentFootprint(
        definition,
        component.anchorCol,
        component.anchorRow,
        component.rotation,
      ),
    [
      component.anchorCol,
      component.anchorRow,
      component.rotation,
      definition,
    ],
  );

  const bodyBox = useMemo(
    () => calculateComponentSvgBodyBox(footprint, viewMode),
    [footprint, viewMode],
  );

  const svgPins = useMemo(
    () => projectPinsToSvg(footprint.pins, viewMode),
    [footprint.pins, viewMode],
  );

  const isXRay = component.side !== viewMode;

  const bodyClassName = [
    styles.bodyRect,
    isXRay ? styles.bodyXRay : styles.bodySameSide,
  ].join(' ');

  const labelClassName = [
    styles.aliasLabel,
    isXRay ? styles.aliasLabelXRay : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={styles.componentGroup}
      onClick={(event) => {
        if (isWireMode) {
          return;
        }
        event.stopPropagation();
        onSelect(component.instanceId);
      }}
    >
      <rect
        x={bodyBox.x}
        y={bodyBox.y}
        width={bodyBox.width}
        height={bodyBox.height}
        rx={6}
        ry={6}
        fill={definition.color}
        stroke={definition.accentColor}
        className={bodyClassName}
        style={isWireMode ? { pointerEvents: 'none' } : undefined}
      />

      {isSelected && (
        <rect
          x={bodyBox.x - 3}
          y={bodyBox.y - 3}
          width={bodyBox.width + 6}
          height={bodyBox.height + 6}
          rx={8}
          ry={8}
          className={styles.selectedOutline}
        />
      )}

      <text
        x={bodyBox.centerX}
        y={bodyBox.centerY}
        className={labelClassName}
      >
        {isXRay ? `${component.alias} (Raio-X)` : component.alias}
      </text>

      {svgPins.map((pin) => {
        const pinClass = [
          styles.pinCircle,
          getPinTypeClassName(pin.type),
        ].join(' ');

        const pinLogicalCoord: HoleCoordinate = {
          col: pin.boardCol,
          row: pin.boardRow,
        };

        return (
          <g
            key={pin.pinId}
            onMouseEnter={() => {
              onHoverHole(pinLogicalCoord);
              onHoverPin({
                componentAlias: component.alias,
                pinLabel: pin.label,
                pinType: pin.type,
                boardCol: pin.boardCol,
                boardRow: pin.boardRow,
              });
            }}
            onMouseLeave={() => onHoverPin(null)}
            onClick={(event) => {
              if (isWireMode && onClickPinHole) {
                event.stopPropagation();
                onClickPinHole(pinLogicalCoord);
              }
            }}
            onDoubleClick={(event) => {
              if (isWireMode && onDoubleClickPinHole) {
                event.stopPropagation();
                onDoubleClickPinHole(pinLogicalCoord);
              }
            }}
          >
            <circle
              cx={pin.cx}
              cy={pin.cy}
              r={6.2}
              className={pinClass}
            />
            <text
              x={pin.cx}
              y={pin.cy - 10}
              className={styles.pinText}
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
