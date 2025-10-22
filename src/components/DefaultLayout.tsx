import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { ContainerProps, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar.tsx";
import Footer from "./Footer.tsx";
import { Breakpoint } from "@mui/system";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import GalleryNavbar from "./GalleryNavbar.tsx";
import ToolTip from "../features/cdspayments/components/ui/tooltip/ToolTip.tsx";

export interface DefaultLayoutProps {
  authRequired?: boolean;
  hasNavBar?: boolean;
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
  hasNavBar = true,
  children,
  topBar,
  background,
}) => {
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [menuOpen, setMenuOpen] = useState(false);

  const { openDraw } = usePaymentStore();

  useEffect(() => {
    if (authRequired && !auth.isAuthenticated) {
      auth.login();
      //TODO: redirect to login
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

  /*if (!ready || pageLoading || !animationReady) {
    return (
      <Container maxWidth="md">
        <Box height="100vh" display="flex" flexDirection="column" justifyContent="center">
          <Loader onIntroComplete={() => setAnimationReady(true)} />
        </Box>
      </Container>
    );
  }*/


  return (
    <>
      <ToolTip />
      {hasNavBar ? (
        <GalleryNavbar onMenuToggle={handleMenuToggle} />
      ) : (
        <Navbar  />
      )}
      {topBar || ""}
      <main className="w-full max-w-8xl mx-auto md:mt-36 md:px-24 flex flex-col">
        {children}
      </main>
      {menuOpen && isMobile ? <></> : <Footer />}
      {openDraw && <div className={"overlay fixed z-40 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"}></div>}
    </>
  );
};

export default DefaultLayout;
