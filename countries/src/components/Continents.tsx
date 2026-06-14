import React, { useEffect, useState, useMemo } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getIndependentCountriesByContinent, getSubregion } from "../data/countries";
import { isRegionSlug } from "../data/countryRegions";
import { useFlagQuizGame } from "../hooks/useFlagQuizGame";
import { getCountryName } from "../i18n/countryNames";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import GameOverDialog from "./feedback/GameOverDialog";
import ScoreDisplay from "./ScoreDisplay";

function Continents() {
  const { t, i18n } = useTranslation();
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const selectedRegion = region || "europe";

  const countries = useMemo(
    () => getIndependentCountriesByContinent(selectedRegion),
    [selectedRegion]
  );

  const [practice, setPractice] = useState<boolean>(false);
  const [hard, setHard] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" as "error" | "success" });

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

  if (!isRegionSlug(selectedRegion)) {
    return <Navigate to="/varldsdelar" replace />;
  }

  const continentLabel = t(`continents.${selectedRegion}`, { defaultValue: selectedRegion });

  return (
    <div>
      <Typography variant="h5" component="h2">
        {t("quiz.title", { continent: continentLabel })}
      </Typography>
      <Stack spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate("/varldsdelar")}>
          {t("quiz.changeContinent")}
        </Button>

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

        <ToggleButtonGroup
          value={hard ? "hard" : "normal"}
          exclusive
          onChange={(_, val) => {
            if (val) {
              setHard(val === "hard");
            }
          }}
          size="small"
        >
          <ToggleButton value="normal">{t("quiz.normalMode")}</ToggleButton>
          <ToggleButton value="hard">{t("quiz.hardMode")}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {randomCountry && (
        <div>
          <img
            src={randomCountry.flags.png}
            alt={t("quiz.flagAlt")}
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
}

export default Continents;
