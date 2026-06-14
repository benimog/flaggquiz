import React, { useCallback, useEffect, useRef, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getCountriesWithPopulation } from "../data/countries";
import { getCountryName } from "../i18n/countryNames";
import { shuffle } from "../utils/shuffle";
import GameOverDialog from "./feedback/GameOverDialog";

const BEST_STREAK_KEY = "flaggquiz.popBest";
const pool = getCountriesWithPopulation();

function readBest(): number {
  try {
    const n = parseInt(localStorage.getItem(BEST_STREAK_KEY) ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeBest(value: number): void {
  try {
    localStorage.setItem(BEST_STREAK_KEY, String(value));
  } catch {
    /* localStorage unavailable (e.g. private mode) — best is in-memory only */
  }
}

// Pick a random country distinct from `exclude` and with a different population
// (so a guess is never ambiguous).
function pickChallenger(exclude: Country): Country {
  const candidates = pool.filter(
    (c) => c !== exclude && c.population !== exclude.population
  );
  return shuffle(candidates)[0];
}

const REVEAL_MS = 1200;

// The anchor (population shown) and challenger (population hidden) for one round.
function newRound(): { anchor: Country; challenger: Country } {
  const anchor = shuffle(pool)[0];
  return { anchor, challenger: pickChallenger(anchor) };
}

const PopulationQuiz: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [{ anchor, challenger }, setRound] = useState(newRound);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [lastCorrect, setLastCorrect] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [best, setBest] = useState<number>(readBest);
  const [gameOver, setGameOver] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending advance timer on unmount.
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  const formatPopulation = (value: number) =>
    value.toLocaleString(i18n.language.startsWith("en") ? "en-US" : "sv-SE");

  const startNewGame = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setRound(newRound());
    setRevealed(false);
    setStreak(0);
    setGameOver({ open: false, message: "" });
  }, []);

  const guess = (higher: boolean) => {
    if (revealed) return;
    const correct = higher
      ? challenger.population! > anchor.population!
      : challenger.population! < anchor.population!;
    setLastCorrect(correct);
    setRevealed(true);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > best) {
        setBest(newStreak);
        writeBest(newStreak);
      }
      advanceTimer.current = setTimeout(() => {
        // The challenger we just confirmed becomes the next anchor.
        setRound((prev) => ({
          anchor: prev.challenger,
          challenger: pickChallenger(prev.challenger),
        }));
        setRevealed(false);
      }, REVEAL_MS);
    } else {
      setGameOver({
        open: true,
        message: t("population.gameOverMessage", {
          streak,
          best: Math.max(best, streak),
        }),
      });
    }
  };

  const countryCard = (country: Country, showPopulation: boolean) => (
    <Box
      sx={{
        width: { xs: "100%", sm: 280 },
        maxWidth: 320,
        mx: "auto",
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={country.flags.png}
          alt=""
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            borderRadius: "4px",
          }}
        />
      </Box>
      <Typography variant="h6" component="p" sx={{ mt: 1 }}>
        {getCountryName(country, i18n.language)}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ minHeight: 24 }}>
        {showPopulation
          ? t("population.inhabitants", {
              value: formatPopulation(country.population!),
            })
          : " "}
      </Typography>
    </Box>
  );

  return (
    <div>
      <Typography variant="h5" component="h2">
        {t("population.title")}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
        {t("population.intro")}
      </Typography>

      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 2 }}>
        <Typography variant="body1">
          {t("population.streak")}: {streak}
        </Typography>
        <Typography variant="body1">
          {t("population.best")}: {best}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        {countryCard(anchor, true)}
        {countryCard(challenger, revealed)}
      </Stack>

      <Box sx={{ mt: 3 }}>
        {revealed ? (
          <Typography
            variant="h6"
            sx={{ color: lastCorrect ? "success.main" : "error.main" }}
          >
            {lastCorrect ? t("quiz.correctAnswer") : t("quiz.wrongAnswer")}
          </Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("population.question", {
                challenger: getCountryName(challenger, i18n.language),
                anchor: getCountryName(anchor, i18n.language),
              })}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" onClick={() => guess(true)}>
                {t("population.more")}
              </Button>
              <Button variant="contained" onClick={() => guess(false)}>
                {t("population.fewer")}
              </Button>
            </Stack>
          </>
        )}
      </Box>

      <GameOverDialog
        open={gameOver.open}
        title={t("population.gameOverTitle")}
        message={gameOver.message}
        onPlayAgain={startNewGame}
        // Once a guess is wrong the board has no guess buttons; closing must
        // restart so the user can't get stranded on a frozen board.
        onClose={startNewGame}
      />
    </div>
  );
};

export default PopulationQuiz;
