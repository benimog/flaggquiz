import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

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
 * Compact, labeled settings bar for the multiple-choice quizzes. Each control is
 * a captioned segmented toggle; controls wrap onto a second row on narrow
 * screens. Styled quieter than the answer buttons so it reads as settings, not
 * gameplay. The four quizzes pass heterogeneous controls (scope / direction /
 * mode / difficulty) — non-setting actions (e.g. "change continent") stay
 * outside this bar.
 */
const QuizOptions: React.FC<QuizOptionsProps> = ({ controls }) => {
  return (
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
        mb: 2,
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
  );
};

export default QuizOptions;
