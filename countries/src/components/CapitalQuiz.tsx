import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getIndependentCountries } from "../data/countries";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import { getCountryName } from "../i18n/countryNames";
import { getCapitalName } from "../i18n/capitalNames";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import ScoreDisplay from "./ScoreDisplay";

type Direction = "countryToCapital" | "capitalToCountry";

const countries = getIndependentCountries().filter((c) => c.capital);

const CapitalQuiz: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [direction, setDirection] = useState<Direction>("countryToCapital");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" as "error" | "success" });

  const {
    randomCountry,
    choices,
    correctPicks,
    incorrectPicks,
    handleChoice,
    resetPicks,
  } = useFlagQuizGame(countries);

  const questionText = (country: Country) =>
    direction === "countryToCapital"
      ? getCountryName(country, i18n.language)
      : getCapitalName(country, i18n.language);

  const answerText = (country: Country) =>
    direction === "countryToCapital"
      ? getCapitalName(country, i18n.language)
      : getCountryName(country, i18n.language);

  const onChoice = (choice: Country) => {
    const result = handleChoice(choice);
    if (result.correct) {
      setSnackbar({ open: true, message: t("quiz.correctAnswer"), severity: "success" });
    } else if (result.answer) {
      setSnackbar({
        open: true,
        message: t("quiz.wrongAnswerIs", { answer: answerText(result.answer) }),
        severity: "error",
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
  }, [choices, randomCountry, direction]);

  return (
    <div>
      <ToggleButtonGroup
        value={direction}
        exclusive
        onChange={(_, newDirection) => {
          if (newDirection) {
            setDirection(newDirection);
            resetPicks();
          }
        }}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="countryToCapital">{t("quiz.countryToCapital")}</ToggleButton>
        <ToggleButton value="capitalToCountry">{t("quiz.capitalToCountry")}</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="body1" sx={{ mb: 1 }}>
        {direction === "countryToCapital"
          ? t("quiz.pickCapital")
          : t("quiz.pickCountryForCapital")}
      </Typography>

      {randomCountry && (
        <div>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            {questionText(randomCountry)}
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Stack spacing={2} direction="column">
              {choices.slice(0, 2).map((choice) => (
                <Button
                  variant="contained"
                  key={choice.name.common}
                  onClick={() => onChoice(choice)}
                >
                  {answerText(choice)}
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
                  {answerText(choice)}
                </Button>
              ))}
            </Stack>
          </Stack>
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
        severity={snackbar.severity}
        autoHideDuration={snackbar.severity === "success" ? 1200 : 2500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default CapitalQuiz;
