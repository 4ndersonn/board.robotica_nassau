export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface ViewportTransform {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
