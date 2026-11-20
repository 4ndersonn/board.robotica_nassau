import type { BomItem } from '../../domain';
import styles from './ReportBomTable.module.css';

export interface ReportBomTableProps {
  readonly items: readonly BomItem[];
}

export function ReportBomTable({ items }: ReportBomTableProps) {
  return (
    <section className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>
        Lista de materiais ({items.length})
      </h2>

      {items.length === 0 ? (
        <p className={styles.emptyText}>
          Nenhum módulo eletrônico posicionado na placa.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Qtd</th>
              <th>Módulo / Componente</th>
              <th>Categoria</th>
              <th>Pegada</th>
              <th>Posições na Placa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.definitionId}>
                <td className={styles.qtyCell}>{item.quantity}</td>
                <td>{item.modelName}</td>
                <td>{item.category}</td>
                <td className={styles.monoCell}>{item.footprintLabel}</td>
                <td className={styles.monoCell}>{item.instancesSummary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
