import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 4 }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("errors.fetchFailed")}
      </Typography>
      <Button variant="contained" onClick={onRetry}>
        {t("common.tryAgain")}
      </Button>
    </Box>
  );
};

export default ErrorMessage;
