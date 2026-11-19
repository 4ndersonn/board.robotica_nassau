import type { ReactNode } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Modal({
  isOpen,
  title,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.dialog}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
