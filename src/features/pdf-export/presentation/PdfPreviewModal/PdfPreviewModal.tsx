import { Button } from '@core/ui/Button/Button';
import type { ComponentDefinition } from '@features/components-catalog/domain';
import type { WireColor, WireColorId } from '@features/wiring/domain';
import type { PdfExportController } from '../../application';
import { PrintSheetA4 } from '../PrintSheetA4/PrintSheetA4';
import styles from './PdfPreviewModal.module.css';

export interface PdfPreviewModalProps {
  readonly pdfController: PdfExportController;
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
}

export function PdfPreviewModal({
  pdfController,
  catalogMap,
  colorMap,
}: PdfPreviewModalProps) {
  const {
    isPreviewOpen,
    closePreview,
    includeCppDefines,
    toggleIncludeCppDefines,
    report,
    handlePrintPdf,
  } = pdfController;

  if (!isPreviewOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlayBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Pré-visualização do Relatório Técnico A4 em PDF"
    >
      <header className={styles.controlBar}>
        <div className={styles.titleGroup}>
          <h2 className={styles.modalTitle}>
            Relatório Técnico A4 Vetorial — Pré-visualização de Impressão / PDF
          </h2>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeCppDefines}
              onChange={toggleIncludeCppDefines}
            />
            <span>Incluir bloco de #define (C++) no relatório</span>
          </label>
        </div>

        <div className={styles.actionsGroup}>
          <Button
            variant="activeConfirm"
            onClick={handlePrintPdf}
          >
            🖨 Imprimir / Salvar PDF Vetorial
          </Button>

          <Button
            variant="secondary"
            onClick={closePreview}
          >
            ✕ Fechar
          </Button>
        </div>
      </header>

      <div className={styles.previewScroll}>
        <PrintSheetA4
          report={report}
          catalogMap={catalogMap}
          colorMap={colorMap}
        />
      </div>
    </div>
  );
}
