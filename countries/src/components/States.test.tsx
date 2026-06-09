import React from "react";
import { render, screen } from "@testing-library/react";
import States from "./States";
import states from "../states.json";

const statesList = states as string[];

test("renders the states quiz with a target and full score line", async () => {
  render(<States />);

  const heading = await screen.findByRole("heading", { level: 1 });
  // Heading shows the (possibly translated) current state; with Swedish
  // default the canonical names are used directly.
  expect(statesList).toContain(heading.textContent);

  // Score line shows 0 of all 50 states (not 52 — DC/PR are not targets)
  expect(screen.getByText(`Poäng: 0/${statesList.length}`)).toBeInTheDocument();
});
