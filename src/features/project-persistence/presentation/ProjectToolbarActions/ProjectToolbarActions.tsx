import { useRef, type ChangeEvent } from 'react';
import { Button } from '@core/ui/Button/Button';
import { IconButton } from '@core/ui/IconButton/IconButton';
import type { ProjectPersistenceController } from '../../application';
import styles from './ProjectToolbarActions.module.css';

export interface ProjectToolbarActionsProps {
  readonly persistenceController: ProjectPersistenceController;
  readonly onOpenFirmwareModal?: () => void;
  readonly onOpenPdfPreview?: () => void;
}

export function ProjectToolbarActions({
  persistenceController,
  onOpenFirmwareModal,
  onOpenPdfPreview,
}: ProjectToolbarActionsProps) {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    openMetadataModal,
    handleExportFile,
    handleImportFile,
  } = persistenceController;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      void handleImportFile(selectedFile);
      event.target.value = '';
    }
  };

  return (
    <div
      className={styles.actionsBar}
      aria-label="Ações de Projeto e Histórico"
    >
      <div className={styles.historyGroup}>
        <IconButton
          label="Desfazer (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo}
        >
          ↶
        </IconButton>

        <IconButton
          label="Refazer (Ctrl+Y)"
          onClick={redo}
          disabled={!canRedo}
        >
          ↷
        </IconButton>
      </div>

      <Button
        variant="secondary"
        onClick={openMetadataModal}
        title="Editar metadados do robô, versão, autor e notas"
      >
        Projeto
      </Button>

      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        title="Importar arquivo .roboboard.json"
      >
        Abrir
      </Button>

      <Button
        variant="secondary"
        onClick={handleExportFile}
        title="Exportar projeto em arquivo .roboboard.json"
      >
        JSON
      </Button>

      {onOpenFirmwareModal && (
        <Button
          variant="activeSelection"
          onClick={onOpenFirmwareModal}
          title="Gerar defines C++ de pinagem para firmware ESP32/Arduino"
        >
          {`</> C++`}
        </Button>
      )}

      {onOpenPdfPreview && (
        <Button
          variant="activeConfirm"
          onClick={onOpenPdfPreview}
          title="Abrir Relatório Técnico A4 Vetorial para impressão ou exportação em PDF"
        >
          Exportar PDF
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.roboboard.json"
        className={styles.hiddenFileInput}
        onChange={handleFileChange}
      />
    </div>
  );
}
