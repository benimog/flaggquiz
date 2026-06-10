import React from "react";
import { render, screen } from "@testing-library/react";
import ReverseFlagQuiz from "./ReverseFlagQuiz";
import rawCountries from "../data/countries.json";

interface RawCountry {
  code: string;
  nameSwe: string;
  independent: boolean;
}

const independent = (rawCountries as RawCountry[]).filter((c) => c.independent);

test("shows a country name and four flag choices including the right flag", async () => {
  const { container } = render(<ReverseFlagQuiz />);

  // The question heading shows an independent country's Swedish name
  const heading = await screen.findByRole("heading", { level: 1 });
  const country = independent.find((c) => c.nameSwe === heading.textContent);
  expect(country).toBeDefined();

  // Four flag option buttons, one of which shows the named country's flag
  const flagButtons = screen.getAllByRole("button", { name: /^Flagga \d$/ });
  expect(flagButtons).toHaveLength(4);
  const flagSrcs = Array.from(container.querySelectorAll("img")).map((img) =>
    img.getAttribute("src")
  );
  expect(flagSrcs).toContain(`/flags/${country?.code}.png`);
});
