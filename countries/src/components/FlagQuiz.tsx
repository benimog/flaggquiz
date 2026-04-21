import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getAllCountries, getIndependentCountries } from "../data/countries";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import { getCountryName } from "../i18n/countryNames";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import ScoreDisplay from "./ScoreDisplay";

interface FlagQuizProps {
  mode: "independent" | "all";
}

const FlagQuiz: React.FC<FlagQuizProps> = ({ mode: initialMode }) => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"independent" | "all">(initialMode);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const countries =
    mode === "independent" ? getIndependentCountries() : getAllCountries();

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
        <ToggleButton value="independent">{t("quiz.independentCountries")}</ToggleButton>
        <ToggleButton value="all">{t("quiz.allCountries")}</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="body1" sx={{ mb: 1 }}>
        {t("quiz.pickCountry")}
      </Typography>

      {randomCountry && (
        <div>
          <div style={{
            width: "100%",
            maxWidth: "320px",
            height: "200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <img
              src={randomCountry.flags.png}
              alt={randomCountry.flags.alt}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                borderRadius: "4px",
              }}
            />
          </div>
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
};

export default FlagQuiz;
