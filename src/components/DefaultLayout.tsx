import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Box, Container, ContainerProps, Typography, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar.tsx";
import Footer from "./Footer.tsx";
import { Breakpoint } from "@mui/system";
import Loader from "./Loader.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";

export interface DefaultLayoutProps {
  authRequired?: boolean;
  background?: string;
  children?: ReactNode | ReactNode[];
  topBar?: ReactNode | ReactNode[];
  pageLoading?: boolean;
  maxWidth?: Breakpoint | false;
  minHeight?: string;
  pb?: number;
  sx?: ContainerProps["sx"];
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  authRequired = false,
  children,
  topBar,
  background,
  pageLoading = false,
  maxWidth = "xl",
  minHeight = "100vh",
  pb = 0,
  sx = {},
}) => {
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [ready, setReady] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { openDraw } = usePaymentStore();


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

    if (openDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

  }, [background, openDraw]);

  const handleMenuToggle = (isOpen: boolean) => {
    setMenuOpen(isOpen);
  };

  if (!ready || pageLoading || !animationReady) {
    return (
      <Container maxWidth="md">
        <Box height="100vh" display="flex" flexDirection="column" justifyContent="center">
          <Loader onIntroComplete={() => setAnimationReady(true)} />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Navbar onMenuToggle={handleMenuToggle} />
      {topBar || ""}
      <Container
        sx={{
          px: "0!important",
          pb: pb,
          minHeight: menuOpen && isMobile ? undefined : minHeight,
          /*overflow: (menuOpen && isMobile) ? "hidden" : undefined,
          overflowX: "hidden",*/
          ...sx,
        }}
        maxWidth={maxWidth}>
        {/*isMobile && <Box mt={8}></Box>*/}
        {children}
      </Container>
      {menuOpen && isMobile ? <></> : <Footer />}
      <Box
        sx={{
          position: "fixed",
          height: "40px",
          width: "100%",
          bottom: 0,
          zIndex: 10,
          background: theme.palette.primary.main,
          alignItems: "center",
          justifyContent: "center",
          display: "none",
        }}>
        <Typography variant="subtitle1" color="white">
          Artpay Beta version
        </Typography>
      </Box>
      {openDraw && <div className={"overlay fixed z-20 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"}></div>}
    </>
  );
};

export default DefaultLayout;
