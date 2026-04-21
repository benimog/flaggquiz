import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 4 }}
    >
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {t("common.loading")}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
