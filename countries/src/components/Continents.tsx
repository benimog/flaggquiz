import React, { useEffect, useState, useMemo } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getCountriesByRegion } from "../data/countries";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import { getCountryName } from "../i18n/countryNames";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import ScoreDisplay from "./ScoreDisplay";

// REST Countries API subregions that belong to North America
const northAmericaSubregions = new Set([
  "Northern America",
  "Central America",
  "Caribbean",
]);

function Continents() {
  const { t, i18n } = useTranslation();
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const selectedRegion = region || "europe";

  const countries = useMemo(() => {
    const isAmericas =
      selectedRegion === "north-america" ||
      selectedRegion === "south-america";
    const apiRegion = isAmericas ? "americas" : selectedRegion;

    const regionCountries = getCountriesByRegion(apiRegion);

    let independentCountries = regionCountries.filter((e) => e.independent);

    if (isAmericas) {
      independentCountries = independentCountries.filter((e) =>
        selectedRegion === "north-america"
          ? northAmericaSubregions.has(e.subregion)
          : e.subregion === "South America"
      );
    }

    return independentCountries as Country[];
  }, [selectedRegion]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

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
    if (!result.correct && result.answer) {
      setSnackbar({
        open: true,
        message: t("quiz.wrongAnswerIs", {
          answer: getCountryName(result.answer, i18n.language),
        }),
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = parseInt(event.key);
      let keyIndex = -1;
      if (key === 7) keyIndex = 0;
      else if (key === 4) keyIndex = 1;
      else if (key === 8) keyIndex = 2;
      else if (key === 5) keyIndex = 3;
      if (keyIndex >= 0 && keyIndex < choices.length) {
        onChoice(choices[keyIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices, randomCountry]);

  const continentLabel = t(`continents.${selectedRegion}`, { defaultValue: selectedRegion });

  return (
    <div>
      <Typography variant="h5" component="h2">
        {t("quiz.title", { continent: continentLabel })}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/varldsdelar")}
        sx={{ mb: 2 }}
      >
        {t("quiz.changeContinent")}
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
                      key={choice.name.common}
                      onClick={() => onChoice(choice)}
                    >
                      {getCountryName(choice, i18n.language)}
                    </Button>
                  ))}
                </Stack>
                <Stack spacing={2} direction="column">
                  {choices.slice(2).map((choice) => (
                    <Button
                      variant="contained"
                      key={choice.name.common}
                      onClick={() => onChoice(choice)}
                    >
                      {getCountryName(choice, i18n.language)}
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
