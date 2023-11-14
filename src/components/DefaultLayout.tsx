import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Box, Container, LinearProgress, Typography } from "@mui/material";
import Navbar from "./Navbar.tsx";

export interface DefaultLayoutProps {
  authRequired?: boolean;
  background?: string;
  children: ReactNode | ReactNode[];
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  authRequired = false,
  children,
  background,
}) => {
  const [ready, setReady] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    if (authRequired && !auth.isAuthenticated) {
      //TODO: redirect to login
    }
    setTimeout(() => setReady(true), 1000);
  }, [auth.isAuthenticated, authRequired]);

  useEffect(() => {
    document.body.style.setProperty("--background", background || "none");
  }, [background]);

  if (!ready) {
    return (
      <Container maxWidth="md">
        <Box
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box>
            <Typography variant="h6">Loading...</Typography>
            <LinearProgress />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ px: "0!important" }} maxWidth={false}>
      <Navbar />
      {children}
    </Container>
  );
};

export default DefaultLayout;
