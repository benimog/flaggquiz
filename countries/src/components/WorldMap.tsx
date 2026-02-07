import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useMapZoomPan } from "../hooks/useMapZoomPan";
import { countryToRegion, regionConfigs, countryNamesSwedish, RegionSlug } from "../data/countryRegions";

interface CustomFeature extends Feature {
    rsmKey: string;
    properties: {
        name: string;
    };
}

// URL to world countries TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

    // Function to get Swedish name for display
    const getSwedishName = (englishName: string): string => {
        return countryNamesSwedish[englishName] || englishName;
    };

    // Check if a country belongs to the active region
    const isInRegion = (countryName: string): boolean => {
        if (!region) return true;
        return countryToRegion[countryName] === region;
    };

    // Handle geography load to get country names
    const handleGeographiesLoad = (geographies: CustomFeature[]) => {
        if (!isLoaded && geographies.length > 0) {
            const countryNames = geographies
                .map((geo) => geo.properties.name)
                .filter((name) => name && name !== "Antarctica" && name !== "Fr. S. Antarctic Lands" && isInRegion(name))
                .sort(() => Math.random() - 0.5);

            setCountries(countryNames);
            setShuffledCountries(countryNames);
            setCurrentCountry(countryNames[0]);
            setIsLoaded(true);
        }
    };

    const handleCountryClick = (countryName: string) => {
        // Don't register click if user was panning/dragging or skip animation is playing
        if (!currentCountry || isDragging || hasMoved || skippedCountry) return;

        if (countryName === currentCountry) {
            setScore(score + 1);
            setGuessedCountries(new Set(guessedCountries).add(countryName));
            setAttempts((prevAttempts) => ({
                ...prevAttempts,
                [countryName]: currentAttempts + 1,
            }));
            const nextIndex = shuffledCountries.indexOf(currentCountry) + 1;
            if (nextIndex < shuffledCountries.length) {
                setCurrentCountry(shuffledCountries[nextIndex]);
                setCurrentAttempts(0);
            } else {
                alert(`Väl spelat! Du klarade ${score + 1}/${countries.length} länder!`);
            }
        } else {
            setCurrentAttempts(currentAttempts + 1);
            setTempCountryName(getSwedishName(countryName));
            setTimeout(() => {
                setTempCountryName(null);
            }, 2000);
        }
    };

    const handleSkip = () => {
        if (!currentCountry || skippedCountry) return;
        const skipped = currentCountry;
        setSkippedCountry(skipped);
        setAttempts((prevAttempts) => ({
            ...prevAttempts,
            [skipped]: currentAttempts,
        }));
        setTimeout(() => {
            setSkippedCountry(null);
            const nextIndex = shuffledCountries.indexOf(skipped) + 1;
            if (nextIndex < shuffledCountries.length) {
                setCurrentCountry(shuffledCountries[nextIndex]);
                setCurrentAttempts(0);
            } else {
                alert(`Väl spelat! Du klarade ${score}/${countries.length} länder!`);
            }
        }, 2000);
    };

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

    // Projection config: use region-specific or default world
    const projection = regionConfig ? "geoMercator" : "geoEqualEarth";
    const projectionConfig = regionConfig
        ? { scale: regionConfig.scale, center: regionConfig.center as [number, number], rotate: regionConfig.rotate as [number, number, number] }
        : { scale: 160, center: [0, 0] as [number, number], rotate: [-10, 0, 0] as [number, number, number] };

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
            <style>{`
                @keyframes pulseRed {
                    0%, 100% { fill: #FF0000; }
                    50% { fill: #D6D6DA; }
                }
            `}</style>

            {regionConfig && (
                <p style={{ fontSize: "0.85em", margin: "0 0 0 0", opacity: 0.7 }}>
                    {regionConfig.emoji} {regionConfig.nameSwedish}
                </p>
            )}
            {regionConfig && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/worldmap/regions")}
                    sx={{ fontWeight: "bold", fontSize: "0.7rem", padding: "2px 8px", marginBottom: "2px" }}
                >
                    Byt världsdel
                </Button>
            )}

            <h1 style={{ margin: "2px 0 2px 0", fontSize: "1.4em" }}>{currentCountry ? getSwedishName(currentCountry) : "Laddar..."}</h1>
            <p style={{ fontSize: "0.7em", margin: "0 0 4px 0" }}>
                Poäng: {score}/{countries.length}
            </p>

            <Button
                variant="outlined"
                size="small"
                onClick={handleSkip}
                sx={{ marginBottom: "4px", fontWeight: "bold", fontSize: "0.7rem", padding: "2px 10px" }}
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
                    <ComposableMap
                        projection={projection}
                        projectionConfig={projectionConfig}
                        style={{ width: "100%", height: "auto" }}
                    >
                        <Geographies geography={geoUrl}>
                            {({ geographies }: { geographies: CustomFeature[] }) => {
                                // Load country names on first render
                                if (!isLoaded && geographies.length > 0) {
                                    setTimeout(() => handleGeographiesLoad(geographies), 0);
                                }

                                return geographies.map((geo) => {
                                    const countryName = geo.properties?.name || "Unknown";
                                    if (countryName === "Antarctica" || countryName === "Fr. S. Antarctic Lands") return null;

                                    // Background country (not in this region)
                                    if (region && !isInRegion(countryName)) {
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                style={{
                                                    default: { fill: "#F5F5F5", stroke: "#E0E0E0", strokeWidth: 0.3, outline: "none" },
                                                    hover: { fill: "#F5F5F5", stroke: "#E0E0E0", strokeWidth: 0.3, outline: "none", cursor: "default" },
                                                    pressed: { fill: "#F5F5F5", outline: "none" },
                                                }}
                                            />
                                        );
                                    }

                                    const fillColor = getFillColor(countryName);
                                    const isSkipped = countryName === skippedCountry;
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={() => handleCountryClick(countryName)}
                                            style={{
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
                                            }}
                                        />
                                    );
                                });
                            }}
                        </Geographies>
                    </ComposableMap>
                </div>
            </div>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ marginTop: "4px", marginBottom: "2px" }}>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleZoomIn}
                    disabled={zoom >= 20}
                    sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                >
                    🔍+ Zooma in
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                >
                    🔍- Zooma ut
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetZoom}
                    sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                >
                    ↺ Återställ
                </Button>
            </Stack>
            <p style={{ fontSize: "0.65em", marginTop: "0", opacity: 0.8, marginBottom: "2px" }}>
                💡 <strong>Tips:</strong> {zoomTip}
            </p>
        </div>
    );
};

// Default world map (no region)
const WorldMap: React.FC = () => <WorldMapInner />;

// Region map wrapper that reads URL param
export const WorldMapRegion: React.FC = () => {
    const { region } = useParams<{ region: string }>();
    const validRegions: RegionSlug[] = ["europe", "africa", "north-america", "south-america", "asia", "oceania"];
    const regionSlug = validRegions.includes(region as RegionSlug) ? (region as RegionSlug) : undefined;
    return <WorldMapInner region={regionSlug} />;
};

export default WorldMap;
