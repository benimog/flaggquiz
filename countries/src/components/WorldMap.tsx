import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMapZoomPan } from "../hooks/useMapZoomPan";
import { useMapQuizGame, SKIP_REVEAL_MS } from "../hooks/useMapQuizGame";
import { countryToRegion, regionConfigs, getCountryDisplayName, getRegionDisplayName, isRegionSlug, RegionSlug } from "../data/countryRegions";
import GameOverDialog from "./feedback/GameOverDialog";

interface CustomFeature extends Feature {
    rsmKey: string;
    properties: {
        name: string;
    };
}

// Module-level geography data cache — prefetch once, reuse across mounts
let geoDataCache: Record<string, any> | null = null;
let geoDataPromise: Promise<Record<string, any>> | null = null;

export function prefetchGeoData(): Promise<Record<string, any>> {
    if (!geoDataPromise) {
        geoDataPromise = fetch("/world-countries.json")
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                geoDataCache = data;
                return data;
            });
    }
    return geoDataPromise;
}

// Start prefetch immediately when module loads
prefetchGeoData();

// Geometries that are never quiz targets
const EXCLUDED_GEOGRAPHIES = new Set(["Antarctica", "Fr. S. Antarctic Lands"]);

const BACKGROUND_GEO_STYLE = {
    default: { fill: "#F5F5F5", stroke: "#E0E0E0", strokeWidth: 0.3, outline: "none" },
    hover: { fill: "#F5F5F5", stroke: "#E0E0E0", strokeWidth: 0.3, outline: "none", cursor: "default" },
    pressed: { fill: "#F5F5F5", outline: "none" },
};

const COMPOSABLE_MAP_STYLE = { width: "100%", height: "100%" };

const activeStyleCache = new Map<string, {
    default: Record<string, string | number>;
    hover: Record<string, string | number>;
    pressed: Record<string, string | number>;
}>();

function getActiveGeoStyle(fillColor: string, isSkipped: boolean, isTouchDevice: boolean) {
    const key = `${fillColor}|${isSkipped}|${isTouchDevice}`;
    let cached = activeStyleCache.get(key);
    if (!cached) {
        const hoverFill = isTouchDevice ? fillColor : (isSkipped ? fillColor : "#F53");
        cached = {
            default: {
                fill: fillColor,
                stroke: "#FFF",
                strokeWidth: 0.5,
                outline: "none",
                ...(isSkipped ? { animation: "pulseRed 0.5s ease-in-out infinite" } : {}),
            },
            hover: {
                fill: hoverFill,
                cursor: "pointer",
                outline: "none",
                ...(isSkipped ? { animation: "pulseRed 0.5s ease-in-out infinite" } : {}),
            },
            pressed: { fill: isTouchDevice ? fillColor : "#E42", outline: "none" },
        };
        activeStyleCache.set(key, cached);
    }
    return cached;
}

function isInRegion(countryName: string, region: RegionSlug | undefined): boolean {
    if (!region) return true;
    return countryToRegion[countryName] === region;
}

interface MapGeographyLayerProps {
    geoData: Record<string, any>;
    region: RegionSlug | undefined;
    projection: string;
    projectionConfig: { scale: number; center: [number, number]; rotate: [number, number, number] };
    getFillColor: (name: string) => string;
    skippedCountry: string | null;
    onCountryClick: (countryName: string) => void;
    onGeographiesLoad: (geographies: CustomFeature[]) => void;
    isLoaded: boolean;
    isTouchDevice: boolean;
}

const MapGeographyLayer = React.memo<MapGeographyLayerProps>(({
    geoData,
    region,
    projection,
    projectionConfig,
    getFillColor,
    skippedCountry,
    onCountryClick,
    onGeographiesLoad,
    isLoaded,
    isTouchDevice,
}) => {
    return (
        <ComposableMap
            projection={projection}
            projectionConfig={projectionConfig}
            style={COMPOSABLE_MAP_STYLE}
        >
            <Geographies geography={geoData}>
                {({ geographies }: { geographies: CustomFeature[] }) => {
                    if (!isLoaded && geographies.length > 0) {
                        setTimeout(() => onGeographiesLoad(geographies), 0);
                    }

                    return geographies.map((geo) => {
                        const countryName = geo.properties?.name || "Unknown";
                        if (EXCLUDED_GEOGRAPHIES.has(countryName)) return null;

                        if (region && !isInRegion(countryName, region)) {
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    style={BACKGROUND_GEO_STYLE}
                                />
                            );
                        }

                        const fillColor = getFillColor(countryName);
                        const isSkipped = countryName === skippedCountry;
                        return (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onClick={() => onCountryClick(countryName)}
                                style={getActiveGeoStyle(fillColor, isSkipped, isTouchDevice)}
                            />
                        );
                    });
                }}
            </Geographies>
        </ComposableMap>
    );
});

interface WorldMapProps {
    region?: RegionSlug;
}

const WorldMapInner: React.FC<WorldMapProps> = ({ region }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [geoData, setGeoData] = useState<Record<string, any> | null>(geoDataCache);
    const [tempCountryName, setTempCountryName] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const {
        currentTarget: currentCountry,
        score,
        total,
        skippedTarget: skippedCountry,
        gameOver,
        start,
        handleGuess,
        handleSkip,
        playAgain,
        closeGameOver,
        getFillColor,
    } = useMapQuizGame();

    useEffect(() => {
        if (!geoData) {
            prefetchGeoData().then(setGeoData);
        }
    }, [geoData]);

    // Re-initialize the quiz when navigating to a different region
    useEffect(() => {
        setIsLoaded(false);
    }, [region]);

    const regionConfig = region ? regionConfigs[region] : null;

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

    const isDraggingRef = useRef(false);
    const hasMovedRef = useRef(false);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
    useEffect(() => { hasMovedRef.current = hasMoved; }, [hasMoved]);

    const handleGeographiesLoad = useCallback((geographies: CustomFeature[]) => {
        if (!isLoaded && geographies.length > 0) {
            const countryNames = geographies
                .map((geo) => geo.properties.name)
                .filter((name) => name && !EXCLUDED_GEOGRAPHIES.has(name) && isInRegion(name, region));

            start(countryNames);
            setIsLoaded(true);
        }
    }, [isLoaded, region, start]);

    const handleCountryClick = useCallback((countryName: string) => {
        if (isDraggingRef.current || hasMovedRef.current) return;
        const correct = handleGuess(countryName);
        if (correct === false) {
            setTempCountryName(getCountryDisplayName(countryName, i18n.language));
            setTimeout(() => {
                setTempCountryName(null);
            }, SKIP_REVEAL_MS);
        }
    }, [handleGuess, i18n.language]);

    const projection = regionConfig ? "geoMercator" : "geoEqualEarth";
    const projectionConfig = useMemo(() => regionConfig
        ? { scale: regionConfig.scale, center: regionConfig.center as [number, number], rotate: regionConfig.rotate as [number, number, number] }
        : { scale: 160, center: [0, 0] as [number, number], rotate: [-10, 0, 0] as [number, number, number] },
        [regionConfig]
    );

    return (
        <div
            className="states-container"
            style={{
                width: "90%",
                maxWidth: "1400px",
                margin: "0 auto",
                flex: 1,
                minHeight: 0,
                paddingTop: "5px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {regionConfig && region && (
                <Typography variant="body2" sx={{ m: 0, opacity: 0.7 }}>
                    {regionConfig.emoji} {getRegionDisplayName(region, i18n.language)}
                </Typography>
            )}
            {regionConfig && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/varldskarta/regioner")}
                    sx={{ fontWeight: "bold", fontSize: "0.7rem", padding: "2px 8px", mb: "2px" }}
                >
                    {t("quiz.changeContinent")}
                </Button>
            )}

            <Typography variant="h5" component="h1" sx={{ my: "2px", fontSize: "1.4em" }}>
                {currentCountry ? getCountryDisplayName(currentCountry, i18n.language) : t("common.loading")}
            </Typography>
            <Typography variant="body2" sx={{ m: 0, mb: "4px" }}>
                {t("scores.points")}: {score}/{total}
            </Typography>

            <Button
                variant="outlined"
                size="small"
                onClick={handleSkip}
                sx={{ mb: "4px", fontWeight: "bold", fontSize: "0.7rem", padding: "2px 10px" }}
            >
                {t("common.skip")}
            </Button>

            {tempCountryName && (
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
                    {tempCountryName}
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
                    {geoData && <MapGeographyLayer
                        geoData={geoData}
                        region={region}
                        projection={projection}
                        projectionConfig={projectionConfig}
                        getFillColor={getFillColor}
                        skippedCountry={skippedCountry}
                        onCountryClick={handleCountryClick}
                        onGeographiesLoad={handleGeographiesLoad}
                        isLoaded={isLoaded}
                        isTouchDevice={isTouchDevice}
                    />}
                </div>
            </div>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: "4px", mb: "2px" }}>
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
            <Typography variant="body2" sx={{ mt: 0, opacity: 0.8, mb: "2px" }}>
                {t("common.tip")}: {zoomTip}
            </Typography>

            <GameOverDialog
                open={gameOver}
                title={t("game.wellPlayed")}
                message={t("game.mapResult", { score, total })}
                onClose={closeGameOver}
                onPlayAgain={playAgain}
            />
        </div>
    );
};

const WorldMap: React.FC = () => <WorldMapInner />;

export const WorldMapRegion: React.FC = () => {
    const { region } = useParams<{ region: string }>();
    if (!isRegionSlug(region)) {
        return <Navigate to="/varldskarta/regioner" replace />;
    }
    return <WorldMapInner region={region} />;
};

export default WorldMap;
