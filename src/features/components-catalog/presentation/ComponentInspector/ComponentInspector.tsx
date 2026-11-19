import { formatHoleLabel } from '@features/board/domain';
import { Button } from '@core/ui/Button/Button';
import type { ComponentsCatalogController } from '../../application';
import styles from './ComponentInspector.module.css';

export interface ComponentInspectorProps {
  readonly catalogController: ComponentsCatalogController;
}

export function ComponentInspector({
  catalogController,
}: ComponentInspectorProps) {
  const {
    selectedComponent,
    selectedDefinition,
    placedComponents,
    statusFeedback,
    updateSelectedAlias,
    rotateSelectedComponent,
    toggleSelectedComponentSide,
    deleteSelectedComponent,
  } = catalogController;

  if (!selectedComponent || !selectedDefinition) {
    return (
      <div className={styles.emptyCard}>
        <span className={styles.emptyTitle}>
          {`Módulos na Placa (${placedComponents.length})`}
        </span>
        <p className={styles.emptyText}>
          Clique em um componente no catálogo à esquerda para posicioná-lo ou
          selecione um módulo já inserido na placa para editar apelido, lado,
          rotação (`R`) ou remover (`Delete`).
        </p>

        {statusFeedback && (
          <div className={styles.feedbackAlert}>{statusFeedback}</div>
        )}
      </div>
    );
  }

  const anchorLabel = formatHoleLabel({
    col: selectedComponent.anchorCol,
    row: selectedComponent.anchorRow,
  });

  return (
    <div className={styles.inspectorContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Módulo Selecionado</span>
        <span className={styles.coordBadge}>{`Âncora ${anchorLabel}`}</span>
      </div>

      <div className={styles.fieldGroup}>
        <label
          htmlFor="component-alias-input"
          className={styles.fieldLabel}
        >
          Apelido do Componente
        </label>
        <input
          id="component-alias-input"
          type="text"
          className={styles.aliasInput}
          value={selectedComponent.alias}
          onChange={(event) => updateSelectedAlias(event.target.value)}
        />
      </div>

      <div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Modelo</span>
          <span className={styles.metaValue}>{selectedDefinition.name}</span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Dimensão / Pinos</span>
          <span className={styles.metaValue}>
            {`${selectedDefinition.widthHoles}×${selectedDefinition.heightHoles} (${selectedDefinition.pins.length}p)`}
          </span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Rotação Atual</span>
          <span className={styles.metaValue}>
            {`${selectedComponent.rotation}°`}
          </span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Lado de Montagem</span>
          <span className={styles.metaValue}>
            {selectedComponent.side === 'top'
              ? 'Frente (Componentes)'
              : 'Verso (Solda)'}
          </span>
        </div>
      </div>

      {statusFeedback && (
        <div className={styles.feedbackAlert}>{statusFeedback}</div>
      )}

      <div className={styles.actionsGrid}>
        <div className={styles.actionRow}>
          <Button
            variant="secondary"
            className={styles.fullWidthBtn}
            onClick={rotateSelectedComponent}
          >
            ↻ Rotacionar 90° (R)
          </Button>

          <Button
            variant="secondary"
            className={styles.fullWidthBtn}
            onClick={toggleSelectedComponentSide}
          >
            ⇄ Alternar Lado
          </Button>
        </div>

        <Button
          variant="danger"
          onClick={deleteSelectedComponent}
        >
          ✕ Remover Componente (Delete)
        </Button>
      </div>
    </div>
  );
}
