import "./App.scss";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material";
import defaultTheme from "./themes/defaultTheme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function AppContent() {
  const baseUrl = ""; // https://artpay.art
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
      <DialogProvider>
        <SnackbarProvider>
          <AuthProvider baseUrl={baseUrl}>
            <DataProvider baseUrl={baseUrl}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/showcase" element={<Showcase />} />
                <Route path="/gallerie/:slug" element={<Gallery selectedTab={0} />} />
                <Route path="/gallerie/:slug/tutte-le-opere" element={<Artworks />} />
                <Route path="/gallerie/:slug/tutti-gli-artisti" element={<Gallery selectedTab={1} />} />
                <Route path="/gallerie/:slug/galleria" element={<Gallery selectedTab={2} />} />
                <Route path="/gallerie/:slug_galleria/opere/:slug_opera" element={<Artwork />} />
                <Route path="/artworks" element={<Artworks />} />
                <Route path="/acquisti" element={<Purchase />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/settings" element={<ProfileSettings />} />
              </Routes>
            </DataProvider>
          </AuthProvider>
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
