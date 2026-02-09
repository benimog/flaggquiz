import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface ErrorMessageProps {
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ onRetry }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 4 }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Kunde inte hämta data
      </Typography>
      <Button variant="contained" onClick={onRetry}>
        Försök igen
      </Button>
    </Box>
  );
};

export default ErrorMessage;
