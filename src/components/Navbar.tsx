import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  SxProps,
  Theme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Logo from "./icons/Logo";
import { Search } from "@mui/icons-material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import MenuIcon from "./icons/MenuIcon.tsx";
import { useEnvDetector, useNavigate } from "../utils.ts";

export interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const auth = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const environment = useEnvDetector();

  const [showMenu, setShowMenu] = useState(false);

  const menuOpen = showMenu && isMobile;

  const mobileStyleOverrides: SxProps<Theme> = {
    top: 0,
    left: 0,
    width: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" },
    m: { xs: 1, sm: 2 },
    height: menuOpen ? "50%" : undefined,
    transition: "all 0.5s",
    overflow: "hidden",
    zIndex: 5
  };


  const handleShowMenu = (newValue: boolean) => {
    setShowMenu(newValue);
    if (onMenuToggle) {
      onMenuToggle(newValue);
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

  type MenuLinks = {
    label: string;
    href: string;
    requireAuth: boolean;
  };

  const menuLinks: MenuLinks[] = [
    /*{ label: "Gallerie", href: "/gallerie ", requireAuth: true },*/
    //{ label: "Collezionisti", href: "/artpay-per-collezionisti", requireAuth: false },
    { label: "Chi siamo", href: "/chi-siamo", requireAuth: false },
    //{ label: "ArtMatch", href: "https://artpay.art/art-match" }
  ];

  return (
    <AppBar
      color="default"
      sx={
        isMobile
          ? mobileStyleOverrides
          : {
              mx: { xs: 8, md: 6, lg: 6, xl: "auto" },
              right: 0,
              px: { xs: undefined, lg: 6 },
              maxWidth: "1344px",
              zIndex: 10,
            }
      }
      elevation={0}>
      <Box display="flex" alignItems="center" sx={{}}>
        <Box
          sx={{ height: "24px", cursor: "pointer" }}
          display="flex"
          alignItems="center"
          onClick={() => handleNavigate("/")}>
          <Logo />
        </Box>
        {!isMobile && (
          <Box sx={{ ml: 3 }}>
            {menuLinks
              .filter((l) => auth.isAuthenticated || !l.requireAuth)
              .map((link, i) => {
                if (link.label === "Chi siamo" && environment !== "production" && auth.isAuthenticated) return;

                return (
                  <Button
                    key={`btn-link-${i}`}
                    sx={{ px: 2 }}
                    onClick={() => handleNavigate(link.href)}
                    color="inherit"
                    variant="text">
                    {link.label}
                  </Button>
                );
              })}
          </Box>
        )}
        {!isMobile && false && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        <Box mx={2} flexGrow={1} />
        {isMobile && false && (
          <IconButton>
            <Search />
          </IconButton>
        )}
        {isMobile && (
          <IconButton sx={{ transform: "translateX(8px)" }} onClick={() => handleShowMenu(!showMenu)}>
            <MenuIcon color="inherit" />
          </IconButton>
        )}
      </Box>
    </AppBar>
  );
};

export default Navbar;
