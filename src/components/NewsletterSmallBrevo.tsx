import React, { FormEvent, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import CheckFillIcon from "./icons/CheckFillIcon.tsx";

export interface NewsletterSmallProps {}

const NewsletterSmallBrevo: React.FC<NewsletterSmallProps> = ({}) => {
  const [formSent, setFormSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = (e: FormEvent<unknown>) => {
    console.log("handleSubmit", e.target, e.currentTarget);
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormSent(true);
    }, 3000);
  };

  return (
    <Grid xs={12} md={4} py={1} px={2} sx={{ backgroundColor: "rgba(255,255,255,.90)", borderRadius: "8px" }} item>
      <Typography variant="body1" color="textPrimary" sx={{ mb: 1 }} fontWeight={600}>
        Newsletter
      </Typography>
      <Box sx={{ textAlign: "center" }}>
        {formLoading ? (
          formSent ? (
            <CheckFillIcon sx={{ height: "80px", width: "80px", mt: 2 }} color="success" />
          ) : (
            <CircularProgress sx={{ mt: 2 }} size="80px" />
          )
        ) : (
          <form
            id="sib-form"
            method="POST"
            action="https://51f5628d.sibforms.com/serve/MUIFAN4KP2y3Y9vz_T41Gc0CugsmkqAXuhJK3fC-GYZ-WZXkEUZ4rpVu9hAoVm4oy64NloGZplSZNeWnFK-DWXmG3bw6ktECUW3rH0bEoIws0c6F7b_jQEZFEt5OIjUpMrPkmBlb4bWDCam7fCEU-5PQEIEIp5DEdhfVXGUNiuqbe_q0COT3_41l652wAjYIVhDbT3DdkNCFHxoD"
            onSubmit={handleSubmit}
            datatype="subscription">
            <TextField
              fullWidth
              id="EMAIL"
              name="EMAIL"
              autoComplete="off"
              placeholder="Email"
              variant="outlined"
              required
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox required id="OPT_IN" name="OPT_IN" />}
              label={
                <Typography variant="body2" color="textSecondary">
                  Dichiaro di aver preso visione dell'{" "}
                  <a href="https://www.artpay.art/informativa-sulla-privacy" target="_blank" rel="noopener noreferrer">
                    informativa riguardante il trattamento dei dati personali
                  </a>
                </Typography>
              }
              sx={{ mb: 1 }}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Iscriviti
            </Button>
          </form>
        )}
      </Box>
    </Grid>
  );
};

export default NewsletterSmallBrevo;
