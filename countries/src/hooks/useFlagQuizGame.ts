import { useState, useEffect, useCallback, useRef } from "react";
import { Country } from "../types/Country";
import { shuffle } from "../utils/shuffle";

interface UseFlagQuizGameReturn {
  randomCountry: Country | null;
  choices: Country[];
  correctPicks: number;
  incorrectPicks: number;
  handleChoice: (choice: Country) => { correct: boolean; answer: Country | null };
  resetPicks: () => void;
}

export function useFlagQuizGame(countries: Country[]): UseFlagQuizGameReturn {
  const [randomCountry, setRandomCountry] = useState<Country | null>(null);
  const [choices, setChoices] = useState<Country[]>([]);
  const [correctPicks, setCorrectPicks] = useState<number>(0);
  const [incorrectPicks, setIncorrectPicks] = useState<number>(0);

  // Track the current country in a ref so getRandomCountry can avoid
  // showing the same flag twice in a row.
  const currentCountryRef = useRef<Country | null>(null);

  const getChoices = useCallback(
    (randomIndex: number) => {
      const wrongChoices = shuffle(
        countries.filter((_, index) => index !== randomIndex)
      ).slice(0, 3);
      return shuffle([...wrongChoices, countries[randomIndex]]);
    },
    [countries]
  );

  const getRandomCountry = useCallback(() => {
    if (countries.length === 0) return;
    let randomIndex = Math.floor(Math.random() * countries.length);
    if (countries.length > 1) {
      while (countries[randomIndex] === currentCountryRef.current) {
        randomIndex = Math.floor(Math.random() * countries.length);
      }
    }
    currentCountryRef.current = countries[randomIndex];
    setRandomCountry(countries[randomIndex]);
    setChoices(getChoices(randomIndex));
  }, [countries, getChoices]);

  useEffect(() => {
    if (countries.length > 0) {
      getRandomCountry();
    }
  }, [countries, getRandomCountry]);

  const handleChoice = useCallback(
    (choice: Country): { correct: boolean; answer: Country | null } => {
      const correct = choice === randomCountry;
      if (correct) {
        setCorrectPicks((prev) => prev + 1);
      } else {
        setIncorrectPicks((prev) => prev + 1);
      }
      getRandomCountry();
      return {
        correct,
        answer: randomCountry,
      };
    },
    [randomCountry, getRandomCountry]
  );

  const resetPicks = useCallback(() => {
    setCorrectPicks(0);
    setIncorrectPicks(0);
  }, []);

  return {
    randomCountry,
    choices,
    correctPicks,
    incorrectPicks,
    handleChoice,
    resetPicks,
  };
}
