import { clamp, type ViewportTransform } from '@core/domain';

export const MIN_ZOOM_SCALE = 0.45;
export const MAX_ZOOM_SCALE = 2.6;
export const ZOOM_STEP = 0.15;

export function createInitialViewport(): ViewportTransform {
  return {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

export function applyZoomDelta(
  current: ViewportTransform,
  deltaScale: number,
): ViewportTransform {
  const nextScale = Number(
    clamp(current.scale + deltaScale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE).toFixed(2),
  );

  return {
    ...current,
    scale: nextScale,
  };
}

export function applyPanDelta(
  current: ViewportTransform,
  deltaX: number,
  deltaY: number,
): ViewportTransform {
  return {
    ...current,
    offsetX: Math.round(current.offsetX + deltaX),
    offsetY: Math.round(current.offsetY + deltaY),
  };
}

/**
 * Processa o evento `wheel` separando:
 * - Pinça no trackpad / Ctrl+Scroll (`ctrlKey === true`): realiza Zoom.
 * - Arraste com dois dedos no trackpad (`ctrlKey === false`): realiza Pan (movimentação X e Y).
 */
export function applyWheelGesture(
  current: ViewportTransform,
  params: {
    readonly deltaX: number;
    readonly deltaY: number;
    readonly ctrlKey: boolean;
  },
): ViewportTransform {
  if (params.ctrlKey) {
    const zoomDirection = params.deltaY < 0 ? 1 : -1;
    const fineStep =
      Math.abs(params.deltaY) < 40
        ? Math.max(0.04, Math.min(ZOOM_STEP, Math.abs(params.deltaY) * 0.008))
        : ZOOM_STEP;

    return applyZoomDelta(current, zoomDirection * fineStep);
  }

  return applyPanDelta(current, -params.deltaX, -params.deltaY);
}

export function formatZoomPercentage(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export function toCssTransformStyle(viewport: ViewportTransform): string {
  return `translate3d(${viewport.offsetX}px, ${viewport.offsetY}px, 0) scale(${viewport.scale})`;
}

export function toGridBackgroundPosition(viewport: ViewportTransform): string {
  const x = Math.round(viewport.offsetX);
  const y = Math.round(viewport.offsetY);
  return `${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px`;
}
