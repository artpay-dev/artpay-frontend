import React, { useState } from "react";
import logo_artpay from "../../../../assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import { Favorite, Menu } from "@mui/icons-material";
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import { SidePanel } from "../../components";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button className={"flex py-4 px-6 gap-2 items-base cursor-pointer"} onClick={() => navigate(-1)}>
      <span className={"underline underline-offset-2 "}>Torna su</span>{" "}
      <span>
        <img src={logo_artpay} alt="Logo artpay" className={"h-5"} />
      </span>
    </button>
  );
};

const ArtMatchLabel = () => (
  <div className={"bg-tertiary px-2 flex items-center justify-center w-fit ms-2 relative"}>
    <Favorite className="text-white" />
    <span className={"text-white font-medium"}>ArtMatch</span>
    <span className={'text-xs block absolute bottom-0 right-0 text-white shadow -rotate-10 bg-linear-to-tr from-primary to-blue-600 border border-primary px-3 py-1 rounded-full translate-y-3/4 translate-x-1/3'}>Beta</span>
  </div>
)


import { Artwork } from "../../../../types/artwork";

interface MainLayoutProps {
  children: React.ReactNode;
  onAiResults?: (results: Artwork[]) => void;
}

const MainLayout = ({ children, onAiResults }: MainLayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={"min-h-screen w-full bg-tertiary flex relative "}>
      <nav className={"absolute flex flex-col lg:flex-row lg:items-center top-6 left-6 gap-6 z-80"}>
        <div className={"custom-navbar flex items-center gap-2 bg-white"}>
          {isMobile && (
            <IconButton
              onClick={toggleDrawer}
              sx={{
                paddingLeft: "16px",
                color: "text.secondary",
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}>
              <Menu />
            </IconButton>
          )}
          <BackButton />
        </div>
        <ArtMatchLabel />
      </nav>
      {!isMobile && <SidePanel open={true} onClose={toggleDrawer} onAiResults={onAiResults} />}
      {isMobile && <SidePanel open={drawerOpen} onClose={toggleDrawer} onAiResults={onAiResults} />}
      <div className={'flex justify-center items-center flex-1'}>{children}</div>
    </div>
  );
};

export default MainLayout;
