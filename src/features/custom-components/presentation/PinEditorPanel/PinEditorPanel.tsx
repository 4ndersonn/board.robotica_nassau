import { Button } from '@core/ui/Button/Button';
import type {
  PinDefinition,
  PinType,
} from '@features/components-catalog/domain';
import styles from './PinEditorPanel.module.css';

export interface PinEditorPanelProps {
  readonly selectedPin: PinDefinition | null;
  readonly totalPinsCount: number;
  readonly onUpdatePin: (
    patch: Partial<Pick<PinDefinition, 'label' | 'type'>>,
  ) => void;
  readonly onRemovePin: () => void;
}

export function PinEditorPanel({
  selectedPin,
  totalPinsCount,
  onUpdatePin,
  onRemovePin,
}: PinEditorPanelProps) {
  if (!selectedPin) {
    return (
      <div className={styles.pinPanel}>
        <div className={styles.headerRow}>
          <span>Editor de Pino</span>
          <span className={styles.coordTag}>{`${totalPinsCount} pinos`}</span>
        </div>
        <p className={styles.hintText}>
          Clique em qualquer furo no mini-grid acima para adicionar ou
          selecionar um pino e editar seu Rótulo e Tipo.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pinPanel}>
      <div className={styles.headerRow}>
        <span>Pino Selecionado</span>
        <span className={styles.coordTag}>
          {`col:${selectedPin.col}, row:${selectedPin.row}`}
        </span>
      </div>

      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <label
            htmlFor="pin-label-input"
            className={styles.label}
          >
            Rótulo do Pino
          </label>
          <input
            id="pin-label-input"
            type="text"
            className={styles.input}
            value={selectedPin.label}
            onChange={(event) => onUpdatePin({ label: event.target.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label
            htmlFor="pin-type-select"
            className={styles.label}
          >
            Tipo Elétrico
          </label>
          <select
            id="pin-type-select"
            className={styles.select}
            value={selectedPin.type}
            onChange={(event) =>
              onUpdatePin({ type: event.target.value as PinType })
            }
          >
            <option value="signal">Sinal / GPIO (Azul)</option>
            <option value="power">Alimentação / VCC (Vermelho)</option>
            <option value="gnd">Terra / GND (Cinza)</option>
            <option value="motor">Motor / Potência (Amarelo)</option>
          </select>
        </div>
      </div>

      <Button
        variant="danger"
        onClick={onRemovePin}
      >
        ✕ Remover Este Pino
      </Button>
    </div>
  );
}
