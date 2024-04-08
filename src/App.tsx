import "./App.scss";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material";
import defaultTheme from "./themes/defaultTheme";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AuthProvider from "./hoc/AuthProvider";
import DataProvider from "./hoc/DataProvider";
import Showcase from "./pages/Showcase.tsx";
import Artwork from "./pages/Artwork";
import Gallery from "./pages/Gallery";
import Artworks from "./pages/Artworks";
import Profile from "./pages/Profile";
import Purchase from "./pages/Purchase";
import Home from "./pages/Home.tsx";
import DialogProvider from "./hoc/DialogProvider.tsx";
import SnackbarProvider from "./hoc/SnackbarProvider.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import PaymentProvider from "./hoc/PaymentProvider.tsx";
import PurchaseComplete from "./pages/PurchaseComplete.tsx";
import RequireLoan from "./pages/RequireLoan.tsx";
import About from "./pages/About.tsx";
import Faq from "./pages/Faq.tsx";
import ContentPage from "./pages/ContentPage.tsx";
import Artist from "./pages/Artist.tsx";
import Artists from "./pages/Artists.tsx";
import PasswordRecovery from "./pages/PasswordRecovery.tsx";
import PasswordReset from "./pages/PasswordReset.tsx";
import SignUpConfirmation from "./pages/SignUpConfirmation.tsx";
import ReactGA from "react-ga4";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import Error from "./pages/Error.tsx";
import GalleryOnboarding from "./pages/GalleryOnboarding.tsx";
import CustomerOnboarding from "./pages/CustomerOnboarding.tsx";
import ArtworkReserved from "./pages/ArtworkReserved.tsx";
import * as dayjs from "dayjs";

import("dayjs/locale/it");

function AppContent() {
  const baseUrl = import.meta.env.VITE_SERVER_URL || ""; // https://artpay.art
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const location = useLocation();

  dayjs.locale("it");

  const enableGa = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (enableGa) {
      ReactGA.send({ hitType: "pageview", page: location.pathname, title: location.pathname });
    }
  }, [enableGa, location.pathname]);

  if (enableGa) {
    ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
      <DialogProvider>
        <SnackbarProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider baseUrl={baseUrl}>
              <DataProvider baseUrl={baseUrl}>
                <PaymentProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/showcase" element={<Showcase />} />
                    <Route path="/gallerie/:slug" element={<Gallery selectedTab={0} />} />
                    <Route path="/gallerie/:slug/tutte-le-opere" element={<Artworks />} />
                    <Route path="/gallerie/:slug/tutti-gli-artisti" element={<Gallery selectedTab={1} />} />
                    <Route path="/gallerie/:slug/galleria" element={<Gallery selectedTab={2} />} />
                    <Route path="/gallerie/:slug_galleria/opere/:slug_opera" element={<Artwork />} />
                    <Route path="/opere/:slug_opera" element={<Artwork />} />
                    <Route path="/artisti/:slug" element={<Artist />} />
                    <Route path="/artisti" element={<Artists />} />
                    <Route path="/artworks" element={<Artworks />} />
                    <Route path="/acquisti" element={<Purchase />} />
                    <Route path="/accconto-blocca-opera" element={<Purchase orderMode="loan" />} />
                    <Route path="/blocca-opera/:slug_opera" element={<RequireLoan />} />
                    <Route path="/opera-bloccata/:slug_opera" element={<ArtworkReserved />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/settings" element={<ProfileSettings />} />
                    <Route path="/thank-you-page" element={<PurchaseComplete />} />
                    <Route path="/thank-you-page/:order_id" element={<PurchaseComplete />} />
                    <Route path="/chi-siamo" element={<About />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/recupero-password" element={<PasswordRecovery />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    <Route path="/verifica-account" element={<SignUpConfirmation />} />
                    <Route
                      path="/informativa-e-gestione-dei-cookies"
                      element={<ContentPage slug="informativa-e-gestione-dei-cookies" />}
                    />
                    <Route
                      path="/informativa-sulla-privacy"
                      element={<ContentPage slug="informativa-e-gestione-dei-cookies" />}
                    />
                    <Route path="/termini-e-condizioni" element={<ContentPage slug="termini-e-condizioni" />} />
                    <Route
                      path="/condizioni-generali-di-acquisto"
                      element={<ContentPage slug="condizioni-generali-di-acquisto" />}
                    />
                    <Route path="/artpay-per-collezionisti" element={<CustomerOnboarding />} />
                    <Route path="/artpay-per-gallerie" element={<GalleryOnboarding />} />
                    <Route path="/errore/:code" element={<Error />} />
                    <Route path="/errore" element={<Error />} />
                  </Routes>
                </PaymentProvider>
              </DataProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </SnackbarProvider>
      </DialogProvider>
    </LocalizationProvider>
  );
}

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={defaultTheme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
