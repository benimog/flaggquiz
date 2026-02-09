import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface FeedbackSnackbarProps {
  open: boolean;
  message: string;
  severity: "error" | "success" | "info";
  onClose: () => void;
  autoHideDuration?: number;
}

const FeedbackSnackbar: React.FC<FeedbackSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 2500,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbar;
