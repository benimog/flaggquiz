import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMapZoomPan } from "../hooks/useMapZoomPan";
import { countryToRegion, regionConfigs, countryNamesSwedish, RegionSlug } from "../data/countryRegions";
import GameOverDialog from "./feedback/GameOverDialog";

interface CustomFeature extends Feature {
    rsmKey: string;
    properties: {
        name: string;
    };
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BACKGROUND_GEO_STYLE = {
    default: { fill: "#F5F5F5", stroke: "#E0E0E0", strokeWidth: 0.3, outline: "none" },
    hover: { fill: "#F5F5F5", stroke: "#E0E0E0", strokeWidth: 0.3, outline: "none", cursor: "default" },
    pressed: { fill: "#F5F5F5", outline: "none" },
};

const COMPOSABLE_MAP_STYLE = { width: "100%", height: "auto" };

const activeStyleCache = new Map<string, {
    default: Record<string, string | number>;
    hover: Record<string, string | number>;
    pressed: Record<string, string | number>;
}>();

function getActiveGeoStyle(fillColor: string, isSkipped: boolean) {
    const key = `${fillColor}|${isSkipped}`;
    let cached = activeStyleCache.get(key);
    if (!cached) {
        cached = {
            default: {
                fill: fillColor,
                stroke: "#FFF",
                strokeWidth: 0.5,
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
        };
        activeStyleCache.set(key, cached);
    }
    return cached;
}

function getSwedishName(englishName: string): string {
    return countryNamesSwedish[englishName] || englishName;
}

function isInRegion(countryName: string, region: RegionSlug | undefined): boolean {
    if (!region) return true;
    return countryToRegion[countryName] === region;
}

interface MapGeographyLayerProps {
    region: RegionSlug | undefined;
    projection: string;
    projectionConfig: { scale: number; center: [number, number]; rotate: [number, number, number] };
    guessedCountries: Set<string>;
    attempts: { [key: string]: number };
    skippedCountry: string | null;
    currentCountry: string | null;
    onCountryClick: (countryName: string) => void;
    onGeographiesLoad: (geographies: CustomFeature[]) => void;
    isLoaded: boolean;
}

const MapGeographyLayer = React.memo<MapGeographyLayerProps>(({
    region,
    projection,
    projectionConfig,
    guessedCountries,
    attempts,
    skippedCountry,
    onCountryClick,
    onGeographiesLoad,
    isLoaded,
}) => {
    const getFillColor = (countryName: string) => {
        const attemptCount = attempts[countryName] || 0;
        if (guessedCountries.has(countryName)) {
            if (attemptCount === 1) return "#00FF00";
            if (attemptCount === 2) return "#8ec961";
            if (attemptCount === 3) return "#fff200";
            return "#FF0000";
        }
        return "#D6D6DA";
    };

    return (
        <ComposableMap
            projection={projection}
            projectionConfig={projectionConfig}
            style={COMPOSABLE_MAP_STYLE}
        >
            <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: CustomFeature[] }) => {
                    if (!isLoaded && geographies.length > 0) {
                        setTimeout(() => onGeographiesLoad(geographies), 0);
                    }

                    return geographies.map((geo) => {
                        const countryName = geo.properties?.name || "Unknown";
                        if (countryName === "Antarctica" || countryName === "Fr. S. Antarctic Lands") return null;

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
                                style={getActiveGeoStyle(fillColor, isSkipped)}
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
    const [countries, setCountries] = useState<string[]>([]);
    const [shuffledCountries, setShuffledCountries] = useState<string[]>([]);
    const [currentCountry, setCurrentCountry] = useState<string | null>(null);
    const [score, setScore] = useState<number>(0);
    const [guessedCountries, setGuessedCountries] = useState<Set<string>>(new Set());
    const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
    const [currentAttempts, setCurrentAttempts] = useState<number>(0);
    const [tempCountryName, setTempCountryName] = useState<string | null>(null);
    const [skippedCountry, setSkippedCountry] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [gameOver, setGameOver] = useState({ open: false, message: "" });

    const regionConfig = region ? regionConfigs[region] : null;

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

    const isDraggingRef = useRef(false);
    const hasMovedRef = useRef(false);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
    useEffect(() => { hasMovedRef.current = hasMoved; }, [hasMoved]);

    const handleGeographiesLoad = useCallback((geographies: CustomFeature[]) => {
        if (!isLoaded && geographies.length > 0) {
            const countryNames = geographies
                .map((geo) => geo.properties.name)
                .filter((name) => name && name !== "Antarctica" && name !== "Fr. S. Antarctic Lands" && isInRegion(name, region))
                .sort(() => Math.random() - 0.5);

            setCountries(countryNames);
            setShuffledCountries(countryNames);
            setCurrentCountry(countryNames[0]);
            setIsLoaded(true);
        }
    }, [isLoaded, region]);

    const handleCountryClick = useCallback((countryName: string) => {
        if (!currentCountry || isDraggingRef.current || hasMovedRef.current || skippedCountry) return;

        if (countryName === currentCountry) {
            setScore((prev) => prev + 1);
            setGuessedCountries((prev) => new Set(prev).add(countryName));
            setAttempts((prevAttempts) => ({
                ...prevAttempts,
                [countryName]: currentAttempts + 1,
            }));
            setShuffledCountries((prevShuffled) => {
                const nextIndex = prevShuffled.indexOf(currentCountry) + 1;
                if (nextIndex < prevShuffled.length) {
                    setCurrentCountry(prevShuffled[nextIndex]);
                    setCurrentAttempts(0);
                } else {
                    setCountries((prevCountries) => {
                        setTimeout(() => {
                            setGameOver({
                                open: true,
                                message: `Du klarade ${score + 1}/${prevCountries.length} länder!`,
                            });
                        }, 0);
                        return prevCountries;
                    });
                }
                return prevShuffled;
            });
        } else {
            setCurrentAttempts((prev) => prev + 1);
            setTempCountryName(getSwedishName(countryName));
            setTimeout(() => {
                setTempCountryName(null);
            }, 2000);
        }
    }, [currentCountry, skippedCountry, currentAttempts, score]);

    const handleSkip = useCallback(() => {
        if (!currentCountry || skippedCountry) return;
        const skipped = currentCountry;
        setSkippedCountry(skipped);
        setAttempts((prevAttempts) => ({
            ...prevAttempts,
            [skipped]: currentAttempts,
        }));
        setTimeout(() => {
            setSkippedCountry(null);
            setShuffledCountries((prevShuffled) => {
                const nextIndex = prevShuffled.indexOf(skipped) + 1;
                if (nextIndex < prevShuffled.length) {
                    setCurrentCountry(prevShuffled[nextIndex]);
                    setCurrentAttempts(0);
                } else {
                    setCountries((prevCountries) => {
                        setTimeout(() => {
                            setGameOver({
                                open: true,
                                message: `Du klarade ${score}/${prevCountries.length} länder!`,
                            });
                        }, 0);
                        return prevCountries;
                    });
                }
                return prevShuffled;
            });
        }, 2000);
    }, [currentCountry, skippedCountry, currentAttempts, score]);

    const handlePlayAgain = () => {
        setGameOver({ open: false, message: "" });
        setScore(0);
        setGuessedCountries(new Set());
        setAttempts({});
        setCurrentAttempts(0);
        const reshuffled = [...countries].sort(() => Math.random() - 0.5);
        setShuffledCountries(reshuffled);
        setCurrentCountry(reshuffled[0]);
    };

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
                maxHeight: "calc(100vh - 70px)",
                paddingTop: "5px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {regionConfig && (
                <Typography variant="body2" sx={{ m: 0, opacity: 0.7 }}>
                    {regionConfig.emoji} {regionConfig.nameSwedish}
                </Typography>
            )}
            {regionConfig && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/worldmap/regions")}
                    sx={{ fontWeight: "bold", fontSize: "0.7rem", padding: "2px 8px", mb: "2px" }}
                >
                    Byt världsdel
                </Button>
            )}

            <Typography variant="h5" component="h1" sx={{ my: "2px", fontSize: "1.4em" }}>
                {currentCountry ? getSwedishName(currentCountry) : "Laddar..."}
            </Typography>
            <Typography variant="body2" sx={{ m: 0, mb: "4px" }}>
                Poäng: {score}/{countries.length}
            </Typography>

            <Button
                variant="outlined"
                size="small"
                onClick={handleSkip}
                sx={{ mb: "4px", fontWeight: "bold", fontSize: "0.7rem", padding: "2px 10px" }}
            >
                Hoppa över
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
                    maxHeight: "55vh",
                    overflow: "hidden",
                    border: "2px solid #555",
                    borderRadius: "8px",
                    ...containerStyle,
                }}
                {...containerHandlers}
            >
                <div style={transformStyle}>
                    <MapGeographyLayer
                        region={region}
                        projection={projection}
                        projectionConfig={projectionConfig}
                        guessedCountries={guessedCountries}
                        attempts={attempts}
                        skippedCountry={skippedCountry}
                        currentCountry={currentCountry}
                        onCountryClick={handleCountryClick}
                        onGeographiesLoad={handleGeographiesLoad}
                        isLoaded={isLoaded}
                    />
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
            <Typography variant="body2" sx={{ mt: 0, opacity: 0.8, mb: "2px" }}>
                Tips: {zoomTip}
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

const WorldMap: React.FC = () => <WorldMapInner />;

export const WorldMapRegion: React.FC = () => {
    const { region } = useParams<{ region: string }>();
    const validRegions: RegionSlug[] = ["europe", "africa", "north-america", "south-america", "asia", "oceania"];
    const regionSlug = validRegions.includes(region as RegionSlug) ? (region as RegionSlug) : undefined;
    return <WorldMapInner region={regionSlug} />;
};

export default WorldMap;
