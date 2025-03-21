import CdsTransactionLayout from "../features/cdspayments/components/cdstransactionlayout/CdsTransactionLayout.tsx";
import { Order } from "../types/order.ts";
import { useEffect, useState } from "react";
import PaymentMethodsList from "../features/cdspayments/components/paymentmethodslist/PaymentMethodsList.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Gallery } from "../types/gallery.ts";
import { Artwork } from "../types/artwork.ts";
import usePaymentStore from "../features/cdspayments/store.ts";
import Payments from "../features/cdspayments/components/payments/Payments.tsx";
import SantanderFlow from "../features/cdspayments/components/santanderflow/SantanderFlow.tsx";
import SkeletonCard from "../features/cdspayments/components/paymentprovidercard/SkeletonCard.tsx";
import { useNavigate } from "react-router-dom";

const CdsPaymentPage = () => {
  const data = useData();
  const [isLoading, setIsLoading] = useState(false);
  const { setPaymentData, order, paymentMethod, loading, paymentStatus } = usePaymentStore();
  const navigate = useNavigate();

  const choosePaymentMethod = paymentMethod == "bnpl";

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setIsLoading(true);

      try {
        let orderResp = await data.getOnHoldOrder();


        if (!orderResp) {
          orderResp = await data.getProcessingOrder();


          if (orderResp) {
            console.log("Trovato ordine in processing, NON creo il payment intent.");
          } else {
            localStorage.removeItem('CdsOrder')
            navigate('/')

            throw new Error("Nessun ordine trovato");
          }
        }

        const productId = orderResp.line_items[0]?.product_id?.toString();
        if (!productId) throw new Error("Invalid product ID");

        const artworkResp: Artwork = await data.getArtwork(productId);
        if (!artworkResp) throw new Error("Artwork not found");

        const vendorResp: Gallery = await data.getGallery(artworkResp.vendor);
        if (!vendorResp) throw new Error("Vendor not found");


        if (orderResp.status === "on-hold") {
          const createPayment = await data.createPaymentIntentCds({ wc_order_key: orderResp?.order_key });
          if (!createPayment) throw new Error("Errore nella creazione del payment intent");
          console.log("Primo payment intent creato", createPayment);

          setPaymentData({
            paymentIntent: createPayment,
          });
        }

        setPaymentData({
          order: orderResp,
          vendor: vendorResp,
          paymentStatus: orderResp.status,
          paymentMethod: orderResp.payment_method,
        });

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [data, paymentMethod, paymentStatus]);




  return (
    <CdsTransactionLayout>
      {choosePaymentMethod ? (
        <PaymentMethodsList order={order as Order} isLoading={isLoading || loading} />
      ) : order?.status === "on-hold" ? (
        <Payments order={order as Order} isLoading={isLoading || loading} />
      ) : paymentStatus === "processing" ? (
        isLoading ? (
          <div className="border-t border-secondary mt-12 space-y-6 pt-12">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <SantanderFlow order={order as Order} isLoading={isLoading || loading} />
        )
      ) : (
        <div className="border-t border-secondary mt-12 space-y-6 pt-12">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
    </CdsTransactionLayout>

  );
};

export default CdsPaymentPage;
