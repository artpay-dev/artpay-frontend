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

function AppContent() {
  const baseUrl = "https://artpay.art";
  return (
    <AuthProvider baseUrl={baseUrl}>
      <DataProvider baseUrl={baseUrl}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/gallery/:id" element={<Gallery />} />
          <Route path="/gallery/:id/info" element={<Gallery />} />
          <Route path="/gallery/:id/events" element={<Gallery />} />
          <Route path="/gallery/:id/contacts" element={<Gallery />} />
          <Route path="/artwork/:id" element={<Artwork />} />
          <Route path="/artworks" element={<Artworks />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
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
