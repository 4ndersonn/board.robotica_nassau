import type { ProjectMetadata } from '@features/project-persistence/domain';
import styles from './ReportHeader.module.css';

export interface ReportHeaderProps {
  readonly metadata: ProjectMetadata;
}

export function ReportHeader({ metadata }: ReportHeaderProps) {
  return (
    <header className={styles.headerBox}>
      <div className={styles.topRow}>
        <h1 className={styles.robotTitle}>{metadata.robotName}</h1>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Categoria</span>
          <span className={styles.metaValue}>
            {metadata.category || '—'}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Versão de hardware</span>
          <span className={styles.metaValue}>
            {`v${metadata.version || '1.0'}`}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Responsável</span>
          <span className={styles.metaValue}>
            {metadata.author || '—'}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Data</span>
          <span className={styles.metaValue}>{metadata.date || '—'}</span>
        </div>
      </div>

      {metadata.notes && (
        <div className={styles.notesRow}>
          <span className={styles.notesLabel}>Notas:</span>
          <span>{metadata.notes}</span>
        </div>
      )}
    </header>
  );
}
