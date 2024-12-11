import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import HeroHome from "../components/HeroHome.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "../utils.ts";
import { CheckedExternalOrderKey, useData } from "../hoc/DataProvider.tsx";

export interface HomeProps {
}

const Home: React.FC<HomeProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const data = useData();

  const sku = searchParams.get("sku");
  const email = searchParams.get("email");


  useEffect(() => {
    setIsReady(false);
    if(sku && email){
      localStorage.setItem('temporaryOrder', JSON.stringify({sku,email}));
    }
    if (!auth.isAuthenticated) {
      auth.login();
    }
    else{
        data.getUserProfile().then((userInfo) => {
          auth.checkIfExternalOrder(userInfo.email).then((resp: any) =>{
            const checkedExternalOrderKey = localStorage.getItem(CheckedExternalOrderKey);
            if(checkedExternalOrderKey){
              localStorage.removeItem(CheckedExternalOrderKey);
            }
            if(resp.status === 200) navigate('/acquisto-esterno');

          });
        })
    }
  }, [auth.isAuthenticated, sku, email]);


  return (
    <DefaultLayout pageLoading={!isReady} topBar={<HeroHome />} maxWidth="xl">

    </DefaultLayout>
  );
};

export default Home;
