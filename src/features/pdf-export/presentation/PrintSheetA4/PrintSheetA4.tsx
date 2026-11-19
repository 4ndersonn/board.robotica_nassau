import type { ComponentDefinition } from '@features/components-catalog/domain';
import type { WireColor, WireColorId } from '@features/wiring/domain';
import type { TechnicalReport } from '../../domain';
import { ReportBomTable } from '../ReportBomTable/ReportBomTable';
import { ReportDiagrams } from '../ReportDiagrams/ReportDiagrams';
import { ReportHeader } from '../ReportHeader/ReportHeader';
import { ReportNetlistTable } from '../ReportNetlistTable/ReportNetlistTable';
import styles from './PrintSheetA4.module.css';

export interface PrintSheetA4Props {
  readonly report: TechnicalReport;
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
}

export function PrintSheetA4({
  report,
  catalogMap,
  colorMap,
}: PrintSheetA4Props) {
  return (
    <article
      className={styles.sheetA4}
      aria-label="Folha Técnica A4 Retrato"
    >
      <ReportHeader metadata={report.metadata} />

      <ReportDiagrams
        placedComponents={report.placedComponents}
        wires={report.wires}
        usedWireColors={report.usedWireColors}
        catalogMap={catalogMap}
        colorMap={colorMap}
      />

      <ReportBomTable items={report.bom} />

      <ReportNetlistTable entries={report.netlist} />

      {report.includeCppDefines && (
        <section className={styles.cppBlock}>
          <h2 className={styles.cppTitle}>
            Mapeamento de Pinagem C++ (#define ESP32 / Arduino)
          </h2>
          <pre className={styles.cppPre}>
            <code>{report.cppHeaderCode}</code>
          </pre>
        </section>
      )}

      <footer className={styles.footerNote}>
        <span>
          RoboBoard Docs — Padrão Perfboard Universal 50×70 mm (Matriz 18×24,
          passo 2.54 mm)
        </span>
        <span>
          {`${report.metadata.robotName} • v${report.metadata.version}`}
        </span>
      </footer>
    </article>
  );
}
