import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface PasswordRecoveryProps {

}

export interface PasswordRecoveryFormData {
  email: string;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({}) => {

  const auth = useAuth();
  const snackbar = useSnackbars();

  const [isReady, setIsReady] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: ""
    } as PasswordRecoveryFormData
  });

  const handleFormSubmit = async (data: PasswordRecoveryFormData) => {
    setIsReady(false);
    try {
      await auth.sendPasswordResetLink(data.email);
      setEmailSent(true);
    } catch (e) {
      await snackbar.error(e);
    }
    setIsReady(true);
  };

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (<DefaultLayout maxWidth="md" pageLoading={false}>
      <Box
        mt={12}
        sx={{
          px: { xs: 3, sm: 6, md: 8 },
          pb: 1,
          mt: { xs: 10, sm: 12, md: 14 },
          flexDirection: "column",
          alignItems: "center"
        }}
        gap={2}
        display="flex">
        <Typography variant="h2" sx={{ mb: 1 }}>Recupero password</Typography>
        {emailSent ?
          <><Typography variant="subtitle1" color="primary" textAlign="center" sx={{ my: { xs: 3, md: 6 } }}>Link di
            reimpostazione
            inviato.</Typography>
            <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 3 }}>Se non ricevi l'email
              entro pochi minuti, verifica la cartella
              dello spam e assicurati di aver inserito l'indirizzo email correttamente</Typography>
          </> :
          <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mb: 1 }}> Per reimpostare la tua
            password, inserisci
            il tuo indirizzo
            email nel campo sottostante.<br /> Assicurati di utilizzare l'indirizzo email associato al tuo account e
            clicca su
            "Invia email di recupero".<br /> Ti invieremo un'email con un link per la reimpostazione della
            password.</Typography>}
        {emailSent ? <Box></Box> : <Box>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Inserisci la tua email" }}
              render={({ field }) => (
                <TextField
                  disabled={!isReady}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Button
              sx={{ minWidth: "160px", mt: 3 }}
              disabled={!isReady}
              type="submit"
              variant="contained"
              color="primary">
              Invia email di recupero
            </Button>
          </form>
        </Box>}
      </Box>
    </DefaultLayout>
  );
};

export default PasswordRecovery;
