import { useState, useCallback, useMemo, useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

function getDistance(t1: React.Touch | Touch, t2: React.Touch | Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function getMidpoint(t1: React.Touch | Touch, t2: React.Touch | Touch): Point {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

export function useMapZoomPan() {
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [isWheelZooming, setIsWheelZooming] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(1);
  const pinchStartMid = useRef<Point>({ x: 0, y: 0 });
  const pinchStartPan = useRef<Point>({ x: 0, y: 0 });
  const wheelTimeoutRef = useRef<number>(0);

  // Refs to track current zoom/pan for use in the wheel event handler
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);

  // Keep refs in sync with state
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // Clamp pan so the map content always covers the container
  const clampPan = useCallback((p: Point, z: number): Point => {
    const container = mapContainerRef.current;
    if (!container || z <= 1) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const maxPanX = rect.width * (z - 1) / 2;
    const maxPanY = rect.height * (z - 1) / 2;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, p.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, p.y)),
    };
  }, []);

  // Button zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((cur) => {
      const next = Math.min(cur * 1.5, 20);
      const ratio = next / cur;
      setPan((p) => clampPan({ x: p.x * ratio, y: p.y * ratio }, next));
      return next;
    });
  }, [clampPan]);

  const handleZoomOut = useCallback(() => {
    setZoom((cur) => {
      const next = Math.max(cur / 1.5, 1);
      const ratio = next / cur;
      setPan((p) => clampPan({ x: p.x * ratio, y: p.y * ratio }, next));
      return next;
    });
  }, [clampPan]);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom — reads from refs for latest values, disables CSS transition
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      // Mouse position relative to container center
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const curZoom = zoomRef.current;
      const curPan = panRef.current;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const nextZoom = Math.min(Math.max(curZoom * delta, 1), 20);

      let newPan: Point;
      if (nextZoom <= 1) {
        newPan = { x: 0, y: 0 };
      } else {
        const ratio = nextZoom / curZoom;
        newPan = clampPan({
          x: mouseX * (1 - ratio) + curPan.x * ratio,
          y: mouseY * (1 - ratio) + curPan.y * ratio,
        }, nextZoom);
      }

      // Update refs immediately so rapid scroll events chain correctly
      zoomRef.current = nextZoom;
      panRef.current = newPan;

      setZoom(nextZoom);
      setPan(newPan);

      // Disable CSS transition during scroll zoom
      setIsWheelZooming(true);
      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = window.setTimeout(() => {
        setIsWheelZooming(false);
      }, 150);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [clampPan]);

  // Prevent browser pinch-zoom on the map container
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const preventGesture = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchmove", preventGesture, { passive: false });
    return () => container.removeEventListener("touchmove", preventGesture);
  }, []);

  // Mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setHasMoved(false);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setHasMoved(true);
        setPan(clampPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }, zoom));
      }
    },
    [isDragging, dragStart, zoom, clampPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 50);
  }, []);

  // Touch handlers (1-finger pan + 2-finger pinch-to-zoom)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Start pinch
        setIsPinching(true);
        setIsDragging(false);
        setHasMoved(true);
        const dist = getDistance(e.touches[0], e.touches[1]);
        pinchStartDist.current = dist;
        pinchStartZoom.current = zoom;
        pinchStartMid.current = getMidpoint(e.touches[0], e.touches[1]);
        pinchStartPan.current = { ...pan };
      } else if (e.touches.length === 1 && !isPinching) {
        // Single-finger pan (only when zoomed in)
        if (zoom > 1) {
          const touch = e.touches[0];
          setIsDragging(true);
          setHasMoved(false);
          setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        }
      }
    },
    [zoom, pan, isPinching]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        const dist = getDistance(e.touches[0], e.touches[1]);
        if (pinchStartDist.current < 1) return; // guard zero-distance

        const container = mapContainerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const containerCenter: Point = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const ratio = dist / pinchStartDist.current;
        const newZoom = Math.min(Math.max(pinchStartZoom.current * ratio, 1), 20);

        const currentMid = getMidpoint(e.touches[0], e.touches[1]);

        // Focal-point zoom: zoom toward the pinch center
        const focalX = pinchStartMid.current.x - containerCenter.x;
        const focalY = pinchStartMid.current.y - containerCenter.y;
        const zoomScale = newZoom / pinchStartZoom.current;

        const driftX = currentMid.x - pinchStartMid.current.x;
        const driftY = currentMid.y - pinchStartMid.current.y;

        let newPanX = focalX + (pinchStartPan.current.x - focalX) * zoomScale + driftX;
        let newPanY = focalY + (pinchStartPan.current.y - focalY) * zoomScale + driftY;

        // If zoom clamps back to 1, reset pan
        if (newZoom <= 1) {
          newPanX = 0;
          newPanY = 0;
        }

        setZoom(newZoom);
        setPan(clampPan({ x: newPanX, y: newPanY }, newZoom));
        setHasMoved(true);
      } else if (isDragging && zoom > 1 && e.touches.length === 1) {
        const touch = e.touches[0];
        setHasMoved(true);
        setPan(clampPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y }, zoom));
      }
    },
    [isPinching, isDragging, dragStart, zoom, clampPan]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isPinching) {
        if (e.touches.length === 1) {
          // One finger left after pinch -> transition to single-finger pan
          setIsPinching(false);
          if (zoom > 1) {
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
          } else {
            setIsDragging(false);
          }
        } else if (e.touches.length === 0) {
          setIsPinching(false);
          setIsDragging(false);
          setTimeout(() => setHasMoved(false), 50);
        }
      } else {
        setIsDragging(false);
        setTimeout(() => setHasMoved(false), 50);
      }
    },
    [isPinching, zoom, pan]
  );

  // Container style properties (memoized for stable references)
  const containerStyle = useMemo(() => ({
    cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
    touchAction: "none" as const,
  }), [zoom, isDragging]);

  const transformStyle = useMemo(() => ({
    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
    transformOrigin: "center center",
    transition: isDragging || isPinching || isWheelZooming ? "none" : "transform 0.2s ease-out",
  }), [zoom, pan.x, pan.y, isDragging, isPinching, isWheelZooming]);

  const containerHandlers = useMemo(() => ({
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }), [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const zoomTip = isTouchDevice
    ? "Nyp för att zooma. Dra kartan för att panorera."
    : "Scrolla för att zooma. Dra kartan för att panorera.";

  return {
    zoom,
    pan,
    isDragging,
    isPinching,
    hasMoved,
    isTouchDevice,
    mapContainerRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    containerStyle,
    transformStyle,
    containerHandlers,
    zoomTip,
  };
}
