import React, { useEffect, useState } from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Country } from "../types/Country";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import ScoreDisplay from "./ScoreDisplay";

interface FlagQuizProps {
  mode: "independent" | "all";
}

const FlagQuiz: React.FC<FlagQuizProps> = ({ mode: initialMode }) => {
  const [mode, setMode] = useState<"independent" | "all">(initialMode);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const url =
        mode === "independent"
          ? "https://restcountries.com/v3.1/independent?status=true&fields=name,flags,translations"
          : "https://restcountries.com/v3.1/all?fields=name,flags,translations";
      const response = await axios.get(url);
      const sorted = response.data.sort(
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
      setCountries(sorted);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let keyIndex = parseInt(event.key);
      if (keyIndex === 7) keyIndex = 0;
      else if (keyIndex === 4) keyIndex = 1;
      else if (keyIndex === 8) keyIndex = 2;
      else if (keyIndex === 5) keyIndex = 3;
      if (keyIndex >= 0 && keyIndex < choices.length) {
        onChoice(choices[keyIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices, randomCountry]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage onRetry={fetchData} />;

  return (
    <div>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, newMode) => {
          if (newMode) {
            setMode(newMode);
            resetPicks();
          }
        }}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="independent">Självständiga länder</ToggleButton>
        <ToggleButton value="all">Alla länder & regioner</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="body1" sx={{ mb: 1 }}>
        Välj rätt land för flaggan
      </Typography>

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
};

export default FlagQuiz;
