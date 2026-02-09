import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface SelectGridItem {
  key: string;
  label: string;
  emoji: string;
}

interface SelectGridProps {
  title: string;
  subtitle: string;
  items: SelectGridItem[];
  onSelect: (key: string) => void;
}

const SelectGrid: React.FC<SelectGridProps> = ({
  title,
  subtitle,
  items,
  onSelect,
}) => {
  return (
    <div>
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
      <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
        {items.map((item) => (
          <Button
            variant="contained"
            key={item.key}
            onClick={() => onSelect(item.key)}
            sx={{
              width: "250px",
              fontSize: "1.1rem",
              padding: "12px 24px",
            }}
          >
            <span className="emoji" style={{ marginRight: "8px" }}>
              {item.emoji}
            </span>
            {item.label}
          </Button>
        ))}
      </Stack>
    </div>
  );
};

export default SelectGrid;
