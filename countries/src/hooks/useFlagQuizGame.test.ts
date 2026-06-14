import { renderHook, act } from "@testing-library/react";
import { useFlagQuizGame } from "./useFlagQuizGame";
import { Country } from "../types/Country";

function makeCountry(name: string): Country {
  return {
    flags: { png: `/flags/${name}.png`, svg: "", alt: "" },
    name: { common: name, official: "" },
    translations: { swe: { common: name, official: "" } },
  };
}

function makeCountries(count: number): Country[] {
  return Array.from({ length: count }, (_, i) => makeCountry(`Country ${i}`));
}

test("provides 4 unique choices including the answer", () => {
  const countries = makeCountries(10);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  expect(result.current.randomCountry).not.toBeNull();
  expect(result.current.choices).toHaveLength(4);
  expect(new Set(result.current.choices).size).toBe(4);
  expect(result.current.choices).toContain(result.current.randomCountry);
});

test("hard mode draws wrong choices from the answer's group when possible", () => {
  // Two groups of 5; with a group key the 3 distractors must share the
  // answer's group (the group has 4 others, enough to fill all three).
  const countries: Country[] = [];
  const groups = new Map<Country, string>();
  for (const group of ["A", "B"]) {
    for (let i = 0; i < 5; i++) {
      const c = makeCountry(`${group}-${i}`);
      groups.set(c, group);
      countries.push(c);
    }
  }
  const getGroupKey = (c: Country) => groups.get(c);
  const { result } = renderHook(() =>
    useFlagQuizGame(countries, false, getGroupKey)
  );

  const answerGroup = getGroupKey(result.current.randomCountry!);
  for (const choice of result.current.choices) {
    expect(getGroupKey(choice)).toBe(answerGroup);
  }
});

test("hard mode fills from the rest of the pool when the group is too small", () => {
  // The answer's group has only itself, so all 3 distractors come from
  // outside the group but choices must still be 4 and unique.
  const countries = makeCountries(6);
  const getGroupKey = (c: Country) =>
    c === countries[0] ? "solo" : "everyone-else";
  const { result } = renderHook(() =>
    useFlagQuizGame(countries, false, getGroupKey)
  );

  expect(result.current.choices).toHaveLength(4);
  expect(new Set(result.current.choices).size).toBe(4);
  expect(result.current.choices).toContain(result.current.randomCountry);
});

test("handles pools smaller than 4 without hanging", () => {
  const countries = makeCountries(2);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  expect(result.current.choices).toHaveLength(2);
  expect(result.current.choices).toContain(result.current.randomCountry);
});

test("correct choice increments correctPicks and advances to a new flag", () => {
  const countries = makeCountries(10);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  const current = result.current.randomCountry!;
  let outcome: { correct: boolean } | undefined;
  act(() => {
    outcome = result.current.handleChoice(current);
  });

  expect(outcome!.correct).toBe(true);
  expect(result.current.correctPicks).toBe(1);
  expect(result.current.incorrectPicks).toBe(0);
});

test("wrong choice increments incorrectPicks and reports the answer", () => {
  const countries = makeCountries(10);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  const current = result.current.randomCountry!;
  const wrong = result.current.choices.find((c) => c !== current)!;
  let outcome: { correct: boolean; answer: Country | null } | undefined;
  act(() => {
    outcome = result.current.handleChoice(wrong);
  });

  expect(outcome!.correct).toBe(false);
  expect(outcome!.answer).toBe(current);
  expect(result.current.incorrectPicks).toBe(1);
});

test("practice mode never shows the same flag twice in a row and never ends", () => {
  const countries = makeCountries(5);
  const { result } = renderHook(() => useFlagQuizGame(countries, true));

  for (let i = 0; i < 50; i++) {
    const previous = result.current.randomCountry!;
    act(() => {
      result.current.handleChoice(previous);
    });
    expect(result.current.gameOver).toBe(false);
    expect(result.current.randomCountry).not.toBe(previous);
  }
});

test("standard mode shows each flag once then ends", () => {
  const countries = makeCountries(5);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  const seen = new Set<Country>();
  for (let i = 0; i < 5; i++) {
    expect(result.current.gameOver).toBe(false);
    const current = result.current.randomCountry!;
    expect(seen.has(current)).toBe(false);
    seen.add(current);
    act(() => {
      result.current.handleChoice(current);
    });
  }

  expect(seen.size).toBe(5);
  expect(result.current.gameOver).toBe(true);
  expect(result.current.randomCountry).toBeNull();
  expect(result.current.total).toBe(5);
});

test("handleChoice is a no-op once the game is over", () => {
  const countries = makeCountries(3);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  for (let i = 0; i < 3; i++) {
    act(() => {
      result.current.handleChoice(result.current.randomCountry!);
    });
  }
  expect(result.current.gameOver).toBe(true);

  const correctBefore = result.current.correctPicks;
  let outcome: { correct: boolean; answer: Country | null } | undefined;
  act(() => {
    outcome = result.current.handleChoice(countries[0]);
  });
  expect(outcome!.answer).toBeNull();
  expect(result.current.correctPicks).toBe(correctBefore);
});

test("resetPicks restarts the game and zeroes both counters", () => {
  const countries = makeCountries(10);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  act(() => {
    result.current.handleChoice(result.current.randomCountry!);
  });
  act(() => {
    result.current.resetPicks();
  });

  expect(result.current.correctPicks).toBe(0);
  expect(result.current.incorrectPicks).toBe(0);
  expect(result.current.gameOver).toBe(false);
  expect(result.current.randomCountry).not.toBeNull();
});

test("closeGameOver dismisses the game-over state", () => {
  const countries = makeCountries(2);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  for (let i = 0; i < 2; i++) {
    act(() => {
      result.current.handleChoice(result.current.randomCountry!);
    });
  }
  expect(result.current.gameOver).toBe(true);

  act(() => {
    result.current.closeGameOver();
  });
  expect(result.current.gameOver).toBe(false);
});
