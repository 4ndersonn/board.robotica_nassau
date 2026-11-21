import { Button } from '@core/ui/Button/Button';
import type { CustomComponentsController } from '../../application';
import { ComponentConfigForm } from '../ComponentConfigForm/ComponentConfigForm';
import { MiniGridEditorSvg } from '../MiniGridEditorSvg/MiniGridEditorSvg';
import { PinEditorPanel } from '../PinEditorPanel/PinEditorPanel';
import styles from './CustomComponentModal.module.css';

export interface CustomComponentModalProps {
  readonly controller: CustomComponentsController;
}

export function CustomComponentModal({
  controller,
}: CustomComponentModalProps) {
  const {
    isModalOpen,
    draft,
    selectedPinCoord,
    selectedPin,
    validationErrors,
    blockingErrors,
    pendingUpdateWarnings,
    closeModal,
    handleMiniGridHoleClick,
    updateSelectedPin,
    removeSelectedPin,
    saveDraftComponent,
    confirmUpdateWithWarnings,
    dismissUpdateWarnings,
  } = controller;

  if (!isModalOpen) {
    return null;
  }

  const allErrors = [...validationErrors, ...blockingErrors];
  const hasWarningsConfirmation = pendingUpdateWarnings.length > 0;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Criador de Componente Customizado"
    >
      <div className={styles.dialog}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {draft.id
              ? `Editar Componente Customizado: ${draft.name}`
              : 'Novo Componente Customizado (Furos & Pinagem)'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeModal}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <div className={styles.twoColumnsBody}>
          <ComponentConfigForm controller={controller} />

          <div className={styles.rightColumn}>
            <MiniGridEditorSvg
              draft={draft}
              selectedPinCoord={selectedPinCoord}
              onClickHole={handleMiniGridHoleClick}
            />

            <PinEditorPanel
              selectedPin={selectedPin}
              totalPinsCount={draft.pins.length}
              onUpdatePin={updateSelectedPin}
              onRemovePin={removeSelectedPin}
            />
          </div>
        </div>

        {allErrors.length > 0 && (
          <div
            className={styles.errorsBox}
            role="alert"
          >
            <div className={styles.feedbackTitle}>
              Não foi possível salvar as alterações:
            </div>
            {allErrors.map((err, idx) => (
              <div key={`err-${idx}`}>{`• ${err}`}</div>
            ))}
          </div>
        )}

        {hasWarningsConfirmation && (
          <div
            className={styles.warningsBox}
            role="status"
          >
            <div className={styles.feedbackTitle}>
              Atenção: impacto nas conexões existentes na placa
            </div>
            {pendingUpdateWarnings.map((warn, idx) => (
              <div key={`warn-${idx}`}>{`• ${warn}`}</div>
            ))}
            <div className={styles.warningsActions}>
              <Button
                variant="secondary"
                onClick={dismissUpdateWarnings}
              >
                Revisar Pinagem
              </Button>
              <Button
                variant="activeSelection"
                onClick={confirmUpdateWithWarnings}
              >
                Confirmar e Atualizar Componente
              </Button>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <Button
            variant="secondary"
            onClick={closeModal}
          >
            Cancelar
          </Button>
          {!hasWarningsConfirmation && (
            <Button
              variant="activeConfirm"
              onClick={saveDraftComponent}
            >
              {draft.id ? 'Salvar Alterações' : 'Criar Componente'}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
