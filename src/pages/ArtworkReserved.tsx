import React, { useCallback, useEffect, useRef, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useStripe } from "@stripe/react-stripe-js";
import { useAuth } from "../hoc/AuthProvider.tsx";
import Tooltip from "../features/cdspayments/components/ui/tooltip/ToolTip.tsx";
import Navbar from "../features/cdspayments/components/ui/navbar/Navbar.tsx";
import useDirectPurchaseStore from "../features/directpurchase/stores/directPurchaseStore";
import { Link, NavLink, useNavigate } from "react-router-dom";
import FaqComponent from "../features/directpurchase/components/FaqComponent.tsx";
import CountdownTimer from "../components/CountdownTimer.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";

export interface ArtworkReservedProps {}

const ArtworkReserved: React.FC<ArtworkReservedProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const stripe = useStripe();
  const dialogs = useDialogs();

  const { pendingOrder } = useDirectPurchaseStore();

  const [paymentResult, setPaymentResult] = useState<{
    status: "success" | "failed" | "processing" | "pending" | "on-hold" | null;
    message: string;
  }>({ status: null, message: "" });
  const [shouldBlock, setShouldBlock] = useState(true);
  const navigate = useNavigate();
  const navigationRef = useRef<string | null>(null);

  console.log(paymentResult);

  // Funzione per annullare l'ordine
  const cancelOrder = useCallback(async () => {
    if (pendingOrder?.id) {
      try {
        await data.setOrderStatus(pendingOrder.id, "cancelled");
        console.log("Order cancelled successfully");
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  }, [pendingOrder?.id, data]);

  // Intercetta click sui link per bloccare navigazione
  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      if (!shouldBlock) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.getAttribute("href")) {
        const href = link.getAttribute("href");

        // Verifica se è un link interno (non assoluto)
        if (href && !href.startsWith("http") && !href.startsWith("mailto:")) {
          e.preventDefault();
          e.stopPropagation();

          const confirmed = await dialogs.yesNo(
            "Vuoi davvero uscire?",
            "Se esci da questa pagina, la tua prenotazione verrà annullata. Sei sicuro di voler continuare?",
            {
              txtYes: "Sì, annulla prenotazione",
              txtNo: "No, resta qui",
              invertColors: true,
            }
          );

          if (confirmed) {
            setShouldBlock(false);
            await cancelOrder();
            navigationRef.current = href;
            // Naviga dopo aver annullato l'ordine
            setTimeout(() => {
              navigate(href);
            }, 100);
          }
        }
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [shouldBlock, dialogs, cancelOrder, navigate]);

  // Gestione chiusura scheda/finestra browser
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlock]);

  // Calcola la data di scadenza: prima prova dai meta_data, poi 7 giorni dalla creazione
  const getExpiryDate = (): Date => {
    // Prima prova a usare la data di scadenza dai meta_data
    if (pendingOrder?.meta_data) {
      const expiryDateMeta = pendingOrder.meta_data.find((m) =>
        m.key.toLowerCase() === "_expiry_date" ||
        m.key.toLowerCase() === "expiry_date" ||
        m.key.toLowerCase() === "_reservation_expiry" ||
        m.key.toLowerCase() === "reservation_expiry"
      )?.value;

      if (expiryDateMeta) {
        return new Date(expiryDateMeta);
      }
    }

    // Altrimenti calcola 7 giorni dalla data di creazione
    if (pendingOrder?.date_created) {
      const createdDate = new Date(pendingOrder.date_created);
      const expiryDate = new Date(createdDate);
      expiryDate.setDate(createdDate.getDate() + 7);
      return expiryDate;
    }

    // Fallback: 7 giorni da ora se non abbiamo la data di creazione
    const now = new Date();
    const fallbackExpiry = new Date(now);
    fallbackExpiry.setDate(now.getDate() + 7);
    return fallbackExpiry;
  };

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
                  customer_note: `Versato acconto ${data.downpaymentPercentage()}%`,
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
              message: `Ciao ${
                auth.user?.username || ""
              },\ngrazie per aver bloccato l'opera!\n\nA breve sarai contattato per definire le modalità di acquisizione/spedizione dell'opera`,
            });
            // Pulisce i parametri dall'URL
            window.history.replaceState({}, document.title, window.location.pathname);
            break;

          default:
            setPaymentResult({
              status: "failed",
              message: "Si è verificato un errore\n\nIl tuo pagamento non è andato a buon fine, riprova",
            });
            break;
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
        setPaymentResult({
          status: "failed",
          message: "Si è verificato un errore\n\nImpossibile caricare le informazioni sul pagamento",
        });
      }
    };

    processPaymentResult();
  }, [stripe, data, auth.user?.username]);

  return (
    <div className="min-h-screen flex flex-col pt-35">
      <Tooltip />
      <div className="mx-auto container max-w-2xl">
        <Navbar />
        <main className="flex-1 bg-white rounded-t-3xl pb-24 shadow-custom-variant p-8 md:p-8">
          <div className="flex flex-col w-full items-center justify-center min-h-72">
            <span className={'mb-7'}>
              <svg width="73" height="72" viewBox="0 0 73 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.9109 62.8766H24.1761C24.9664 62.8766 25.625 63.1505 26.1519 63.6984L32.0462 69.5175C33.6268 71.1175 35.1141 71.9175 36.5081 71.9175C37.9021 71.9175 39.3894 71.1175 40.9702 69.5175L46.8313 63.6984C47.3803 63.1505 48.0498 62.8766 48.84 62.8766H57.1053C59.3666 62.8766 60.9911 62.3834 61.9788 61.397C62.9668 60.4108 63.4608 58.7889 63.4608 56.5313V48.2795C63.4608 47.5342 63.7242 46.8766 64.2509 46.3067L70.1123 40.422C71.7149 38.8437 72.5107 37.3642 72.4997 35.9835C72.4889 34.6028 71.6931 33.1124 70.1123 31.5123L64.2509 25.6274C63.7242 25.0575 63.4608 24.411 63.4608 23.6877V15.4357C63.4608 13.1781 62.9668 11.5507 61.9788 10.5535C60.9911 9.55623 59.3666 9.0576 57.1053 9.0576H48.84C48.0498 9.0576 47.3803 8.79459 46.8313 8.26858L40.9702 2.44941C39.3676 0.805585 37.8747 -0.01085 36.4916 0.000108863C35.1086 0.0110677 33.6159 0.827502 32.0133 2.44941L26.1519 8.26858C25.625 8.79459 24.9664 9.0576 24.1761 9.0576H15.9109C13.6497 9.0576 12.0252 9.55076 11.0374 10.5371C10.0495 11.5234 9.55555 13.1562 9.55555 15.4357V23.6877C9.55555 24.411 9.28114 25.0575 8.73232 25.6274L2.90384 31.5123C1.30128 33.1124 0.5 34.6028 0.5 35.9835C0.5 37.3642 1.30128 38.8437 2.90384 40.422L8.73232 46.3067C9.28114 46.8766 9.55555 47.5342 9.55555 48.2795V56.5313C9.55555 58.7889 10.0495 60.4108 11.0374 61.397C12.0252 62.3834 13.6497 62.8766 15.9109 62.8766ZM33.0012 51.6326C32.7158 51.6326 32.4798 51.5834 32.2932 51.4848C32.1066 51.3863 31.9145 51.2164 31.7169 50.9751L21.8381 39.5012C21.7284 39.3479 21.6351 39.1835 21.5583 39.008C21.4814 38.8327 21.443 38.6465 21.443 38.4492C21.443 38.0986 21.5637 37.8082 21.8052 37.5779C22.0467 37.3479 22.3321 37.2328 22.6614 37.2328C22.9029 37.2328 23.1114 37.2767 23.287 37.3645C23.4627 37.452 23.6383 37.6054 23.8139 37.8247L32.9353 48.4765L49.4986 22.7014C49.8279 22.2411 50.2012 22.011 50.6184 22.011C50.9257 22.011 51.2111 22.1261 51.4745 22.3562C51.738 22.5863 51.8697 22.8658 51.8697 23.1945C51.8697 23.348 51.8368 23.5069 51.7709 23.6712C51.705 23.8356 51.6392 23.9836 51.5733 24.1151L34.2526 50.9751C34.0769 51.1944 33.8848 51.3588 33.6762 51.4683C33.4677 51.5779 33.2426 51.6326 33.0012 51.6326Z"
                  fill="#42B396"
                />
              </svg>
            </span>
            <div className={'space-y-4 text-center'}>
              <p className={'text-lg'}>La tua prenotazione è andato a buon fine</p>
              <p>Hai 7 giorni per completare l'acquisto</p>
              <p className={'text-secondary'}>La tua prenotazione scade tra</p>
              <div className="mt-6">
                <CountdownTimer expiryDate={getExpiryDate()} />
              </div>
            </div>
          </div>
          <div className={"border-t border-b border-[#D9DDFB] mt-18 py-6"}>
            <p className={"flex items-center gap-2"}>
              <span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_1269_3042)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      fill="#010F22"
                    />
                    <path
                      d="M11.4148 14.4602V14.1534C11.4186 13.5549 11.4848 13.0682 11.6136 12.6932C11.7424 12.3182 11.9318 12.0019 12.1818 11.7443C12.4356 11.483 12.75 11.233 13.125 10.9943C13.4053 10.8125 13.6402 10.6212 13.8295 10.4205C14.0227 10.2159 14.1686 9.99242 14.267 9.75C14.3693 9.50379 14.4205 9.23674 14.4205 8.94886C14.4205 8.53977 14.3239 8.18182 14.1307 7.875C13.9413 7.56818 13.6837 7.33144 13.358 7.16477C13.0322 6.99432 12.6705 6.90909 12.2727 6.90909C11.8939 6.90909 11.5398 6.99242 11.2102 7.15909C10.8845 7.32197 10.6174 7.56439 10.4091 7.88636C10.2045 8.20455 10.0928 8.59849 10.0739 9.06818H9C9.01894 8.44318 9.17424 7.90152 9.46591 7.44318C9.75758 6.98485 10.1477 6.63068 10.6364 6.38068C11.125 6.12689 11.6705 6 12.2727 6C12.9015 6 13.4545 6.13068 13.9318 6.39205C14.4091 6.64962 14.7822 7.00379 15.0511 7.45455C15.3201 7.90152 15.4545 8.41477 15.4545 8.99432C15.4545 9.37689 15.3939 9.72538 15.2727 10.0398C15.1515 10.3542 14.9697 10.6439 14.7273 10.9091C14.4886 11.1742 14.1894 11.4242 13.8295 11.6591C13.4886 11.8864 13.2178 12.1117 13.017 12.3352C12.8163 12.5587 12.6723 12.8144 12.5852 13.1023C12.4981 13.3864 12.4508 13.7367 12.4432 14.1534V14.4602H11.4148ZM11.9602 17.8807C11.7367 17.8807 11.5436 17.8011 11.3807 17.642C11.2216 17.4792 11.142 17.286 11.142 17.0625C11.142 16.8352 11.2216 16.642 11.3807 16.483C11.5436 16.3239 11.7367 16.2443 11.9602 16.2443C12.1837 16.2443 12.375 16.3239 12.5341 16.483C12.697 16.642 12.7784 16.8352 12.7784 17.0625C12.7784 17.2102 12.7405 17.3466 12.6648 17.4716C12.5928 17.5966 12.4943 17.697 12.3693 17.7727C12.2481 17.8447 12.1117 17.8807 11.9602 17.8807Z"
                      fill="#010F22"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1269_3042">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              Hai bisogno di aiuto?
            </p>
            <Link to="/contatti" className={"text-[#808791] underline block mt-6"}>
              Scrivici
            </Link>
          </div>
          <FaqComponent />
        </main>
      </div>
      <footer className={"p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary"}>
        <section className={"md:max-w-xl lg:max-w-4xl mx-auto"}>
          <p>© artpay srl 2024 - Tutti i diritti riservati</p>
          <div className={"flex items-center gap-4 border-b border-gray-300 py-8 flex-wrap"}>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Privacy Policy">
              Privacy Policy
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Cookie Policy">
              Cookie Policy
            </a>
            <NavLink to="/termini-e-condizioni" className={"underline-none text-primary"}>
              Termini e condizioni
            </NavLink>
            <NavLink to="/condizioni-generali-di-acquisto" className={"underline-none text-primary"}>
              Condizioni generali di acquisto
            </NavLink>
          </div>
          <div className={"pt-8"}>
            <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default ArtworkReserved;
