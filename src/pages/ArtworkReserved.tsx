import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useStripe } from "@stripe/react-stripe-js";
import { useAuth } from "../hoc/AuthProvider.tsx";
import Tooltip from "../features/cdspayments/components/ui/tooltip/ToolTip.tsx";
import Navbar from "../features/cdspayments/components/ui/navbar/Navbar.tsx";

export interface ArtworkReservedProps {

}

const ArtworkReserved: React.FC<ArtworkReservedProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const stripe = useStripe();

  const [paymentResult, setPaymentResult] = useState<{
    status: "success" | "failed" | "processing" | "pending" | "on-hold" | null;
    message: string;
  }>({ status: null, message: "" });


  useEffect(() => {
    if (!stripe) return;

    const urlParams = new URLSearchParams(window.location.search);
    const clientSecret = urlParams.get("payment_intent_client_secret");
    const paymentIntentId = urlParams.get("payment_intent");
    const redirectStatus = urlParams.get("redirect_status");


    if (!clientSecret || !paymentIntentId || !redirectStatus) return;

    const processPaymentResult = async () => {
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        const completedOrderId = localStorage.getItem("completed-order");

        console.log(paymentIntent);

        switch (paymentIntent?.status) {
          case "requires_capture":
            if (completedOrderId) {
              try {
                await data.setOrderStatus(+completedOrderId, "on-hold", {
                  payment_method: "Acconto blocco opera",
                  payment_method_title: "Blocco opera",
                  customer_note: `Versato acconto ${data.downpaymentPercentage()}%`
                });
                localStorage.removeItem("completed-order");
                localStorage.removeItem("showCheckout");
                localStorage.removeItem("checkoutUrl");
                console.log("Order status updated successfully");
              } catch (e) {
                console.error("Error updating order status:", e);
              }
            } else {
              console.warn("No completed order ID found in localStorage");
            }
            setPaymentResult({
              status: "success",
              message: `Ciao ${auth.user?.username || ""},\ngrazie per aver bloccato l'opera!\n\nA breve sarai contattato per definire le modalità di acquisizione/spedizione dell'opera`
            });
            // Pulisce i parametri dall'URL
            window.history.replaceState({}, document.title, window.location.pathname);
            break;

          default:
            setPaymentResult({
              status: "failed",
              message: "Si è verificato un errore\n\nIl tuo pagamento non è andato a buon fine, riprova"
            });
            break;
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
        setPaymentResult({
          status: "failed",
          message: "Si è verificato un errore\n\nImpossibile caricare le informazioni sul pagamento"
        });
      }
    };

    processPaymentResult();
  }, [stripe,data, auth.user?.username]);


    return (
      <div className="min-h-screen flex flex-col pt-35">
        <Tooltip />
        <div className="mx-auto container max-w-2xl">
          <Navbar />
          <section className="px-8 mb-6 container lg:px-2">
            <h2 className={" leading-[125%] text-primary font-light"}>Acquista</h2>
          </section>
          <main className="flex-1 bg-white rounded-t-3xl pb-24 shadow-custom-variant p-8 md:p-8">
            <div className={"flex flex-col mb-6"}>
              {paymentResult.status ? paymentResult.status : null}
            </div>
          </main>
        </div>
      </div>
    )
};

export default ArtworkReserved;
