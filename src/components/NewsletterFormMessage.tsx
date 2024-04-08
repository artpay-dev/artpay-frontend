import React from "react";
import { NewsletterFormState } from "../types/newsletter.ts";
import { CircularProgress, Typography, useTheme } from "@mui/material";
import ErrorIcon from "./icons/ErrorIcon.tsx";
import CheckFillIcon from "./icons/CheckFillIcon.tsx";

export interface NewsletterFormMessageProps {
  formState?: NewsletterFormState;
  variant?: "standard" | "contrast";
}

const NewsletterFormMessage: React.FC<NewsletterFormMessageProps> = ({ formState = "new", variant = "standard" }) => {
  const theme = useTheme();

  switch (formState) {
    case "saving":
      return <CircularProgress sx={{ mt: 2 }} size="40px" />;
    case "error":
      return <>
        <ErrorIcon sx={{ height: "40px", width: "40px", mt: 2 }} color="error" />
        <Typography sx={{ mb: 1 }} variant="body1" color="error">Si è verificato un errore</Typography>
      </>;
    case "success":
      return <>
        <CheckFillIcon sx={{ height: "40px", width: "40px", mt: 2 }} color="success" />
        <Typography sx={{ mb: 1 }} variant="body1"
                    color={variant === "contrast" ? theme.palette.primary.contrastText : theme.palette.success.main}>Controlla
          la tua casella
          email</Typography>
      </>;
    default:
      return <></>;
  }
};

export default NewsletterFormMessage;
