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
import PaymentProvider from "./hoc/PaymentProvider.tsx";
import PurchaseComplete from "./pages/PurchaseComplete.tsx";
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
import Contacts from "./pages/Contacts.tsx";
import Messages from "./pages/Messages.tsx";
import Galleries from "./pages/Galleries.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import LandingForCampaignPage from "./pages/LandingForCampaignPage.tsx";
import CdsPaymentsPage from "./pages/CdsPaymentsPage.tsx";
import PaymentDraw from "./features/cdspayments/components/ui/paymentdraw/PaymentDraw.tsx";
import { useScrollToTop } from "./utils.ts";
import Tutorials from "./pages/Tutorials.tsx";
import SinglePostPage from "./pages/SinglePostPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import PersonalSettingsPage from "./pages/PersonalSettingsPage.tsx";
import ShippingSettingsPage from "./pages/ShippingSettingsPage.tsx";
import FollowedGalleriesPage from "./pages/FollowedGalleriesPage.tsx";
import FavoritesArtworksPage from "./pages/FavoritesArtworksPage.tsx";
import HistoryOrdersPage from "./pages/HistoryOrdersPage.tsx";

import FatsPayLayout from "./features/fastpay/layout/FatsPayLayout.tsx";
import FastPay from "./pages/fast-pay/FastPay.tsx";
import FastPayCreate from "./pages/fast-pay/FastPayCreate.tsx";

import QuotesLayout from "./features/quotes/layout/QuotesLayout.tsx";
import QuotePage from "./pages/quotes/QuotePage.tsx";

function AppContent() {
  const baseUrl = import.meta.env.VITE_SERVER_URL || "";
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const location = useLocation();

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
                <PaymentDraw />
                <PaymentProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/showcase" element={<Showcase />} />
                    <Route path="/gallerie" element={<Galleries />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/gallerie/:slug" element={<Gallery selectedTab={0} />} />
                    <Route path="/gallerie/:slug/tutte-le-opere" element={<Artworks />} />
                    <Route path="/gallerie/:slug/tutti-gli-artisti" element={<Gallery selectedTab={1} />} />
                    <Route path="/gallerie/:slug/galleria" element={<Gallery selectedTab={2} />} />
                    <Route path="/gallerie/:slug_galleria/opere/:slug_opera" element={<Artwork />} />
                    <Route path="/opere/:slug_opera" element={<Artwork />} />
                    <Route path="/artisti/:slug" element={<Artist />} />
                    <Route path="/artisti" element={<Artists />} />
                    <Route path="/tutte-le-opere" element={<Artworks />} />
                    <Route path="/acquisto" element={<Purchase />} />
                    <Route path="/acquisto-esterno" >
                      <Route element={<CdsPaymentsPage />} index />
                    </Route>
                    <Route path="/completa-acquisto/:order_id" element={<Purchase orderMode="redeem" />} />
                    <Route path={"/guide"} element={<Tutorials />} />
                    <Route path="/guide/:slug" element={<SinglePostPage />} />
                    <Route path="/acconto-blocca-opera" element={<Purchase orderMode="loan" />} />
                    <Route path="/opera-bloccata/:slug_opera" element={<ArtworkReserved />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/seguiti" element={<FollowedGalleriesPage />} />
                    <Route path="/profile/opere-preferite" element={<FavoritesArtworksPage />} />
                    <Route path="/profile/personal-settings" element={<PersonalSettingsPage />} />
                    <Route path="/profile/history-orders" element={<HistoryOrdersPage />} />
                    <Route path="/profile/shipping-invoice-settings" element={<ShippingSettingsPage />} />
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
                      element={<ContentPage slug="informativa-sulla-privacy" />}
                    />
                    <Route path="/termini-e-condizioni" element={<ContentPage slug="termini-e-condizioni" />} />
                    <Route
                      path="/condizioni-generali-di-acquisto"
                      element={<ContentPage slug="condizioni-generali-di-acquisto" />}
                    />
                    <Route path="/artpay-per-collezionisti" element={<CustomerOnboarding />} />
                    <Route path="/artpay-per-gallerie" element={<GalleryOnboarding />} />
                    <Route path="/contatti" element={<Contacts />} />
                    <Route path="/profile/messaggi" element={<Messages />} />
                    <Route path="/errore/:code" element={<Error />} />
                    <Route path="/errore" element={<Error />} />
                    <Route path={"/gallerie-the-others"} element={<LandingForCampaignPage />} />
                    <Route path={"/vendor/fastpay"}  element={<FatsPayLayout />}>
                      <Route element={<FastPay />} index/>
                      <Route path={"crea-offerta"} element={<FastPayCreate />} />
                    </Route>
                    <Route path={"/quotes"} element={<QuotesLayout />}>
                      <Route element={<QuotePage />} index />
                    </Route>
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
          <ScrollWrapper />
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;


function ScrollWrapper() {
  useScrollToTop()
  return null;
}
