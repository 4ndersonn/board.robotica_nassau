import { Button } from '@core/ui/Button/Button';
import {
  MAX_COMPONENT_HEIGHT,
  MAX_COMPONENT_WIDTH,
  MIN_COMPONENT_HEIGHT,
  MIN_COMPONENT_WIDTH,
  PCB_COLOR_PRESETS,
} from '../../domain';
import type { CustomComponentsController } from '../../application';
import styles from './ComponentConfigForm.module.css';

export interface ComponentConfigFormProps {
  readonly controller: CustomComponentsController;
}

export function ComponentConfigForm({
  controller,
}: ComponentConfigFormProps) {
  const {
    draft,
    updateDraftMeta,
    updateDraftDimensions,
    applyQuickPinRow,
    clearAllPins,
  } = controller;

  return (
    <div className={styles.formColumn}>
      <div className={styles.fieldGroup}>
        <label
          htmlFor="custom-comp-name"
          className={styles.label}
        >
          Nome do Componente *
        </label>
        <input
          id="custom-comp-name"
          type="text"
          className={styles.input}
          placeholder="Ex: Sensor Ultrassônico HC-SR04"
          value={draft.name}
          onChange={(event) => updateDraftMeta({ name: event.target.value })}
        />
      </div>

      <div className={styles.rowTwo}>
        <div className={styles.fieldGroup}>
          <label
            htmlFor="custom-comp-category"
            className={styles.label}
          >
            Categoria
          </label>
          <input
            id="custom-comp-category"
            type="text"
            className={styles.input}
            placeholder="Sensores, Motores..."
            value={draft.category}
            onChange={(event) =>
              updateDraftMeta({ category: event.target.value })
            }
          />
        </div>

        <div className={styles.fieldGroup}>
          <label
            htmlFor="custom-comp-desc"
            className={styles.label}
          >
            Descrição Curta
          </label>
          <input
            id="custom-comp-desc"
            type="text"
            className={styles.input}
            value={draft.description}
            onChange={(event) =>
              updateDraftMeta({ description: event.target.value })
            }
          />
        </div>
      </div>

      <div className={styles.rowTwo}>
        <div className={styles.fieldGroup}>
          <label
            htmlFor="custom-comp-width"
            className={styles.label}
          >
            {`Largura em Furos (${MIN_COMPONENT_WIDTH}..${MAX_COMPONENT_WIDTH})`}
          </label>
          <input
            id="custom-comp-width"
            type="number"
            min={MIN_COMPONENT_WIDTH}
            max={MAX_COMPONENT_WIDTH}
            className={styles.input}
            value={draft.widthHoles}
            onChange={(event) =>
              updateDraftDimensions(
                Number.parseInt(event.target.value, 10),
                draft.heightHoles,
              )
            }
          />
        </div>

        <div className={styles.fieldGroup}>
          <label
            htmlFor="custom-comp-height"
            className={styles.label}
          >
            {`Altura em Furos (${MIN_COMPONENT_HEIGHT}..${MAX_COMPONENT_HEIGHT})`}
          </label>
          <input
            id="custom-comp-height"
            type="number"
            min={MIN_COMPONENT_HEIGHT}
            max={MAX_COMPONENT_HEIGHT}
            className={styles.input}
            value={draft.heightHoles}
            onChange={(event) =>
              updateDraftDimensions(
                draft.widthHoles,
                Number.parseInt(event.target.value, 10),
              )
            }
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <span className={styles.label}>Cor da PCB (Presets + Livre)</span>
        <div className={styles.presetsRow}>
          {PCB_COLOR_PRESETS.map((preset) => {
            const isSelected = draft.color === preset.color;
            const btnClass = [
              styles.presetBtn,
              isSelected ? styles.presetBtnActive : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={preset.name}
                type="button"
                className={btnClass}
                onClick={() =>
                  updateDraftMeta({
                    color: preset.color,
                    accentColor: preset.accentColor,
                  })
                }
              >
                <span
                  className={styles.presetSwatch}
                  style={{ backgroundColor: preset.accentColor }}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.customColorRow}>
          <span className={styles.label}>Cor Corpo:</span>
          <input
            type="color"
            className={styles.colorPicker}
            value={draft.color}
            onChange={(event) =>
              updateDraftMeta({ color: event.target.value })
            }
            aria-label="Seletor livre de cor do corpo da PCB"
          />

          <span className={styles.label}>Cor Borda:</span>
          <input
            type="color"
            className={styles.colorPicker}
            value={draft.accentColor}
            onChange={(event) =>
              updateDraftMeta({ accentColor: event.target.value })
            }
            aria-label="Seletor livre de cor da borda da PCB"
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <span className={styles.label}>Atalhos Rápidos de Pinagem</span>
        <div className={styles.quickPinGrid}>
          <Button
            variant="secondary"
            onClick={() => applyQuickPinRow('left')}
          >
            + Fileira Esquerda
          </Button>
          <Button
            variant="secondary"
            onClick={() => applyQuickPinRow('right')}
          >
            + Fileira Direita
          </Button>
          <Button
            variant="secondary"
            onClick={() => applyQuickPinRow('top')}
          >
            + Superior
          </Button>
          <Button
            variant="secondary"
            onClick={() => applyQuickPinRow('bottom')}
          >
            + Inferior
          </Button>
          <Button
            variant="danger"
            onClick={clearAllPins}
          >
            Limpar Pinos
          </Button>
        </div>
      </div>
    </div>
  );
}
