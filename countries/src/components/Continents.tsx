import React, { useEffect, useState } from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useParams, useNavigate } from "react-router-dom";
import { Country } from "../types/Country";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import ScoreDisplay from "./ScoreDisplay";

const continentNames: Record<string, string> = {
  africa: "Afrika",
  "north-america": "Nordamerika",
  "south-america": "Sydamerika",
  asia: "Asien",
  europe: "Europa",
  oceania: "Oceanien",
};

// REST Countries API subregions that belong to North America
const northAmericaSubregions = new Set([
  "Northern America",
  "Central America",
  "Caribbean",
]);

function Continents() {
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const selectedRegion = region || "europe";

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const isAmericas =
        selectedRegion === "north-america" ||
        selectedRegion === "south-america";
      const apiRegion = isAmericas ? "americas" : selectedRegion;

      const response = await axios.get(
        `https://restcountries.com/v3.1/region/${apiRegion}?fields=name,flags,translations,independent,subregion`
      );

      let independentCountries = response.data.filter(
        (e: { independent: boolean }) => e.independent === true
      );

      if (isAmericas) {
        independentCountries = independentCountries.filter(
          (e: { subregion: string }) =>
            selectedRegion === "north-america"
              ? northAmericaSubregions.has(e.subregion)
              : e.subregion === "South America"
        );
      }

      independentCountries.sort(
        (
          a: { translations: { swe: { common: string } } },
          b: { translations: { swe: { common: string } } }
        ) =>
          a.translations.swe.common.localeCompare(
            b.translations.swe.common,
            "sv",
            { sensitivity: "case" }
          )
      );
      setCountries(independentCountries);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRegion]);

  const {
    randomCountry,
    choices,
    correctPicks,
    incorrectPicks,
    handleChoice,
    resetPicks,
  } = useFlagQuizGame(countries);

  const onChoice = (choice: Country) => {
    const result = handleChoice(choice);
    if (!result.correct) {
      setSnackbar({
        open: true,
        message: `Fel! Rätt svar är ${result.answer}`,
      });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage onRetry={fetchData} />;

  return (
    <div>
      <Typography variant="h5" component="h2">
        Flaggquiz - {continentNames[selectedRegion] || selectedRegion}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/varldsdelar")}
        sx={{ mb: 2 }}
      >
        &larr; Byt världsdel
      </Button>

      {randomCountry && (
        <div>
          <img
            src={randomCountry.flags.png}
            alt={randomCountry.flags.alt}
            style={{
              maxWidth: "320px",
              width: "100%",
              height: "auto",
              borderRadius: "4px",
            }}
          />
          <div>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Stack spacing={2} direction="row" justifyContent="center">
                <Stack spacing={2} direction="column">
                  {choices.slice(0, 2).map((choice) => (
                    <Button
                      variant="contained"
                      key={choice.translations.swe.common}
                      onClick={() => onChoice(choice)}
                    >
                      {choice.translations.swe.common}
                    </Button>
                  ))}
                </Stack>
                <Stack spacing={2} direction="column">
                  {choices.slice(2).map((choice) => (
                    <Button
                      variant="contained"
                      key={choice.translations.swe.common}
                      onClick={() => onChoice(choice)}
                    >
                      {choice.translations.swe.common}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </div>
          <ScoreDisplay
            correct={correctPicks}
            incorrect={incorrectPicks}
            onReset={resetPicks}
          />
        </div>
      )}

      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity="error"
        onClose={() => setSnackbar({ open: false, message: "" })}
      />
    </div>
  );
}

export default Continents;
