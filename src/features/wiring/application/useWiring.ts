import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BoardViewMode, HoleCoordinate } from '@features/board/domain';
import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import {
  resolveNetlist,
  type EditorToolMode,
  type NetlistEntry,
  type Wire,
  type WireColor,
  type WireColorId,
  type WirePoint,
  type WireRoutingStyle,
  type WireSide,
} from '../domain';
import {
  WIRE_COLOR_MAP,
  WIRE_COLOR_PRESETS,
} from '../infrastructure/wireColorPresets';
import {
  addWaypoint,
  deleteWire,
  finishWire,
  startWire,
  updateWire,
  type ActiveWireDraft,
} from './wireUseCases';

export interface WiringController {
  readonly toolMode: EditorToolMode;
  readonly setToolMode: (mode: EditorToolMode) => void;
  readonly activeColorId: WireColorId;
  readonly setActiveColorId: (colorId: WireColorId) => void;
  readonly activeRoutingStyle: WireRoutingStyle;
  readonly setActiveRoutingStyle: (style: WireRoutingStyle) => void;
  readonly showOppositeSideWires: boolean;
  readonly toggleShowOppositeSideWires: () => void;
  readonly colorPresets: readonly WireColor[];
  readonly colorMap: ReadonlyMap<WireColorId, WireColor>;
  readonly wires: readonly Wire[];
  readonly replaceWires: (next: readonly Wire[]) => void;
  readonly activeDraft: ActiveWireDraft | null;
  readonly selectedWireId: string | null;
  readonly selectedWire: Wire | null;
  readonly hoveredWireId: string | null;
  readonly setHoveredWireId: (wireId: string | null) => void;
  readonly selectWire: (wireId: string | null) => void;
  readonly handleHoleClickInWireMode: (
    coord: HoleCoordinate,
    isEndpointPin: boolean,
  ) => void;
  readonly handleHoleDoubleClickInWireMode: (coord: HoleCoordinate) => void;
  readonly commitActiveDraft: (terminalPoint?: WirePoint) => void;
  readonly cancelActiveDraft: () => void;
  readonly updateSelectedWireColor: (colorId: WireColorId) => void;
  readonly updateSelectedWireRouting: (routingStyle: WireRoutingStyle) => void;
  readonly updateSelectedWireSide: (side: WireSide) => void;
  readonly updateSelectedWireNote: (note: string) => void;
  readonly deleteSelectedWire: () => void;
  readonly netlist: readonly NetlistEntry[];
}

export function useWiring(params: {
  readonly currentViewMode: BoardViewMode;
  readonly placedComponents: readonly PlacedComponent[];
  readonly catalogMap: ReadonlyMap<string, ComponentDefinition>;
  readonly isComponentPlacementActive: boolean;
  readonly onExitComponentPlacement: () => void;
  readonly onClearComponentSelection: () => void;
}): WiringController {
  const {
    currentViewMode,
    placedComponents,
    catalogMap,
    isComponentPlacementActive,
    onExitComponentPlacement,
    onClearComponentSelection,
  } = params;

  const [toolMode, setToolModeState] = useState<EditorToolMode>('select');
  const [activeColorId, setActiveColorId] = useState<WireColorId>('red');
  const [activeRoutingStyle, setActiveRoutingStyle] =
    useState<WireRoutingStyle>('orthogonal');
  const [showOppositeSideWires, setShowOppositeSideWires] = useState(true);

  const [wires, setWires] = useState<readonly Wire[]>([]);
  const [activeDraft, setActiveDraft] = useState<ActiveWireDraft | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);

  useEffect(() => {
    if (isComponentPlacementActive) {
      setToolModeState('select');
      setActiveDraft(null);
      setSelectedWireId(null);
    }
  }, [isComponentPlacementActive]);

  useEffect(() => {
    setActiveDraft((prev) =>
      prev ? { ...prev, side: currentViewMode } : null,
    );
  }, [currentViewMode]);

  const setToolMode = useCallback(
    (mode: EditorToolMode) => {
      setToolModeState(mode);
      if (mode === 'wire' || mode === 'hand') {
        onExitComponentPlacement();
        onClearComponentSelection();
        setSelectedWireId(null);
        setActiveDraft(null);
      } else {
        setActiveDraft(null);
      }
    },
    [onClearComponentSelection, onExitComponentPlacement],
  );

  const handleSetColorId = useCallback((colorId: WireColorId) => {
    setActiveColorId(colorId);
    setActiveDraft((prev) => (prev ? { ...prev, colorId } : null));
  }, []);

  const handleSetRoutingStyle = useCallback((routingStyle: WireRoutingStyle) => {
    setActiveRoutingStyle(routingStyle);
    setActiveDraft((prev) => (prev ? { ...prev, routingStyle } : null));
  }, []);

  const toggleShowOppositeSideWires = useCallback(() => {
    setShowOppositeSideWires((prev) => !prev);
  }, []);

  const cancelActiveDraft = useCallback(() => {
    setActiveDraft(null);
  }, []);

  const commitActiveDraft = useCallback(
    (terminalPoint?: WirePoint) => {
      if (!activeDraft) {
        return;
      }

      const outcome = finishWire({
        draft: activeDraft,
        terminalPoint,
        existingWires: wires,
      });

      if (outcome.ok && outcome.createdWire) {
        setWires(outcome.nextWires);
        setSelectedWireId(outcome.createdWire.id);
      }

      setActiveDraft(null);
    },
    [activeDraft, wires],
  );

  const handleHoleClickInWireMode = useCallback(
    (coord: HoleCoordinate, isEndpointPin: boolean) => {
      if (toolMode !== 'wire') {
        return;
      }

      const point: WirePoint = { col: coord.col, row: coord.row };

      if (!activeDraft) {
        setActiveDraft(
          startWire({
            origin: point,
            colorId: activeColorId,
            routingStyle: activeRoutingStyle,
            side: currentViewMode,
          }),
        );
        return;
      }

      const lastPoint =
        activeDraft.waypoints[activeDraft.waypoints.length - 1];

      const isClickingSameLastHole =
        lastPoint.col === point.col && lastPoint.row === point.row;

      if (
        (isClickingSameLastHole && activeDraft.waypoints.length >= 2) ||
        (isEndpointPin && !isClickingSameLastHole)
      ) {
        commitActiveDraft(point);
        return;
      }

      setActiveDraft((prev) => (prev ? addWaypoint(prev, point) : null));
    },
    [
      activeColorId,
      activeDraft,
      activeRoutingStyle,
      commitActiveDraft,
      currentViewMode,
      toolMode,
    ],
  );

  const handleHoleDoubleClickInWireMode = useCallback(
    (coord: HoleCoordinate) => {
      if (toolMode !== 'wire' || !activeDraft) {
        return;
      }

      commitActiveDraft({ col: coord.col, row: coord.row });
    },
    [activeDraft, commitActiveDraft, toolMode],
  );

  const selectWire = useCallback(
    (wireId: string | null) => {
      setSelectedWireId(wireId);
      if (wireId) {
        onClearComponentSelection();
      }
    },
    [onClearComponentSelection],
  );

  const updateSelectedWireColor = useCallback(
    (colorId: WireColorId) => {
      if (!selectedWireId) {
        return;
      }
      setWires((prev) => updateWire(selectedWireId, { colorId }, prev));
    },
    [selectedWireId],
  );

  const updateSelectedWireRouting = useCallback(
    (routingStyle: WireRoutingStyle) => {
      if (!selectedWireId) {
        return;
      }
      setWires((prev) => updateWire(selectedWireId, { routingStyle }, prev));
    },
    [selectedWireId],
  );

  const updateSelectedWireSide = useCallback(
    (side: WireSide) => {
      if (!selectedWireId) {
        return;
      }
      setWires((prev) => updateWire(selectedWireId, { side }, prev));
    },
    [selectedWireId],
  );

  const updateSelectedWireNote = useCallback(
    (note: string) => {
      if (!selectedWireId) {
        return;
      }
      setWires((prev) => updateWire(selectedWireId, { note }, prev));
    },
    [selectedWireId],
  );

  const deleteSelectedWire = useCallback(() => {
    if (!selectedWireId) {
      return;
    }
    setWires((prev) => deleteWire(selectedWireId, prev));
    setSelectedWireId(null);
    setHoveredWireId(null);
  }, [selectedWireId]);

  const replaceWires = useCallback((next: readonly Wire[]) => {
    setWires(next);
    setSelectedWireId(null);
    setActiveDraft(null);
    setHoveredWireId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (
        activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        activeTag === 'SELECT'
      ) {
        return;
      }

      if (event.key === 'v' || event.key === 'V') {
        event.preventDefault();
        setToolMode('select');
      } else if (event.key === 'w' || event.key === 'W') {
        event.preventDefault();
        setToolMode('wire');
      } else if (event.key === 'h' || event.key === 'H') {
        event.preventDefault();
        setToolMode('hand');
      } else if (event.key === 'Enter' && activeDraft) {
        event.preventDefault();
        commitActiveDraft();
      } else if (event.key === 'Escape') {
        if (activeDraft) {
          event.preventDefault();
          cancelActiveDraft();
        } else if (selectedWireId) {
          setSelectedWireId(null);
        }
      } else if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedWireId
      ) {
        event.preventDefault();
        deleteSelectedWire();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeDraft,
    cancelActiveDraft,
    commitActiveDraft,
    deleteSelectedWire,
    selectedWireId,
    setToolMode,
  ]);

  const selectedWire = useMemo(
    () => wires.find((wire) => wire.id === selectedWireId) ?? null,
    [selectedWireId, wires],
  );

  const netlist = useMemo(
    () =>
      resolveNetlist(wires, placedComponents, catalogMap, WIRE_COLOR_MAP),
    [catalogMap, placedComponents, wires],
  );

  return {
    toolMode,
    setToolMode,
    activeColorId,
    setActiveColorId: handleSetColorId,
    activeRoutingStyle,
    setActiveRoutingStyle: handleSetRoutingStyle,
    showOppositeSideWires,
    toggleShowOppositeSideWires,
    colorPresets: WIRE_COLOR_PRESETS,
    colorMap: WIRE_COLOR_MAP,
    wires,
    replaceWires,
    activeDraft,
    selectedWireId,
    selectedWire,
    hoveredWireId,
    setHoveredWireId,
    selectWire,
    handleHoleClickInWireMode,
    handleHoleDoubleClickInWireMode,
    commitActiveDraft,
    cancelActiveDraft,
    updateSelectedWireColor,
    updateSelectedWireRouting,
    updateSelectedWireSide,
    updateSelectedWireNote,
    deleteSelectedWire,
    netlist,
  };
}
