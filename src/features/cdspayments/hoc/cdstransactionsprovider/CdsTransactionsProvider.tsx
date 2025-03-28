import { ReactNode, useEffect} from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../store.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Artwork } from "../../../../types/artwork.ts";
import { Gallery } from "../../../../types/gallery.ts";
import { clearLocalStorage } from "../../utils.ts";

const CdsTransactionsProvider = ({children}: {children: ReactNode}) => {
  const data = useData();
  const { setPaymentData, paymentMethod, paymentStatus } = usePaymentStore();
  const navigate = useNavigate();
  const [searchParams]  = useSearchParams();

  const hasPayment_intent = searchParams.has("payment_intent")



  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setPaymentData({loading: true});

      try {
        let orderResp = await data.getOnHoldOrder();


        if (!orderResp) {
          orderResp = await data.getProcessingOrder();


          if (orderResp) {
            console.log("Trovato ordine in processing, NON creo il payment intent.");
          } else {
            localStorage.removeItem('CdsOrder')
            if (!hasPayment_intent) navigate("/");

            throw new Error("Nessun ordine trovato");
          }
        }

        const productId = orderResp.line_items[0]?.product_id?.toString();
        if (!productId) throw new Error("Invalid product ID");

        const artworkResp: Artwork = await data.getArtwork(productId);
        if (!artworkResp) throw new Error("Artwork not found");

        const vendorResp: Gallery = await data.getGallery(artworkResp.vendor);
        if (!vendorResp) throw new Error("Vendor not found");


        if ((orderResp.status === "on-hold" && orderResp.payment_method != "klarna") || !hasPayment_intent) {
          const createPayment = await data.createPaymentIntentCds({ wc_order_key: orderResp?.order_key });
          if (!createPayment) throw new Error("Errore nella creazione del payment intent");
          console.log("Primo payment intent creato", createPayment);

          const updatePayment = await data.updatePaymentIntent({
            wc_order_key: orderResp?.order_key,
            payment_method: "klarna",
          });
          if (!updatePayment) throw new Error("Error during updating payment intent");
          console.log('update payment intent', updatePayment);


          setPaymentData({
            paymentIntent: updatePayment,
          });
        }

        if (hasPayment_intent) {
          const successPayment = searchParams.get("redirect_status") === "succeeded";

          if (successPayment) {
            try {

              const updateOrderStatus = await data.setOrderStatus(orderResp.id, "completed");
              if (!updateOrderStatus) throw new Error("Errore during comlete order setting");

              console.log("Payment completed:", updateOrderStatus);

              setPaymentData({paymentStatus: "completed"})

              setPaymentData({
                order: updateOrderStatus,
                vendor: vendorResp,
                paymentStatus: updateOrderStatus.status,
                paymentMethod: updateOrderStatus.payment_method,
                loading:false
              });

              clearLocalStorage(orderResp);

              return

            } catch (e) {
              console.error(e);
            }
          }

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
        setPaymentData({loading: false});
      }
    };

    fetchPaymentDetails()

  }, [data, paymentMethod, paymentStatus]);


  return (
    <>
      {children}
    </>
  );
};

export default CdsTransactionsProvider;