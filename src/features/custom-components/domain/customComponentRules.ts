import type {
  ComponentDefinition,
  PinDefinition,
  PinType,
} from '@features/components-catalog/domain';

export interface CustomComponentDraft {
  readonly id?: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly widthHoles: number;
  readonly heightHoles: number;
  readonly color: string;
  readonly accentColor: string;
  readonly pins: readonly PinDefinition[];
}

export interface CustomComponentValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export const MIN_COMPONENT_WIDTH = 1;
export const MAX_COMPONENT_WIDTH = 18;
export const MIN_COMPONENT_HEIGHT = 1;
export const MAX_COMPONENT_HEIGHT = 24;

export const PCB_COLOR_PRESETS: readonly {
  readonly name: string;
  readonly color: string;
  readonly accentColor: string;
}[] = [
  { name: 'Azul Escuro', color: '#1e293b', accentColor: '#38bdf8' },
  { name: 'Vermelho Driver', color: '#7f1d1d', accentColor: '#f87171' },
  { name: 'Verde PCB', color: '#14532d', accentColor: '#4ade80' },
  { name: 'Roxo Sensor', color: '#4c1d95', accentColor: '#c084fc' },
  { name: 'Preto Fosco', color: '#27272a', accentColor: '#eab308' },
  { name: 'Turquesa KRE', color: '#065f46', accentColor: '#34d399' },
];

export function createInitialCustomDraft(): CustomComponentDraft {
  return {
    name: '',
    category: 'Customizados',
    description: 'Módulo customizado criado pela equipe',
    widthHoles: 4,
    heightHoles: 6,
    color: '#1e293b',
    accentColor: '#38bdf8',
    pins: [
      { id: 'pin-0-0', col: 0, row: 0, label: 'VCC', type: 'power' },
      { id: 'pin-0-1', col: 0, row: 1, label: 'GND', type: 'gnd' },
    ],
  };
}

/**
 * Valida todas as regras de domínio de um componente customizado:
 * - Nome obrigatório.
 * - Largura entre 1 e 18 furos; Altura entre 1 e 24 furos.
 * - Pelo menos 1 pino definido.
 * - Todos os pinos dentro dos limites (0..widthHoles-1, 0..heightHoles-1) e com rótulo não vazio.
 */
export function validateCustomComponentDraft(
  draft: CustomComponentDraft,
): CustomComponentValidationResult {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push('O nome do componente é obrigatório.');
  }

  if (
    !Number.isInteger(draft.widthHoles) ||
    draft.widthHoles < MIN_COMPONENT_WIDTH ||
    draft.widthHoles > MAX_COMPONENT_WIDTH
  ) {
    errors.push(
      `A largura deve estar entre ${MIN_COMPONENT_WIDTH} e ${MAX_COMPONENT_WIDTH} furos.`,
    );
  }

  if (
    !Number.isInteger(draft.heightHoles) ||
    draft.heightHoles < MIN_COMPONENT_HEIGHT ||
    draft.heightHoles > MAX_COMPONENT_HEIGHT
  ) {
    errors.push(
      `A altura deve estar entre ${MIN_COMPONENT_HEIGHT} e ${MAX_COMPONENT_HEIGHT} furos.`,
    );
  }

  if (draft.pins.length < 1) {
    errors.push('O componente deve possuir pelo menos 1 pino.');
  }

  const outOfBoundsPin = draft.pins.find(
    (pin) =>
      pin.col < 0 ||
      pin.col >= draft.widthHoles ||
      pin.row < 0 ||
      pin.row >= draft.heightHoles,
  );

  if (outOfBoundsPin) {
    errors.push(
      'Existem pinos fora dos limites atuais de largura/altura do componente.',
    );
  }

  const unlabeledPin = draft.pins.find((pin) => !pin.label.trim());
  if (unlabeledPin) {
    errors.push('Todos os pinos devem possuir um rótulo (ex: VCC, GND, S1).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Remove pinos que ficaram fora da matriz após redução de largura ou altura.
 */
export function clampPinsToDimensions(
  pins: readonly PinDefinition[],
  widthHoles: number,
  heightHoles: number,
): readonly PinDefinition[] {
  return pins.filter(
    (pin) =>
      pin.col >= 0 &&
      pin.col < widthHoles &&
      pin.row >= 0 &&
      pin.row < heightHoles,
  );
}

export type QuickPinRowPreset = 'left' | 'right' | 'top' | 'bottom';

/**
 * Gerador puro de fileiras rápidas de pinos nas bordas do módulo:
 * - 'left': coluna 0 (todas as linhas 0..heightHoles-1)
 * - 'right': coluna widthHoles-1 (todas as linhas 0..heightHoles-1)
 * - 'top': linha 0 (todas as colunas 0..widthHoles-1)
 * - 'bottom': linha heightHoles-1 (todas as colunas 0..widthHoles-1)
 */
export function generateQuickPinRow(
  existingPins: readonly PinDefinition[],
  widthHoles: number,
  heightHoles: number,
  preset: QuickPinRowPreset,
  defaultType: PinType = 'signal',
): readonly PinDefinition[] {
  const byCoord = new Map<string, PinDefinition>(
    existingPins.map((pin) => [`${pin.col}:${pin.row}`, pin]),
  );

  const upsertPin = (col: number, row: number, prefix: string, index: number) => {
    const key = `${col}:${row}`;
    if (!byCoord.has(key)) {
      byCoord.set(key, {
        id: `pin-${col}-${row}`,
        col,
        row,
        label: `${prefix}${index}`,
        type: defaultType,
      });
    }
  };

  switch (preset) {
    case 'left': {
      for (let row = 0; row < heightHoles; row += 1) {
        upsertPin(0, row, 'L', row + 1);
      }
      break;
    }
    case 'right': {
      const rightCol = Math.max(0, widthHoles - 1);
      for (let row = 0; row < heightHoles; row += 1) {
        upsertPin(rightCol, row, 'R', row + 1);
      }
      break;
    }
    case 'top': {
      for (let col = 0; col < widthHoles; col += 1) {
        upsertPin(col, 0, 'T', col + 1);
      }
      break;
    }
    case 'bottom': {
      const bottomRow = Math.max(0, heightHoles - 1);
      for (let col = 0; col < widthHoles; col += 1) {
        upsertPin(col, bottomRow, 'B', col + 1);
      }
      break;
    }
  }

  return Array.from(byCoord.values());
}

export function buildCustomComponentDefinition(
  draft: CustomComponentDraft,
): ComponentDefinition {
  const id =
    draft.id ??
    `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    name: draft.name.trim(),
    category: draft.category.trim() || 'Customizados',
    description:
      draft.description.trim() ||
      `Módulo customizado ${draft.widthHoles}×${draft.heightHoles} (${draft.pins.length} pinos)`,
    widthHoles: draft.widthHoles,
    heightHoles: draft.heightHoles,
    color: draft.color,
    accentColor: draft.accentColor,
    pins: draft.pins.map((pin) => ({
      ...pin,
      label: pin.label.trim(),
    })),
    isCustom: true,
  };
}
