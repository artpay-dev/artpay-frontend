import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Typography } from "@mui/material";
import PasswordChangeForm, { PasswordChangeFormData } from "../components/PasswordChangeForm.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface PasswordRecoveryProps {

}

export interface PasswordRecoveryFormData {
  email: string;
}

const subtitle = "La password deve contenere almeno una maiuscola, una minuscola, un numero, un segno punteggiatura (esclusi i caratteri $&#<>). La password deve essere lunga non meno di 8 caratteri e non più lunga di 50";

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({}) => {
  const snackbar = useSnackbars();
  const navigate = useNavigate();
  const auth = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [resetCode, setResetCode] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data: PasswordChangeFormData) => {
    if (!resetCode || !email) {
      return;
    }
    setIsSaving(true);
    try {
      await auth.resetPassword({ code: resetCode, email: email, password: data.newPassword });
    } catch (e) {
      await snackbar.error(e);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const resetCode = queryParams.get("code");
    const email = queryParams.get("email");
    if (resetCode && email) {
      setResetCode(resetCode);
      setEmail(email);
      setIsReady(true);
    } else {
      snackbar.error("Link di recupero password non valido").then(() => {
        navigate("/");
      });
    }

  }, [navigate, snackbar]);

  return (<DefaultLayout maxWidth="md" pageLoading={!isReady}>
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
        <Typography variant="h2" sx={{ mb: 2 }}>Reimpostazione password</Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 0 }}>
          {subtitle}
        </Typography>
        <PasswordChangeForm oneColumn sx={{ maxWidth: "500px", textAlign: "center", mt: 0 }}
                            disabled={isSaving}
                            onSubmit={handleFormSubmit} />
      </Box>
    </DefaultLayout>
  );
};

export default PasswordRecovery;
