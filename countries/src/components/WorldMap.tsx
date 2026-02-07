import React, { useState, useCallback, useRef, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

interface CustomFeature extends Feature {
    rsmKey: string;
    properties: {
        name: string;
    };
}

// URL to world countries TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Swedish names for countries (subset - the API will handle matching)
const countryNamesSwedish: Record<string, string> = {
    "Sweden": "Sverige",
    "Norway": "Norge",
    "Denmark": "Danmark",
    "Finland": "Finland",
    "Germany": "Tyskland",
    "France": "Frankrike",
    "Spain": "Spanien",
    "Italy": "Italien",
    "United Kingdom": "Storbritannien",
    "Poland": "Polen",
    "Netherlands": "Nederländerna",
    "Belgium": "Belgien",
    "Austria": "Österrike",
    "Switzerland": "Schweiz",
    "Greece": "Grekland",
    "Portugal": "Portugal",
    "Ireland": "Irland",
    "Czechia": "Tjeckien",
    "Romania": "Rumänien",
    "Hungary": "Ungern",
    "Bulgaria": "Bulgarien",
    "Croatia": "Kroatien",
    "Slovakia": "Slovakien",
    "Slovenia": "Slovenien",
    "Lithuania": "Litauen",
    "Latvia": "Lettland",
    "Estonia": "Estland",
    "Russia": "Ryssland",
    "Ukraine": "Ukraina",
    "Belarus": "Vitryssland",
    "Serbia": "Serbien",
    "Bosnia and Herz.": "Bosnien och Hercegovina",
    "Albania": "Albanien",
    "Macedonia": "Nordmakedonien",
    "Montenegro": "Montenegro",
    "Moldova": "Moldavien",
    "United States of America": "USA",
    "Canada": "Kanada",
    "Mexico": "Mexiko",
    "Brazil": "Brasilien",
    "Argentina": "Argentina",
    "Chile": "Chile",
    "Colombia": "Colombia",
    "Peru": "Peru",
    "Venezuela": "Venezuela",
    "Cuba": "Kuba",
    "Jamaica": "Jamaica",
    "China": "Kina",
    "Japan": "Japan",
    "South Korea": "Sydkorea",
    "North Korea": "Nordkorea",
    "India": "Indien",
    "Indonesia": "Indonesien",
    "Thailand": "Thailand",
    "Vietnam": "Vietnam",
    "Philippines": "Filippinerna",
    "Malaysia": "Malaysia",
    "Singapore": "Singapore",
    "Australia": "Australien",
    "New Zealand": "Nya Zeeland",
    "South Africa": "Sydafrika",
    "Egypt": "Egypten",
    "Nigeria": "Nigeria",
    "Kenya": "Kenya",
    "Morocco": "Marocko",
    "Ethiopia": "Etiopien",
    "Tanzania": "Tanzania",
    "Algeria": "Algeriet",
    "Saudi Arabia": "Saudiarabien",
    "Turkey": "Turkiet",
    "Iran": "Iran",
    "Iraq": "Irak",
    "Israel": "Israel",
    "Pakistan": "Pakistan",
    "Afghanistan": "Afghanistan",
    "Iceland": "Island",
    "Greenland": "Grönland",
};

const WorldMap: React.FC = () => {
    const [countries, setCountries] = useState<string[]>([]);
    const [shuffledCountries, setShuffledCountries] = useState<string[]>([]);
    const [currentCountry, setCurrentCountry] = useState<string | null>(null);
    const [score, setScore] = useState<number>(0);
    const [guessedCountries, setGuessedCountries] = useState<Set<string>>(new Set());
    const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
    const [currentAttempts, setCurrentAttempts] = useState<number>(0);
    const [tempCountryName, setTempCountryName] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Zoom and pan state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Function to get Swedish name for display
    const getSwedishName = (englishName: string): string => {
        return countryNamesSwedish[englishName] || englishName;
    };

    // Handle geography load to get country names
    const handleGeographiesLoad = (geographies: CustomFeature[]) => {
        if (!isLoaded && geographies.length > 0) {
            const countryNames = geographies
                .map((geo) => geo.properties.name)
                .filter((name) => name && name !== "Antarctica")
                .sort(() => Math.random() - 0.5);

            setCountries(countryNames);
            setShuffledCountries(countryNames);
            setCurrentCountry(countryNames[0]);
            setIsLoaded(true);
        }
    };

    const handleCountryClick = (countryName: string) => {
        // Don't register click if user was panning/dragging
        if (!currentCountry || isDragging || hasMoved) return;

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
            }, 3000);
        }
    };

    const getFillColor = (countryName: string) => {
        const attemptCount = attempts[countryName] || 0;
        if (guessedCountries.has(countryName)) {
            if (attemptCount === 1) return "#00FF00"; // Green
            if (attemptCount === 2) return "#8ec961"; // Light green
            if (attemptCount === 3) return "#fff200"; // Yellow
            return "#FF0000"; // Red for 4 or more attempts
        }
        return "#D6D6DA"; // Default color
    };

    // Zoom controls - scale pan position to maintain view center
    const handleZoomIn = useCallback(() => {
        const newZoom = Math.min(zoom * 1.5, 20);
        const zoomRatio = newZoom / zoom;
        setPan(p => ({ x: p.x * zoomRatio, y: p.y * zoomRatio }));
        setZoom(newZoom);
    }, [zoom]);

    const handleZoomOut = useCallback(() => {
        const newZoom = Math.max(zoom / 1.5, 1);
        const zoomRatio = newZoom / zoom;
        setPan(p => ({ x: p.x * zoomRatio, y: p.y * zoomRatio }));
        setZoom(newZoom);
    }, [zoom]);

    const handleResetZoom = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    // Mouse wheel zoom - using native event to properly prevent page scroll
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
                setPan(p => ({ x: p.x * zoomRatio, y: p.y * zoomRatio }));
                return newZoom;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    // Mouse drag for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setHasMoved(false);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    }, [zoom, pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setHasMoved(true);
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    }, [isDragging, dragStart, zoom]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Reset hasMoved after a short delay to allow click event to check it
        setTimeout(() => setHasMoved(false), 50);
    }, []);

    // Touch events for mobile panning
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (zoom > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            setIsDragging(true);
            setHasMoved(false);
            setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        }
    }, [zoom, pan]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isDragging && zoom > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            setHasMoved(true);
            setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
        }
    }, [isDragging, dragStart, zoom]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        // Reset hasMoved after a short delay to allow click event to check it
        setTimeout(() => setHasMoved(false), 50);
    }, []);

    return (
        <div
            className="states-container"
            style={{
                width: "90%",
                maxWidth: "1400px",
                paddingTop: "10px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <h1 style={{ margin: "0 0 5px 0" }}>{currentCountry ? getSwedishName(currentCountry) : "Laddar..."}</h1>
            <p style={{ fontSize: "0.8em", margin: "0 0 10px 0" }}>
                Poäng: {score}/{countries.length}
            </p>

            {/* Zoom controls - clearly visible */}
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
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetZoom}
                    sx={{ fontWeight: "bold" }}
                >
                    ↺ Återställ
                </Button>
            </Stack>
            <p style={{ fontSize: "0.8em", marginTop: "0", opacity: 0.8, marginBottom: "10px" }}>
                💡 <strong>Tips:</strong> Använd knapparna ovan eller scroll för att zooma. Dra kartan för att panorera.
            </p>

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

            {/* Map container with zoom/pan */}
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
                    <ComposableMap
                        projection="geoEqualEarth"
                        projectionConfig={{
                            scale: 160,
                            center: [0, 0],
                            rotate: [-10, 0, 0],
                        }}
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
                                    if (countryName === "Antarctica") return null;

                                    const fillColor = getFillColor(countryName);
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={() => handleCountryClick(countryName)}
                                            style={{
                                                default: { fill: fillColor, stroke: "#FFF", strokeWidth: 0.5, outline: "none" },
                                                hover: { fill: "#F53", cursor: "pointer", outline: "none" },
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

            {/* Zoom level indicator */}
            <p style={{ fontSize: "0.7em", margin: "5px 0 0 0", opacity: 0.6 }}>
                Zoom: {Math.round(zoom * 100)}%
            </p>
        </div>
    );
};

export default WorldMap;
