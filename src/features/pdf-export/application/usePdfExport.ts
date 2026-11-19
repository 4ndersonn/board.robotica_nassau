import { useCallback, useMemo, useState } from 'react';
import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type {
  NetlistEntry,
  Wire,
  WireColor,
  WireColorId,
} from '@features/wiring/domain';
import type { ProjectMetadata } from '@features/project-persistence/domain';
import type { TechnicalReport } from '../domain';
import type { PdfPrintPort } from '../infrastructure/PrintPdfAdapter';
import { assembleTechnicalReport } from './assembleTechnicalReport';

export interface PdfExportController {
  readonly isPreviewOpen: boolean;
  readonly openPreview: () => void;
  readonly closePreview: () => void;
  readonly includeCppDefines: boolean;
  readonly toggleIncludeCppDefines: () => void;
  readonly report: TechnicalReport;
  readonly handlePrintPdf: () => void;
}

export function usePdfExport(params: {
  readonly printPort: PdfPrintPort;
  readonly metadata: ProjectMetadata;
  readonly placedComponents: readonly PlacedComponent[];
  readonly wires: readonly Wire[];
  readonly netlist: readonly NetlistEntry[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
}): PdfExportController {
  const {
    printPort,
    metadata,
    placedComponents,
    wires,
    netlist,
    catalogMap,
    colorMap,
  } = params;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [includeCppDefines, setIncludeCppDefines] = useState(true);

  const report = useMemo(
    () =>
      assembleTechnicalReport({
        metadata,
        placedComponents,
        wires,
        netlist,
        catalogMap,
        colorMap,
        includeCppDefines,
      }),
    [
      catalogMap,
      colorMap,
      includeCppDefines,
      metadata,
      netlist,
      placedComponents,
      wires,
    ],
  );

  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const toggleIncludeCppDefines = useCallback(() => {
    setIncludeCppDefines((prev) => !prev);
  }, []);

  const handlePrintPdf = useCallback(() => {
    const fileTitle = `${metadata.robotName.trim() || 'RoboBoard'} - v${metadata.version} - Relatorio Tecnico`;
    printPort.triggerVectorPdfPrint(fileTitle);
  }, [metadata.robotName, metadata.version, printPort]);

  return {
    isPreviewOpen,
    openPreview,
    closePreview,
    includeCppDefines,
    toggleIncludeCppDefines,
    report,
    handlePrintPdf,
  };
}
