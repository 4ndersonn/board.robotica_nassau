import type { PinType } from '@features/components-catalog/domain';
import type { CustomComponentDraft } from '../../domain';
import styles from './MiniGridEditorSvg.module.css';

export interface MiniGridEditorSvgProps {
  readonly draft: CustomComponentDraft;
  readonly selectedPinCoord: { readonly col: number; readonly row: number } | null;
  readonly onClickHole: (col: number, row: number) => void;
}

const CELL_PITCH = 28;
const PADDING = 24;

function getPinClass(type: PinType): string {
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

export function MiniGridEditorSvg({
  draft,
  selectedPinCoord,
  onClickHole,
}: MiniGridEditorSvgProps) {
  const cols = Math.max(1, Math.min(18, draft.widthHoles));
  const rows = Math.max(1, Math.min(24, draft.heightHoles));

  const svgWidth = (cols - 1) * CELL_PITCH + PADDING * 2;
  const svgHeight = (rows - 1) * CELL_PITCH + PADDING * 2;

  const pinLookup = new Map(
    draft.pins.map((pin) => [`${pin.col}:${pin.row}`, pin]),
  );

  const cells: { readonly col: number; readonly row: number }[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({ col, row });
    }
  }

  return (
    <div className={styles.gridContainer}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        height={svgHeight}
        className={styles.svgCanvas}
        aria-label="Mini-grid interativo de edição de pinos"
      >
        <rect
          x={6}
          y={6}
          width={svgWidth - 12}
          height={svgHeight - 12}
          rx={8}
          ry={8}
          fill={draft.color}
          stroke={draft.accentColor}
          strokeWidth={2}
        />

        {cells.map((cell) => {
          const cx = PADDING + cell.col * CELL_PITCH;
          const cy = PADDING + cell.row * CELL_PITCH;
          const existingPin = pinLookup.get(`${cell.col}:${cell.row}`);
          const isSelected =
            selectedPinCoord?.col === cell.col &&
            selectedPinCoord?.row === cell.row;

          return (
            <g
              key={`mini-${cell.col}-${cell.row}`}
              className={styles.holeCell}
              onClick={() => onClickHole(cell.col, cell.row)}
            >
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={10.5}
                  className={styles.selectedRing}
                />
              )}

              <circle
                cx={cx}
                cy={cy}
                r={existingPin ? 7 : 5}
                className={
                  existingPin
                    ? getPinClass(existingPin.type)
                    : styles.emptyHole
                }
              />

              {existingPin && (
                <text
                  x={cx}
                  y={cy - 10}
                  className={styles.pinLabelText}
                >
                  {existingPin.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
