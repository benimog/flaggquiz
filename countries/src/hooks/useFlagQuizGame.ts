import { useState, useEffect, useCallback } from "react";
import { Country } from "../types/Country";

interface UseFlagQuizGameReturn {
  randomCountry: Country | null;
  choices: Country[];
  correctPicks: number;
  incorrectPicks: number;
  handleChoice: (choice: Country) => { correct: boolean; answer: string };
  resetPicks: () => void;
}

export function useFlagQuizGame(countries: Country[]): UseFlagQuizGameReturn {
  const [randomCountry, setRandomCountry] = useState<Country | null>(null);
  const [choices, setChoices] = useState<Country[]>([]);
  const [correctPicks, setCorrectPicks] = useState<number>(0);
  const [incorrectPicks, setIncorrectPicks] = useState<number>(0);

  const getChoices = useCallback(
    (randomIndex: number) => {
      const result: Country[] = [];
      while (result.length < 3) {
        const randomChoiceIndex = Math.floor(Math.random() * countries.length);
        if (randomChoiceIndex !== randomIndex) {
          const randomChoice = countries[randomChoiceIndex];
          if (!result.includes(randomChoice)) {
            result.push(randomChoice);
          }
        }
      }
      result.push(countries[randomIndex]);
      result.sort(() => Math.random() - 0.5);
      return result;
    },
    [countries]
  );

  const getRandomCountry = useCallback(() => {
    if (countries.length > 0) {
      const randomIndex = Math.floor(Math.random() * countries.length);
      setRandomCountry(countries[randomIndex]);
      setChoices(getChoices(randomIndex));
    }
  }, [countries, getChoices]);

  useEffect(() => {
    if (countries.length > 0) {
      getRandomCountry();
    }
  }, [countries, getRandomCountry]);

  const handleChoice = useCallback(
    (choice: Country): { correct: boolean; answer: string } => {
      const correct = choice === randomCountry;
      if (correct) {
        setCorrectPicks((prev) => prev + 1);
      } else {
        setIncorrectPicks((prev) => prev + 1);
      }
      getRandomCountry();
      return {
        correct,
        answer: randomCountry?.translations.swe.common || "",
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
