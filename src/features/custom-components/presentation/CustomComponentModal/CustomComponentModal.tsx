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
    closeModal,
    handleMiniGridHoleClick,
    updateSelectedPin,
    removeSelectedPin,
    saveDraftComponent,
  } = controller;

  if (!isModalOpen) {
    return null;
  }

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
              ? `Editar componente: ${draft.name}`
              : 'Novo componente'}
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

        {validationErrors.length > 0 && (
          <div className={styles.errorsBox}>
            {validationErrors.map((err, idx) => (
              <div key={`err-${idx}`}>{`• ${err}`}</div>
            ))}
          </div>
        )}

        <footer className={styles.footer}>
          <Button
            variant="secondary"
            onClick={closeModal}
          >
            Cancelar
          </Button>
          <Button
            variant="activeConfirm"
            onClick={saveDraftComponent}
          >
            {draft.id ? 'Salvar alterações' : 'Criar componente'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
