import { Button } from '@core/ui/Button/Button';
import type { WiringController } from '../../application';
import styles from './WireToolbarControls.module.css';

export interface WireToolbarControlsProps {
  readonly wiringController: WiringController;
  readonly isSpaceTemporaryHand?: boolean;
}

export function WireToolbarControls({
  wiringController,
  isSpaceTemporaryHand = false,
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

  const isHandActive = toolMode === 'hand' || isSpaceTemporaryHand;
  const isSelectActive = toolMode === 'select' && !isSpaceTemporaryHand;
  const isWireActive = toolMode === 'wire' && !isSpaceTemporaryHand;

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
          variant={isSelectActive ? 'activeConfirm' : 'secondary'}
          className={styles.compactBtn}
          onClick={() => setToolMode('select')}
          aria-pressed={isSelectActive}
          title="Selecionar componentes e fios (Atalho: V)"
        >
          ↖ Selecionar (V)
        </Button>

        <Button
          variant={isWireActive ? 'activeSelection' : 'secondary'}
          className={styles.compactBtn}
          onClick={() => setToolMode('wire')}
          aria-pressed={isWireActive}
          title="Traçar fios na placa (Atalho: W)"
        >
          ∿ Fio (W)
        </Button>

        <Button
          variant={isHandActive ? 'activeSelection' : 'secondary'}
          className={styles.compactBtn}
          onClick={() => setToolMode('hand')}
          aria-pressed={isHandActive}
          title="Mover / Arrastar visão da placa (Atalho: H ou segurar Espaço)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.handIconSvg}
            aria-hidden="true"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
            <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span>Mover (H)</span>
        </Button>
      </div>

      {toolMode === 'wire' && (
        <div className={styles.wireContextualOptions}>
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
                  title={`${preset.name} — ${preset.usageHint}`}
                  aria-label={`Cor de fio ${preset.name}`}
                  aria-pressed={isSelected}
                  onClick={() => setActiveColorId(preset.id)}
                />
              );
            })}
          </div>

          <Button
            variant={
              activeRoutingStyle === 'orthogonal'
                ? 'activeSelection'
                : 'secondary'
            }
            className={styles.compactBtn}
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
        </div>
      )}

      <div className={styles.oppositeSideGroup}>
        <Button
          variant={showOppositeSideWires ? 'activeConfirm' : 'secondary'}
          className={styles.compactBtn}
          onClick={toggleShowOppositeSideWires}
          title="Mostrar ou ocultar fios traçados no lado oposto da placa"
        >
          {showOppositeSideWires
            ? '👁 Lado Oposto: Visível'
            : '🚫 Lado Oposto: Oculto'}
        </Button>
      </div>
    </div>
  );
}
