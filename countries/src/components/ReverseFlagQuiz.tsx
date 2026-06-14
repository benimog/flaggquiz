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
import GameOverDialog from "./feedback/GameOverDialog";
import ScoreDisplay from "./ScoreDisplay";

const ReverseFlagQuiz: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"independent" | "all">("independent");
  const [practice, setPractice] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" as "error" | "success" });

  const countries =
    mode === "independent" ? getIndependentCountries() : getAllCountries();

  const {
    randomCountry,
    choices,
    correctPicks,
    incorrectPicks,
    total,
    gameOver,
    handleChoice,
    resetPicks,
    closeGameOver,
  } = useFlagQuizGame(countries, practice);

  const onChoice = (choice: Country) => {
    const result = handleChoice(choice);
    if (result.correct) {
      setSnackbar({ open: true, message: t("quiz.correctAnswer"), severity: "success" });
    } else {
      setSnackbar({ open: true, message: t("quiz.wrongAnswer"), severity: "error" });
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

  const renderFlagButton = (choice: Country, index: number) => (
    <Button
      variant="outlined"
      key={choice.name.common}
      onClick={() => onChoice(choice)}
      aria-label={t("quiz.flagOption", { index: index + 1 })}
      sx={{
        width: { xs: 140, sm: 170 },
        height: { xs: 95, sm: 115 },
        p: 1,
      }}
    >
      <img
        src={choice.flags.png}
        alt=""
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          borderRadius: "2px",
        }}
      />
    </Button>
  );

  return (
    <div>
      <Stack spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, newMode) => {
            if (newMode) {
              setMode(newMode);
            }
          }}
          size="small"
        >
          <ToggleButton value="independent">{t("quiz.independentCountries")}</ToggleButton>
          <ToggleButton value="all">{t("quiz.allCountries")}</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={practice ? "practice" : "standard"}
          exclusive
          onChange={(_, val) => {
            if (val) {
              setPractice(val === "practice");
            }
          }}
          size="small"
        >
          <ToggleButton value="standard">{t("quiz.standardMode")}</ToggleButton>
          <ToggleButton value="practice">{t("quiz.practiceMode")}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Typography variant="body1" sx={{ mb: 1 }}>
        {t("quiz.pickFlag")}
      </Typography>

      {randomCountry && (
        <div>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            {getCountryName(randomCountry, i18n.language)}
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Stack spacing={2} direction="column">
              {choices.slice(0, 2).map((choice, index) => renderFlagButton(choice, index))}
            </Stack>
            <Stack spacing={2} direction="column">
              {choices.slice(2).map((choice, index) => renderFlagButton(choice, index + 2))}
            </Stack>
          </Stack>
          <ScoreDisplay
            correct={correctPicks}
            incorrect={incorrectPicks}
            total={practice ? undefined : total}
            onReset={resetPicks}
          />
        </div>
      )}

      {!randomCountry && total > 0 && !gameOver && (
        <Button variant="contained" onClick={resetPicks} sx={{ mt: 2 }}>
          {t("common.playAgain")}
        </Button>
      )}

      <GameOverDialog
        open={gameOver}
        title={t("game.wellPlayed")}
        message={t("game.quizResult", { correct: correctPicks, total })}
        onPlayAgain={resetPicks}
        onClose={closeGameOver}
      />

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

export default ReverseFlagQuiz;
