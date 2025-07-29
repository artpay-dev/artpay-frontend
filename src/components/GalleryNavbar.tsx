import React, { useEffect, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import UserIcon from "./icons/UserIcon.tsx";

import ShoppingBagIcon from "./icons/ShoppingBagIcon.tsx";
import { useNavigate } from "../utils.ts";
import { useData } from "../hoc/DataProvider.tsx";
import { useLocation } from "react-router-dom";
import LogoFastArtpay from "./icons/LogoFastArtpay.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import ArrowLeftIcon from "./icons/ArrowLeftIcon.tsx";

export interface GalleryNavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const GalleryNavbar: React.FC<GalleryNavbarProps> = ({ onMenuToggle }) => {
  const auth = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const { setPaymentData } = usePaymentStore();

  const [hasPendingOrder, setHasPendingOrder] = useState(false);

  const [showCheckout, setShowCheckout] = useState<boolean>(
    JSON.parse(localStorage.getItem("showCheckout") as string) || false,
  );

  const handleOrders = async () => {
    try {
      const pendingOrder = await data.getPendingOrder();

      if (pendingOrder && pendingOrder.created_via != "gallery_auction") {
        setShowCheckout(true);
        setHasPendingOrder(true);
        localStorage.setItem("showCheckout", "true");
        console.log("pendingorder", pendingOrder);
        return;
      } else {
        localStorage.removeItem("showCheckout");
      }

      if (auth.isAuthenticated) {
        const orders = await data.getOnHoldOrder();
        if (orders) {
          const redirectToAcquistoEsterno = localStorage.getItem("redirectToAcquistoEsterno");

          if (!redirectToAcquistoEsterno && location.pathname !== "/acquisto-esterno") {
            navigate("/acquisto-esterno");
          }

          console.log(orders);

          if (orders.created_via == "gallery_auction") {
            localStorage.removeItem("showCheckout");
            setPaymentData({
              order: orders,
            });
          } else {
            localStorage.setItem("showCheckout", "true");
            setShowCheckout(true);
          }
        } else {
          const processedOrders = await data.getProcessingOrder();
          console.log(processedOrders);
          if (!processedOrders) {
            return;
          }
          console.log(processedOrders);
          if (processedOrders.created_via == "gallery_auction") {
            localStorage.removeItem("showCheckout");
            setShowCheckout(false);
            setPaymentData({
              order: orders,
            });
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
    handleOrders();
  }, [auth.isAuthenticated, data, hasPendingOrder, localStorage]);

  const handleCheckout = () => {
    localStorage.setItem("isNotified", "true");
    navigate("/acquisto");
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

  return (
    <header className={"fixed w-full z-20 top-6 px-6 md:px-12"}>
      <div className={"flex items-center gap-8 justify-between max-w-8xl mx-auto"}>
        {location.pathname.startsWith("/gallerie") ? (
          <div></div>
        ) : (
          <div className={"custom-navbar flex py-4 px-2 bg-white"}>
            <button
              className={"underline flex items-center gap-2 mx-2 cursor-pointer"}
              onClick={() => navigate("back")}>
              {" "}
              <ArrowLeftIcon color={"primary"} /> <span className={"hidden md:block"}>Torna indietro</span>
            </button>
          </div>
        )}
        <div className={"flex items-center justify-center gap-8"}>
          <nav className={"px-6 py-4 custom-navbar flex justify-end items-center bg-white space-x-4 w-full md:w-fit"}>
            {auth.isAuthenticated ? (
              <div className={"flex items-center justify-center gap-6"}>
                <span className={"text-secondary hidden md:block"}>Transazioni</span>
                <LogoFastArtpay size={"small"} />
                {showCheckout && (
                  <div className={"flex items-center justify-center space-x-2.5"}>
                    <IconButton sx={{ position: "relative" }} onClick={() => handleCheckout()} color="primary">
                      <ShoppingBagIcon />
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
                  </div>
                )}
                <Button onClick={() => handleLogout()} color="tertiary" variant="text" className={"hidden! lg:block"}>
                  Logout
                </Button>
                <IconButton onClick={() => handleProfileClick()} color="primary">
                  <UserIcon color="primary" />
                </IconButton>
              </div>
            ) : (
              <Button sx={{ minWidth: "150px" }} onClick={() => handleLogin()} color="primary" variant="contained">
                Login/Registrati
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default GalleryNavbar;
