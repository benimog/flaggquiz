import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizControl {
  /** Caption shown above the segmented control (e.g. "Scope", "Mode"). */
  caption: string;
  /** Currently selected value. */
  value: string;
  options: QuizOption[];
  onChange: (value: string) => void;
}

interface QuizOptionsProps {
  controls: QuizControl[];
}

/**
 * Collapsible settings disclosure for the multiple-choice quizzes. Collapsed by
 * default it shows a one-line summary of the current selections plus an
 * "Options" toggle, keeping the play area uncluttered. Expanded it reveals the
 * captioned segmented controls (stacked on mobile, a row on desktop). The four
 * quizzes pass heterogeneous controls (scope / direction / mode / difficulty) —
 * non-setting actions (e.g. "change continent") stay outside this bar.
 *
 * The toggles stay mounted while collapsed, so each renders a `<ToggleButton>`
 * with stable text that the quiz tests rely on; the "Options" trigger text is in
 * the `controlLabels` set those tests use to isolate the answer buttons.
 */
const QuizOptions: React.FC<QuizOptionsProps> = ({ controls }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const summary = controls
    .map((c) => c.options.find((o) => o.value === c.value)?.label ?? "")
    .filter(Boolean)
    .join(" · ");

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 1,
          rowGap: 0.5,
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {summary}
        </Typography>
        <Button
          size="small"
          color="inherit"
          onClick={() => setOpen((o) => !o)}
          startIcon={<TuneIcon fontSize="small" />}
          endIcon={
            <ExpandMoreIcon
              fontSize="small"
              sx={{
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          }
          aria-expanded={open}
          sx={{ textTransform: "none", color: "text.secondary" }}
        >
          {t("quiz.optionsLabel")}
        </Button>
      </Box>

      <Collapse in={open}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            columnGap: { xs: 2, sm: 3 },
            rowGap: 1.5,
            mt: 1.5,
          }}
        >
          {controls.map((control) => (
            <Stack key={control.caption} spacing={0.5} alignItems="center">
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.7rem",
                }}
              >
                {control.caption}
              </Typography>
              <ToggleButtonGroup
                value={control.value}
                exclusive
                aria-label={control.caption}
                onChange={(_, val) => {
                  if (val) {
                    control.onChange(val);
                  }
                }}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    px: 1.5,
                    py: 0.4,
                    fontSize: "0.8rem",
                  },
                }}
              >
                {control.options.map((opt) => (
                  <ToggleButton key={opt.value} value={opt.value}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default QuizOptions;
