import { Button } from '@core/ui/Button/Button';
import { Modal } from '@core/ui/Modal/Modal';
import type { CustomComponentsController } from '../../application';
import styles from './CustomComponentDeleteModal.module.css';

export interface CustomComponentDeleteModalProps {
  readonly controller: CustomComponentsController;
}

export function CustomComponentDeleteModal({
  controller,
}: CustomComponentDeleteModalProps) {
  const {
    pendingDeleteConfirmation,
    confirmDeleteCustom,
    cancelDeleteCustom,
  } = controller;

  if (!pendingDeleteConfirmation) {
    return null;
  }

  const { componentName, impact } = pendingDeleteConfirmation;
  const instancesLabel =
    impact.affectedInstancesCount === 1
      ? '1 instância posicionada será removida da placa'
      : `${impact.affectedInstancesCount} instâncias posicionadas serão removidas da placa`;

  const wiresLabel =
    impact.affectedWiresCount === 1
      ? '1 fio conectado aos pinos deste componente será preservado e ficará vinculado apenas ao furo físico'
      : `${impact.affectedWiresCount} fios conectados aos pinos deste componente serão preservados e ficarão vinculados apenas aos furos físicos`;

  return (
    <Modal
      isOpen
      title={
        impact.inUse
          ? 'Confirmar Exclusão de Componente em Uso'
          : 'Confirmar Exclusão de Componente'
      }
      onClose={cancelDeleteCustom}
    >
      <div className={styles.content}>
        <p className={styles.description}>
          {impact.inUse ? (
            <>
              O componente customizado{' '}
              <strong className={styles.highlight}>{componentName}</strong> está
              atualmente em uso na montagem.
            </>
          ) : (
            <>
              Deseja excluir o componente customizado{' '}
              <strong className={styles.highlight}>{componentName}</strong> da
              sua biblioteca?
            </>
          )}
        </p>

        {impact.inUse ? (
          <div className={styles.impactBox}>
            <div className={styles.impactItem}>{`• ${instancesLabel}.`}</div>
            {impact.affectedWiresCount > 0 ? (
              <div className={styles.impactItem}>{`• ${wiresLabel}.`}</div>
            ) : (
              <div className={styles.impactItem}>
                • Nenhum fio está conectado diretamente aos pinos deste
                componente.
              </div>
            )}
          </div>
        ) : (
          <div className={styles.safeBox}>
            • Nenhuma instância deste componente está posicionada na placa no
            momento.
          </div>
        )}

        <footer className={styles.footer}>
          <Button
            variant="secondary"
            onClick={cancelDeleteCustom}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteCustom}
          >
            {impact.inUse
              ? 'Excluir da Biblioteca e da Placa'
              : 'Excluir da Biblioteca'}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
