import React from "react";
import logo_artpay from "../../../../assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import { Favorite } from "@mui/icons-material";
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
  <div className={"bg-tertiary px-2 flex items-center justify-center w-fit ms-2"}>
    <Favorite className="text-white" />
    <span className={"text-white font-medium"}>ArtMatch</span>
  </div>
)


const MainLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <div className={"min-h-screen w-full bg-tertiary flex relative "}>
      <nav className={"absolute flex flex-col lg:flex-row lg:items-center top-6 left-6 gap-6"}>
        <div className={"custom-navbar "}>
          <BackButton />
        </div>
        <ArtMatchLabel />
      </nav>
      <SidePanel />
      <div className={'flex justify-center items-center w-full'}>{children}</div>
    </div>
  );
};

export default MainLayout;
