import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import usMap from "../us-states.json";
import states from "../states.json";
import { useMapZoomPan } from "../hooks/useMapZoomPan";

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
  const [skippedState, setSkippedState] = useState<string | null>(null);

  const {
    zoom,
    isDragging,
    hasMoved,
    mapContainerRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    containerStyle,
    transformStyle,
    containerHandlers,
    zoomTip,
  } = useMapZoomPan();

  useEffect(() => {
    const shuffled = [...statesList].sort(() => Math.random() - 0.5);
    setShuffledStates(shuffled);
    setCurrentState(shuffled[0] ?? null);
  }, []);

  const handleStateClick = (stateName: string) => {
    if (!currentState || isDragging || hasMoved || skippedState) return;

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
      setTimeout(() => setTempStateName(null), 2000);
    }
  };

  const handleSkip = () => {
    if (!currentState || skippedState) return;
    const skipped = currentState;
    setSkippedState(skipped);
    setAttempts((prevAttempts) => ({
      ...prevAttempts,
      [skipped]: currentAttempts,
    }));
    setTimeout(() => {
      setSkippedState(null);
      const nextIndex = shuffledStates.indexOf(skipped) + 1;
      if (nextIndex < shuffledStates.length) {
        setCurrentState(shuffledStates[nextIndex]);
        setCurrentAttempts(0);
      } else {
        alert(`Väl spelat! Du klarade ${score}/${statesList.length} stater!`);
      }
    }, 2000);
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
      <style>{`
        @keyframes pulseRed {
          0%, 100% { fill: #FF0000; }
          50% { fill: #D6D6DA; }
        }
      `}</style>
      <h1 style={{ margin: "0 0 5px 0" }}>{currentState ?? "Laddar..."}</h1>
      <p style={{ fontSize: "0.8em", margin: "0 0 10px 0" }}>
        Poäng: {score}/{statesList.length}
      </p>

      <Button
        variant="outlined"
        size="small"
        onClick={handleSkip}
        sx={{ marginBottom: "10px", fontWeight: "bold" }}
      >
        Hoppa över
      </Button>

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
          ...containerStyle,
        }}
        {...containerHandlers}
      >
        <div style={transformStyle}>
          <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
            <Geographies geography={usMap}>
              {({ geographies }: { geographies: CustomFeature[] }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties?.NAME || "Unknown";
                  const fillColor = getFillColor(stateName);
                  const isSkipped = stateName === skippedState;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(stateName)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: "#FFF",
                          outline: "none",
                          ...(isSkipped ? { animation: "pulseRed 0.5s ease-in-out infinite" } : {}),
                        },
                        hover: {
                          fill: isSkipped ? fillColor : "#F53",
                          cursor: "pointer",
                          outline: "none",
                          ...(isSkipped ? { animation: "pulseRed 0.5s ease-in-out infinite" } : {}),
                        },
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

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ marginTop: "10px", marginBottom: "5px" }}>
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
      <p style={{ fontSize: "0.8em", marginTop: 0, opacity: 0.8, marginBottom: "5px" }}>
        💡 <strong>Tips:</strong> {zoomTip}
      </p>
      <p style={{ fontSize: "0.7em", margin: "0", opacity: 0.6 }}>Zoom: {Math.round(zoom * 100)}%</p>
    </div>
  );
};

export default States;
