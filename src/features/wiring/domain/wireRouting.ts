import type { WirePoint, WireRoutingStyle } from './entities';

export function areWirePointsEqual(a: WirePoint, b: WirePoint): boolean {
  return a.col === b.col && a.row === b.row;
}

/**
 * Expande um segmento entre dois pontos no grid conforme o estilo de dobra:
 * - 'free': linha direta de `from` até `to`.
 * - 'orthogonal': dobra de 90° em L (horizontal primeiro, depois vertical).
 */
export function computeSegmentPathPoints(
  from: WirePoint,
  to: WirePoint,
  routingStyle: WireRoutingStyle,
): readonly WirePoint[] {
  if (areWirePointsEqual(from, to)) {
    return [from];
  }

  if (
    routingStyle === 'free' ||
    from.col === to.col ||
    from.row === to.row
  ) {
    return [from, to];
  }

  const cornerPoint: WirePoint = {
    col: to.col,
    row: from.row,
  };

  return [from, cornerPoint, to];
}

/**
 * Constrói a sequência completa de vértices do fio (incluindo dobras de 90°
 * quando `routingStyle === 'orthogonal'`) a partir dos waypoints clicados pelo usuário.
 */
export function buildRoutedWirePath(
  waypoints: readonly WirePoint[],
  routingStyle: WireRoutingStyle,
): readonly WirePoint[] {
  if (waypoints.length <= 1) {
    return waypoints;
  }

  const fullPath: WirePoint[] = [waypoints[0]];

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const current = waypoints[index];
    const next = waypoints[index + 1];
    const segment = computeSegmentPathPoints(current, next, routingStyle);

    for (let sIndex = 1; sIndex < segment.length; sIndex += 1) {
      const candidate = segment[sIndex];
      const lastAdded = fullPath[fullPath.length - 1];
      if (!areWirePointsEqual(lastAdded, candidate)) {
        fullPath.push(candidate);
      }
    }
  }

  return fullPath;
}
