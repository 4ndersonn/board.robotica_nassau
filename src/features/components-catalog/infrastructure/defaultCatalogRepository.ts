import type {
  CatalogRepository,
  ComponentDefinition,
  PinDefinition,
  PinType,
} from '../domain';

function createDualRowPins(
  leftLabels: readonly { readonly label: string; readonly type: PinType }[],
  rightLabels: readonly { readonly label: string; readonly type: PinType }[],
  rightColOffset: number,
): readonly PinDefinition[] {
  const pins: PinDefinition[] = [];

  leftLabels.forEach((item, row) => {
    pins.push({
      id: `L-${row + 1}-${item.label}`,
      col: 0,
      row,
      label: item.label,
      type: item.type,
    });
  });

  rightLabels.forEach((item, row) => {
    pins.push({
      id: `R-${row + 1}-${item.label}`,
      col: rightColOffset,
      row,
      label: item.label,
      type: item.type,
    });
  });

  return pins;
}

/**
 * 1. ESP32 DevKit V1 (30 pinos) — 2 fileiras de 15 pinos (largura 10 furos = passo 9 furos / 22.86mm)
 * Fileira esquerda: 3V3, GND, D15, D2, D4, RX2, TX2, D5, D18, D19, D21, RX0, TX0, D22, D23
 * Fileira direita:  EN, VP, VN, D34, D35, D32, D33, D25, D26, D27, D14, D12, D13, GND, VIN
 */
const ESP32_30_DEFINITION: ComponentDefinition = {
  id: 'esp32-devkit-30p',
  name: 'ESP32 DevKit V1 (30 pinos)',
  category: 'Microcontroladores',
  description: '2 fileiras de 15 pinos (3V3, GND, D15..D23 / EN, VP, VN, D34..VIN)',
  widthHoles: 10,
  heightHoles: 15,
  color: '#1e293b',
  accentColor: '#38bdf8',
  pins: createDualRowPins(
    [
      { label: '3V3', type: 'power' },
      { label: 'GND', type: 'gnd' },
      { label: 'D15', type: 'signal' },
      { label: 'D2', type: 'signal' },
      { label: 'D4', type: 'signal' },
      { label: 'RX2', type: 'signal' },
      { label: 'TX2', type: 'signal' },
      { label: 'D5', type: 'signal' },
      { label: 'D18', type: 'signal' },
      { label: 'D19', type: 'signal' },
      { label: 'D21', type: 'signal' },
      { label: 'RX0', type: 'signal' },
      { label: 'TX0', type: 'signal' },
      { label: 'D22', type: 'signal' },
      { label: 'D23', type: 'signal' },
    ],
    [
      { label: 'EN', type: 'signal' },
      { label: 'VP', type: 'signal' },
      { label: 'VN', type: 'signal' },
      { label: 'D34', type: 'signal' },
      { label: 'D35', type: 'signal' },
      { label: 'D32', type: 'signal' },
      { label: 'D33', type: 'signal' },
      { label: 'D25', type: 'signal' },
      { label: 'D26', type: 'signal' },
      { label: 'D27', type: 'signal' },
      { label: 'D14', type: 'signal' },
      { label: 'D12', type: 'signal' },
      { label: 'D13', type: 'signal' },
      { label: 'GND', type: 'gnd' },
      { label: 'VIN', type: 'power' },
    ],
    9,
  ),
};

/**
 * 2. ESP32 DevKitC (38 pinos) — 2 fileiras de 19 pinos
 */
const ESP32_38_DEFINITION: ComponentDefinition = {
  id: 'esp32-devkit-38p',
  name: 'ESP32 DevKitC (38 pinos)',
  category: 'Microcontroladores',
  description: '2 fileiras de 19 pinos com barramentos completos de GPIO e alimentação',
  widthHoles: 10,
  heightHoles: 19,
  color: '#172554',
  accentColor: '#60a5fa',
  pins: createDualRowPins(
    [
      { label: '3V3', type: 'power' },
      { label: 'EN', type: 'signal' },
      { label: 'VP', type: 'signal' },
      { label: 'VN', type: 'signal' },
      { label: 'D34', type: 'signal' },
      { label: 'D35', type: 'signal' },
      { label: 'D32', type: 'signal' },
      { label: 'D33', type: 'signal' },
      { label: 'D25', type: 'signal' },
      { label: 'D26', type: 'signal' },
      { label: 'D27', type: 'signal' },
      { label: 'D14', type: 'signal' },
      { label: 'D12', type: 'signal' },
      { label: 'GND', type: 'gnd' },
      { label: 'D13', type: 'signal' },
      { label: 'SD2', type: 'signal' },
      { label: 'SD3', type: 'signal' },
      { label: 'CMD', type: 'signal' },
      { label: '5V', type: 'power' },
    ],
    [
      { label: 'GND', type: 'gnd' },
      { label: 'D23', type: 'signal' },
      { label: 'D22', type: 'signal' },
      { label: 'TX0', type: 'signal' },
      { label: 'RX0', type: 'signal' },
      { label: 'D21', type: 'signal' },
      { label: 'GND', type: 'gnd' },
      { label: 'D19', type: 'signal' },
      { label: 'D18', type: 'signal' },
      { label: 'D5', type: 'signal' },
      { label: 'D17', type: 'signal' },
      { label: 'D16', type: 'signal' },
      { label: 'D4', type: 'signal' },
      { label: 'D0', type: 'signal' },
      { label: 'D2', type: 'signal' },
      { label: 'D15', type: 'signal' },
      { label: 'SD1', type: 'signal' },
      { label: 'SD0', type: 'signal' },
      { label: 'CLK', type: 'signal' },
    ],
    9,
  ),
};

/**
 * 3. Ponte H TB6612FNG (módulo vermelho) — 2 fileiras de 8 pinos
 * Fileira 1: VM, VCC, GND, AO1, AO2, BO2, BO1, GND
 * Fileira 2: PWMA, AIN2, AIN1, STBY, BIN1, BIN2, PWMB, GND
 */
const TB6612FNG_DEFINITION: ComponentDefinition = {
  id: 'tb6612fng-driver',
  name: 'Ponte H TB6612FNG',
  category: 'Drivers de Motor',
  description: 'Driver duplo para motores DC (2 fileiras de 8 pinos, módulo vermelho)',
  widthHoles: 8,
  heightHoles: 8,
  color: '#7f1d1d',
  accentColor: '#f87171',
  pins: createDualRowPins(
    [
      { label: 'VM', type: 'power' },
      { label: 'VCC', type: 'power' },
      { label: 'GND', type: 'gnd' },
      { label: 'AO1', type: 'motor' },
      { label: 'AO2', type: 'motor' },
      { label: 'BO2', type: 'motor' },
      { label: 'BO1', type: 'motor' },
      { label: 'GND', type: 'gnd' },
    ],
    [
      { label: 'PWMA', type: 'signal' },
      { label: 'AIN2', type: 'signal' },
      { label: 'AIN1', type: 'signal' },
      { label: 'STBY', type: 'signal' },
      { label: 'BIN1', type: 'signal' },
      { label: 'BIN2', type: 'signal' },
      { label: 'PWMB', type: 'signal' },
      { label: 'GND', type: 'gnd' },
    ],
    7,
  ),
};

/**
 * 4. Regulador Step-Down (Mini360 / MP1584) — 4 pinos nos cantos (IN+, IN-, OUT+, OUT-)
 */
const STEP_DOWN_MINI360_DEFINITION: ComponentDefinition = {
  id: 'stepdown-mini360-mp1584',
  name: 'Regulador Step-Down (Mini360 / MP1584)',
  category: 'Energia',
  description: 'Conversor DC-DC Buck compacto com 4 pinos nos cantos (IN+, IN-, OUT+, OUT-)',
  widthHoles: 5,
  heightHoles: 7,
  color: '#14532d',
  accentColor: '#4ade80',
  pins: [
    { id: 'in-pos', col: 0, row: 0, label: 'IN+', type: 'power' },
    { id: 'in-neg', col: 4, row: 0, label: 'IN-', type: 'gnd' },
    { id: 'out-pos', col: 0, row: 6, label: 'OUT+', type: 'power' },
    { id: 'out-neg', col: 4, row: 6, label: 'OUT-', type: 'gnd' },
  ],
};

/**
 * 5a. Borne KRE 2 vias (passo 5.08 mm = ocupa 1 pino a cada 2 furos em 3 furos de largura)
 */
const BORNE_KRE_2_DEFINITION: ComponentDefinition = {
  id: 'borne-kre-2v',
  name: 'Borne KRE 2 vias',
  category: 'Conectores & Chaves',
  description: 'Conector parafusável de 2 terminais para bateria ou motor',
  widthHoles: 3,
  heightHoles: 3,
  color: '#065f46',
  accentColor: '#34d399',
  pins: [
    { id: 'kre2-1', col: 0, row: 1, label: 'V+', type: 'power' },
    { id: 'kre2-2', col: 2, row: 1, label: 'GND', type: 'gnd' },
  ],
};

/**
 * 5b. Borne KRE 4 vias
 */
const BORNE_KRE_4_DEFINITION: ComponentDefinition = {
  id: 'borne-kre-4v',
  name: 'Borne KRE 4 vias',
  category: 'Conectores & Chaves',
  description: 'Bloco terminal parafusável de 4 vias para saídas de motores A/B',
  widthHoles: 7,
  heightHoles: 3,
  color: '#065f46',
  accentColor: '#34d399',
  pins: [
    { id: 'kre4-1', col: 0, row: 1, label: 'M1A', type: 'motor' },
    { id: 'kre4-2', col: 2, row: 1, label: 'M1B', type: 'motor' },
    { id: 'kre4-3', col: 4, row: 1, label: 'M2A', type: 'motor' },
    { id: 'kre4-4', col: 6, row: 1, label: 'M2B', type: 'motor' },
  ],
};

/**
 * 5c. Conector JST 2 pinos
 */
const JST_2P_DEFINITION: ComponentDefinition = {
  id: 'conector-jst-2p',
  name: 'Conector JST 2 pinos',
  category: 'Conectores & Chaves',
  description: 'Conector polarizado de 2 vias (2.54 mm) para bateria LiPo ou sensor',
  widthHoles: 2,
  heightHoles: 2,
  color: '#4c1d95',
  accentColor: '#c084fc',
  pins: [
    { id: 'jst-vcc', col: 0, row: 0, label: 'VCC', type: 'power' },
    { id: 'jst-gnd', col: 1, row: 0, label: 'GND', type: 'gnd' },
  ],
};

/**
 * 5d. Chave Deslizante 3 pinos (SS12D00)
 */
const SLIDE_SWITCH_3P_DEFINITION: ComponentDefinition = {
  id: 'chave-deslizante-3p',
  name: 'Chave Deslizante 3 pinos',
  category: 'Conectores & Chaves',
  description: 'Interruptor liga/desliga 1 polo 2 posições (T1, COM, T2)',
  widthHoles: 3,
  heightHoles: 2,
  color: '#3f3f46',
  accentColor: '#facc15',
  pins: [
    { id: 'sw-1', col: 0, row: 0, label: 'ON', type: 'power' },
    { id: 'sw-2', col: 1, row: 0, label: 'COM', type: 'power' },
    { id: 'sw-3', col: 2, row: 0, label: 'OFF', type: 'signal' },
  ],
};

const DEFAULT_CATALOG_LIST: readonly ComponentDefinition[] = [
  ESP32_30_DEFINITION,
  ESP32_38_DEFINITION,
  TB6612FNG_DEFINITION,
  STEP_DOWN_MINI360_DEFINITION,
  BORNE_KRE_2_DEFINITION,
  BORNE_KRE_4_DEFINITION,
  JST_2P_DEFINITION,
  SLIDE_SWITCH_3P_DEFINITION,
];

export const defaultCatalogRepository: CatalogRepository = {
  getAllDefinitions(): readonly ComponentDefinition[] {
    return DEFAULT_CATALOG_LIST;
  },
};
