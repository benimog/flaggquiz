import React from "react";
import { render, screen } from "@testing-library/react";
import Landskap from "./Landskap";
import landskap from "../landskap.json";

const landskapList = landskap as string[];

test("renders the provinces quiz with a target and full score line", async () => {
  render(<Landskap />);

  // A current target province is shown as the heading
  const heading = await screen.findByRole("heading", { level: 1 });
  expect(landskapList).toContain(heading.textContent);

  // Score line shows 0 of all 25 provinces
  expect(screen.getByText(`Poäng: 0/${landskapList.length}`)).toBeInTheDocument();
});
