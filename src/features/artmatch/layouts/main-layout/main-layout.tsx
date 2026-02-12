import React, { useState } from "react";
import logo_artpay from "../../../../assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import { Favorite, Menu } from "@mui/icons-material";
import { IconButton, useMediaQuery, useTheme, Box } from "@mui/material";
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
  <Box
    className={"bg-tertiary px-2 flex items-center justify-center w-fit ms-2"}
    sx={{ position: "relative" }}>
    <Favorite className="text-white" />
    <span className={"text-white font-medium"}>ArtMatch</span>
    <Box
      component="span"
      sx={{
        position: "absolute",
        bottom: 0,
        right: 0,
        transform: "translate(30%, 60%) rotate(-8deg)",
        fontSize: "0.625rem",
        fontWeight: 700,
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "4px 10px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.5), 0 2px 4px rgba(118, 75, 162, 0.3)",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        border: "1.5px solid rgba(255, 255, 255, 0.3)",
      }}>
      Beta
    </Box>
  </Box>
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
