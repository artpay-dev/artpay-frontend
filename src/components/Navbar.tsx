import React, { useEffect, useState } from "react";
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

import ShoppingBagIcon from "./icons/ShoppingBagIcon.tsx";
import MenuIcon from "./icons/MenuIcon.tsx";
import { useEnvDetector, useNavigate } from "../utils.ts";
import { useData } from "../hoc/DataProvider.tsx";
import { useLocation } from "react-router-dom";
import LogoFastArtpay from "./icons/LogoFastArtpay.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";

export interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const auth = useAuth();
  const data = useData();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const {order, setPaymentData} = usePaymentStore()

  console.dir(order)

  const environment = useEnvDetector();

  const [showMenu, setShowMenu] = useState(false);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);

  const [showCheckout, setShowCheckout] = useState<boolean>(
    JSON.parse(localStorage.getItem("showCheckout") as string) || false,
  );

  const handleOrders = async () => {
    const shouldCheck = JSON.parse(localStorage.getItem("checkOrder") ?? "true");

    if (!shouldCheck) return;

    try {
      const pendingOrder = await data.getPendingOrder();
      console.log(pendingOrder);

      if (pendingOrder) {
        setShowCheckout(true);
        setHasPendingOrder(true);
        localStorage.setItem("showCheckout", "true");
      } else {
        localStorage.removeItem("showCheckout");
      }

      if (auth.isAuthenticated) {
        const orders = await data.getOnHoldOrder();
        console.log(orders);
        if (orders) {
          const redirectToAcquistoEsterno = localStorage.getItem("redirectToAcquistoEsterno");

          if (!redirectToAcquistoEsterno && location.pathname !== "/acquisto-esterno") {
            navigate("/acquisto-esterno");
          }

          console.log(orders)

          if(orders.created_via == "gallery_auction") {
            //localStorage.setItem("checkoutUrl", "/acquisto-esterno");
            setPaymentData({
              order: orders,
            })
          } else {
            localStorage.setItem("showCheckout", "true");
            setShowCheckout(true);
          }
        } else {
          const processedOrders = await data.getProcessingOrder();
          console.log(processedOrders);
          if (!processedOrders) {
            localStorage.removeItem("showCheckout");
            localStorage.removeItem("checkoutUrl");
            return
          }


          if (processedOrders.created_via == "gallery_auction") {
            //localStorage.setItem("checkoutUrl", "/acquisto-esterno");
            setPaymentData({
              order: orders,
            })
          } else {
            localStorage.setItem("showCheckout", "true");
            setShowCheckout(true);
          }
        }
      }

      localStorage.setItem("checkOrder", "false");
    } catch (error) {
      console.error("Errore nel recupero degli ordini:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("checkOrder") === null) {
      localStorage.setItem("checkOrder", "true");
    }
    handleOrders();
  }, [auth.isAuthenticated, data, hasPendingOrder]);

  const menuOpen = showMenu && isMobile;

  const mobileStyleOverrides: SxProps<Theme> = {
    top: 0,
    left: 0,
    width: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" },
    m: { xs: 1, sm: 2 },
    height: menuOpen ? "50%" : undefined,
    transition: "all 0.5s",
    overflow: "hidden",
    //borderRadius: 0
  };

  const handleCheckout = () => {
    /*const checkoutUrl = localStorage.getItem("checkoutUrl");
    if (checkoutUrl) {
      navigate(checkoutUrl);
      localStorage.setItem("isNotified", "true");
    } else {
      navigate("/acquisto");
    }*/
    localStorage.setItem("isNotified", "true");
    navigate("/checkout");
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

  const authButton = (
    <div className={"mb-8 md:mb-0"}>
      <Button sx={{ minWidth: "150px" }} onClick={() => handleLogin()} color="primary" variant="outlined">
        Login/Registrati
      </Button>
    </div>
  );

  const galleryLink = (
    <Link sx={{ mr: isMobile ? 0 : 2, minWidth: "120px" }} href="https://gallerie.artpay.art" color="tertiary.main">
      Sei una galleria?
    </Link>
  );

  type MenuLinks = {
    label: string;
    href: string;
    requireAuth: boolean;
  };

  let menuLinks: MenuLinks[];

  if (environment === "production") {
    menuLinks = [{ label: "Chi siamo", href: "/chi-siamo", requireAuth: false }];
  } else {
    menuLinks = [
      { label: "Gallerie", href: "/gallerie ", requireAuth: true },
      //{ label: "Collezionisti", href: "/artpay-per-collezionisti", requireAuth: false },
      { label: "Chi siamo", href: "/chi-siamo", requireAuth: false },
      //{ label: "ArtMatch", href: "https://artpay.art/art-match" }
    ];
  }

  //onMenuToggle

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
          {/*<BetaLabel ml={1} mt={0.5} />*/}
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
        {/*<TextField sx={{flexGrow:0, ml: 1}} variant="standard" InputProps={{startAdornment: <InputAdornment position="start"><Search/></InputAdornment>}}/>*/}
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
        {auth.isAuthenticated ? (
          <>
            {!isMobile && (
              <Typography variant="body1" fontWeight={500} color="textPrimary">
                Ciao {auth.user?.username}!
              </Typography>
            )}
            <IconButton sx={{ mr: showCheckout ? 4 : 0, ml: 1 }} onClick={() => handleProfileClick()} color="inherit">
              <UserIcon fontSize="inherit" color="inherit" />
            </IconButton>
            <LogoFastArtpay />

            {showCheckout && (
              <IconButton
                sx={{ mr: 0, transform: { xs: undefined, md: "translateX(8px)" }, position: "relative" }}
                onClick={() => handleCheckout()}
                color="primary">
                <ShoppingBagIcon color="inherit" />
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    bgcolor: "red",
                    borderRadius: "50%",
                  }}
                />
              </IconButton>
            )}
          </>
        ) : (
          <>
            {!isMobile && galleryLink}
            {!isMobile ? (
              authButton
            ) : (
              <IconButton onClick={() => handleProfileClick()} color="primary">
                <UserIcon color="primary" />
              </IconButton>
            )}
          </>

        )}
        {isMobile && (
          <IconButton sx={{ transform: "translateX(8px)" }} onClick={() => handleShowMenu(!showMenu)}>
            <MenuIcon color="inherit" />
          </IconButton>
        )}
      </Box>
      {menuOpen && (
        <Box flexGrow={1} pt={3} display="flex" flexDirection="column" sx={{ height: "auto" }}>
          {menuLinks
            .filter((l) => auth.isAuthenticated || !l.requireAuth)
            .map((link, i) => {
              if (link.label === "Chi siamo" && environment !== "production" && auth.isAuthenticated) return;

              return (
                <Button
                  key={`btn-link-mobile-${i}`}
                  sx={{}}
                  onClick={() => handleNavigate(link.href)}
                  color="inherit"
                  variant="text">
                  {link.label}
                </Button>
              );
            })}

          <Box flexGrow={1}></Box>
          {auth.isAuthenticated ? (
            <>
              <hr className={"text-gray-300 mt-4 mb-6"} />
              <Typography sx={{ textAlign: "center" }} color="primary">
                Ciao {auth.user?.username}
              </Typography>
              <Button sx={{ mb: 6 }} onClick={() => handleLogout()} color="tertiary" variant="text">
                Logout
              </Button>
            </>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mb: 6 }}>
              <Box my={1} sx={{ textAlign: "center" }}>
                {galleryLink}
              </Box>
              {authButton}
            </Box>
          )}
        </Box>
      )}
    </AppBar>
  );
};

export default Navbar;
