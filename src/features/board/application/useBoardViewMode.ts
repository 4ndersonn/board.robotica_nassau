import { useCallback, useMemo, useState } from 'react';
import {
  type BoardViewMode,
  type DisplayHoleCoordinate,
  type HoleCoordinate,
  toDisplayCoordinate,
} from '../domain';

export interface BoardViewModeController {
  readonly viewMode: BoardViewMode;
  readonly isMirroredBottom: boolean;
  readonly hoveredHole: DisplayHoleCoordinate | null;
  readonly setViewMode: (mode: BoardViewMode) => void;
  readonly toggleViewMode: () => void;
  readonly hoverHole: (coord: HoleCoordinate | null) => void;
}

export function useBoardViewMode(): BoardViewModeController {
  const [viewMode, setViewModeState] = useState<BoardViewMode>('top');
  const [hoveredLogicalCoord, setHoveredLogicalCoord] =
    useState<HoleCoordinate | null>(null);

  const setViewMode = useCallback((mode: BoardViewMode) => {
    setViewModeState(mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewModeState((prev) => (prev === 'top' ? 'bottom' : 'top'));
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
    isMirroredBottom: viewMode === 'bottom',
    hoveredHole,
    setViewMode,
    toggleViewMode,
    hoverHole,
  };
}
