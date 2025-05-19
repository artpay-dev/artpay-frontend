import React, { useEffect } from "react";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSearchParams } from "react-router-dom";
//import { useNavigate } from "../utils.ts";
import MiddleInfoLayout from "../features/cdspayments/layouts/middleinfolayout/MiddleInfoLayout.tsx";
import Payments from "../features/cdspayments/components/payments/Payments.tsx";

export interface HomeProps {
}

const Home: React.FC<HomeProps> = ({}) => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  //const navigate = useNavigate();

  const orderId = searchParams.get("order_id");


  useEffect(() => {
    if(orderId != null) localStorage.setItem("externalOrderKey",orderId);
    /*if (!auth.isAuthenticated) {
      auth.login();
    }
    else{
      navigate('/acquisto-esterno');
    }*/

  }, [auth.isAuthenticated, orderId]);


  /*return (
    <div className={'w-full h-screen bg-primary'}></div>
  );*/

  return (
    <MiddleInfoLayout>
      <Payments />
    </MiddleInfoLayout>
  )
};

export default Home;
