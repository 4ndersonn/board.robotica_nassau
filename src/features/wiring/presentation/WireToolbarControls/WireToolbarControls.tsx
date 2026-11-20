import { Button } from '@core/ui/Button/Button';
import type { WiringController } from '../../application';
import styles from './WireToolbarControls.module.css';

export interface WireToolbarControlsProps {
  readonly wiringController: WiringController;
}

export function WireToolbarControls({
  wiringController,
}: WireToolbarControlsProps) {
  const {
    toolMode,
    setToolMode,
    activeColorId,
    setActiveColorId,
    activeRoutingStyle,
    setActiveRoutingStyle,
    showOppositeSideWires,
    toggleShowOppositeSideWires,
    colorPresets,
  } = wiringController;

  return (
    <div
      className={styles.toolbarGroup}
      aria-label="Ferramentas de Desenho e Fios"
    >
      <div
        className={styles.modeToggle}
        role="group"
        aria-label="Modo de ferramenta"
      >
        <Button
          variant={toolMode === 'select' ? 'activeConfirm' : 'secondary'}
          onClick={() => setToolMode('select')}
          aria-pressed={toolMode === 'select'}
        >
          ↖ Selecionar (V)
        </Button>

        <Button
          variant={toolMode === 'wire' ? 'activeSelection' : 'secondary'}
          onClick={() => setToolMode('wire')}
          aria-pressed={toolMode === 'wire'}
        >
          ∿ Fio (W)
        </Button>
      </div>

      <div className={styles.wireOptions}>
        <div
          className={styles.colorSwatches}
          role="group"
          aria-label="Cor do fio"
        >
          {colorPresets.map((preset) => {
            const isSelected = preset.id === activeColorId;
            const swatchClassName = [
              styles.swatchBtn,
              isSelected ? styles.swatchActive : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={preset.id}
                type="button"
                className={swatchClassName}
                style={{ backgroundColor: preset.hex }}
                title={`${preset.name}: ${preset.usageHint}`}
                aria-label={`Cor de fio ${preset.name}`}
                aria-pressed={isSelected}
                onClick={() => setActiveColorId(preset.id)}
              />
            );
          })}
        </div>

        <div className={styles.routingToggle}>
          <Button
            variant={
              activeRoutingStyle === 'orthogonal'
                ? 'activeSelection'
                : 'secondary'
            }
            onClick={() =>
              setActiveRoutingStyle(
                activeRoutingStyle === 'orthogonal' ? 'free' : 'orthogonal',
              )
            }
            title="Alternar estilo de dobra entre Ortogonal 90° e Livre"
          >
            {activeRoutingStyle === 'orthogonal'
              ? '∟ Ortogonal 90°'
              : '∕ Livre'}
          </Button>

          <Button
            variant={showOppositeSideWires ? 'activeConfirm' : 'secondary'}
            onClick={toggleShowOppositeSideWires}
            title="Mostrar ou ocultar fios traçados no lado oposto da placa"
          >
            {showOppositeSideWires
              ? 'Lado oposto: visível'
              : 'Lado oposto: oculto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
