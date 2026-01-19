import Navbar from "../../cdspayments/components/ui/navbar/Navbar.tsx";
import SkeletonOrderDetails from "../../cdspayments/components/paymentmethodslist/SkeletonOrderDetails.tsx";
import PaymentProviderCard from "../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import { useNavigate } from "react-router-dom";
import { ReactNode,
  //useEffect,
  useState
} from "react";
import { useDirectPurchase } from "../contexts/DirectPurchaseContext.tsx";
import { Box, Button, Typography } from "@mui/material";
import DisplayImage from "../../../components/DisplayImage.tsx";
import ShoppingBagIcon from "../../../components/icons/ShoppingBagIcon.tsx";
import UserIcon from "../../../components/icons/UserIcon.tsx";
import FaqComponent from "../components/FaqComponent.tsx";
import Tooltip from "../../cdspayments/components/ui/tooltip/ToolTip.tsx";
import CountdownTimer from "../../../components/CountdownTimer.tsx";
import useDirectPurchaseStore from "../stores/directPurchaseStore.ts";
import { useData } from "../../../hoc/DataProvider.tsx";
import { useDialogs } from "../../../hoc/DialogProvider.tsx";
import usePaymentStore from "../../cdspayments/stores/paymentStore.ts";
//import useBeforeUnload from "../hooks/useBeforeUnload.ts";

const DirectPurchaseLayout = ({ children }: { children: ReactNode }) => {
  const {
    pendingOrder,
    loading,
    subtotal,
    artworks,
    requireInvoice,
    handleRequireInvoice,
    isSaving,
    userProfile,
    orderMode,
  } = useDirectPurchase();

  const data = useData();
  const dialogs = useDialogs();
  const navigate = useNavigate();
  const { updatePageData, reset, /*isProcessingCheckout*/ } = useDirectPurchaseStore();
  const [isCancelling, setIsCancelling] = useState(false);
  const { refreshOrders } = usePaymentStore()

  // Blocca la navigazione in modalità loan o standard quando lo status è pending
  // ma NON bloccare quando si sta processando il checkout
  /*const shouldBlock = (orderMode === "loan" || orderMode === "standard") &&
                      pendingOrder?.status === "pending" &&
                      !isProcessingCheckout;

  useBeforeUnload(shouldBlock)*/



  const handleBlockNavigation = async (path?: string, extrernal?: boolean) => {
    // Blocca solo in modalità loan o standard quando lo status è pending
    if (
      (orderMode === "loan" || orderMode === "standard") &&
      pendingOrder?.status === "pending"
    ) {
      const confirmed = await dialogs.yesNo(
        "Annulla transazione",
        "Vuoi davvero uscire? L'opera non rimarrà nel tuo carrello e la transazione verrà annullata.",
        {
          txtYes: "Annulla",
          txtNo: "Resta"
        }
      );

      if (!confirmed) return;

      try {
        // Cancella l'ordine
        if (pendingOrder?.id) {
          await data.setOrderStatus(pendingOrder.id, "cancelled");
        }

        // Pulisce il localStorage
        if (pendingOrder?.order_key) {
          const paymentIntentKeys = [
            `payment-intents-${pendingOrder.order_key}`,
            `payment-intents-cds-${pendingOrder.order_key}`,
            `payment-intents-redeem-${pendingOrder.order_key}`,
            `payment-intents-block-${pendingOrder.order_key}`,
            "completed-order"
          ];
          paymentIntentKeys.forEach(key => localStorage.removeItem(key));
        }

        // Resetta lo store
        reset();

        // Refresh ordini
        refreshOrders();

        // Naviga alla dashboard
        if (extrernal) window.open(path, "_blank");
        navigate(path ? path : "/dashboard");
      } catch (error) {
        console.error("Error cancelling order:", error);
        // Naviga comunque
        navigate(path ? path : "/dashboard");
      }
    } else {
      // Se non è in modalità loan/standard o non è pending, naviga direttamente
      if (extrernal) window.open(path, "_blank");
      navigate(path ? path : "/dashboard");
    }
  }

  const getExpiryDate = (): Date => {
    // Prima prova a usare la data di scadenza dai meta_data
    if (pendingOrder?.meta_data) {
      const expiryDateMeta = pendingOrder.meta_data.find(
        (m) =>
          m.key.toLowerCase() === "_expiry_date" ||
          m.key.toLowerCase() === "expiry_date" ||
          m.key.toLowerCase() === "_reservation_expiry" ||
          m.key.toLowerCase() === "reservation_expiry",
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

  const handleCancelTransaction = async () => {
    if (!pendingOrder?.id) return;

    const confirmed = await dialogs.yesNo(
      "Richiesta annullamento",
      "Sei sicuro di voler richiedere l'annullamento di questa transazione? Verrà inviata una richiesta di cancellazione e rimborso alla galleria.",
      {
        txtYes: "Sì, richiedi annullamento",
        txtNo: "No, torna indietro"
      }
    );

    if (!confirmed) return;

    try {
      setIsCancelling(true);

      // Invia richiesta di cancellazione alla galleria
      if (pendingOrder.line_items && pendingOrder.line_items.length > 0) {
        const productId = pendingOrder.line_items[0].product_id;
        const artworkName = pendingOrder.line_items[0].name;

        await data.sendQuestionToVendor({
          product_id: productId,
          question: `RICHIESTA DI CANCELLAZIONE E RIMBORSO\n\nOrdine #${pendingOrder.id}\nOpera: ${artworkName}\n\nIl cliente richiede la cancellazione della transazione e l'eventuale rimborso dell'acconto versato. Si prega di procedere con l'annullamento dell'ordine e il rilascio della prenotazione dell'opera.`,
        });
      }

      // Aggiorna le customer_note dell'ordine
      const updatedOrder = await data.updateOrder(pendingOrder.id, {
        customer_note: "Richiesta di cancellazione in corso"
      });

      navigate("/dashboard");

      refreshOrders()

      // Aggiorna lo stato locale
      updatePageData({ pendingOrder: updatedOrder });

      // Mostra messaggio di conferma
      await dialogs.okOnly(
        "Richiesta inviata",
        "La richiesta di cancellazione e rimborso è stata inviata alla galleria. Riceverai una notifica quando la richiesta sarà elaborata."
      );

    } catch (error) {
      console.error("Error sending cancellation request:", error);
      await dialogs.okOnly(
        "Errore",
        "Si è verificato un errore durante l'invio della richiesta. Riprova più tardi."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDirectCancelTransaction = async () => {
    if (!pendingOrder?.id) return;

    const confirmed = await dialogs.yesNo(
      "Elimina transazione",
      "Vuoi davvero eliminare questa transazione? L'opera non rimarrà nel tuo carrello.",
      {
        txtYes: "Elimina",
        txtNo: "Annulla"
      }
    );

    if (!confirmed) return;

    try {
      setIsCancelling(true);

      // Cancella l'ordine direttamente
      await data.setOrderStatus(pendingOrder.id, "cancelled");

      // Pulisce il localStorage
      if (pendingOrder?.order_key) {
        const paymentIntentKeys = [
          `payment-intents-${pendingOrder.order_key}`,
          `payment-intents-cds-${pendingOrder.order_key}`,
          `payment-intents-redeem-${pendingOrder.order_key}`,
          `payment-intents-block-${pendingOrder.order_key}`,
          "completed-order"
        ];
        paymentIntentKeys.forEach(key => localStorage.removeItem(key));
      }

      // Resetta lo store
      reset();

      // Refresh ordini
      refreshOrders();

      // Naviga alla dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error cancelling order:", error);
      // Naviga comunque alla dashboard
      navigate("/dashboard");
    } finally {
      setIsCancelling(false);
    }
  };

  const isReedemPurchase = pendingOrder?.status === "on-hold" && pendingOrder?.created_via === "rest-api";



  /*useEffect(() => {
    const cancelOrder = () => {
      if (
        pendingOrder?.status === "pending" &&
        !pendingOrder.customer_note.includes("Documentazione")
      ) {
        try {
          todo: Creare endpoint safe per eliminare l'ordine
          if (pendingOrder?.id) {
            const url = `${process.env.VITE_SERVER_URL}/wp-json/wc/v3/orders/${pendingOrder.id}`;
            const payload = JSON.stringify({ status: "cancelled" });
            const blob = new Blob([payload], { type: "application/json", });
            navigator.sendBeacon(url, blob);
          }


          if (pendingOrder?.order_key) {
            const paymentIntentKeys = [
              `payment-intents-${pendingOrder.order_key}`,
              `payment-intents-cds-${pendingOrder.order_key}`,
              `payment-intents-redeem-${pendingOrder.order_key}`,
              `payment-intents-block-${pendingOrder.order_key}`,
              "completed-order",
            ];
            paymentIntentKeys.forEach((key) => localStorage.removeItem(key));
          }

          reset?.();
          refreshOrders?.();
        } catch (error) {
          console.error("Error cancelling order:", error);
        }
      }
    };

    // intercetta chiusura o refresh
    const handleBeforeUnload = () => cancelOrder();

    // intercetta navigazione interna (unmount del componente)
    return () => {
      cancelOrder();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);*/


  return (
    <div className="min-h-screen flex flex-col pt-35">
      <Tooltip />
      <div className="mx-auto container max-w-2xl">
        <Navbar handleClick={() => handleBlockNavigation()} />
        <section className="px-8 mb-6 container lg:px-2">
          {orderMode === "loan" ? (
            <h2 className="text-4xl font-normal flex flex-col mb-13">
              <span className={" leading-[125%] text-primary font-light"}>Prenota</span>
            </h2>
          ) : (
            <h2 className="text-4xl font-normal flex flex-col mb-13">
              {pendingOrder ? (
                <>
                  <span className={" leading-[125%] text-primary font-light"}>Transazione</span>
                  <span className={"leading-[125%]  text-2xl"}>Ordine N.{pendingOrder.id}</span>
                </>
              ) : (
                <span className="size-12 my-5 block border-2 border-white border-b-transparent rounded-full animate-spin"></span>
              )}
            </h2>
          )}
        </section>
        <main className="flex-1 bg-white rounded-t-3xl pb-24 shadow-custom-variant p-8 md:p-8">
          {loading ? (
            <SkeletonOrderDetails />
          ) : (
            <>
              <div className={"flex flex-col space-y-8 pb-12 border-b border-[#CDCFD3] "}>
                <div className={"flex space-x-2 items-center"}>
                  <ShoppingBagIcon className={"size-4"} />
                  <Typography className={`flex-1 text-secondary`}>Riassunto dell'ordine</Typography>
                </div>
                {pendingOrder?.line_items.map((item: any, i: number) => (
                  <Box key={item.id} className={"flex items-center w-full gap-4 mb-8"}>
                    <DisplayImage
                      src={item.image.src}
                      width="64px"
                      height="64px"
                      objectFit={"cover"}
                      borderRadius={"5px"}
                    />
                    <div className={"space-y-1"}>
                      <div className={"flex gap-2"}>
                        <Typography variant="h4" fontWeight={500}>
                          {item.name}
                        </Typography>
                        <Typography variant="h4" fontWeight={500} color="textSecondary">
                          {artworks[i]?.artistName}
                        </Typography>
                      </div>
                      <div className={"flex gap-2 text-xs text-secondary"}>
                        <Typography variant="body1" color="textSecondary">
                          {artworks[i]?.technique}
                        </Typography>
                        {artworks[i].technique && artworks[i].dimensions && "|"}
                        <Typography variant="body1" color="textSecondary">
                          {artworks[i]?.dimensions}
                        </Typography>
                      </div>
                    </div>
                  </Box>
                ))}
                {isReedemPurchase && pendingOrder?.payment_method_title.includes("Blocco opera") ? (
                  <div className={"space-y-4"}>
                    <div className={"space-y-1"}>
                      <p className={"text-secondary"}>Scadenza della prenotazione</p>
                      <CountdownTimer expiryDate={getExpiryDate()} />
                    </div>
                    <div className={`w-full rounded-sm p-4 space-y-2 flex flex-col ${pendingOrder?.customer_note.includes("Ottenuto") ? "bg-[#42B3964D]" : "bg-[#FED1824D] "}`}>
                      <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#6576EE] text-white w-fit"}>
                        Opera prenotata
                      </span>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"text-secondary"}>Prestito</span>
                        <span>{pendingOrder?.customer_note}</span>
                      </div>
                      <div className={"flex flex-col gap-1"}>
                        <span className={"text-secondary"}>Stato</span>
                        <span>Pagamento da completare</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={"w-full rounded-sm bg-[#FED1824D] p-4 space-y-2 flex flex-col"}>
                    {pendingOrder?.status !== "pending" && pendingOrder?.status !== "processing" && !pendingOrder?.meta_data.find(k => k.key === "_question_id")?.value && (
                      <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#6576EE] text-white w-fit"}>
                        {pendingOrder?.status}
                      </span>
                    )}
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Stato</span>
                      <span>{pendingOrder?.customer_note || "Pagamento da completare"}</span>
                    </div>
                  </div>
                )}
                <div className={"flex flex-col space-y-4"}>
                  <div>
                    <Typography variant="body1" color="textSecondary" className={"block"} mb={0.5}>
                      Venditore
                    </Typography>
                    <Typography variant="body1">{artworks[0]?.galleryName}</Typography>
                  </div>
                  <div>
                    <Typography variant="body1" color="textSecondary" className={"block"} mb={0.5}>
                      Prezzo
                    </Typography>
                    <Typography variant="body1">
                      € {subtotal.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </div>
                  {(orderMode === "loan" || isReedemPurchase) && (
                    <div>
                      <Typography variant="body1" color="textSecondary" className={"block"} mb={0.5}>
                        Caparra
                      </Typography>
                      <Typography variant="body1">
                        €{" "}
                        {(subtotal * 0.05).toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                      <p className={"mt-2 text-[#D49B38]"}>
                        Prenota l'opera per 7 giorni. La caparra ti verrà rimborsata al completamento del pagamento.
                      </p>
                      <div className={" text-secondary space-y-2 mt-6"}>
                        <p>Come funziona?</p>
                        <ol className={"list-decimal ps-5 space-y-2"}>
                          <li>
                            Prenota l'opera per 7 giorni versando solo il 5%. (Se non concludi l'acquisto, ti
                            rimborsiamo tutto.
                          </li>
                          <li>Richiedi il prestito. Soggetto ad approvazione dell'istituto di credito.</li>
                          <li>Concludi l'acquisto e transazione su artpay.</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={"flex flex-col space-y-8 mb-6"}>
                <div className={"flex space-x-2 items-center pt-4"}>
                  <UserIcon className={"size-4"} />
                  <Typography className={`flex-1 text-secondary`}>Informazioni di contatto</Typography>
                </div>
                <div className={"flex flex-col space-y-4"}>
                  <div className={"flex flex-col gap-2 p-6 bg-[#FAFAFB] rounded-lg "}>
                    <Typography variant="body1">Informazioni personali</Typography>
                    <Typography variant="body1" color="textSecondary">
                      {userProfile?.first_name || "Nome e Cognome"} {userProfile?.last_name || ""}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {userProfile?.email || "Email"}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {userProfile?.shipping?.phone || "Telefono"}
                    </Typography>
                    <Button onClick={() => handleBlockNavigation("/profile/personal-settings")} className={"text-primary !underline block mt-4 w-fit !px-0 !font-light"}>
                      Modifica
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          {orderMode != "loan" && (
            <PaymentProviderCard className={"w-full mb-6"} backgroundColor={"bg-[#FAFAFB]"}>
              <p className={"flex gap-2"}>
                <button
                  className={`${
                    requireInvoice ? "bg-primary" : "bg-gray-300"
                  } rounded-full border border-gray-300 px-3 cursor-pointer relative`}
                  onClick={() => handleRequireInvoice(!requireInvoice)}
                  disabled={isSaving}>
                  <span
                    className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                      requireInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                    }`}
                  />
                </button>
                Hai bisogno di una fattura?
              </p>
            </PaymentProviderCard>
          )}

          {children}
          {(pendingOrder?.payment_method.includes("Acconto") || pendingOrder?.status == "processing") && !pendingOrder?.customer_note.includes("Richiesta di cancellazione") && (
            <div className={"flex flex-col items-center space-y-6 mt-12"}>
              {pendingOrder?.status === "processing" ? (
                <p className={"leading-[125%] text-center"}>
                  Se interrompi la procedura con artpay costo dell’opera ti verrà rimborsato.
                </p>
              ) : (
                <p className={"leading-[125%] text-center"}>
                  Se interrompi la procedura con artpay l’opera non sarà più prenotata a tuo nome. Il costo dell’acconto
                  ti verrà rimborsato.
                </p>
              )}
              <button
                className={
                  "text-[#EC6F7B] artpay-button-style bg-[#FAFAFB] disabled:cursor-not-allowed disabled:opacity-65"
                }
                onClick={handleCancelTransaction}
                disabled={loading || isCancelling}>
                {isCancelling ? "Annullamento in corso..." : "Elimina Transazione"}
              </button>
            </div>
          )}
          {(pendingOrder && !pendingOrder?.payment_method.includes("Acconto") && pendingOrder.status !== "processing" ) && !pendingOrder?.customer_note.includes("Richiesta di cancellazione") && orderMode !== "loan" && (
            <div className={"flex flex-col items-center space-y-6 mt-12"}>
              <p className={"leading-[125%] text-center text-balance"}>
                Se interrompi la procedura con artpay l’opera non sarà più disponibile nel tuo carrello.
              </p>
              <button
                className={
                  "text-[#EC6F7B] artpay-button-style bg-[#FAFAFB] disabled:cursor-not-allowed disabled:opacity-65"
                }
                onClick={handleDirectCancelTransaction}
                disabled={loading || isCancelling}>
                {isCancelling ? "Annullamento in corso..." : "Elimina Transazione"}
              </button>
            </div>
          )}
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
            <Button variant={'link'} className={'underline block mt-6 text-sm'} onClick={() => handleBlockNavigation('/contatti')}>
              Scrivici
            </Button>
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
              target="_blank"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Privacy Policy">
              Privacy Policy
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
              target="_blank"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Cookie Policy">
              Cookie Policy
            </a>
            <Button onClick={() => handleBlockNavigation("/termini-e-condizioni")} className={"underline-none text-primary !text-xs"}>
              Termini e condizioni
            </Button>
            <Button onClick={() => handleBlockNavigation("/condizioni-generali-di-acquisto")} className={"underline-none text-primary !text-xs"}>
              Condizioni generali di acquisto
            </Button>
          </div>
          <div className={"pt-8"}>
            <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default DirectPurchaseLayout;
