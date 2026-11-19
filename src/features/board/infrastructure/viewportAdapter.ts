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

export function formatZoomPercentage(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export function toCssTransformStyle(viewport: ViewportTransform): string {
  return `translate3d(${viewport.offsetX}px, ${viewport.offsetY}px, 0) scale(${viewport.scale})`;
}
