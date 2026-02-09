import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const LoadingSpinner: React.FC = () => {
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
        Laddar...
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
