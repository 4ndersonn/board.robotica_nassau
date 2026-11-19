import {
  BOARD_5X7_SPEC,
  calculateBoardSvgMetrics,
  generateBoardGrid,
  getHoleCenterPx,
  getOrderedColumnHeaders,
  getOrderedRowHeaders,
  type BoardViewMode,
} from '@features/board/domain';
import {
  resolveComponentFootprint,
  type ComponentDefinition,
  type PlacedComponent,
} from '@features/components-catalog/domain';
import {
  calculateComponentSvgBodyBox,
  projectPinsToSvg,
} from '@features/components-catalog/presentation/svgProjection';
import type {
  Wire,
  WireColor,
  WireColorId,
} from '@features/wiring/domain';
import { projectWirePointsToSvg } from '@features/wiring/presentation/wireSvgProjection';
import styles from './ReportDiagrams.module.css';

export interface ReportDiagramsProps {
  readonly placedComponents: readonly PlacedComponent[];
  readonly wires: readonly Wire[];
  readonly usedWireColors: readonly WireColor[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
}

interface SingleVectorBoardProps {
  readonly viewMode: BoardViewMode;
  readonly placedComponents: readonly PlacedComponent[];
  readonly wires: readonly Wire[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
}

function PrintableVectorBoardSvg({
  viewMode,
  placedComponents,
  wires,
  catalogMap,
  colorMap,
}: SingleVectorBoardProps) {
  const metrics = calculateBoardSvgMetrics(BOARD_5X7_SPEC);
  const holes = generateBoardGrid(viewMode, BOARD_5X7_SPEC);
  const colHeaders = getOrderedColumnHeaders(viewMode, BOARD_5X7_SPEC);
  const rowHeaders = getOrderedRowHeaders(BOARD_5X7_SPEC);

  return (
    <svg
      viewBox={`0 0 ${metrics.widthPx} ${metrics.heightPx}`}
      className={styles.vectorSvg}
    >
      <rect
        x={2}
        y={2}
        width={metrics.widthPx - 4}
        height={metrics.heightPx - 4}
        rx={10}
        ry={10}
        fill="#ffffff"
        stroke="#18181b"
        strokeWidth={2.5}
      />

      {colHeaders.map((col) => {
        const { cx } = getHoleCenterPx(col.displayCol, 0);
        return (
          <g key={`p-col-${col.displayCol}`}>
            <text
              x={cx}
              y={24}
              fontSize={11}
              fontWeight={700}
              fontFamily="monospace"
              fill="#18181b"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {col.label}
            </text>
            <text
              x={cx}
              y={metrics.heightPx - 24}
              fontSize={11}
              fontWeight={700}
              fontFamily="monospace"
              fill="#18181b"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {col.label}
            </text>
          </g>
        );
      })}

      {rowHeaders.map((row) => {
        const { cy } = getHoleCenterPx(0, row.displayRow);
        return (
          <g key={`p-row-${row.displayRow}`}>
            <text
              x={22}
              y={cy}
              fontSize={11}
              fontWeight={700}
              fontFamily="monospace"
              fill="#18181b"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {row.label}
            </text>
            <text
              x={metrics.widthPx - 22}
              y={cy}
              fontSize={11}
              fontWeight={700}
              fontFamily="monospace"
              fill="#18181b"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {row.label}
            </text>
          </g>
        );
      })}

      {holes.map((hole) => {
        const { cx, cy } = getHoleCenterPx(
          hole.displayCol,
          hole.displayRow,
        );
        return (
          <g key={`p-hole-${hole.fullLabel}`}>
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill="none"
              stroke="#a1a1aa"
              strokeWidth={1}
            />
            <circle
              cx={cx}
              cy={cy}
              r={2.5}
              fill="#71717a"
            />
          </g>
        );
      })}

      {placedComponents.map((component) => {
        const definition = catalogMap.get(component.definitionId);
        if (!definition) {
          return null;
        }

        const footprint = resolveComponentFootprint(
          definition,
          component.anchorCol,
          component.anchorRow,
          component.rotation,
        );
        const bodyBox = calculateComponentSvgBodyBox(footprint, viewMode);
        const svgPins = projectPinsToSvg(footprint.pins, viewMode);
        const isOppositeSide = component.side !== viewMode;

        return (
          <g key={`p-comp-${component.instanceId}`}>
            <rect
              x={bodyBox.x}
              y={bodyBox.y}
              width={bodyBox.width}
              height={bodyBox.height}
              rx={5}
              ry={5}
              fill={isOppositeSide ? 'none' : '#f4f4f5'}
              stroke="#09090b"
              strokeWidth={isOppositeSide ? 1.2 : 2}
              strokeDasharray={isOppositeSide ? '5 3' : undefined}
            />

            <text
              x={bodyBox.centerX}
              y={bodyBox.centerY}
              fontSize={11}
              fontWeight={800}
              fill={isOppositeSide ? '#71717a' : '#09090b'}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {component.alias}
            </text>

            {svgPins.map((pin) => (
              <g key={`p-pin-${component.instanceId}-${pin.pinId}`}>
                <circle
                  cx={pin.cx}
                  cy={pin.cy}
                  r={5.5}
                  fill="#ffffff"
                  stroke="#09090b"
                  strokeWidth={1.6}
                />
                <text
                  x={pin.cx}
                  y={pin.cy - 9}
                  fontSize={7.5}
                  fontWeight={700}
                  fontFamily="monospace"
                  fill="#09090b"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {pin.label}
                </text>
              </g>
            ))}
          </g>
        );
      })}

      {wires.map((wire) => {
        const isSameSide = wire.side === viewMode;
        const { waypointCenters, polylinePointsAttr } =
          projectWirePointsToSvg(
            wire.points,
            wire.routingStyle,
            viewMode,
          );
        const rawHex = colorMap.get(wire.colorId)?.hex ?? '#18181b';
        const strokeColor =
          wire.colorId === 'white' ? '#52525b' : rawHex;

        const firstPt = waypointCenters[0];
        const lastPt = waypointCenters[waypointCenters.length - 1];

        return (
          <g key={`p-wire-${viewMode}-${wire.id}`}>
            <polyline
              points={polylinePointsAttr}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSameSide ? 4.2 : 2}
              strokeDasharray={isSameSide ? undefined : '5 4'}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isSameSide ? 1 : 0.45}
            />

            {isSameSide && firstPt && (
              <circle
                cx={firstPt.x}
                cy={firstPt.y}
                r={5.2}
                fill={strokeColor}
                stroke="#09090b"
                strokeWidth={1.5}
              />
            )}

            {isSameSide && lastPt && (
              <circle
                cx={lastPt.x}
                cy={lastPt.y}
                r={5.2}
                fill={strokeColor}
                stroke="#09090b"
                strokeWidth={1.5}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ReportDiagrams({
  placedComponents,
  wires,
  usedWireColors,
  catalogMap,
  colorMap,
}: ReportDiagramsProps) {
  return (
    <section className={styles.diagramsSection}>
      <div className={styles.diagramsGrid}>
        <div className={styles.diagramCard}>
          <div className={styles.diagramTitle}>
            <span>Vista Superior (Componentes)</span>
            <span className={styles.diagramSub}>Colunas 1 → 18</span>
          </div>
          <PrintableVectorBoardSvg
            viewMode="top"
            placedComponents={placedComponents}
            wires={wires}
            catalogMap={catalogMap}
            colorMap={colorMap}
          />
        </div>

        <div className={styles.diagramCard}>
          <div className={styles.diagramTitle}>
            <span>Vista Inferior Espelhada (Soldas e Fios)</span>
            <span className={styles.diagramSub}>Colunas 18 → 1</span>
          </div>
          <PrintableVectorBoardSvg
            viewMode="bottom"
            placedComponents={placedComponents}
            wires={wires}
            catalogMap={catalogMap}
            colorMap={colorMap}
          />
        </div>
      </div>

      {usedWireColors.length > 0 && (
        <div className={styles.legendRow}>
          <span className={styles.legendTitle}>Legenda de Fios:</span>
          {usedWireColors.map((color) => (
            <span
              key={color.id}
              className={styles.legendItem}
            >
              <span
                className={styles.colorSwatch}
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
