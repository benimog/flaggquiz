import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Country } from "../types/Country";

interface ChoiceGridProps {
  choices: Country[];
  getLabel: (choice: Country) => string;
  onChoice: (choice: Country) => void;
}

/**
 * 2×2 grid of answer buttons for the text-answer quizzes (FlagQuiz,
 * CapitalQuiz, Continents). Columns are `minmax(0, 1fr)` so a long country name
 * wraps inside its button instead of overflowing the viewport on mobile.
 * `gridAutoFlow: column` keeps the column-major visual order (choices 0/1 in the
 * left column, 2/3 in the right) that the numpad shortcuts (7=0, 4=1, 8=2, 5=3)
 * rely on — DOM order stays 0,1,2,3.
 */
const ChoiceGrid: React.FC<ChoiceGridProps> = ({ choices, getLabel, onChoice }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gridTemplateRows: "repeat(2, auto)",
      gridAutoFlow: "column",
      gap: 2,
      maxWidth: 440,
      mx: "auto",
      mt: 2,
    }}
  >
    {choices.map((choice) => (
      <Button
        variant="contained"
        key={choice.name.common}
        onClick={() => onChoice(choice)}
        sx={{ minHeight: 48, lineHeight: 1.2, overflowWrap: "anywhere" }}
      >
        {getLabel(choice)}
      </Button>
    ))}
  </Box>
);

export default ChoiceGrid;
