import { Button } from '@core/ui/Button/Button';
import type { WiringController } from '../../application';
import styles from './WireInspector.module.css';

export interface WireInspectorProps {
  readonly wiringController: WiringController;
}

export function WireInspector({
  wiringController,
}: WireInspectorProps) {
  const {
    selectedWire,
    colorPresets,
    updateSelectedWireColor,
    updateSelectedWireRouting,
    updateSelectedWireSide,
    updateSelectedWireNote,
    deleteSelectedWire,
  } = wiringController;

  if (!selectedWire) {
    return null;
  }

  return (
    <div className={styles.inspectorCard}>
      <div className={styles.headerRow}>
        <span className={styles.title}>Fio selecionado</span>
        <span className={styles.sideTag}>
          {selectedWire.side === 'top' ? 'Lado: frente' : 'Lado: verso'}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Cor do condutor</span>
        <div className={styles.colorGrid}>
          {colorPresets.map((preset) => {
            const isSelected = preset.id === selectedWire.colorId;
            const btnClass = [
              styles.colorBtn,
              isSelected ? styles.colorBtnActive : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={preset.id}
                type="button"
                className={btnClass}
                onClick={() => updateSelectedWireColor(preset.id)}
              >
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label
          htmlFor="wire-note-input"
          className={styles.fieldLabel}
        >
          Observação
        </label>
        <input
          id="wire-note-input"
          type="text"
          className={styles.noteInput}
          placeholder="Ex: Alimentação 5V, PWM Motor Esquerdo..."
          value={selectedWire.note}
          onChange={(event) => updateSelectedWireNote(event.target.value)}
        />
      </div>

      <div className={styles.actionRow}>
        <Button
          variant="secondary"
          className={styles.fullBtn}
          onClick={() =>
            updateSelectedWireRouting(
              selectedWire.routingStyle === 'orthogonal'
                ? 'free'
                : 'orthogonal',
            )
          }
        >
          {selectedWire.routingStyle === 'orthogonal'
            ? 'Estilo: 90°'
            : 'Estilo: livre'}
        </Button>

        <Button
          variant="secondary"
          className={styles.fullBtn}
          onClick={() =>
            updateSelectedWireSide(
              selectedWire.side === 'top' ? 'bottom' : 'top',
            )
          }
        >
          ⇄ Mover lado
        </Button>
      </div>

      <Button
        variant="danger"
        onClick={deleteSelectedWire}
      >
        ✕ Excluir fio (Delete)
      </Button>
    </div>
  );
}
