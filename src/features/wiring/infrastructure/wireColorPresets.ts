import type { WireColor, WireColorId } from '../domain';

export const WIRE_COLOR_PRESETS: readonly WireColor[] = [
  {
    id: 'red',
    name: 'Vermelho',
    hex: '#ef4444',
    usageHint: 'VCC / Alimentação Positiva (+5V, +3.3V, VM)',
  },
  {
    id: 'black',
    name: 'Preto',
    hex: '#52525b',
    usageHint: 'GND / Referência Comum (Terra)',
  },
  {
    id: 'yellow',
    name: 'Amarelo',
    hex: '#eab308',
    usageHint: 'PWM / Sinais de Controle ou Motor A',
  },
  {
    id: 'white',
    name: 'Branco',
    hex: '#f4f4f6',
    usageHint: 'RX / TX / Barramento de Dados',
  },
  {
    id: 'green',
    name: 'Verde',
    hex: '#22c55e',
    usageHint: 'Sensores / Entradas Digitais ou Analógicas',
  },
  {
    id: 'blue',
    name: 'Azul',
    hex: '#38bdf8',
    usageHint: 'GPIO / Controle de Direção (AIN/BIN)',
  },
  {
    id: 'orange',
    name: 'Laranja',
    hex: '#f97316',
    usageHint: 'Saídas de Potência / Motor B',
  },
  {
    id: 'purple',
    name: 'Roxo',
    hex: '#a855f7',
    usageHint: 'Sinais Auxiliares / Enable / Standby',
  },
];

export const WIRE_COLOR_MAP: ReadonlyMap<WireColorId, WireColor> = new Map(
  WIRE_COLOR_PRESETS.map((preset) => [preset.id, preset]),
);
