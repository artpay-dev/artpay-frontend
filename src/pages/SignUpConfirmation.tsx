import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface SignUpConfirmationProps {

}

const SignUpConfirmation: React.FC<SignUpConfirmationProps> = ({}) => {
  const auth = useAuth();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

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
      <Typography variant="h2" sx={{ mb: 2 }}>Account verificato</Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        Account verificato con successo
      </Typography>
      <Button variant="contained" sx={{ width: "200px" }} href="/">Vai alla home</Button>
      {!auth.isAuthenticated ?
        (<Button variant="outlined" sx={{ width: "200px" }} onClick={() => auth.login()}>Effettua il login</Button>) :
        (<Button variant="outlined" sx={{ width: "200px" }} href="/profile">Vai al tuo profilo</Button>)
      }
    </Box>
  </DefaultLayout>);
};

export default SignUpConfirmation;
