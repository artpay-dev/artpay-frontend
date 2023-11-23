import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Logo from "./icons/Logo";
import { Search } from "@mui/icons-material";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const theme = useTheme();
  const auth = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar color="default" sx={{}} elevation={0}>
      <Box display="flex" alignItems="center" sx={{ height: "100%" }}>
        <Box sx={{ height: "24px" }}>
          <Logo />
        </Box>
        {!isMobile && (
          <Box>
            <Button
              sx={{ ml: { xs: 1, sm: 2, lg: 6 } }}
              color="inherit"
              variant="text">
              Opere
            </Button>
            <Button sx={{ ml: 0 }} color="inherit" variant="text">
              Come funziona
            </Button>
          </Box>
        )}
        {/*<TextField sx={{flexGrow:0, ml: 1}} variant="standard" InputProps={{startAdornment: <InputAdornment position="start"><Search/></InputAdornment>}}/>*/}
        {!isMobile && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        <Box mx={2} flexGrow={1} />
        {!isMobile && (
          <Link
            sx={{ mr: 2, minWidth: "120px" }}
            href="#"
            color="tertiary.main">
            Sei una galleria?
          </Link>
        )}
        {isMobile && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        <Button
          sx={{ minWidth: "150px" }}
          onClick={() => auth.login()}
          color="secondary"
          variant="outlined">
          Login/Registrati
        </Button>
      </Box>
    </AppBar>
  );
};

export default Navbar;
