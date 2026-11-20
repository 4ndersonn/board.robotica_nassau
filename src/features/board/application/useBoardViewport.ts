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
  applyWheelGesture,
  applyZoomDelta,
  createInitialViewport,
  formatZoomPercentage,
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  toCssTransformStyle,
  toGridBackgroundPosition,
  ZOOM_STEP,
} from '../domain';

export interface BoardViewportController {
  readonly viewport: ViewportTransform;
  readonly zoomPercentageLabel: string;
  readonly cssTransform: string;
  readonly gridBackgroundPosition: string;
  readonly isPanning: boolean;
  readonly isSpacePressed: boolean;
  readonly isHandToolActive: boolean;
  readonly isHandNavigationMode: boolean;
  readonly setIsHandToolActive: (active: boolean) => void;
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
  const [isHandToolActive, setIsHandToolActive] = useState(false);
  const panOriginRef = useRef<Point2D | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const isHandNavigationMode = isHandToolActive || isSpacePressed;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        const activeTag = document.activeElement?.tagName;
        if (
          activeTag !== 'INPUT' &&
          activeTag !== 'TEXTAREA' &&
          activeTag !== 'SELECT'
        ) {
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

  useEffect(() => {
    const preventBrowserPinchZoom = (event: WheelEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        containerRef.current.contains(target)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', preventBrowserPinchZoom, {
      passive: false,
    });
    return () => {
      window.removeEventListener('wheel', preventBrowserPinchZoom);
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
    setIsPanning(false);
    panOriginRef.current = null;
  }, []);

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLElement>) => {
    containerRef.current = event.currentTarget;
    event.preventDefault();
    setViewport((prev) =>
      applyWheelGesture(prev, {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        ctrlKey: event.ctrlKey || event.metaKey,
      }),
    );
  }, []);

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      containerRef.current = event.currentTarget;
      const isMiddleClick = event.button === 1;
      const isHandLeftClick = isHandNavigationMode && event.button === 0;

      if (isMiddleClick || isHandLeftClick) {
        event.preventDefault();
        event.stopPropagation();
        setIsPanning(true);
        panOriginRef.current = {
          x: event.clientX - viewport.offsetX,
          y: event.clientY - viewport.offsetY,
        };
      }
    },
    [isHandNavigationMode, viewport.offsetX, viewport.offsetY],
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
    gridBackgroundPosition: toGridBackgroundPosition(viewport),
    isPanning,
    isSpacePressed,
    isHandToolActive,
    isHandNavigationMode,
    setIsHandToolActive,
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
