import { useCallback, useMemo, useState } from 'react';
import {
  type BoardViewMode,
  type DisplayHoleCoordinate,
  type HoleCoordinate,
  toDisplayCoordinate,
} from '../domain';

export interface BoardViewModeController {
  readonly viewMode: BoardViewMode;
  readonly hoveredHole: DisplayHoleCoordinate | null;
  readonly setViewMode: (mode: BoardViewMode) => void;
  readonly hoverHole: (coord: HoleCoordinate | null) => void;
}

export function useBoardViewMode(): BoardViewModeController {
  const [viewMode, setViewModeState] = useState<BoardViewMode>('top');
  const [hoveredLogicalCoord, setHoveredLogicalCoord] =
    useState<HoleCoordinate | null>(null);

  const setViewMode = useCallback((mode: BoardViewMode) => {
    setViewModeState(mode);
  }, []);

  const hoverHole = useCallback((coord: HoleCoordinate | null) => {
    setHoveredLogicalCoord(coord);
  }, []);

  const hoveredHole = useMemo(() => {
    if (!hoveredLogicalCoord) {
      return null;
    }
    return toDisplayCoordinate(hoveredLogicalCoord, viewMode);
  }, [hoveredLogicalCoord, viewMode]);

  return {
    viewMode,
    hoveredHole,
    setViewMode,
    hoverHole,
  };
}
