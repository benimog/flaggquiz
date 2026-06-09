import { useState, useCallback, useEffect, useRef } from "react";
import { shuffle } from "../utils/shuffle";

// Shared game logic for the click-the-map quizzes (world map, US states,
// Swedish provinces): shuffled target order, scoring, per-target attempt
// counts, skip with a 2s reveal, and game-over/replay handling.

export const SKIP_REVEAL_MS = 2000;

interface UseMapQuizGameReturn {
  currentTarget: string | null;
  score: number;
  total: number;
  attempts: Record<string, number>;
  skippedTarget: string | null;
  gameOver: boolean;
  start: (items: string[]) => void;
  handleGuess: (name: string) => boolean | null;
  handleSkip: () => void;
  playAgain: () => void;
  closeGameOver: () => void;
  getFillColor: (name: string) => string;
}

export function useMapQuizGame(): UseMapQuizGameReturn {
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [skippedTarget, setSkippedTarget] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const itemsRef = useRef<string[]>([]);
  const skipTimerRef = useRef<number>(0);

  useEffect(() => () => clearTimeout(skipTimerRef.current), []);

  const currentTarget = index < shuffled.length ? shuffled[index] : null;

  const start = useCallback((items: string[]) => {
    clearTimeout(skipTimerRef.current);
    itemsRef.current = items;
    setShuffled(shuffle(items));
    setIndex(0);
    setScore(0);
    setGuessed(new Set());
    setAttempts({});
    setCurrentAttempts(0);
    setSkippedTarget(null);
    setGameOver(false);
  }, []);

  const advance = useCallback(() => {
    setCurrentAttempts(0);
    const next = index + 1;
    if (next >= shuffled.length) {
      setGameOver(true);
    }
    setIndex(next);
  }, [index, shuffled.length]);

  // Returns true for a correct guess, false for a wrong one, and null when
  // the click should be ignored (no active target, or during skip reveal).
  const handleGuess = useCallback(
    (name: string): boolean | null => {
      if (!currentTarget || skippedTarget || gameOver) return null;
      if (name === currentTarget) {
        setScore((prev) => prev + 1);
        setGuessed((prev) => new Set(prev).add(name));
        setAttempts((prev) => ({ ...prev, [name]: currentAttempts + 1 }));
        advance();
        return true;
      }
      setCurrentAttempts((prev) => prev + 1);
      return false;
    },
    [currentTarget, skippedTarget, gameOver, currentAttempts, advance]
  );

  const handleSkip = useCallback(() => {
    if (!currentTarget || skippedTarget || gameOver) return;
    const skipped = currentTarget;
    setSkippedTarget(skipped);
    setAttempts((prev) => ({ ...prev, [skipped]: currentAttempts }));
    skipTimerRef.current = window.setTimeout(() => {
      setSkippedTarget(null);
      advance();
    }, SKIP_REVEAL_MS);
  }, [currentTarget, skippedTarget, gameOver, currentAttempts, advance]);

  const playAgain = useCallback(() => {
    start(itemsRef.current);
  }, [start]);

  const closeGameOver = useCallback(() => {
    setGameOver(false);
  }, []);

  const getFillColor = useCallback(
    (name: string) => {
      const attemptCount = attempts[name] || 0;
      if (guessed.has(name)) {
        if (attemptCount === 1) return "#00FF00";
        if (attemptCount === 2) return "#8ec961";
        if (attemptCount === 3) return "#fff200";
        return "#FF0000";
      }
      return "#D6D6DA";
    },
    [attempts, guessed]
  );

  return {
    currentTarget,
    score,
    total: shuffled.length,
    attempts,
    skippedTarget,
    gameOver,
    start,
    handleGuess,
    handleSkip,
    playAgain,
    closeGameOver,
    getFillColor,
  };
}
