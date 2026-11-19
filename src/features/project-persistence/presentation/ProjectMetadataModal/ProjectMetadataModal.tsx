import { Button } from '@core/ui/Button/Button';
import { Modal } from '@core/ui/Modal/Modal';
import type { ProjectPersistenceController } from '../../application';
import styles from './ProjectMetadataModal.module.css';

export interface ProjectMetadataModalProps {
  readonly persistenceController: ProjectPersistenceController;
}

export function ProjectMetadataModal({
  persistenceController,
}: ProjectMetadataModalProps) {
  const {
    metadata,
    updateMetadata,
    isMetadataModalOpen,
    closeMetadataModal,
    handleResetProject,
    persistenceFeedback,
  } = persistenceController;

  return (
    <Modal
      isOpen={isMetadataModalOpen}
      title="Metadados do Projeto & Documentação Técnica"
      onClose={closeMetadataModal}
    >
      <div className={styles.formContainer}>
        <div className={styles.rowTwoCols}>
          <div className={styles.fieldGroup}>
            <label
              htmlFor="meta-robot-name"
              className={styles.label}
            >
              Nome do Robô / Placa
            </label>
            <input
              id="meta-robot-name"
              type="text"
              className={styles.input}
              value={metadata.robotName}
              onChange={(event) =>
                updateMetadata({ robotName: event.target.value })
              }
            />
          </div>

          <div className={styles.fieldGroup}>
            <label
              htmlFor="meta-category"
              className={styles.label}
            >
              Categoria
            </label>
            <input
              id="meta-category"
              type="text"
              className={styles.input}
              placeholder="Hockey, Sumô, Seguidor..."
              value={metadata.category}
              onChange={(event) =>
                updateMetadata({ category: event.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.rowTwoCols}>
          <div className={styles.fieldGroup}>
            <label
              htmlFor="meta-version"
              className={styles.label}
            >
              Versão de Hardware
            </label>
            <input
              id="meta-version"
              type="text"
              className={styles.input}
              value={metadata.version}
              onChange={(event) =>
                updateMetadata({ version: event.target.value })
              }
            />
          </div>

          <div className={styles.fieldGroup}>
            <label
              htmlFor="meta-date"
              className={styles.label}
            >
              Data da Revisão
            </label>
            <input
              id="meta-date"
              type="date"
              className={styles.input}
              value={metadata.date}
              onChange={(event) =>
                updateMetadata({ date: event.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label
            htmlFor="meta-author"
            className={styles.label}
          >
            Responsável / Autor
          </label>
          <input
            id="meta-author"
            type="text"
            className={styles.input}
            value={metadata.author}
            onChange={(event) =>
              updateMetadata({ author: event.target.value })
            }
          />
        </div>

        <div className={styles.fieldGroup}>
          <label
            htmlFor="meta-notes"
            className={styles.label}
          >
            Notas Técnicas de Montagem
          </label>
          <textarea
            id="meta-notes"
            className={styles.textarea}
            value={metadata.notes}
            onChange={(event) =>
              updateMetadata({ notes: event.target.value })
            }
          />
        </div>

        {persistenceFeedback && (
          <div className={styles.feedbackBanner}>{persistenceFeedback}</div>
        )}

        <div className={styles.footerActions}>
          <Button
            variant="danger"
            onClick={handleResetProject}
          >
            Limpar / Novo Projeto
          </Button>

          <Button
            variant="activeConfirm"
            onClick={closeMetadataModal}
          >
            Concluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
