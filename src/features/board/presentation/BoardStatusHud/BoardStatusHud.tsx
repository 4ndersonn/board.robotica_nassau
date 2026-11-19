import {
  BOARD_5X7_SPEC,
  formatHoleLabel,
  type BoardViewMode,
  type DisplayHoleCoordinate,
} from '../../domain';
import styles from './BoardStatusHud.module.css';

export interface BoardStatusHudProps {
  readonly viewMode: BoardViewMode;
  readonly hoveredHole: DisplayHoleCoordinate | null;
  readonly pinTooltipText?: string | null;
  readonly pinHoleCoord?: { readonly col: number; readonly row: number } | null;
}

export function BoardStatusHud({
  viewMode,
  hoveredHole,
  pinTooltipText,
  pinHoleCoord,
}: BoardStatusHudProps) {
  const isBottom = viewMode === 'bottom';

  const modeBadgeClass = [
    styles.badge,
    isBottom ? styles.badgeBottom : styles.badgeTop,
  ].join(' ');

  return (
    <div className={styles.hudBar}>
      <div className={styles.group}>
        <span className={modeBadgeClass}>
          {isBottom
            ? '⇄ VISTA INFERIOR ESPELHADA (SOLDA / COBRE)'
            : '◉ VISTA SUPERIOR (COMPONENTES / FR4)'}
        </span>

        <div className={styles.coordDisplay}>
          <span className={styles.coordLabel}>Furo:</span>
          <span className={styles.coordValue}>
            {hoveredHole ? hoveredHole.fullLabel : '---'}
          </span>

          {pinTooltipText && (
            <span className={styles.badgeTop}>
              {pinHoleCoord
                ? `${pinTooltipText} (${formatHoleLabel(pinHoleCoord)})`
                : pinTooltipText}
            </span>
          )}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.hint}>
          {`${BOARD_5X7_SPEC.columns}×${BOARD_5X7_SPEC.rows} (${BOARD_5X7_SPEC.pitchMm} mm) • R: Girar 90° • Del: Remover • Scroll: Zoom`}
        </span>
      </div>
    </div>
  );
}
