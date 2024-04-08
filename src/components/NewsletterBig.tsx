import React, { useState } from "react";
import { Box, Button, Link, Typography, useTheme } from "@mui/material";
import TextField from "./TextField.tsx";
import Checkbox from "./Checkbox.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Controller, useForm } from "react-hook-form";
import { BREVO_FORM_URL, NewsletterFormData, NewsletterFormState } from "../types/newsletter.ts";
import NewsletterFormMessage from "./NewsletterFormMessage.tsx";
import PromoCard from "./PromoCard.tsx";

export interface NewsletterBigProps {
  title: string;
  subtitle?: string;
  checkboxText?: string;
  ctaText?: string;
}

const NewsletterBig: React.FC<NewsletterBigProps> = ({ title, subtitle, checkboxText, ctaText = "Iscriviti" }) => {
  const data = useData();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<NewsletterFormData>({
    defaultValues: {
      email: "",
      optIn: false
    }
  });

  const [formState, setFormState] = useState<NewsletterFormState>("new");

  const handleFormSubmit = (formData: NewsletterFormData) => {
    setFormState("saving");
    data.subscribeNewsletter(formData.email, formData.optIn ? "1" : "", BREVO_FORM_URL).then(() => {
      setFormState("success");
    }).catch((err) => {
      console.error(err);
      setFormState("error");
    });
  };

  return <PromoCard title={title} titleVariant="h2" variant="contrast">
    <form onSubmit={handleSubmit(handleFormSubmit)} datatype="subscription">
      {formState === "new" ? <>
          <Box sx={{ width: "100%", maxWidth: "400px" }}>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Inserisci la tua email" }}
              render={({ field }) => (
                <TextField
                  placeholder="email"
                  size="medium"
                  variant="filled"
                  sx={{ mb: 2 }}
                  fullWidth
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    endAdornment: <Button variant="contained" type="submit">{ctaText}</Button>
                  }}
                />
              )} />
            <Checkbox
              alignTop
              size="small"
              checkboxSx={{ p: 0 }}
              sx={{ textAlign: "left" }}
              label={checkboxText || <Typography variant="body2" color={errors.optIn ? "error" : "white"}>
                * Dichiaro di aver preso visione dell'{" "}
                <Link href="https://artpay.art/informativa-sulla-privacy"
                      sx={{ color: errors.optIn ? theme.palette.error.main : "white", textDecoration: "underline" }}
                      target="_blank" rel="noopener noreferrer">
                  informativa riguardante il trattamento dei dati personali
                </Link>
              </Typography>}
              error={!!errors?.optIn}
              {...register("optIn", { required: true })}
            />
          </Box>
        </> :
        <Box sx={{
          flexGrow: 1,
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}><NewsletterFormMessage variant="contrast" formState={formState} /></Box>}
    </form>
  </PromoCard>
    ;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} datatype="subscription">
      <Box
        display="flex"
        flexDirection="column"
        py={12}
        px={5}
        justifyContent="center"
        alignItems="center"
        sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.contrast.main }}>
        {formState === "new" ? <>
          <Typography variant="h3" color="white">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="h6" color="white">
              Lasciaci un indirizzo email e ti invieremo una selezione di opere presenti su artpay
            </Typography>
          )}
          <Box sx={{ maxWidth: "667px", width: "100%" }} my={6}>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Inserisci la tua email" }}
              render={({ field }) => (
                <TextField
                  placeholder="email"
                  size="medium"
                  variant="outlined"
                  sx={{
                    color: "black",
                    input: { background: "white", borderRadius: "24px" },
                    mb: 2
                  }}
                  fullWidth
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )} />
            <Checkbox
              alignTop
              checkboxSx={{ p: 0 }}
              sx={{ textAlign: "left" }}
              label={checkboxText || <Typography variant="body2" color={errors.optIn ? "error" : "textSecondary"}>
                * Dichiaro di aver preso visione dell'{" "}
                <a href="https://artpay.art/informativa-sulla-privacy" target="_blank" rel="noopener noreferrer">
                  informativa riguardante il trattamento dei dati personali
                </a>
              </Typography>}
              error={!!errors?.optIn}
              {...register("optIn", { required: true })}
            />
          </Box>
          <Button color="contrast" size="large" type="submit" sx={{ color: theme.palette.primary.main }}
                  variant="contained">
            {ctaText}
          </Button>
        </> : <NewsletterFormMessage formState={formState} />}
      </Box>
    </form>
  );
};

export default NewsletterBig;
