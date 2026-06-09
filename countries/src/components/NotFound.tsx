import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

function NotFound() {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("errors.notFound")}
      </Typography>
      <Button variant="contained" component={RouterLink} to="/">
        {t("errors.goHome")}
      </Button>
    </Box>
  );
}

export default NotFound;
