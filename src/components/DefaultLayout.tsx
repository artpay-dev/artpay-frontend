import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Box, Container, LinearProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar.tsx";
import Footer from "./Footer.tsx";
import { Breakpoint } from "@mui/system";

export interface DefaultLayoutProps {
  authRequired?: boolean;
  background?: string;
  children?: ReactNode | ReactNode[];
  topBar?: ReactNode | ReactNode[];
  pageLoading?: boolean;
  maxWidth?: Breakpoint | false;
  minHeight?: string;
  pb?: number;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
                                                       authRequired = false,
                                                       children,
                                                       topBar,
                                                       background,
                                                       pageLoading = false,
                                                       maxWidth = "xl",
                                                       minHeight = "100vh",
                                                       pb = 0
                                                     }) => {
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (authRequired && !auth.isAuthenticated) {
      auth.login();
      //TODO: redirect to login
    } else {
      setReady(true);
    }
  }, [auth, auth.isAuthenticated, authRequired]);

  useEffect(() => {
    document.body.style.setProperty("--background", background || "none");
  }, [background]);

  const handleMenuToggle = (isOpen: boolean) => {
    setMenuOpen(isOpen);
  };

  if (!ready || pageLoading) {
    return (
      <Container maxWidth="md">
        <Box height="100vh" display="flex" flexDirection="column" justifyContent="center">
          <Box>
            <Typography variant="h6">Loading...</Typography>
            <LinearProgress />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Navbar onMenuToggle={handleMenuToggle} />
      {topBar || ""}
      <Container sx={{
        px: "0!important",
        pb: pb,
        minHeight: (menuOpen && isMobile) ? undefined : minHeight,
        overflow: (menuOpen && isMobile) ? "hidden" : undefined
      }} maxWidth={maxWidth}>
        {isMobile && <Box mt={8}></Box>}
        {children}
      </Container>
      {(menuOpen && isMobile) ? <></> : <Footer />}
    </>
  );
};

export default DefaultLayout;
