import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Continents from "./Continents";

// Labels of the non-answer control buttons, so we can isolate the four choice
// buttons each round.
const controlLabels = new Set([
  "← Byt världsdel",
  "Spel",
  "Testläge",
  "Återställ",
  "Spela igen",
]);

function renderOceania() {
  return render(
    <MemoryRouter initialEntries={["/varldsdelar/oceania"]}>
      <Routes>
        <Route path="/varldsdelar/:region" element={<Continents />} />
      </Routes>
    </MemoryRouter>
  );
}

function clickAChoice() {
  const choice = screen
    .getAllByRole("button")
    .find((b) => b.textContent && !controlLabels.has(b.textContent));
  expect(choice).toBeDefined();
  fireEvent.click(choice!);
}

test("standard mode plays each flag once then shows the game-over dialog", () => {
  renderOceania();

  // 14 independent Oceania countries; click through all of them.
  for (let i = 0; i < 14; i++) {
    expect(screen.queryByText("Väl spelat!")).toBeNull();
    clickAChoice();
  }

  // After the last answer the game-over dialog appears with a result line.
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("Väl spelat!")).toBeInTheDocument();
  expect(within(dialog).getByText(/av 14/)).toBeInTheDocument();
});

test("play again starts a fresh game", () => {
  renderOceania();

  for (let i = 0; i < 14; i++) {
    clickAChoice();
  }
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Spela igen" }));

  // A fresh question is shown again (randomCountry is set, game not over).
  expect(screen.getByAltText("Flagga att gissa")).toBeInTheDocument();
});

test("practice mode never reaches the game-over dialog", () => {
  renderOceania();

  // Switch to never-ending practice mode, then play well past one full cycle.
  fireEvent.click(screen.getByRole("button", { name: "Testläge" }));

  for (let i = 0; i < 30; i++) {
    expect(screen.queryByText("Väl spelat!")).toBeNull();
    clickAChoice();
  }
  expect(screen.queryByText("Väl spelat!")).toBeNull();
});
