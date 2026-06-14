import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import PopulationQuiz from "./PopulationQuiz";
import rawCountries from "../data/countries.json";

interface RawCountry {
  nameSwe: string;
  population?: number;
}

const popByNameSwe = new Map(
  (rawCountries as RawCountry[]).map((c) => [c.nameSwe, c.population])
);

test("shows two countries and more/fewer buttons, and reveals a result after a guess", () => {
  render(<PopulationQuiz />);

  // The streak starts at zero.
  expect(screen.getByText("Rätt i rad: 0")).toBeInTheDocument();

  // Both guess buttons are present.
  const more = screen.getByRole("button", { name: "Fler" });
  expect(screen.getByRole("button", { name: "Färre" })).toBeInTheDocument();

  // Guessing reveals an outcome (correct or wrong) regardless of which is right.
  fireEvent.click(more);
  const outcome =
    screen.queryByText("Rätt svar!") ?? screen.queryByText("Fel svar!");
  expect(outcome).not.toBeNull();
});

test("closing the game-over dialog after a wrong guess restarts the board", async () => {
  render(<PopulationQuiz />);

  // Read the two countries from the question and pick the wrong guess on purpose.
  const question = screen.getByText(
    /^Har .+ fler eller färre invånare än .+\?$/
  );
  const [, challenger, anchor] =
    question.textContent!.match(/^Har (.+) fler eller färre invånare än (.+)\?$/)!;
  const challengerHasMore =
    popByNameSwe.get(challenger)! > popByNameSwe.get(anchor)!;
  const wrongLabel = challengerHasMore ? "Färre" : "Fler";

  fireEvent.click(screen.getByRole("button", { name: wrongLabel }));

  // The game-over dialog appears.
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("Fel!")).toBeInTheDocument();

  // Closing (not "Play again") must restart, not strand a button-less board:
  // the guess buttons must come back and the streak reset.
  fireEvent.click(within(dialog).getByRole("button", { name: "Stäng" }));
  // The dialog closes via a transition; wait for the board's buttons to return.
  expect(await screen.findByRole("button", { name: "Fler" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Färre" })).toBeInTheDocument();
  expect(screen.getByText("Rätt i rad: 0")).toBeInTheDocument();
});
