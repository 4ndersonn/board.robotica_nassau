import type {
  NetlistEndpointInfo,
  NetlistEntry,
} from '@features/wiring/domain';
import type { ProjectMetadata } from '@features/project-persistence/domain';

export interface FirmwareDefineItem {
  readonly macroName: string;
  readonly gpioNumber: number;
  readonly comment: string;
  readonly wireId: string;
}

export interface FirmwareExportResult {
  readonly headerCode: string;
  readonly defines: readonly FirmwareDefineItem[];
}

const ESP32_SPECIAL_GPIO_MAP: Readonly<Record<string, number>> = {
  VP: 36,
  VN: 39,
  RX0: 3,
  TX0: 1,
  RX2: 16,
  TX2: 17,
};

function isMcuComponentAlias(alias: string | null): boolean {
  if (!alias) {
    return false;
  }
  const upper = alias.toUpperCase();
  return upper.includes('ESP32') || upper.includes('ARDUINO');
}

/**
 * Extrai o número inteiro do GPIO do ESP32 a partir do rótulo do pino (ex: 'D27' -> 27, 'VP' -> 36).
 * Retorna `null` para pinos de alimentação/controle não-GPIO (`3V3`, `GND`, `VIN`, `5V`, `EN`).
 */
export function extractEsp32GpioNumber(pinLabel: string | null): number | null {
  if (!pinLabel) {
    return null;
  }

  const normalized = pinLabel.trim().toUpperCase();

  if (normalized in ESP32_SPECIAL_GPIO_MAP) {
    return ESP32_SPECIAL_GPIO_MAP[normalized];
  }

  const dMatch = /^D(\d+)$/.exec(normalized);
  if (dMatch) {
    return Number.parseInt(dMatch[1], 10);
  }

  const gpioMatch = /^GPIO(\d+)$/.exec(normalized);
  if (gpioMatch) {
    return Number.parseInt(gpioMatch[1], 10);
  }

  return null;
}

function sanitizeMacroToken(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/PONTE\s+H\s+/g, '')
    .replace(/TB6612FNG/g, 'TB6612')
    .replace(/REGULADOR\s+STEP-DOWN.*/g, 'STEPDOWN')
    .replace(/BORNE\s+KRE\s*/g, 'KRE_')
    .replace(/CONECTOR\s+JST\s*/g, 'JST_')
    .replace(/CHAVE\s+DESLIZANTE\s*/g, 'SW_')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildTargetMacroName(target: NetlistEndpointInfo): string {
  if (target.componentAlias && target.pinLabel) {
    const compToken = sanitizeMacroToken(target.componentAlias) || 'MOD';
    const pinToken = sanitizeMacroToken(target.pinLabel) || 'PIN';
    return `${compToken}_${pinToken}`.replace(/_+/g, '_');
  }

  return `PIN_FURO_${sanitizeMacroToken(target.holeLabel)}`;
}

/**
 * Serviço puro de domínio:
 * Identifica conexões na Netlist entre pinos GPIO do ESP32 e outros módulos/furos
 * e gera o código C++ formatado com `#define` e comentários de cor/observação.
 */
export function generateCppDefines(
  netlist: readonly NetlistEntry[],
  metadata: Pick<ProjectMetadata, 'robotName' | 'version'>,
): FirmwareExportResult {
  const defines: FirmwareDefineItem[] = [];
  const usedMacros = new Map<string, number>();

  for (const entry of netlist) {
    const originIsMcu = isMcuComponentAlias(entry.origin.componentAlias);
    const destIsMcu = isMcuComponentAlias(entry.destination.componentAlias);

    const originGpio = originIsMcu
      ? extractEsp32GpioNumber(entry.origin.pinLabel)
      : null;
    const destGpio = destIsMcu
      ? extractEsp32GpioNumber(entry.destination.pinLabel)
      : null;

    let gpioNumber: number | null = null;
    let targetEndpoint: NetlistEndpointInfo | null = null;

    if (originGpio !== null) {
      gpioNumber = originGpio;
      targetEndpoint = entry.destination;
    } else if (destGpio !== null) {
      gpioNumber = destGpio;
      targetEndpoint = entry.origin;
    }

    if (gpioNumber === null || targetEndpoint === null) {
      continue;
    }

    const baseMacro = buildTargetMacroName(targetEndpoint);
    const count = usedMacros.get(baseMacro) ?? 0;
    usedMacros.set(baseMacro, count + 1);
    const macroName = count === 0 ? baseMacro : `${baseMacro}_${count + 1}`;

    const commentParts = [`Fio ${entry.colorName}`];
    if (entry.note.trim()) {
      commentParts.push(entry.note.trim());
    }

    defines.push({
      macroName,
      gpioNumber,
      comment: commentParts.join(' - '),
      wireId: entry.wireId,
    });
  }

  const headerLine = `// RoboBoard Docs - ${metadata.robotName} (v${metadata.version})`;

  if (defines.length === 0) {
    return {
      headerCode: [
        headerLine,
        '// Nenhuma conexão de pino GPIO do ESP32 identificada na Netlist.',
      ].join('\n'),
      defines: [],
    };
  }

  const maxMacroLength = Math.max(
    ...defines.map((item) => item.macroName.length),
    12,
  );

  const defineLines = defines.map((item) => {
    const paddedMacro = item.macroName.padEnd(maxMacroLength + 2, ' ');
    const paddedGpio = String(item.gpioNumber).padEnd(2, ' ');
    return `#define ${paddedMacro}${paddedGpio}  // ${item.comment}`;
  });

  return {
    headerCode: [headerLine, ...defineLines].join('\n'),
    defines,
  };
}
