import React, { useEffect, useState, useRef } from "react";
import { Button, IconButton } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import UserIcon from "./icons/UserIcon.tsx";
import { useNavigate } from "react-router-dom";
import { useData } from "../hoc/DataProvider.tsx";
import { NavLink, useLocation } from "react-router-dom";
import LogoFastArtpay from "./icons/LogoFastArtpay.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import ArrowLeftIcon from "./icons/ArrowLeftIcon.tsx";
import FavouriteIcon from "./icons/FavouriteIcon.tsx";
import MessageIcon from "./icons/custom/MessageIcon.tsx";
import MenuIcon from "./icons/MenuIcon.tsx";

const STORAGE_KEYS = {
  SHOW_CHECKOUT: "showCheckout",
  REDIRECT_TO_ACQUISTO_ESTERNO: "redirectToAcquistoEsterno",
  CHECK_ORDER: "checkOrder",
  IS_NOTIFIED: "isNotified",
} as const;

const ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  ACQUISTO: "/acquisto",
  ACQUISTO_ESTERNO: "/acquisto-esterno",
  GALLERIE: "/gallerie",
  COMPLETE: "/complete-order/",
} as const;

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showCheckout, setShowCheckout] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOW_CHECKOUT) || "false");
    } catch {
      return false;
    }
  });

  const handlePendingOrder = async (pendingOrder: any) => {
    if (pendingOrder && pendingOrder.created_via !== "gallery_auction") {
      setShowCheckout(true);
      setHasPendingOrder(true);
      localStorage.setItem(STORAGE_KEYS.SHOW_CHECKOUT, "true");
      return true;
    }
    localStorage.removeItem(STORAGE_KEYS.SHOW_CHECKOUT);
    return false;
  };

  const handleOnHoldOrder = async (orders: any) => {
    const redirectToAcquistoEsterno = localStorage.getItem(STORAGE_KEYS.REDIRECT_TO_ACQUISTO_ESTERNO);

    if (!redirectToAcquistoEsterno && location.pathname !== ROUTES.ACQUISTO_ESTERNO) {
      navigate(ROUTES.ACQUISTO_ESTERNO);
    }

    if (orders.created_via === "gallery_auction") {
      localStorage.removeItem(STORAGE_KEYS.SHOW_CHECKOUT);
      setPaymentData({ order: orders });
    } else {
      localStorage.setItem(STORAGE_KEYS.SHOW_CHECKOUT, "true");
      setShowCheckout(true);
    }
  };

  const handleProcessingOrder = async (processedOrders: any, orders: any) => {
    if (!processedOrders) return;

    if (processedOrders.created_via === "gallery_auction") {
      localStorage.removeItem(STORAGE_KEYS.SHOW_CHECKOUT);
      setShowCheckout(false);
      setPaymentData({ order: orders });
    } else {
      localStorage.setItem(STORAGE_KEYS.SHOW_CHECKOUT, "true");
      setShowCheckout(true);
    }
  };

  const handleOrders = async () => {
    try {
      const pendingOrder = await data.getPendingOrder();

      if (await handlePendingOrder(pendingOrder)) {
        return;
      }

      if (auth.isAuthenticated) {
        const orders = await data.getOnHoldOrder();
        if (orders) {
          await handleOnHoldOrder(orders);
        } else {
          const processedOrders = await data.getProcessingOrder();
          await handleProcessingOrder(processedOrders, orders);
        }
      }

      localStorage.setItem(STORAGE_KEYS.CHECK_ORDER, "false");
    } catch (error) {
      console.error("Errore nel recupero degli ordini:", error);
    }
  };

  useEffect(() => {
    handleOrders();
  }, [auth.isAuthenticated, data, hasPendingOrder]);

  /*const handleCheckout = () => {
    localStorage.setItem(STORAGE_KEYS.IS_NOTIFIED, "true");
    navigate(ROUTES.ACQUISTO);
  };*/

  const handleLogout = async () => {
    await auth.logout();
    navigate(ROUTES.HOME);
    handleShowMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogin = async () => {
    auth.login();
    handleShowMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handleShowMenu = (newValue: boolean) => {
    onMenuToggle?.(newValue);
  };

  const handleProfileClick = () => {
    if (auth.isAuthenticated) {
      handleNavigate(ROUTES.PROFILE);
    } else {
      handleLogin();
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigate = (link: string) => {
    handleShowMenu(false);
    setIsMobileMenuOpen(false);
    if (link.startsWith("http")) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  const isGalleryPage = location.pathname.startsWith(ROUTES.GALLERIE);
  const isCompletedOrderPage = location.pathname.startsWith(ROUTES.COMPLETE);


  return (
    <>
      {/* Desktop Navbar */}
      <header className="fixed w-full z-20 top-6 px-6 md:px-12 hidden md:block">
        <div className="flex items-center gap-8 justify-between max-w-8xl mx-auto">
          <BackButton isVisible={!isGalleryPage && !isCompletedOrderPage} />

          <div className="flex items-center justify-center gap-8">
            <MainNavigation
              isAuthenticated={auth.isAuthenticated}
              showCheckout={showCheckout}
              onLogout={handleLogout}
              onLogin={handleLogin}
              onProfileClick={handleProfileClick}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <header className="fixed w-full z-50 top-6 px-6 md:hidden">
        <div className="flex items-center gap-4 justify-between max-w-8xl mx-auto">
          <BackButton isVisible={!isGalleryPage} />

          <div className="flex items-center justify-center gap-4">
            <MobileNavigation
              isAuthenticated={auth.isAuthenticated}
              showCheckout={showCheckout}
              onMenuToggle={handleMobileMenuToggle}
              onLogin={handleLogin}
              isMenuOpen={isMobileMenuOpen}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <MobileMenu isAuthenticated={auth.isAuthenticated} onLogout={handleLogout} onNavigate={handleNavigate} />
      )}
    </>
  );
};

const BackButton: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const navigate = useNavigate();

  if (!isVisible) return <div />;

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="custom-navbar flex py-4 px-2 bg-white">
      <button className="underline flex items-center gap-2 mx-2 cursor-pointer" onClick={handleGoBack} type="button">
        <ArrowLeftIcon color="primary" />
        <span className="hidden md:block">Torna indietro</span>
      </button>
    </div>
  );
};

const MainNavigation: React.FC<{
  isAuthenticated: boolean;
  showCheckout: boolean;
  onLogout: () => void;
  onLogin: () => void;
  onProfileClick: () => void;
}> = ({ isAuthenticated, showCheckout, onLogout, onLogin, onProfileClick }) => (
  <nav className=" flex justify-end items-center space-x-4 w-full md:w-fit ">
    {isAuthenticated ? (
      <AuthenticatedUserSection showCheckout={showCheckout} onLogout={onLogout} onProfileClick={onProfileClick} />
    ) : (
      <div className={"custom-navbar bg-white p-3"}>
        <Button sx={{ minWidth: "150px" }} onClick={onLogin} color="primary" variant="contained">
          Login/Registrati
        </Button>
      </div>
    )}
  </nav>
);

const ProfileDropdown: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300); // Small delay to allow moving to menu
  };

  const handleMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMenuMouseLeave = () => {
    setOpen(false);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div 
      ref={anchorRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <IconButton
        color="primary"
        aria-controls={open ? "profile-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
      >
        <UserIcon />
      </IconButton>
      
      {open && (
        <div 
          className="absolute right-0 top-full mt-2 w-64 bg-[#F5F5F5] rounded-lg  z-50"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <div className="py-2">
            <button
              onClick={() => handleMenuItemClick("/profile")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer"
            >
              Il mio account
            </button>
            <button
              onClick={() => handleMenuItemClick("/profile/history-orders")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer"
            >
              I miei ordini
            </button>
            <button
              onClick={() => handleMenuItemClick("/profile/shipping-invoice-settings")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer "
            >
              Fatturazione e spedizione
            </button>
            <button
              onClick={() => handleMenuItemClick("/chi-siamo")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer "
            >
              Chi siamo
            </button>
            <button
              onClick={() => handleMenuItemClick("/contatti")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer "
            >
              Contatti
            </button>
            <button
              onClick={() => handleMenuItemClick("/guide")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer "
            >
              Guide
            </button>
            <button
              onClick={() => handleMenuItemClick("/faq")}
              className="w-full text-left px-4 py-2 text-base hover:underline transition-all cursor-pointer "
            >
              FAQ
            </button>
            <button
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-base text-[#EC6F7B] hover:underline transition-all cursor-pointer "
            >
              Esci
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthenticatedUserSection: React.FC<{
  showCheckout: boolean;
  onLogout: () => void;
  onProfileClick: () => void;
}> = ({ showCheckout, onLogout }) => (
  <div className="flex items-center justify-center gap-3">
    <div className="flex items-center custom-navbar px-6 py-3.5  bg-white ">
      <NavLink
        to={"/dashboard"}
        className="hidden md:block md:px-4 py-3 text-tertiary hover:bg-gray-50 transition-colors rounded-full">
        Feed
      </NavLink>
      <NavLink
        to={"/profile/seguiti"}
        className="hidden md:block md:px-4 py-3 text-tertiary hover:bg-gray-50 transition-colors rounded-full">
        Seguiti
      </NavLink>
      <NavLink
        to={"/profile/opere-preferite"}
        className="md:px-4 py-3 text-tertiary hover:bg-gray-50 transition-colors rounded-full">
        <FavouriteIcon fontSize="small" />
      </NavLink>
      <ProfileDropdown onLogout={onLogout} />
    </div>

    <div className="custom-navbar p-3 bg-white ">
      <NavLink to={"/profile/messaggi"}>
        <IconButton sx={{ position: "relative" }}>
          <MessageIcon size={"small"} />
        </IconButton>
      </NavLink>
    </div>

    <div className="custom-navbar p-5 bg-white ">
      <LogoFastArtpay size="small" showCheckOut={showCheckout} />
    </div>

    <Button onClick={onLogout} color="tertiary" variant="text" className="hidden! lg:block">
      Logout
    </Button>
  </div>
);

const MobileNavigation: React.FC<{
  isAuthenticated: boolean;
  showCheckout: boolean;
  onMenuToggle: () => void;
  onLogin: () => void;
  isMenuOpen: boolean;
}> = ({ isAuthenticated, showCheckout, onMenuToggle, onLogin, isMenuOpen }) => (
  <nav className="flex justify-end items-center space-x-3 w-full">
    {isAuthenticated ? (
      <AuthenticatedMobileSection showCheckout={showCheckout} onMenuToggle={onMenuToggle} isMenuOpen={isMenuOpen} />
    ) : (
      <div className="custom-navbar p-3 bg-white rounded-full">
        <Button onClick={onLogin} color="primary" variant="contained" size="small">
          Login/Registrati
        </Button>
      </div>
    )}
  </nav>
);

const AuthenticatedMobileSection: React.FC<{
  showCheckout: boolean;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}> = ({ showCheckout, onMenuToggle, isMenuOpen }) => (
  <div className="flex items-center justify-center gap-3">
    <div className="custom-navbar p-2 bg-white rounded-full">
      <NavLink to={"/profile/messaggi"}>
        <IconButton size="small">
          <MessageIcon size={"small"} />
        </IconButton>
      </NavLink>
    </div>

    <div className="custom-navbar p-3 bg-white rounded-full">
      <LogoFastArtpay size="small" showCheckOut={showCheckout} />
    </div>
    <div className="custom-navbar p-4 bg-white rounded-full md:hidden">
      <button type="button" onClick={onMenuToggle} aria-label="Toggle menu">
        {isMenuOpen ? (
          <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <MenuIcon className="cursor-pointer" />
        )}
      </button>
    </div>
  </div>
);

const MobileMenu: React.FC<{
  isAuthenticated: boolean;
  onLogout: () => void;
  onNavigate: (link: string) => void;
}> = ({ isAuthenticated, onLogout, onNavigate }) => (
  <div className="fixed inset-0 z-40 bg-[#010F22] pt-24">
    {/* Menu Content */}
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 py-8 text-white">
        {isAuthenticated ? (
          <>
            <MobileMenuList onNavigate={onNavigate} onLogout={onLogout} />
            <div className="mt-14">
              <ul className={"text-white ps-8 leading-[125%] space-y-4"}>
                <li>
                  <NavLink to={"/profile"}>Il mio account</NavLink>
                </li>
                <li>
                  <NavLink to={"/profile/history-orders"}>I miei ordini</NavLink>
                </li>
                <li>
                  <NavLink to={"/profile/shipping-invoice-settings"}>Fatturazione e spedizione</NavLink>
                </li>
                <li>
                  <NavLink to={"/chi-siamo"}>Chi siamo</NavLink>
                </li>
                <li>
                  <NavLink to={"/contatti"}>Contatti</NavLink>
                </li>
                <li>
                  <NavLink to={"/guide"}>Guide</NavLink>
                </li>
                <li>
                  <NavLink to={"/faq"}>FAQ</NavLink>
                </li>
                <li>
                  <button onClick={onLogout} className={'text-[#EC6F7B]'}>Esci</button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <UnauthenticatedMenuContent onNavigate={onNavigate} />
        )}
      </div>

      {/* Footer with horizontal links */}
      <div className="p-6">
        <div className="flex justify-center space-x-8 text-sm text-primary">
          <button onClick={() => onNavigate("/privacy")} className="hover:text-secondary transition-colors">
            Privacy
          </button>
          <button onClick={() => onNavigate("/terms")} className="hover:text-secondary transition-colors">
            Termini
          </button>
          <button onClick={() => onNavigate("/help")} className="hover:text-secondary transition-colors">
            Aiuto
          </button>
          <button onClick={() => onNavigate("/about")} className="hover:text-secondary transition-colors">
            Info
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MobileMenuList: React.FC<{
  onNavigate: (link: string) => void;
  onLogout: () => void;
}> = ({ onNavigate }) => (
  <div className="space-y-6 ps-8">
    <button
      onClick={() => onNavigate("/dashboard")}
      className="flex items-center space-x-4 w-full rounded-lg text-left transition-colors">
      <span className="text-white text-2xl">Feed</span>
    </button>

    <button
      onClick={() => onNavigate("/profile/seguiti")}
      className="flex items-center space-x-4 w-full rounded-lg text-left transition-colors">
      <span className="text-white text-2xl">Seguiti</span>
    </button>

    <button
      onClick={() => onNavigate("/profile/opere-preferite")}
      className="flex items-center space-x-4 w-full rounded-lg text-left transition-colors">
      <span className="text-white text-2xl">Lista dei desderi</span>
    </button>
  </div>
);

const UnauthenticatedMenuContent: React.FC<{
  onNavigate: (link: string) => void;
}> = ({ onNavigate }) => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <h3 className="text-xl font-medium text-white mb-4">Accedi per vedere il menu completo</h3>
      <p className="text-secondary mb-6">Effettua il login per accedere a tutte le funzionalità</p>
      <div className="custom-navbar bg-wgite p-3">
        <Button onClick={() => onNavigate("/login")} color="primary" variant="contained" size="large" fullWidth>
          Login/Registrati
        </Button>
      </div>
    </div>
  </div>
);

export default GalleryNavbar;
