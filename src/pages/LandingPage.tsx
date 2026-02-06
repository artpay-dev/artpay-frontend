import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MiddleInfoLayout from "../features/cdspayments/layouts/middleinfolayout/MiddleInfoLayout.tsx";
import Payments from "../features/cdspayments/components/payments/Payments.tsx";

export interface HomeProps {
}

const Home: React.FC<HomeProps> = ({}) => {
  const [searchParams] = useSearchParams();
  const [orderVerified, setOrderVerified] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId != null) {
        try {
          // Call flashOrder endpoint to verify/retrieve order
          const response = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/wp-json/wp/v2/flashOrder?order_id=${orderId}`
          );

          if (response.ok) {
            localStorage.setItem("externalOrderKey", orderId);
            setOrderVerified(true);
            console.log("Order found successfully");
          } else {
            console.error("Order not found");
            setOrderError("Ordine non trovato");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          setOrderError("Errore durante il recupero dell'ordine");
        }
      } else {
        // No order_id in URL, might be continuing from localStorage
        const savedOrderKey = localStorage.getItem("externalOrderKey");
        if (savedOrderKey) {
          setOrderVerified(true);
        }
      }
    };

    fetchOrder();
  }, [orderId]);

  if (orderError) {
    return (
      <MiddleInfoLayout>
        <div className="text-center py-8">
          <p className="text-red-600">{orderError}</p>
          <p className="text-gray-600 mt-2">Contatta l'assistenza per maggiori informazioni.</p>
        </div>
      </MiddleInfoLayout>
    );
  }

  if (!orderVerified && orderId) {
    return (
      <MiddleInfoLayout>
        <div className="text-center py-8">
          <div className="inline-block size-12 border-2 border-primary border-b-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Verifica ordine in corso...</p>
        </div>
      </MiddleInfoLayout>
    );
  }

  return (
    <MiddleInfoLayout>
      <Payments />
    </MiddleInfoLayout>
  )
};

export default Home;
