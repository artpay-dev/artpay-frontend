import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MiddleInfoLayout from "../features/cdspayments/layouts/middleinfolayout/MiddleInfoLayout.tsx";
import Payments from "../features/cdspayments/components/payments/Payments.tsx";

export interface HomeProps {
}

const Home: React.FC<HomeProps> = ({}) => {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");


  useEffect(() => {
    if(orderId != null) localStorage.setItem("externalOrderKey",orderId);


  }, []);



  return (
    <MiddleInfoLayout>
      <Payments />
    </MiddleInfoLayout>
  )
};

export default Home;
