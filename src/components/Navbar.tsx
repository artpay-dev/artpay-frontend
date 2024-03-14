import React, { useState } from "react";
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
  useTheme
} from "@mui/material";
import Logo from "./icons/Logo";
import { Search } from "@mui/icons-material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import UserIcon from "./icons/UserIcon.tsx";
import { useNavigate } from "react-router-dom";
import ShoppingBagIcon from "./icons/ShoppingBagIcon.tsx";
import MenuIcon from "./icons/MenuIcon.tsx";

export interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const auth = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);

  const menuOpen = showMenu && isMobile;

  const mobileStyleOverrides: SxProps<Theme> = {
    top: 0,
    left: 0,
    width: "calc(100% - 16px)",
    margin: "8px",
    height: menuOpen ? "calc(100dvh - 16px)" : undefined,
    transition: "all 0.5s",
    overflow: "hidden"
    //borderRadius: 0
  };

  const handleCheckout = () => {
    navigate("/acquisti");
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
    handleShowMenu(false);
  };
  const handleLogin = async () => {
    auth.login();
    handleShowMenu(false);
  };

  const handleShowMenu = (newValue: boolean) => {
    setShowMenu(newValue);
    if (onMenuToggle) {
      onMenuToggle(newValue);
    }
  };

  const handleProfileClick = () => {
    if (auth.isAuthenticated) {
      handleNavigate("/profile");
    } else {
      handleLogin();
    }
  };

  const handleNavigate = (link: string) => {
    handleShowMenu(false);
    if (link.startsWith("http")) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  const authButton = <Button sx={{ minWidth: "150px" }} onClick={() => handleLogin()} color="secondary"
                             variant="outlined">
    Login/Registrati
  </Button>;

  const galleryLink = <Link sx={{ mr: isMobile ? 0 : 2, minWidth: "120px" }} href="#" color="tertiary.main">
    Sei una galleria?
  </Link>;

  const menuLinks = [
    { label: "Gallerie", href: "https://artpay.art/artpay-per-gallerie " },
    { label: "Collezionisti", href: "https://artpay.art/artpay-per-collezionisti " },
    { label: "Chi siamo", href: "/chi-siamo" },
    { label: "ArtMatch", href: "https://artpay.art/art-match" }
  ];

  //onMenuToggle

  return (
    <AppBar color="default" sx={isMobile ? mobileStyleOverrides : { mx: { xs: 8, lg: 12 }, right: 0 }} elevation={0}>
      <Box display="flex" alignItems="center" sx={{}}>
        <Box sx={{ height: "24px", cursor: "pointer" }} onClick={() => handleNavigate("/")}>
          <Logo />
        </Box>
        {!isMobile && (
          <Box sx={{ ml: 3 }}>
            {menuLinks.map((link, i) => <Button key={`btn-link-${i}`} sx={{ px: 1 }}
                                                onClick={() => handleNavigate(link.href)}
                                                color="inherit"
                                                variant="text">
              {link.label}
            </Button>)}
          </Box>
        )}
        {/*<TextField sx={{flexGrow:0, ml: 1}} variant="standard" InputProps={{startAdornment: <InputAdornment position="start"><Search/></InputAdornment>}}/>*/}
        {(!isMobile && false) && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        <Box mx={2} flexGrow={1} />
        {(isMobile && false) && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        {auth.isAuthenticated ? (
          <>
            {!isMobile &&
              <Typography sx={{ mr: 2 }} variant="body2" color="primary">
                Ciao {auth.user?.username}
              </Typography>
            }
            <IconButton onClick={() => handleCheckout()} color="primary">
              <ShoppingBagIcon color="primary" />
            </IconButton>
            <IconButton onClick={() => handleProfileClick()} color="primary">
              <UserIcon color="primary" />
            </IconButton>
          </>
        ) : (
          <>
            {!isMobile && galleryLink}
            {!isMobile ? authButton : <IconButton onClick={() => handleProfileClick()} color="primary">
              <UserIcon color="primary" />
            </IconButton>}
          </>
        )}
        {isMobile && <IconButton onClick={() => handleShowMenu(!showMenu)}><MenuIcon /></IconButton>}
      </Box>
      {menuOpen && <Box flexGrow={1} pt={3} display="flex" flexDirection="column" sx={{ height: "auto" }}>
        {menuLinks.map((link, i) => <Button key={`btn-link-mobile-${i}`} sx={{}}
                                            onClick={() => handleNavigate(link.href)}
                                            color="inherit"
                                            variant="text">
          {link.label}
        </Button>)}


        <Box flexGrow={1}></Box>
        {auth.isAuthenticated ? <>
          <Typography sx={{ textAlign: "center" }} variant="body2" color="primary">
            Ciao {auth.user?.username}
          </Typography>
          <Button sx={{ mb: 12 }} onClick={() => handleLogout()} color="tertiary" variant="text">
            Logout
          </Button>
        </> : <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mb: 12 }}>
          <Box my={1} sx={{ textAlign: "center" }}>
            {galleryLink}
          </Box>
          {authButton}
        </Box>}
      </Box>}
    </AppBar>
  );
};

export default Navbar;
