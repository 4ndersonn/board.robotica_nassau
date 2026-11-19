import type { NetlistEntry } from '@features/wiring/domain';
import styles from './ReportNetlistTable.module.css';

export interface ReportNetlistTableProps {
  readonly entries: readonly NetlistEntry[];
}

export function ReportNetlistTable({
  entries,
}: ReportNetlistTableProps) {
  return (
    <section className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>
        Tabela Completa de Conexões — Netlist ({entries.length} fios)
      </h2>

      {entries.length === 0 ? (
        <p className={styles.emptyText}>
          Nenhuma conexão de fio registrada na placa.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Origem</th>
              <th>Destino</th>
              <th>Cor</th>
              <th>Lado</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.wireId}>
                <td className={styles.numCell}>{index + 1}</td>
                <td className={styles.monoCell}>
                  {entry.origin.formattedEndpoint}
                </td>
                <td className={styles.monoCell}>
                  {entry.destination.formattedEndpoint}
                </td>
                <td>
                  <span className={styles.colorBadge}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: entry.colorHex }}
                    />
                    <span>{entry.colorName}</span>
                  </span>
                </td>
                <td className={styles.monoCell}>{entry.sideLabel}</td>
                <td>{entry.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
