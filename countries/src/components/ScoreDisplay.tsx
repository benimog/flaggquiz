import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

interface ScoreDisplayProps {
  correct: number;
  incorrect: number;
  total?: number;
  onReset: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  correct,
  incorrect,
  total,
  onReset,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1">
        Rätta svar: {correct}
        {total != null ? ` / ${total}` : ""}
      </Typography>
      <Typography variant="body1">Felaktiga svar: {incorrect}</Typography>
      <Button variant="contained" onClick={onReset} sx={{ mt: 1 }}>
        Återställ
      </Button>
    </Box>
  );
};

export default ScoreDisplay;
