import "./App.scss";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material";
import defaultTheme from "./themes/defaultTheme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./hoc/AuthProvider";
import DataProvider from "./hoc/DataProvider";
import Home from "./pages/Home";
import Artwork from "./pages/Artwork";
import Gallery from "./pages/Gallery";
import Artworks from "./pages/Artworks";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Purchase from "./pages/Purchase";

function AppContent() {
  return (
    <AuthProvider baseUrl="">
      <DataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/info" element={<Gallery />} />
          <Route path="/gallery/events" element={<Gallery />} />
          <Route path="/gallery/contacts" element={<Gallery />} />
          <Route path="/artwork/:id" element={<Artwork />} />
          <Route path="/artworks" element={<Artworks />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
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
