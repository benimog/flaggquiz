import { useState, useEffect, useCallback } from "react";
import { Country } from "../types/Country";
import { shuffle } from "../utils/shuffle";

interface UseFlagQuizGameReturn {
  randomCountry: Country | null;
  choices: Country[];
  correctPicks: number;
  incorrectPicks: number;
  total: number;
  gameOver: boolean;
  handleChoice: (choice: Country) => { correct: boolean; answer: Country | null };
  resetPicks: () => void;
  closeGameOver: () => void;
}

// Shared logic for the four multiple-choice flag quizzes (FlagQuiz,
// ReverseFlagQuiz, Continents, CapitalQuiz). The pool is shuffled into a deck
// and presented one question at a time so each country appears exactly once.
//
// - Standard mode (default): the deck is played through once, then `gameOver`.
// - Practice mode (`practice = true`): never-ending — when the deck is
//   exhausted it reshuffles and continues (avoiding an immediate repeat of the
//   last flag at the wrap boundary).
//
// In both modes the three wrong choices are drawn from the full pool and may
// repeat across questions; only the question (the answer flag) is unique.
export function useFlagQuizGame(
  countries: Country[],
  practice: boolean = false
): UseFlagQuizGameReturn {
  const [order, setOrder] = useState<Country[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [choices, setChoices] = useState<Country[]>([]);
  const [correctPicks, setCorrectPicks] = useState<number>(0);
  const [incorrectPicks, setIncorrectPicks] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const buildChoices = useCallback(
    (answer: Country) => {
      const wrongChoices = shuffle(
        countries.filter((c) => c !== answer)
      ).slice(0, 3);
      return shuffle([...wrongChoices, answer]);
    },
    [countries]
  );

  const setup = useCallback(() => {
    const newOrder = shuffle(countries);
    setOrder(newOrder);
    setIndex(0);
    setChoices(newOrder.length > 0 ? buildChoices(newOrder[0]) : []);
    setCorrectPicks(0);
    setIncorrectPicks(0);
    setGameOver(false);
  }, [countries, buildChoices]);

  // (Re)start whenever the pool changes (mode/continent/direction toggle) or
  // when switching between standard and practice mode. The country getters
  // return stable, module-level arrays, so this fires only on real changes.
  useEffect(() => {
    setup();
  }, [setup, practice]);

  const advance = useCallback(() => {
    const next = index + 1;
    if (next >= order.length) {
      if (practice) {
        const last = order[index];
        let newOrder = shuffle(countries);
        if (newOrder.length > 1) {
          while (newOrder[0] === last) {
            newOrder = shuffle(countries);
          }
        }
        setOrder(newOrder);
        setIndex(0);
        setChoices(newOrder.length > 0 ? buildChoices(newOrder[0]) : []);
      } else {
        setIndex(next);
        setChoices([]);
        setGameOver(true);
      }
    } else {
      setIndex(next);
      setChoices(buildChoices(order[next]));
    }
  }, [index, order, practice, countries, buildChoices]);

  const randomCountry = index < order.length ? order[index] : null;

  const handleChoice = useCallback(
    (choice: Country): { correct: boolean; answer: Country | null } => {
      if (gameOver) {
        return { correct: false, answer: null };
      }
      const answer = randomCountry;
      const correct = choice === answer;
      if (correct) {
        setCorrectPicks((prev) => prev + 1);
      } else {
        setIncorrectPicks((prev) => prev + 1);
      }
      advance();
      return { correct, answer };
    },
    [gameOver, randomCountry, advance]
  );

  const resetPicks = useCallback(() => {
    setup();
  }, [setup]);

  const closeGameOver = useCallback(() => {
    setGameOver(false);
  }, []);

  return {
    randomCountry,
    choices,
    correctPicks,
    incorrectPicks,
    total: order.length,
    gameOver,
    handleChoice,
    resetPicks,
    closeGameOver,
  };
}
