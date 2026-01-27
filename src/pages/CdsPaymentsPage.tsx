import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";
import CdsPayments from "../features/cdspayments";
import { useAuth } from "../hoc/AuthProvider.tsx";

const CdsPaymentsPage = () => {
  const auth = useAuth();
  const [loginPromptShown, setLoginPromptShown] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated && !loginPromptShown) {
      auth.login();
      setLoginPromptShown(true);
    }
  }, [auth.isAuthenticated, auth, loginPromptShown]);

  // Mostra un loading mentre l'utente non è autenticato
  if (!auth.isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <CdsPayments />;
};

export default CdsPaymentsPage;
