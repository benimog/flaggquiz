import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature } from "geojson";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useMapZoomPan } from "../hooks/useMapZoomPan";

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
    const [skippedCountry, setSkippedCountry] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

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
            <style>{`
                @keyframes pulseRed {
                    0%, 100% { fill: #FF0000; }
                    50% { fill: #D6D6DA; }
                }
            `}</style>
            <h1 style={{ margin: "10px 0 5px 0" }}>{currentCountry ? getSwedishName(currentCountry) : "Laddar..."}</h1>
            <p style={{ fontSize: "0.8em", margin: "0 0 10px 0" }}>
                Poäng: {score}/{countries.length}
            </p>

            <Button
                variant="outlined"
                size="small"
                onClick={handleSkip}
                sx={{ marginBottom: "10px", fontWeight: "bold" }}
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
                    overflow: "hidden",
                    border: "2px solid #555",
                    borderRadius: "8px",
                    ...containerStyle,
                }}
                {...containerHandlers}
            >
                <div style={transformStyle}>
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
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetZoom}
                    sx={{ fontWeight: "bold" }}
                >
                    ↺ Återställ
                </Button>
            </Stack>
            <p style={{ fontSize: "0.8em", marginTop: "0", opacity: 0.8, marginBottom: "5px" }}>
                💡 <strong>Tips:</strong> {zoomTip}
            </p>
            <p style={{ fontSize: "0.7em", margin: "0", opacity: 0.6 }}>
                Zoom: {Math.round(zoom * 100)}%
            </p>
        </div>
    );
};

export default WorldMap;
