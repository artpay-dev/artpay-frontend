import { ReactNode, useEffect } from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Artwork } from "../../../../types/artwork.ts";
import { Gallery } from "../../../../types/gallery.ts";
import { clearLocalStorage } from "../../utils.ts";

const CdsTransactionsProvider = ({ children }: { children: ReactNode }) => {
  const data = useData();
  const { setPaymentData, paymentMethod, paymentStatus, vendor, user } = usePaymentStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hasPayment_intent = searchParams.has("payment_intent");
  const oreder_params = searchParams.get("order");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setPaymentData({ loading: true });

      try {
        let orderResp;

        if (oreder_params) {
          orderResp = await data.getOrder(Number(oreder_params));
          if (orderResp) {
            console.log("Ordine nei parametri");
            localStorage.setItem("redirectToAcquistoEsterno", "true");
          }
        }

        if (!orderResp) {
          orderResp = await data.getOnHoldOrder();
          if (orderResp) {
            console.log("Trovato ordine on-hold");
            /*localStorage.setItem("showCheckout", "true");*/
            localStorage.setItem("redirectToAcquistoEsterno", "true");
          }
        }

        if (!orderResp) {
          orderResp = await data.getProcessingOrder();

          if (orderResp) {
            console.log("Trovato ordine in processing");
            /*localStorage.setItem("showCheckout", "true");*/
          }
        }

        if (!orderResp) {
          const listOrders = await data.listOrders({
            status: ["completed", "cancelled", "failed"],
            customer: Number(JSON.parse(localStorage.getItem("artpay-user") as string).id),
          });

          orderResp = listOrders[0];

          if (orderResp.status == "completed") {
            console.log("Payment completed:", orderResp);

            setPaymentData({
              order: orderResp,
              paymentStatus: orderResp.status,
              paymentMethod: orderResp.payment_method,
              paymentIntent: null,
              loading: false,
            });

            clearLocalStorage(orderResp);

            return;
          }

          orderResp = listOrders[0];
        }

        if (!orderResp && !hasPayment_intent) {
          localStorage.removeItem("CdsOrder");
          localStorage.removeItem("showCheckout");
          localStorage.removeItem("checkoutUrl");
          localStorage.removeItem("checkOrder");
          navigate("/");

          throw new Error("Nessun ordine trovato");
        }

        if (!user) {
          const resp = await data.getUserProfile();
          if (!resp) throw new Error("User not found");
          setPaymentData({
            user: resp,
          });
        }

        if (!vendor) {
          const productId = orderResp?.line_items[0]?.product_id?.toString();
          if (!productId) throw new Error("Invalid product ID");

          const artworkResp: Artwork = await data.getArtwork(productId);
          if (!artworkResp) throw new Error("Artwork not found");

          const vendorResp: Gallery = await data.getGallery(artworkResp.vendor);
          if (!vendorResp) throw new Error("Vendor not found");

          setPaymentData({ vendor: vendorResp });
        }

        if (hasPayment_intent) {
          const successPayment = searchParams.get("redirect_status") === "succeeded";
          const failedPayment = searchParams.get("redirect_status") === "failed";

          if (successPayment) {
            try {
              let updateOrderStatus;
              updateOrderStatus = await data.setOrderStatus(orderResp.id, "completed");
              if (!updateOrderStatus) throw new Error("Errore during complete order setting");

              if (user?.billing.invoice_type == "receipt") {
                const updateBilling = await data.updateOrder(orderResp.id, {
                  billing: user?.billing ? { ...user?.billing } : { ...user?.shipping },
                });
                updateOrderStatus = updateBilling;
                console.log(updateBilling);
              }

              console.log("Payment completed:", updateOrderStatus);

              setPaymentData({
                order: updateOrderStatus,
                paymentStatus: updateOrderStatus.status,
                paymentMethod: updateOrderStatus.payment_method,
                loading: false,
              });

              clearLocalStorage(orderResp);

              return;
            } catch (e) {
              console.error(e);
            }
          } else if (failedPayment) {
            const updateOrderStatus = await data.setOrderStatus(orderResp.id, "failed");
            if (!updateOrderStatus) throw new Error("Errore during failed order setting");


            console.log("Payment failed:", updateOrderStatus);

            setPaymentData({
              order: updateOrderStatus,
              paymentStatus: updateOrderStatus.status,
              paymentMethod: updateOrderStatus.payment_method,
              loading: false,
            });
          }
        }

        setPaymentData({
          order: orderResp,
          paymentStatus: orderResp?.status,
          paymentMethod: orderResp?.payment_method,
          orderNote: orderResp?.customer_note,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setPaymentData({ loading: false });
      }
    };

    fetchPaymentDetails();
  }, [paymentMethod, paymentStatus]);

  return <>{children}</>;
};

export default CdsTransactionsProvider;
