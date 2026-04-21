import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1">
        {t("scores.correct")}: {correct}
        {total != null ? ` / ${total}` : ""}
      </Typography>
      <Typography variant="body1">
        {t("scores.incorrect")}: {incorrect}
      </Typography>
      <Button variant="contained" onClick={onReset} sx={{ mt: 1 }}>
        {t("common.reset")}
      </Button>
    </Box>
  );
};

export default ScoreDisplay;
