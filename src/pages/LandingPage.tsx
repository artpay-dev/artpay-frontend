import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import HeroHome from "../components/HeroHome.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "../utils.ts";

export interface HomeProps {
}

const Home: React.FC<HomeProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");


  useEffect(() => {
    setIsReady(false);
    if(orderId != null) localStorage.setItem("externalOrderKey",orderId);
    if (!auth.isAuthenticated) {
      auth.login();
    }
    else{
      navigate('/acquisto-esterno');
    }

  }, [auth.isAuthenticated, orderId]);


  return (
    <DefaultLayout pageLoading={!isReady} topBar={<HeroHome />} maxWidth="xl">
    </DefaultLayout>
    /*<div className={'w-full h-screen bg-primary'}></div>*/
  );
};

export default Home;
