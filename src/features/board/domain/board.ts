/**
 * Modo de visualização da placa 5x7 cm:
 * - 'top': Vista Superior (Lado dos Componentes / FR4 Verde)
 * - 'bottom': Vista Inferior Espelhada (Lado da Solda / Fenolite Cobre)
 */
export type BoardViewMode = 'top' | 'bottom';

/**
 * Coordenada lógica interna (sempre referenciada na Vista Superior).
 * - col: 0..17 (correspondente às colunas 1..18)
 * - row: 0..23 (correspondente às linhas A..X)
 */
export interface HoleCoordinate {
  readonly col: number;
  readonly row: number;
}

/**
 * Coordenada projetada para exibição em tela conforme o modo de vista atual.
 */
export interface DisplayHoleCoordinate {
  readonly logical: HoleCoordinate;
  readonly displayCol: number;
  readonly displayRow: number;
  readonly rowLabel: string;
  readonly colLabel: string;
  readonly fullLabel: string;
}

export interface BoardSpec {
  readonly id: string;
  readonly name: string;
  readonly physicalWidthMm: number;
  readonly physicalHeightMm: number;
  readonly pitchMm: number;
  readonly columns: number;
  readonly rows: number;
  readonly pitchPx: number;
  readonly paddingPx: number;
  readonly padRadiusPx: number;
  readonly holeRadiusPx: number;
}

export const BOARD_5X7_SPEC: BoardSpec = {
  id: 'perfboard-5x7-standard',
  name: 'Placa Perfurada Universal 5×7 cm',
  physicalWidthMm: 50,
  physicalHeightMm: 70,
  pitchMm: 2.54,
  columns: 18,
  rows: 24,
  pitchPx: 26,
  paddingPx: 52,
  padRadiusPx: 9,
  holeRadiusPx: 4.2,
};

const ROW_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWX';

/**
 * Espelha o índice de coluna no eixo X para a Vista Inferior.
 * Regra de domínio: (totalColumns - 1) - col => 17 - col para 18 colunas.
 */
export function mirrorX(
  col: number,
  totalColumns: number = BOARD_5X7_SPEC.columns,
): number {
  return totalColumns - 1 - col;
}

export function formatRowLabel(row: number): string {
  return ROW_ALPHABET[row] ?? '?';
}

export function formatColLabel(col: number): string {
  return String(col + 1);
}

export function formatHoleLabel(coord: HoleCoordinate): string {
  return `${formatRowLabel(coord.row)}${formatColLabel(coord.col)}`;
}

/**
 * Função pura exigida pela arquitetura:
 * Converte uma coordenada lógica (sempre armazenada na Vista Superior: col 0..17, row 0..23)
 * para sua coordenada de exibição na vista atual ('top' ou 'bottom'),
 * espelhando o eixo X na Vista Inferior (17 - col).
 */
export function toDisplayCoordinate(
  coord: HoleCoordinate,
  viewMode: BoardViewMode,
  spec: BoardSpec = BOARD_5X7_SPEC,
): DisplayHoleCoordinate {
  const displayCol =
    viewMode === 'bottom' ? mirrorX(coord.col, spec.columns) : coord.col;
  const displayRow = coord.row;
  const rowLabel = formatRowLabel(coord.row);
  const colLabel = formatColLabel(coord.col);

  return {
    logical: coord,
    displayCol,
    displayRow,
    rowLabel,
    colLabel,
    fullLabel: `${rowLabel}${colLabel}`,
  };
}

/**
 * Gera todas as 432 coordenadas da matriz 18x24 já projetadas para a vista ativa.
 */
export function generateBoardGrid(
  viewMode: BoardViewMode,
  spec: BoardSpec = BOARD_5X7_SPEC,
): readonly DisplayHoleCoordinate[] {
  const result: DisplayHoleCoordinate[] = [];

  for (let row = 0; row < spec.rows; row += 1) {
    for (let col = 0; col < spec.columns; col += 1) {
      result.push(toDisplayCoordinate({ col, row }, viewMode, spec));
    }
  }

  return result;
}

/**
 * Retorna os rótulos das colunas na ordem visual da esquerda para a direita.
 * - Vista Superior: 1 .. 18
 * - Vista Inferior Espelhada: 18 .. 1
 */
export function getOrderedColumnHeaders(
  viewMode: BoardViewMode,
  spec: BoardSpec = BOARD_5X7_SPEC,
): readonly { readonly displayCol: number; readonly label: string }[] {
  return Array.from({ length: spec.columns }, (_, displayCol) => {
    const logicalCol =
      viewMode === 'bottom' ? mirrorX(displayCol, spec.columns) : displayCol;
    return {
      displayCol,
      label: formatColLabel(logicalCol),
    };
  });
}

/**
 * Retorna os rótulos das linhas (A .. X) de cima para baixo.
 */
export function getOrderedRowHeaders(
  spec: BoardSpec = BOARD_5X7_SPEC,
): readonly { readonly displayRow: number; readonly label: string }[] {
  return Array.from({ length: spec.rows }, (_, displayRow) => ({
    displayRow,
    label: formatRowLabel(displayRow),
  }));
}

export interface BoardSvgMetrics {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly originXPx: number;
  readonly originYPx: number;
}

export function calculateBoardSvgMetrics(
  spec: BoardSpec = BOARD_5X7_SPEC,
): BoardSvgMetrics {
  const gridWidthPx = (spec.columns - 1) * spec.pitchPx;
  const gridHeightPx = (spec.rows - 1) * spec.pitchPx;

  return {
    widthPx: gridWidthPx + spec.paddingPx * 2,
    heightPx: gridHeightPx + spec.paddingPx * 2,
    originXPx: spec.paddingPx,
    originYPx: spec.paddingPx,
  };
}

export function getHoleCenterPx(
  displayCol: number,
  displayRow: number,
  spec: BoardSpec = BOARD_5X7_SPEC,
): { readonly cx: number; readonly cy: number } {
  return {
    cx: spec.paddingPx + displayCol * spec.pitchPx,
    cy: spec.paddingPx + displayRow * spec.pitchPx,
  };
}
