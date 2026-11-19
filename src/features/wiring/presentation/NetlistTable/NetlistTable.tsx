import type { NetlistEntry } from '../../domain';
import styles from './NetlistTable.module.css';

export interface NetlistTableProps {
  readonly entries: readonly NetlistEntry[];
  readonly selectedWireId: string | null;
  readonly hoveredWireId: string | null;
  readonly onSelectWire: (wireId: string) => void;
  readonly onHoverWire: (wireId: string | null) => void;
}

export function NetlistTable({
  entries,
  selectedWireId,
  hoveredWireId,
  onSelectWire,
  onHoverWire,
}: NetlistTableProps) {
  return (
    <div className={styles.netlistSection}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Netlist Automática (Conexões)</h3>
        <span className={styles.countBadge}>{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <div className={styles.emptyState}>
          Nenhum fio traçado. Ative o modo <strong>Fio (W)</strong> na barra
          superior, clique no furo de origem, adicione dobras e clique no furo
          de destino (ou pressione <code>Enter</code>) para gerar a Netlist.
        </div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Origem</th>
                <th>Destino</th>
                <th>Cor</th>
                <th>Lado</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isSelected = entry.wireId === selectedWireId;
                const isHovered = entry.wireId === hoveredWireId;
                const rowClass = [
                  styles.row,
                  isSelected || isHovered ? styles.rowSelected : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr
                    key={entry.wireId}
                    className={rowClass}
                    onClick={() => onSelectWire(entry.wireId)}
                    onMouseEnter={() => onHoverWire(entry.wireId)}
                    onMouseLeave={() => onHoverWire(null)}
                  >
                    <td className={styles.endpointCell}>
                      {entry.origin.formattedEndpoint}
                    </td>
                    <td className={styles.endpointCell}>
                      {entry.destination.formattedEndpoint}
                    </td>
                    <td>
                      <span className={styles.colorCell}>
                        <span
                          className={styles.colorDot}
                          style={{ backgroundColor: entry.colorHex }}
                        />
                        <span>{entry.colorName}</span>
                      </span>
                    </td>
                    <td className={styles.sideCell}>{entry.sideLabel}</td>
                    <td className={styles.noteCell}>
                      {entry.note || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
