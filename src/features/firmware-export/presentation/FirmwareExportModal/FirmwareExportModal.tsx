import { Button } from '@core/ui/Button/Button';
import { Modal } from '@core/ui/Modal/Modal';
import type { FirmwareExportController } from '../../application';
import styles from './FirmwareExportModal.module.css';

export interface FirmwareExportModalProps {
  readonly firmwareController: FirmwareExportController;
}

export function FirmwareExportModal({
  firmwareController,
}: FirmwareExportModalProps) {
  const {
    isFirmwareModalOpen,
    closeFirmwareModal,
    firmwareResult,
    copyFeedback,
    handleCopyDefines,
    handleDownloadHeader,
  } = firmwareController;

  return (
    <Modal
      isOpen={isFirmwareModalOpen}
      title="Exportar pinagem C++"
      onClose={closeFirmwareModal}
    >
      <div className={styles.container}>
        <pre className={styles.codePre}>
          <code>{firmwareResult.headerCode}</code>
        </pre>

        {copyFeedback && (
          <div className={styles.feedbackBanner}>{copyFeedback}</div>
        )}

        <div className={styles.footerRow}>
          <div className={styles.leftActions}>
            <Button
              variant="activeSelection"
              onClick={() => void handleCopyDefines()}
            >
              Copiar defines
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownloadHeader}
            >
              Baixar .h
            </Button>
          </div>

          <Button
            variant="activeConfirm"
            onClick={closeFirmwareModal}
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
