import { renderHook, act } from "@testing-library/react";
import { useMapQuizGame, SKIP_REVEAL_MS } from "./useMapQuizGame";

const ITEMS = ["Alpha", "Beta", "Gamma"];

function startedHook() {
  const rendered = renderHook(() => useMapQuizGame());
  act(() => {
    rendered.result.current.start(ITEMS);
  });
  return rendered;
}

test("start shuffles the items and sets the first target", () => {
  const { result } = startedHook();
  expect(result.current.total).toBe(3);
  expect(ITEMS).toContain(result.current.currentTarget);
  expect(result.current.score).toBe(0);
  expect(result.current.gameOver).toBe(false);
});

test("correct guess scores, colors green and advances", () => {
  const { result } = startedHook();
  const target = result.current.currentTarget!;

  let outcome: boolean | null = null;
  act(() => {
    outcome = result.current.handleGuess(target);
  });

  expect(outcome).toBe(true);
  expect(result.current.score).toBe(1);
  expect(result.current.getFillColor(target)).toBe("#00FF00");
  expect(result.current.currentTarget).not.toBe(target);
});

test("wrong guesses degrade the fill color once solved", () => {
  const { result } = startedHook();
  const target = result.current.currentTarget!;
  const wrong = ITEMS.find((i) => i !== target)!;

  act(() => {
    expect(result.current.handleGuess(wrong)).toBe(false);
  });
  act(() => {
    result.current.handleGuess(target);
  });

  // 1 wrong + the correct guess = 2 attempts
  expect(result.current.getFillColor(target)).toBe("#8ec961");
  // unsolved territories stay grey
  expect(result.current.getFillColor(wrong)).toBe("#D6D6DA");
});

test("completing all targets sets gameOver with the final score", () => {
  const { result } = startedHook();

  for (let i = 0; i < ITEMS.length; i++) {
    act(() => {
      result.current.handleGuess(result.current.currentTarget!);
    });
  }

  expect(result.current.gameOver).toBe(true);
  expect(result.current.score).toBe(3);
  expect(result.current.currentTarget).toBeNull();
});

test("skip reveals for 2s, ignores clicks meanwhile, then advances without scoring", () => {
  vi.useFakeTimers();
  try {
    const { result } = startedHook();
    const target = result.current.currentTarget!;

    act(() => {
      result.current.handleSkip();
    });
    expect(result.current.skippedTarget).toBe(target);
    // clicks during the reveal are ignored
    act(() => {
      expect(result.current.handleGuess(target)).toBeNull();
    });

    act(() => {
      vi.advanceTimersByTime(SKIP_REVEAL_MS);
    });

    expect(result.current.skippedTarget).toBeNull();
    expect(result.current.currentTarget).not.toBe(target);
    expect(result.current.score).toBe(0);
    // a skipped target counts as failed (red) once revealed
    expect(result.current.getFillColor(target)).toBe("#D6D6DA");
  } finally {
    vi.useRealTimers();
  }
});

test("playAgain resets and reuses the same item pool", () => {
  const { result } = startedHook();
  act(() => {
    result.current.handleGuess(result.current.currentTarget!);
  });

  act(() => {
    result.current.playAgain();
  });

  expect(result.current.score).toBe(0);
  expect(result.current.total).toBe(3);
  expect(result.current.gameOver).toBe(false);
  expect(ITEMS).toContain(result.current.currentTarget);
});
