import {
  areWirePointsEqual,
  type Wire,
  type WireColorId,
  type WirePoint,
  type WireRoutingStyle,
  type WireSide,
} from '../domain';

export interface ActiveWireDraft {
  readonly waypoints: readonly WirePoint[];
  readonly colorId: WireColorId;
  readonly routingStyle: WireRoutingStyle;
  readonly side: WireSide;
}

export function startWire(params: {
  readonly origin: WirePoint;
  readonly colorId: WireColorId;
  readonly routingStyle: WireRoutingStyle;
  readonly side: WireSide;
}): ActiveWireDraft {
  return {
    waypoints: [params.origin],
    colorId: params.colorId,
    routingStyle: params.routingStyle,
    side: params.side,
  };
}

export function addWaypoint(
  draft: ActiveWireDraft,
  point: WirePoint,
): ActiveWireDraft {
  const lastPoint = draft.waypoints[draft.waypoints.length - 1];
  if (lastPoint && areWirePointsEqual(lastPoint, point)) {
    return draft;
  }

  return {
    ...draft,
    waypoints: [...draft.waypoints, point],
  };
}

export interface FinishWireOutcome {
  readonly ok: boolean;
  readonly createdWire?: Wire;
  readonly nextWires: readonly Wire[];
}

export function finishWire(params: {
  readonly draft: ActiveWireDraft;
  readonly terminalPoint?: WirePoint;
  readonly existingWires: readonly Wire[];
}): FinishWireOutcome {
  const updatedDraft = params.terminalPoint
    ? addWaypoint(params.draft, params.terminalPoint)
    : params.draft;

  if (updatedDraft.waypoints.length < 2) {
    return {
      ok: false,
      nextWires: params.existingWires,
    };
  }

  const createdWire: Wire = {
    id: `wire-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    points: updatedDraft.waypoints,
    colorId: updatedDraft.colorId,
    routingStyle: updatedDraft.routingStyle,
    side: updatedDraft.side,
    note: '',
  };

  return {
    ok: true,
    createdWire,
    nextWires: [...params.existingWires, createdWire],
  };
}

export function updateWire(
  wireId: string,
  patch: Partial<Pick<Wire, 'colorId' | 'routingStyle' | 'side' | 'note'>>,
  existingWires: readonly Wire[],
): readonly Wire[] {
  return existingWires.map((wire) =>
    wire.id === wireId ? { ...wire, ...patch } : wire,
  );
}

export function deleteWire(
  wireId: string,
  existingWires: readonly Wire[],
): readonly Wire[] {
  return existingWires.filter((wire) => wire.id !== wireId);
}
