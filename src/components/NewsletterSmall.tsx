import React, { useState } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import Checkbox from "./Checkbox.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { BREVO_FORM_URL, NewsletterFormData, NewsletterFormState } from "../types/newsletter.ts";
import NewsletterFormMessage from "./NewsletterFormMessage.tsx";

export interface NewsletterSmallProps {}

const NewsletterSmall: React.FC<NewsletterSmallProps> = ({}) => {
  const data = useData()
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    defaultValues: {
      email: "",
      optIn: false,
    },
  });

  const [formState, setFormState] = useState<NewsletterFormState>("new");

  const handleFormSubmit = (formData: NewsletterFormData) => {
    setFormState("saving")
    data.subscribeNewsletter(formData.email, formData.optIn ? "1" : "", BREVO_FORM_URL).then(() => {
      setFormState("success")
    }).catch((err) => {
      console.error(err)
      setFormState("error")
    })
  };

  return (
    <Grid xs={12} md={4} py={1} px={2} sx={{ backgroundColor: "rgba(255,255,255,.90)", borderRadius: "8px" }} item>
      <Typography variant="body1" color="textPrimary" sx={{ mb: 1 }} fontWeight={600}>
        Newsletter
      </Typography>
      <Box sx={{ textAlign: "center", pt:1, pb:2 }}>
        {formState === "new" ?
          <form onSubmit={handleSubmit(handleFormSubmit)} datatype="subscription">
            <Controller
              name="email"
              control={control}
              rules={{ required: "Inserisci la tua email" }}
              render={({ field }) => (
                <TextField
                  disabled={formState !== "new"}
                  label="Email*"
                  variant="outlined"
                  fullWidth
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Checkbox
              alignTop
              checkboxSx={{p: 0}}
              sx={{mt: 2, mb:3, textAlign: 'left'}}
              label={<Typography variant="body2" color={errors.optIn ? "error":"textSecondary"}>
                * Dichiaro di aver preso visione dell'{" "}
                <a href="https://www.artpay.art/informativa-sulla-privacy" target="_blank" rel="noopener noreferrer">
                  informativa riguardante il trattamento dei dati personali
                </a>
              </Typography>}
              error={!!errors?.optIn}
              {...register("optIn", { required: true })}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Iscriviti
            </Button>
          </form> :  <NewsletterFormMessage formState={formState}/>}
      </Box>
    </Grid>
  );
};

export default NewsletterSmall;
