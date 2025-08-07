import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import UserIcon from "./icons/UserIcon.tsx";
import { useNavigate } from "../utils.ts";
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

  return (
    <>
      {/* Desktop Navbar */}
      <header className="fixed w-full z-20 top-6 px-6 md:px-12 hidden md:block">
        <div className="flex items-center gap-8 justify-between max-w-8xl mx-auto">
          <BackButton isVisible={!isGalleryPage} onNavigateBack={() => navigate("back")} />

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
          <BackButton isVisible={!isGalleryPage} onNavigateBack={() => navigate("back")} />

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
        <MobileMenu
          isAuthenticated={auth.isAuthenticated}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
};

const BackButton: React.FC<{ isVisible: boolean; onNavigateBack: () => void }> = ({ isVisible, onNavigateBack }) => {
  if (!isVisible) return <div />;

  return (
    <div className="custom-navbar flex py-4 px-2 bg-white">
      <button className="underline flex items-center gap-2 mx-2 cursor-pointer" onClick={onNavigateBack} type="button">
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
      <div className={'custom-navbar bg-white p-3'}>
        <Button sx={{ minWidth: "150px" }} onClick={onLogin} color="primary" variant="contained">
          Login/Registrati
        </Button>
      </div>
    )}
  </nav>
);

const AuthenticatedUserSection: React.FC<{
  showCheckout: boolean;
  onLogout: () => void;
  onProfileClick: () => void;
}> = ({ showCheckout, onLogout, onProfileClick }) => (
  <div className="flex items-center justify-center gap-3">
    <div className="flex items-center custom-navbar px-6 py-3.5  bg-white ">
      <NavLink
        to={"/dashboard"}
        className="hidden md:block md:px-4 py-3 text-tertiary hover:bg-gray-50 transition-colors rounded-full">
        Feed
      </NavLink>
      <NavLink
        to={"/profile/gallerie"}
        className="hidden md:block md:px-4 py-3 text-tertiary hover:bg-gray-50 transition-colors rounded-full">
        Seguiti
      </NavLink>
      <NavLink
        to={"/profile/opere-preferite"}
        className="md:px-4 py-3 text-tertiary hover:bg-gray-50 transition-colors rounded-full">
        <FavouriteIcon fontSize="small" />
      </NavLink>
      <IconButton onClick={onProfileClick} color="primary">
        <UserIcon />
      </IconButton>
    </div>

    <div className="custom-navbar p-3 bg-white ">
     <NavLink to={'/messaggi'}>
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
      <NavLink to={'/messaggi'} >
        <IconButton size="small">
          <MessageIcon size={"small"} />
        </IconButton>
      </NavLink>
    </div>

    <div className="custom-navbar p-3 bg-white rounded-full">
      <LogoFastArtpay size="small" showCheckOut={showCheckout} />
    </div>
    <div className="custom-navbar p-4 bg-white rounded-full md:hidden">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
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
          <MobileMenuList onNavigate={onNavigate} onLogout={onLogout} />
        ) : (
          <UnauthenticatedMenuContent onNavigate={onNavigate} />
        )}
      </div>

      {/* Footer with horizontal links */}
      <div className="p-6 border-t bg-gray-50">
        <div className="flex justify-center space-x-8 text-sm text-secondary">
          <button onClick={() => onNavigate('/privacy')} className="hover:text-primary transition-colors">
            Privacy
          </button>
          <button onClick={() => onNavigate('/terms')} className="hover:text-primary transition-colors">
            Termini
          </button>
          <button onClick={() => onNavigate('/help')} className="hover:text-primary transition-colors">
            Aiuto
          </button>
          <button onClick={() => onNavigate('/about')} className="hover:text-primary transition-colors">
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
  <div className="space-y-3 ">

    <button
      onClick={() => onNavigate("/dashboard")}
      className="flex items-center space-x-4 w-full p-4 rounded-lg text-left transition-colors"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
      </svg>
      <span className="text-white text-2xl">Feed</span>
    </button>

    <button
      onClick={() => onNavigate("/profile/gallerie")}
      className="flex items-center space-x-4 w-full p-4 rounded-lg text-left transition-colors"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-white text-2xl">Seguiti</span>
    </button>

    <button
      onClick={() => onNavigate("/profile/opere-preferite")}
      className="flex items-center space-x-4 w-full p-4 rounded-lg text-left transition-colors"
    >
      <FavouriteIcon />
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
        <Button
          onClick={() => onNavigate('/login')}
          color="primary"
          variant="contained"
          size="large"
          fullWidth
        >
          Login/Registrati
        </Button>
      </div>
    </div>
  </div>
);


export default GalleryNavbar;
