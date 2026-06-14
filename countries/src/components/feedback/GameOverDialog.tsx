import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";

interface GameOverDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onPlayAgain?: () => void;
  // When provided, a "Copy result" button is shown that copies this text to the
  // clipboard (Wordle-style shareable result). Used by the daily quiz.
  shareText?: string;
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onPlayAgain,
  shareText,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Reset the "Copied!" label whenever the dialog is reopened.
  useEffect(() => {
    if (open) {
      setCopied(false);
    }
  }, [open]);

  const handleShare = async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to the
      // native share sheet where it exists.
      if (navigator.share) {
        try {
          await navigator.share({ text: shareText });
        } catch {
          /* user cancelled the share sheet */
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ whiteSpace: "pre-line" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {shareText && (
          <Button
            onClick={handleShare}
            variant="outlined"
            startIcon={<ContentCopyIcon />}
          >
            {copied ? t("game.copied") : t("game.shareResult")}
          </Button>
        )}
        {onPlayAgain && (
          <Button onClick={onPlayAgain} variant="contained">
            {t("common.playAgain")}
          </Button>
        )}
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameOverDialog;
