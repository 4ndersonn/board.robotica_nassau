import { useRef, type ChangeEvent } from 'react';
import { Button } from '@core/ui/Button/Button';
import type { CustomComponentsController } from '@features/custom-components/application';
import type { ComponentsCatalogController } from '../../application';
import { ComponentCard } from '../ComponentCard/ComponentCard';
import styles from './CatalogSidebar.module.css';

export interface CatalogSidebarProps {
  readonly catalogController: ComponentsCatalogController;
  readonly customController?: CustomComponentsController;
}

export function CatalogSidebar({
  catalogController,
  customController,
}: CatalogSidebarProps) {
  const {
    filteredDefinitions,
    searchQuery,
    setSearchQuery,
    activePlacementDefId,
    placementRotation,
    placementSide,
    startPlacement,
    cancelPlacement,
    rotatePlacement90,
    setPlacementSide,
  } = catalogController;

  const libraryInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && customController) {
      void customController.handleImportLibrary(file);
      event.target.value = '';
    }
  };

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Catálogo de Módulos</h2>
        <span className={styles.countBadge}>
          {filteredDefinitions.length}
        </span>
      </div>

      {customController && (
        <div className={styles.libraryToolbar}>
          <Button
            variant="activeSelection"
            onClick={customController.openCreateModal}
          >
            + Novo Componente
          </Button>

          <div className={styles.librarySubRow}>
            <Button
              variant="secondary"
              onClick={() => libraryInputRef.current?.click()}
              title="Importar biblioteca-equipe.json"
            >
              📥 Importar Lib
            </Button>
            <Button
              variant="secondary"
              onClick={customController.handleExportLibrary}
              title="Exportar biblioteca-equipe.json"
            >
              📤 Exportar Lib
            </Button>
          </div>

          <input
            ref={libraryInputRef}
            type="file"
            accept=".json"
            className={styles.hiddenInput}
            onChange={handleImportFileChange}
          />
        </div>
      )}

      <div className={styles.searchWrapper}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar módulo (ESP32, TB6612, KRE...)"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Buscar componente no catálogo"
        />
      </div>

      {activePlacementDefId && (
        <div className={styles.placementControls}>
          <div className={styles.placementHeader}>
            <span>Modo de Posicionamento</span>
            <span>{`${placementRotation}°`}</span>
          </div>

          <div className={styles.placementActions}>
            <Button
              variant="secondary"
              onClick={rotatePlacement90}
            >
              ↻ Girar 90° (R)
            </Button>

            <Button
              variant={
                placementSide === 'top' ? 'activeConfirm' : 'secondary'
              }
              onClick={() =>
                setPlacementSide(
                  placementSide === 'top' ? 'bottom' : 'top',
                )
              }
            >
              {placementSide === 'top' ? 'Lado: Frente' : 'Lado: Verso'}
            </Button>

            <Button
              variant="danger"
              onClick={cancelPlacement}
            >
              Cancelar (Esc)
            </Button>
          </div>
        </div>
      )}

      <div className={styles.listScroll}>
        {filteredDefinitions.map((definition) => (
          <ComponentCard
            key={definition.id}
            definition={definition}
            isActivePlacement={activePlacementDefId === definition.id}
            onSelectForPlacement={startPlacement}
            onEditCustom={customController?.openEditModal}
            onDuplicateCustom={customController?.handleDuplicateCustom}
            onDeleteCustom={customController?.handleDeleteCustom}
          />
        ))}

        {filteredDefinitions.length === 0 && (
          <p className={styles.emptyState}>
            Nenhum módulo encontrado para &ldquo;{searchQuery}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
