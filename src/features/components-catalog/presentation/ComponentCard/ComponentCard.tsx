import type { ComponentDefinition } from '../../domain';
import styles from './ComponentCard.module.css';

export interface ComponentCardProps {
  readonly definition: ComponentDefinition;
  readonly isActivePlacement: boolean;
  readonly onSelectForPlacement: (definitionId: string) => void;
  readonly onEditCustom?: (definition: ComponentDefinition) => void;
  readonly onDuplicateCustom?: (definitionId: string) => void;
  readonly onDeleteCustom?: (definitionId: string) => void;
}

export function ComponentCard({
  definition,
  isActivePlacement,
  onSelectForPlacement,
  onEditCustom,
  onDuplicateCustom,
  onDeleteCustom,
}: ComponentCardProps) {
  const wrapperClassName = [
    styles.cardWrapper,
    isActivePlacement ? styles.cardActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        className={styles.cardMainBtn}
        onClick={() => onSelectForPlacement(definition.id)}
        aria-pressed={isActivePlacement}
        title={`${definition.name} — ${definition.description}`}
      >
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span
              className={styles.colorSwatch}
              style={{ backgroundColor: definition.accentColor }}
            />
            <span className={styles.name}>{definition.name}</span>
          </div>

          <div className={styles.badgesGroup}>
            {definition.isCustom && (
              <span className={styles.customTag}>Custom</span>
            )}
            <span className={styles.badge}>
              {`${definition.widthHoles}×${definition.heightHoles}`}
            </span>
            <span
              className={styles.actionHint}
              aria-hidden="true"
            >
              {isActivePlacement ? '✓' : '+'}
            </span>
          </div>
        </div>

        <p
          className={styles.description}
          title={definition.description}
        >
          {definition.description}
        </p>

        <div className={styles.metaRow}>
          <span>{definition.category}</span>
          <span
            className={
              isActivePlacement ? styles.activeStatusLabel : undefined
            }
          >
            {isActivePlacement
              ? 'Selecionado • Clique na placa'
              : `${definition.pins.length} pinos`}
          </span>
        </div>
      </button>

      {definition.isCustom && (
        <div className={styles.customActionsBar}>
          {onEditCustom && (
            <button
              type="button"
              className={styles.miniActionBtn}
              onClick={() => onEditCustom(definition)}
            >
              Editar
            </button>
          )}
          {onDuplicateCustom && (
            <button
              type="button"
              className={styles.miniActionBtn}
              onClick={() => onDuplicateCustom(definition.id)}
            >
              Duplicar
            </button>
          )}
          {onDeleteCustom && (
            <button
              type="button"
              className={`${styles.miniActionBtn} ${styles.miniDangerBtn}`}
              onClick={() => onDeleteCustom(definition.id)}
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
