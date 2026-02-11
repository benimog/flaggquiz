import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import landskapMap from "../svenska-landskap.json";
import landskap from "../landskap.json";
import { useMapZoomPan } from "../hooks/useMapZoomPan";
import GameOverDialog from "./feedback/GameOverDialog";

interface CustomFeature extends Feature {
  rsmKey: string;
  properties: {
    landskap: string;
  };
}

const landskapList = landskap as string[];

const Landskap: React.FC = () => {
  const [shuffledLandskap, setShuffledLandskap] = useState<string[]>([]);
  const [currentLandskap, setCurrentLandskap] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [guessedLandskap, setGuessedLandskap] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
  const [currentAttempts, setCurrentAttempts] = useState<number>(0);
  const [tempLandskapName, setTempLandskapName] = useState<string | null>(null);
  const [skippedLandskap, setSkippedLandskap] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState({ open: false, message: "" });

  const {
    zoom,
    isDragging,
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
  } = useMapZoomPan();

  useEffect(() => {
    const shuffled = [...landskapList].sort(() => Math.random() - 0.5);
    setShuffledLandskap(shuffled);
    setCurrentLandskap(shuffled[0] ?? null);
  }, []);

  const handleLandskapClick = (landskapName: string) => {
    if (!currentLandskap || isDragging || hasMoved || skippedLandskap) return;

    if (landskapName === currentLandskap) {
      setScore((prev) => prev + 1);
      setGuessedLandskap((prev) => new Set(prev).add(landskapName));
      setAttempts((prevAttempts) => ({
        ...prevAttempts,
        [landskapName]: currentAttempts + 1,
      }));
      const nextIndex = shuffledLandskap.indexOf(currentLandskap) + 1;
      if (nextIndex < shuffledLandskap.length) {
        setCurrentLandskap(shuffledLandskap[nextIndex]);
        setCurrentAttempts(0);
      } else {
        setGameOver({
          open: true,
          message: `Du klarade ${score + 1}/${landskapList.length} landskap!`,
        });
      }
    } else {
      setCurrentAttempts((prev) => prev + 1);
      setTempLandskapName(landskapName);
      setTimeout(() => setTempLandskapName(null), 2000);
    }
  };

  const handleSkip = () => {
    if (!currentLandskap || skippedLandskap) return;
    const skipped = currentLandskap;
    setSkippedLandskap(skipped);
    setAttempts((prevAttempts) => ({
      ...prevAttempts,
      [skipped]: currentAttempts,
    }));
    setTimeout(() => {
      setSkippedLandskap(null);
      const nextIndex = shuffledLandskap.indexOf(skipped) + 1;
      if (nextIndex < shuffledLandskap.length) {
        setCurrentLandskap(shuffledLandskap[nextIndex]);
        setCurrentAttempts(0);
      } else {
        setGameOver({
          open: true,
          message: `Du klarade ${score}/${landskapList.length} landskap!`,
        });
      }
    }, 2000);
  };

  const getFillColor = (landskapName: string) => {
    const attemptCount = attempts[landskapName] || 0;
    if (guessedLandskap.has(landskapName)) {
      if (attemptCount === 1) return "#00FF00";
      if (attemptCount === 2) return "#8ec961";
      if (attemptCount === 3) return "#fff200";
      return "#FF0000";
    }
    return "#D6D6DA";
  };

  const handlePlayAgain = () => {
    setGameOver({ open: false, message: "" });
    const shuffled = [...landskapList].sort(() => Math.random() - 0.5);
    setShuffledLandskap(shuffled);
    setCurrentLandskap(shuffled[0] ?? null);
    setScore(0);
    setGuessedLandskap(new Set());
    setAttempts({});
    setCurrentAttempts(0);
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
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "5px" }}>
        {currentLandskap ?? "Laddar..."}
      </Typography>
      <Typography variant="body2" sx={{ m: 0, mb: "10px", opacity: 0.8 }}>
        Poäng: {score}/{landskapList.length}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={handleSkip}
        sx={{ mb: "10px", fontWeight: "bold" }}
      >
        Hoppa över
      </Button>

      {tempLandskapName && (
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
          {tempLandskapName}
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
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [16, 63], scale: 1200 }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={landskapMap}>
              {({ geographies }: { geographies: CustomFeature[] }) =>
                geographies.map((geo) => {
                  const landskapName = geo.properties?.landskap || "Unknown";
                  const fillColor = getFillColor(landskapName);
                  const isSkipped = landskapName === skippedLandskap;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleLandskapClick(landskapName)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: "#FFF",
                          outline: "none",
                          ...(isSkipped ? { animation: "pulseRed 0.5s ease-in-out infinite" } : {}),
                        },
                        hover: {
                          fill: isTouchDevice ? fillColor : (isSkipped ? fillColor : "#F53"),
                          cursor: "pointer",
                          outline: "none",
                          ...(isSkipped ? { animation: "pulseRed 0.5s ease-in-out infinite" } : {}),
                        },
                        pressed: { fill: isTouchDevice ? fillColor : "#E42", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: "10px", mb: "5px" }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= 20}
          sx={{ fontWeight: "bold", fontSize: "0.85rem" }}
        >
          Zooma in
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          sx={{ fontWeight: "bold", fontSize: "0.85rem" }}
        >
          Zooma ut
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleResetZoom}
          sx={{ fontWeight: "bold", fontSize: "0.85rem" }}
        >
          Återställ
        </Button>
      </Stack>
      <Typography variant="body2" sx={{ mt: 0, opacity: 0.8, mb: "5px" }}>
        Tips: {zoomTip}
      </Typography>
      <Typography variant="caption" sx={{ m: 0, opacity: 0.6 }}>
        Zoom: {Math.round(zoom * 100)}%
      </Typography>

      <GameOverDialog
        open={gameOver.open}
        title="Väl spelat!"
        message={gameOver.message}
        onClose={() => setGameOver({ open: false, message: "" })}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
};

export default Landskap;
