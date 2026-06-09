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

test("never shows the same flag twice in a row", () => {
  const countries = makeCountries(5);
  const { result } = renderHook(() => useFlagQuizGame(countries));

  for (let i = 0; i < 50; i++) {
    const previous = result.current.randomCountry!;
    act(() => {
      result.current.handleChoice(previous);
    });
    expect(result.current.randomCountry).not.toBe(previous);
  }
});

test("resetPicks zeroes both counters", () => {
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
});
