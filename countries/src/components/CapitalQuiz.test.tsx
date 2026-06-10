import React from "react";
import { render, screen } from "@testing-library/react";
import CapitalQuiz from "./CapitalQuiz";
import rawCountries from "../data/countries.json";

interface RawCountry {
  nameSwe: string;
  independent: boolean;
  capitalSwe?: string;
}

const independent = (rawCountries as RawCountry[]).filter((c) => c.independent);

test("asks for the capital of a country with four capital choices", async () => {
  render(<CapitalQuiz />);

  // The question heading shows an independent country's Swedish name
  const heading = await screen.findByRole("heading", { level: 1 });
  const country = independent.find((c) => c.nameSwe === heading.textContent);
  expect(country).toBeDefined();

  // The four choices are capitals, including the correct one
  const capitals = new Set(independent.map((c) => c.capitalSwe));
  const choiceButtons = screen
    .getAllByRole("button")
    .filter((b) => capitals.has(b.textContent ?? ""));
  expect(choiceButtons).toHaveLength(4);
  expect(
    choiceButtons.some((b) => b.textContent === country?.capitalSwe)
  ).toBe(true);
});
