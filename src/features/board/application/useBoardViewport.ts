import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import type { Point2D, ViewportTransform } from '@core/domain';
import {
  applyZoomDelta,
  createInitialViewport,
  formatZoomPercentage,
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  toCssTransformStyle,
  ZOOM_STEP,
} from '../infrastructure/viewportAdapter';

export interface BoardViewportController {
  readonly viewport: ViewportTransform;
  readonly zoomPercentageLabel: string;
  readonly cssTransform: string;
  readonly isPanning: boolean;
  readonly isSpacePressed: boolean;
  readonly canZoomIn: boolean;
  readonly canZoomOut: boolean;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly resetViewport: () => void;
  readonly handleWheel: (event: ReactWheelEvent<HTMLElement>) => void;
  readonly handleMouseDown: (event: ReactMouseEvent<HTMLElement>) => void;
  readonly handleMouseMove: (event: ReactMouseEvent<HTMLElement>) => void;
  readonly handleMouseUpOrLeave: () => void;
}

export function useBoardViewport(): BoardViewportController {
  const [viewport, setViewport] = useState<ViewportTransform>(
    createInitialViewport,
  );
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panOriginRef = useRef<Point2D | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          event.preventDefault();
          setIsSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
        panOriginRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const zoomIn = useCallback(() => {
    setViewport((prev) => applyZoomDelta(prev, ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((prev) => applyZoomDelta(prev, -ZOOM_STEP));
  }, []);

  const resetViewport = useCallback(() => {
    setViewport(createInitialViewport());
  }, []);

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setViewport((prev) => applyZoomDelta(prev, direction * ZOOM_STEP));
  }, []);

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const isMiddleClick = event.button === 1;
      const isSpaceLeftClick = isSpacePressed && event.button === 0;

      if (isMiddleClick || isSpaceLeftClick) {
        event.preventDefault();
        setIsPanning(true);
        panOriginRef.current = {
          x: event.clientX - viewport.offsetX,
          y: event.clientY - viewport.offsetY,
        };
      }
    },
    [isSpacePressed, viewport.offsetX, viewport.offsetY],
  );

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (!isPanning || !panOriginRef.current) {
        return;
      }

      const nextOffsetX = event.clientX - panOriginRef.current.x;
      const nextOffsetY = event.clientY - panOriginRef.current.y;

      setViewport((prev) => ({
        ...prev,
        offsetX: nextOffsetX,
        offsetY: nextOffsetY,
      }));
    },
    [isPanning],
  );

  const handleMouseUpOrLeave = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panOriginRef.current = null;
    }
  }, [isPanning]);

  return {
    viewport,
    zoomPercentageLabel: formatZoomPercentage(viewport.scale),
    cssTransform: toCssTransformStyle(viewport),
    isPanning,
    isSpacePressed,
    canZoomIn: viewport.scale < MAX_ZOOM_SCALE,
    canZoomOut: viewport.scale > MIN_ZOOM_SCALE,
    zoomIn,
    zoomOut,
    resetViewport,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  };
}
