import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Logo from "./icons/Logo";
import { Search } from "@mui/icons-material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import UserIcon from "./icons/UserIcon.tsx";
import { useNavigate } from "react-router-dom";
import ShoppingBagIcon from "./icons/ShoppingBagIcon.tsx";

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const theme = useTheme();
  const auth = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const mobileStyleOverrides: SxProps<Theme> = {
    top: 0,
    left: 0,
    width: "100%",
    margin: 0,
    borderRadius: 0,
  };

  const handleCheckout = () => {
    navigate("/acquisti");
  };

  return (
    <AppBar color="default" sx={isMobile ? mobileStyleOverrides : {}} elevation={0}>
      <Box display="flex" alignItems="center" sx={{ height: "100%" }}>
        <Box sx={{ height: "24px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <Logo />
        </Box>
        {!isMobile && (
          <Box>
            <Button
              sx={{ ml: { xs: 1, sm: 2, lg: 6 } }}
              onClick={() => navigate("/artworks")}
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
        {isMobile && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        {auth.isAuthenticated ? (
          <>
            <Typography sx={{ mr: 2 }} variant="body2" color="primary">
              Ciao {auth.user?.username}
            </Typography>
            <IconButton onClick={() => handleCheckout()} color="primary">
              <ShoppingBagIcon color="primary" />
            </IconButton>
            <IconButton onClick={() => navigate("/profile")} color="primary">
              <UserIcon color="primary" />
            </IconButton>
          </>
        ) : (
          <>
            {!isMobile && (
              <Link sx={{ mr: 2, minWidth: "120px" }} href="#" color="tertiary.main">
                Sei una galleria?
              </Link>
            )}
            <Button sx={{ minWidth: "150px" }} onClick={() => auth.login()} color="secondary" variant="outlined">
              Login/Registrati
            </Button>
          </>
        )}
      </Box>
    </AppBar>
  );
};

export default Navbar;
