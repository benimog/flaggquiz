import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getAllCountries, getIndependentCountries, getSubregion } from "../data/countries";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import { getCountryName } from "../i18n/countryNames";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import GameOverDialog from "./feedback/GameOverDialog";
import QuizOptions from "./QuizOptions";
import ChoiceGrid from "./ChoiceGrid";
import ScoreDisplay from "./ScoreDisplay";

interface FlagQuizProps {
  mode: "independent" | "all";
}

const FlagQuiz: React.FC<FlagQuizProps> = ({ mode: initialMode }) => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"independent" | "all">(initialMode);
  const [practice, setPractice] = useState<boolean>(false);
  const [hard, setHard] = useState<boolean>(false);
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
  } = useFlagQuizGame(countries, practice, hard ? getSubregion : undefined);

  const onChoice = (choice: Country) => {
    const result = handleChoice(choice);
    if (result.correct) {
      setSnackbar({ open: true, message: t("quiz.correctAnswer"), severity: "success" });
    } else if (result.answer) {
      setSnackbar({
        open: true,
        message: t("quiz.wrongAnswerIs", {
          answer: getCountryName(result.answer, i18n.language),
        }),
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
  }, [choices, randomCountry]);

  return (
    <div>
      <QuizOptions
        controls={[
          {
            caption: t("quiz.scopeLabel"),
            value: mode,
            options: [
              { value: "independent", label: t("quiz.independentShort") },
              { value: "all", label: t("quiz.allShort") },
            ],
            onChange: (val) => setMode(val as "independent" | "all"),
          },
          {
            caption: t("quiz.modeLabel"),
            value: practice ? "practice" : "standard",
            options: [
              { value: "standard", label: t("quiz.standardMode") },
              { value: "practice", label: t("quiz.practiceMode") },
            ],
            onChange: (val) => setPractice(val === "practice"),
          },
          {
            caption: t("quiz.difficultyLabel"),
            value: hard ? "hard" : "normal",
            options: [
              { value: "normal", label: t("quiz.normalMode") },
              { value: "hard", label: t("quiz.hardMode") },
            ],
            onChange: (val) => setHard(val === "hard"),
          },
        ]}
      />

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
              alt={t("quiz.flagAlt")}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                borderRadius: "4px",
              }}
            />
          </div>
          <ChoiceGrid
            choices={choices}
            getLabel={(choice) => getCountryName(choice, i18n.language)}
            onChoice={onChoice}
          />
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

export default FlagQuiz;
