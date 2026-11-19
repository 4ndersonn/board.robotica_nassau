import { useCallback, useMemo, useState } from 'react';
import type { NetlistEntry } from '@features/wiring/domain';
import type { ProjectMetadata } from '@features/project-persistence/domain';
import {
  generateCppDefines,
  type FirmwareExportResult,
} from '../domain';
import {
  copyCodeToClipboard,
  downloadCppHeaderFile,
} from '../infrastructure/firmwareOutputAdapter';

export interface FirmwareExportController {
  readonly isFirmwareModalOpen: boolean;
  readonly openFirmwareModal: () => void;
  readonly closeFirmwareModal: () => void;
  readonly firmwareResult: FirmwareExportResult;
  readonly copyFeedback: string | null;
  readonly handleCopyDefines: () => Promise<void>;
  readonly handleDownloadHeader: () => void;
}

export function useFirmwareExport(
  netlist: readonly NetlistEntry[],
  metadata: ProjectMetadata,
): FirmwareExportController {
  const [isFirmwareModalOpen, setIsFirmwareModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const firmwareResult = useMemo(
    () => generateCppDefines(netlist, metadata),
    [metadata, netlist],
  );

  const openFirmwareModal = useCallback(() => {
    setCopyFeedback(null);
    setIsFirmwareModalOpen(true);
  }, []);

  const closeFirmwareModal = useCallback(() => {
    setIsFirmwareModalOpen(false);
    setCopyFeedback(null);
  }, []);

  const handleCopyDefines = useCallback(async () => {
    const ok = await copyCodeToClipboard(firmwareResult.headerCode);
    setCopyFeedback(
      ok
        ? 'Defines C++ copiados para a área de transferência!'
        : 'Não foi possível copiar automaticamente.',
    );
  }, [firmwareResult.headerCode]);

  const handleDownloadHeader = useCallback(() => {
    downloadCppHeaderFile(firmwareResult.headerCode, metadata.robotName);
    setCopyFeedback('Arquivo de cabeçalho C++ (.h) baixado com sucesso!');
  }, [firmwareResult.headerCode, metadata.robotName]);

  return {
    isFirmwareModalOpen,
    openFirmwareModal,
    closeFirmwareModal,
    firmwareResult,
    copyFeedback,
    handleCopyDefines,
    handleDownloadHeader,
  };
}
