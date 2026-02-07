import React, { useEffect, useState, useCallback, useRef } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import usMap from "../us-states.json";
import states from "../states.json";

interface CustomFeature extends Feature {
  rsmKey: string;
  properties: {
    NAME: string;
  };
}

const statesList = states as string[];

const States: React.FC = () => {
  const [shuffledStates, setShuffledStates] = useState<string[]>([]);
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [guessedStates, setGuessedStates] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
  const [currentAttempts, setCurrentAttempts] = useState<number>(0);
  const [tempStateName, setTempStateName] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shuffled = [...statesList].sort(() => Math.random() - 0.5);
    setShuffledStates(shuffled);
    setCurrentState(shuffled[0] ?? null);
  }, []);

  const handleStateClick = (stateName: string) => {
    if (!currentState || isDragging || hasMoved) return;

    if (stateName === currentState) {
      setScore((prev) => prev + 1);
      setGuessedStates((prev) => new Set(prev).add(stateName));
      setAttempts((prevAttempts) => ({
        ...prevAttempts,
        [stateName]: currentAttempts + 1,
      }));
      const nextIndex = shuffledStates.indexOf(currentState) + 1;
      if (nextIndex < shuffledStates.length) {
        setCurrentState(shuffledStates[nextIndex]);
        setCurrentAttempts(0);
      } else {
        alert(`Väl spelat! Du klarade ${score + 1}/${statesList.length} stater!`);
      }
    } else {
      setCurrentAttempts((prev) => prev + 1);
      setTempStateName(stateName);
      setTimeout(() => setTempStateName(null), 3000);
    }
  };

  const getFillColor = (stateName: string) => {
    const attemptCount = attempts[stateName] || 0;
    if (guessedStates.has(stateName)) {
      if (attemptCount === 1) return "#00FF00";
      if (attemptCount === 2) return "#8ec961";
      if (attemptCount === 3) return "#fff200";
      return "#FF0000";
    }
    return "#D6D6DA";
  };

  const handleZoomIn = useCallback(() => {
    setZoom((currentZoom) => {
      const newZoom = Math.min(currentZoom * 1.5, 20);
      const zoomRatio = newZoom / currentZoom;
      setPan((p) => ({ x: p.x * zoomRatio, y: p.y * zoomRatio }));
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((currentZoom) => {
      const newZoom = Math.max(currentZoom / 1.5, 1);
      const zoomRatio = newZoom / currentZoom;
      setPan((p) => ({ x: p.x * zoomRatio, y: p.y * zoomRatio }));
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;

      setZoom((currentZoom) => {
        const newZoom = Math.min(Math.max(currentZoom * delta, 1), 20);
        const zoomRatio = newZoom / currentZoom;
        setPan((p) => ({ x: p.x * zoomRatio, y: p.y * zoomRatio }));
        return newZoom;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

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
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 50);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoom > 1 && e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setHasMoved(false);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      }
    },
    [zoom, pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && zoom > 1 && e.touches.length === 1) {
        const touch = e.touches[0];
        setHasMoved(true);
        setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
      }
    },
    [isDragging, dragStart, zoom]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 50);
  }, []);

  return (
    <div
      className="states-container"
      style={{
        width: "90%",
        maxWidth: "900px",
        margin: "0 auto",
        paddingTop: "10px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: "0 0 5px 0" }}>{currentState ?? "Laddar..."}</h1>
      <p style={{ fontSize: "0.8em", margin: "0 0 10px 0" }}>
        Poäng: {score}/{statesList.length}
      </p>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ marginBottom: "10px" }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= 20}
          sx={{ fontWeight: "bold", fontSize: "1rem" }}
        >
          🔍+ Zooma in
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          sx={{ fontWeight: "bold", fontSize: "1rem" }}
        >
          🔍- Zooma ut
        </Button>
        <Button variant="outlined" size="small" onClick={handleResetZoom} sx={{ fontWeight: "bold" }}>
          ↺ Återställ
        </Button>
      </Stack>
      <p style={{ fontSize: "0.8em", marginTop: 0, opacity: 0.8, marginBottom: "10px" }}>
        💡 <strong>Tips:</strong> Använd knapparna ovan eller scroll för att zooma. Dra kartan för att panorera.
      </p>

      {tempStateName && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {tempStateName}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          overflow: "hidden",
          border: "2px solid #555",
          borderRadius: "8px",
          cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          touchAction: zoom > 1 ? "none" : "auto",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
            <Geographies geography={usMap}>
              {({ geographies }: { geographies: CustomFeature[] }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties?.NAME || "Unknown";
                  const fillColor = getFillColor(stateName);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(stateName)}
                      style={{
                        default: { fill: fillColor, stroke: "#FFF", outline: "none" },
                        hover: { fill: "#F53", cursor: "pointer", outline: "none" },
                        pressed: { fill: "#E42", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <p style={{ fontSize: "0.7em", margin: "5px 0 0 0", opacity: 0.6 }}>Zoom: {Math.round(zoom * 100)}%</p>
    </div>
  );
};

export default States;
