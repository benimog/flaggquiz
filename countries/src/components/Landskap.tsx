import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import landskapMap from "../svenska-landskap.json";
import landskap from "../landskap.json";
import { useMapZoomPan } from "../hooks/useMapZoomPan";
import { useMapQuizGame, SKIP_REVEAL_MS } from "../hooks/useMapQuizGame";
import { getLandskapName } from "../i18n/landskapNames";
import GameOverDialog from "./feedback/GameOverDialog";

interface CustomFeature extends Feature {
  rsmKey: string;
  properties: {
    landskap: string;
  };
}

const landskapList = landskap as string[];

const Landskap: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [tempLandskapName, setTempLandskapName] = useState<string | null>(null);

  const {
    currentTarget: currentLandskap,
    score,
    total,
    skippedTarget: skippedLandskap,
    gameOver,
    start,
    handleGuess,
    handleSkip,
    playAgain,
    closeGameOver,
    getFillColor,
  } = useMapQuizGame();

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
  } = useMapZoomPan();
  const zoomTip = isTouchDevice ? t("common.zoomTipTouch") : t("common.zoomTipMouse");

  useEffect(() => {
    start(landskapList);
  }, [start]);

  const handleLandskapClick = (landskapName: string) => {
    if (isDragging || hasMoved) return;
    const correct = handleGuess(landskapName);
    if (correct === false) {
      setTempLandskapName(getLandskapName(landskapName, i18n.language));
      setTimeout(() => setTempLandskapName(null), SKIP_REVEAL_MS);
    }
  };

  return (
    <div
      className="states-container"
      style={{
        width: "90%",
        maxWidth: "900px",
        margin: "0 auto",
        flex: 1,
        minHeight: 0,
        paddingTop: "10px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "5px" }}>
        {currentLandskap ? getLandskapName(currentLandskap, i18n.language) : t("common.loading")}
      </Typography>
      <Typography variant="body2" sx={{ m: 0, mb: "10px", opacity: 0.8 }}>
        {t("scores.points")}: {score}/{total}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={handleSkip}
        sx={{ mb: "10px", fontWeight: "bold" }}
      >
        {t("common.skip")}
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
          flex: 1,
          minHeight: 0,
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
            projectionConfig={{ center: [18, 63], scale: 1050 }}
            width={800}
            height={600}
            style={{ width: "100%", height: "100%" }}
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
          {t("common.zoomIn")}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          sx={{ fontWeight: "bold", fontSize: "0.85rem" }}
        >
          {t("common.zoomOut")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleResetZoom}
          sx={{ fontWeight: "bold", fontSize: "0.85rem" }}
        >
          {t("common.reset")}
        </Button>
      </Stack>
      <Typography variant="body2" sx={{ mt: 0, opacity: 0.8, mb: "5px" }}>
        {t("common.tip")}: {zoomTip}
      </Typography>
      <Typography variant="caption" sx={{ m: 0, opacity: 0.6 }}>
        {t("common.zoom")}: {Math.round(zoom * 100)}%
      </Typography>

      <GameOverDialog
        open={gameOver}
        title={t("game.wellPlayed")}
        message={t("game.landskapResult", { score, total })}
        onClose={closeGameOver}
        onPlayAgain={playAgain}
      />
    </div>
  );
};

export default Landskap;
