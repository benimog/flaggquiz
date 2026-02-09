import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface GameOverDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onPlayAgain?: () => void;
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onPlayAgain,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {onPlayAgain && (
          <Button onClick={onPlayAgain} variant="contained">
            Spela igen
          </Button>
        )}
        <Button onClick={onClose}>Stäng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameOverDialog;
