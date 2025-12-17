import { ReactNode, useRef, useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hoc/AuthProvider.tsx";
import { useData } from "../../../hoc/DataProvider.tsx";
import { areBillingFieldsFilled } from "../../../utils.ts";
import { useStripe } from "@stripe/react-stripe-js";
import { Button, RadioGroup, Typography } from "@mui/material";
import { Cancel, Edit } from "@mui/icons-material";
import PaymentCard from "../../../components/PaymentCard.tsx";
import ContentCard from "../../../components/ContentCard.tsx";
import { PiCreditCardThin, PiTruckThin } from "react-icons/pi";
import RadioButton from "../../../components/RadioButton.tsx";
import { useDirectPurchase } from "../contexts/DirectPurchaseContext.tsx";
import DirectPurchaseLayout from "../layouts/DirectPurchaseLayout.tsx";
import PaymentsSelection from "./PaymentsSelection.tsx";
import PaymentProviderCard from "../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import BillingDataPreview from "../../../components/BillingDataPreview.tsx";
import { Link, useNavigate } from "react-router-dom";
import { BankTransfer } from "../../cdspayments/components/banktransfer";
import PaymentStatusPlaceholder from "./PaymentStatusPlaceholder.tsx";
import SantanderIcon from "../../../components/icons/SantanderIcon.tsx";
import Checkbox from "../../../components/Checkbox.tsx";
import usePaymentStore from "../../cdspayments/stores/paymentStore.ts";
import { useDialogs } from "../../../hoc/DialogProvider.tsx";

const DirectPurchaseView = () => {
  const auth = useAuth();
  const data = useData();
  const stripe = useStripe();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const { refreshOrders } = usePaymentStore();
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  // State per gestire il risultato del pagamento
  const [paymentCompleted, setPaymentCompleted] = useState<{
    status: "completed" | "failed" | "on-hold" | null;
    orderNumber?: number;
    orderTotal?: string;
  }>({ status: null });



  const {
    // State
    isReady,
    paymentMethod,
    isSaving,
    shippingDataEditing,
    requireInvoice,
    privacyChecked,

    // Data
    userProfile,
    availableShippingMethods,
    pendingOrder,
    paymentIntent,
    orderMode,

    // Actions
    updateState,
    handleSelectShippingMethod,
    handleSubmitCheckout,
    onChangePaymentMethod,
    updatePageData,
    reset,

    // Utils
    getCurrentShippingMethod,
    getEstimatedShippingCost,
    getThankYouPage,
    onCancelPaymentMethod,
  } = useDirectPurchase();

  const contactHeaderButtons: ReactNode[] = [];
  if (auth.isAuthenticated) {
    if (
      shippingDataEditing &&
      (areBillingFieldsFilled(userProfile?.billing) || areBillingFieldsFilled(userProfile?.shipping))
    ) {
      contactHeaderButtons.push(
        <Button
          key="cancel-btn"
          color="error"
          disabled={isSaving}
          onClick={() => updateState({ shippingDataEditing: false })}
          startIcon={<Cancel />}>
          Annulla
        </Button>,
      );
    } else if (!shippingDataEditing) {
      contactHeaderButtons.push(
        <Button
          key="edit-btn"
          disabled={isSaving}
          onClick={() => updateState({ shippingDataEditing: true })}
          startIcon={<Edit />}>
          Modifica
        </Button>,
      );
    }
  }

  const currentShippingMethod = getCurrentShippingMethod();
  const estimatedShippingCost = getEstimatedShippingCost();
  const thankYouPage = getThankYouPage();

  const showBillingSection = userProfile && (requireInvoice || orderMode === "loan");

  const isReedemPurchase = pendingOrder?.status === "on-hold" && pendingOrder.created_via == "rest-api";

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

  const handleUpdateCustomerNote = async (note: string, openSantander = false) => {
    if (!pendingOrder) return;

    updateState({ isSaving: true });

    try {
      // Aggiorna le customer note su WooCommerce
      const updatedOrder = await data.updateOrder(pendingOrder.id, {
        customer_note: note,
      });

      // Aggiorna anche lo stato locale
      updatePageData({
        pendingOrder: updatedOrder,
      });

      // Refresh ordini in PaymentDraw
      refreshOrders();

      // Apri Santander in una nuova finestra se richiesto
      if (openSantander) {
        window.open("https://www.santanderconsumer.it/prestito/partner/artpay", "_blank");
      }

      updateState({ isSaving: false });
    } catch (error) {
      console.error("Error updating order:", error);
      updateState({ isSaving: false });
    }
  };

  const handleSantanderLoanRequest = () => {

    handleUpdateCustomerNote("Richiesta prestito in corso", true);
  };

  const handleLoanRequest = () => {

    handleUpdateCustomerNote("Richiesta prestito in corso", false);
  };

  const handleLoanCompleted = () => {

    handleUpdateCustomerNote("Ottenuto", false);
  };

  // Wrapping di onCancelPaymentMethod per disabilitare il blocco
  const handleCancelPaymentMethod = useCallback(() => {

    onCancelPaymentMethod();
  }, [onCancelPaymentMethod]);

  // Wrapping di handleSubmitCheckout per disabilitare il blocco
  const handleCheckout = useCallback(() => {

    handleSubmitCheckout();
  }, [handleSubmitCheckout]);

  // Funzione per annullare l'ordine
 /* const cancelOrder = useCallback(async () => {
    if (pendingOrder?.id) {
      try {
        await data.setOrderStatus(pendingOrder.id, "cancelled");
        console.log("Order cancelled successfully");
        refreshOrders(); // Aggiorna PaymentDraw
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  }, [pendingOrder?.id, data, refreshOrders]);*/



  /*if (noPendingOrder && !pendingOrder && ) {
    return (
      <DefaultLayout pageLoading={!isReady || !paymentsReady} pb={6} authRequired>
        <Grid mt={16} spacing={3} px={3} container>
          <Grid item xs={12}>
            <Typography variant="h3">
              <ErrorIcon color="error" fontSize="large" /> Non ci sono opere nel carrello
            </Typography>
            <Typography sx={{ mt: 1 }} variant="subtitle1" color="textSecondary">
              Esplora Artpay e inizia ad acquistare
            </Typography>
          </Grid>
        </Grid>
      </DefaultLayout>
    );
  }*/

  const renderer = () => {
    // Se abbiamo appena completato un pagamento, mostra il placeholder
    if (paymentCompleted.status) {
      return (
        <PaymentStatusPlaceholder
          status={paymentCompleted.status === "on-hold" ? "completed" : paymentCompleted.status}
          orderNumber={paymentCompleted.orderNumber}
          orderTotal={paymentCompleted.orderTotal}
        />
      );
    }

    // Se l'ordine è già completato (caricato da database), mostra il messaggio
    if (pendingOrder?.status === "completed" || pendingOrder?.status === "failed") {
      return (
        <PaymentStatusPlaceholder
          status={pendingOrder.status}
          orderNumber={pendingOrder?.id}
          orderTotal={pendingOrder?.total}
        />
      );
    }

    // Se orderMode è "loan", controlla prima lo stato dell'ordine
    if (orderMode === "loan") {
      // Se l'ordine è completato, mostra il risultato
      /*if (pendingOrder?.status === "completed" || pendingOrder?.status === "failed") {
        return (
          <PaymentStatusPlaceholder
            status={pendingOrder.status}
            orderNumber={pendingOrder?.id}
            orderTotal={pendingOrder?.total}
          />
        );
      }*/

      // Altrimenti mostra il form di pagamento
      return (
        <PaymentCard
          orderMode={orderMode}
          paymentMethod={paymentMethod || "card"}
          checkoutButtonRef={checkoutButtonRef}
          onCheckout={handleCheckout}
          onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
          onReady={() => updateState({ checkoutReady: true })}
          paymentIntent={paymentIntent}
          thankYouPage={thankYouPage}
        />
      );
    }

    if (orderMode === "redeem") {
      // Se l'ordine è già completato, mostra il messaggio di successo
      // @ts-expect-error "si si ok"
      if (pendingOrder?.status === "completed" || pendingOrder?.status === "failed") {
          navigate(`/complete-order/${pendingOrder.id}`);
      }

      console.log(isReedemPurchase);

      // Se lo stato è processing o ha documentazione caricata, mostra il BankTransfer flow
      if (
        pendingOrder?.status === "processing" ||
        pendingOrder?.customer_note?.includes("Documentazione caricata, in attesa di conferma da artpay")
      ) {
        return (
          <ContentCard
            title="Pagamento"
            icon={<PiCreditCardThin size="28px" />}
            contentPadding={0}
            contentPaddingMobile={0}>
            <PaymentProviderCard>
              <BankTransfer order={pendingOrder} handleRestoreOrder={handleCancelPaymentMethod} />
            </PaymentProviderCard>
          </ContentCard>
        );
      }

      if (isReedemPurchase) {
        return (
          <ContentCard
            title="Pagamento"
            icon={<PiCreditCardThin size="28px" />}
            contentPadding={0}
            contentPaddingMobile={0}>
            {(() => {
              // Caso 1: Prestito da richiedere (stato iniziale)
              if (
                !pendingOrder.customer_note.includes("Richiesta prestito in corso") &&
                !pendingOrder.customer_note.includes("Ottenuto") &&
                !pendingOrder.customer_note.includes("Documentazione caricata") &&
                !pendingOrder.payment_method.includes("bank_transfer")
              ) {
                return (
                  <>
                  <PaymentProviderCard
                    icon={<SantanderIcon />}
                    cardTitle={"Santander"}
                    subtitle={"A partire da € 1.500,00 fino a € 30.000,00"}>
                    <ol className={"list-decimal ps-4 space-y-1 border-b border-zinc-300 pb-6"}>
                      <li>Richiedi finanziamento</li>
                      <li>Calcola rata e conferma richiesta</li>
                      <li>Paga su artpay con il finanziamento ricevuto</li>
                    </ol>
                    <div className={"w-full flex justify-between py-4"}>
                      <div>
                        <strong>Prezzo opera:</strong>
                        <p className={"text-secondary text-xs"}>Incluse commissioni artpay</p>
                      </div>
                      <strong>
                        €&nbsp;
                        {Number(pendingOrder.total)?.toLocaleString("it-IT", {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                    <p className={"mt-6 text-secondary text-xs"}>
                      Il costo del finanziamento varia in base al piano scelto
                    </p>
                    <button
                      disabled={!privacyChecked || isSaving}
                      onClick={handleSantanderLoanRequest}
                      className={
                        "artpay-button-style w-full bg-primary hover:bg-primary-hover text-white disabled:opacity-60"
                      }>
                      {isSaving ? "Avvio in corso..." : "Avvia richiesta prestito"}
                    </button>
                    <Checkbox
                      disabled={isSaving}
                      checked={privacyChecked}
                      onChange={(e) => updateState({ privacyChecked: e.target.checked })}
                      label={
                        <Typography variant="body1">
                          Accetto le{" "}
                          <Link to="/condizioni-generali-di-acquisto" target="_blank" className={'underline text-primary'}>
                            condizioni generali d'acquisto
                          </Link>
                        </Typography>
                      }
                    />
                  </PaymentProviderCard>

                  <PaymentProviderCard backgroundColor={'bg-[#FAFAFB] mt-6'}>
                    <Button variant={'link'} className={'!text-primary '} onClick={handleLoanRequest}>Ho già richiesto il prestito</Button>
                  </PaymentProviderCard>
                  </>
                );
              }

              // Caso 2: Prestito ottenuto o documentazione caricata - mostra BankTransfer
              if (
                pendingOrder.customer_note.includes("Ottenuto") ||
                pendingOrder.customer_note.includes("Documentazione caricata") ||
                pendingOrder.payment_method.includes( "bank_transfer")
              ) {
                return (
                  <PaymentProviderCard>
                    <BankTransfer order={pendingOrder} handleRestoreOrder={handleCancelPaymentMethod} />
                  </PaymentProviderCard>
                );
              }

              // Caso 3: Richiesta prestito in corso - chiedi se è stato ottenuto
              return (
                <div className={"w-full p-6 rounded-sm bg-[#FAFAFB]"}>
                  <span>Hai ottenuto il prestito?</span>
                  <button
                    disabled={isSaving}
                    onClick={handleLoanCompleted}
                    className={
                      "artpay-button-style mt-6 w-full bg-primary hover:bg-primary-hover text-white disabled:opacity-60"
                    }>
                    {"Completa l'acquisto"}
                  </button>
                </div>
              );
            })()}
          </ContentCard>
        );
      }

      // Per ordini non completati, controlla se è stato selezionato un metodo di pagamento
      switch (pendingOrder?.payment_method) {
        case "":
          return <PaymentsSelection paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />;
        case "card":
          return (
            <PaymentCard
              orderMode={orderMode}
              paymentMethod={paymentMethod || ""}
              checkoutButtonRef={checkoutButtonRef}
              onCheckout={() => handleSubmitCheckout()}
              onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
              onReady={() => updateState({ checkoutReady: true })}
              paymentIntent={paymentIntent}
              thankYouPage={thankYouPage}
            />
          );
        case "klarna":
          return (
            <PaymentCard
              orderMode={orderMode}
              paymentMethod={paymentMethod || ""}
              checkoutButtonRef={checkoutButtonRef}
              onCheckout={() => handleSubmitCheckout()}
              onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
              onReady={() => updateState({ checkoutReady: true })}
              paymentIntent={paymentIntent}
              thankYouPage={thankYouPage}
            />
          );
          case "paypal":
          return (
            <PaymentCard
              orderMode={orderMode}
              paymentMethod={paymentMethod || ""}
              checkoutButtonRef={checkoutButtonRef}
              onCheckout={() => handleSubmitCheckout()}
              onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
              onReady={() => updateState({ checkoutReady: true })}
              paymentIntent={paymentIntent}
              thankYouPage={thankYouPage}
            />
          );
        case "revolut_pay":
          return (
            <PaymentCard
              orderMode={orderMode}
              paymentMethod={paymentMethod || ""}
              checkoutButtonRef={checkoutButtonRef}
              onCheckout={() => handleSubmitCheckout()}
              onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
              onReady={() => updateState({ checkoutReady: true })}
              paymentIntent={paymentIntent}
              thankYouPage={thankYouPage}
            />
          );
        case "google_pay":
          return (
            <PaymentCard
              orderMode={orderMode}
              paymentMethod={paymentMethod || ""}
              checkoutButtonRef={checkoutButtonRef}
              onCheckout={() => handleSubmitCheckout()}
              onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
              onReady={() => updateState({ checkoutReady: true })}
              paymentIntent={paymentIntent}
              thankYouPage={thankYouPage}
            />
          );
          case "bank_transfer":
          return (
            <ContentCard
              title="Pagamento"
              icon={<PiCreditCardThin size="28px" />}
              contentPadding={0}
              contentPaddingMobile={0}>
              <PaymentProviderCard>
                <BankTransfer order={pendingOrder} handleRestoreOrder={handleCancelPaymentMethod} />
              </PaymentProviderCard>
            </ContentCard>
          );
        default:
          return <PaymentsSelection paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />;
      }
    }

    // Per gli altri orderMode, usa la logica esistente
    switch (pendingOrder?.payment_method) {
      case "":
        return <PaymentsSelection paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />;
      case "card":
        return (
          <PaymentCard
            orderMode={orderMode}
            paymentMethod={paymentMethod || ""}
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
            onReady={() => updateState({ checkoutReady: true })}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
          />
        );
      case "klarna":
        return (
          <PaymentCard
            orderMode={orderMode}
            paymentMethod={paymentMethod || ""}
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
            onReady={() => updateState({ checkoutReady: true })}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
          />
        );
        case "paypal":
        return (
          <PaymentCard
            orderMode={orderMode}
            paymentMethod={paymentMethod || ""}
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
            onReady={() => updateState({ checkoutReady: true })}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
          />
        );
      case "revolut_pay":
        return (
          <PaymentCard
            orderMode={orderMode}
            paymentMethod={paymentMethod || ""}
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
            onReady={() => updateState({ checkoutReady: true })}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
          />
        );
      case "google_pay":
        return (
          <PaymentCard
            orderMode={orderMode}
            paymentMethod={paymentMethod || ""}
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
            onReady={() => updateState({ checkoutReady: true })}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
          />
        );
      case "bank_transfer":
        return (
          <ContentCard
            title="Pagamento"
            icon={<PiCreditCardThin size="28px" />}
            contentPadding={0}
            contentPaddingMobile={0}>
            <PaymentProviderCard>
              <BankTransfer order={pendingOrder} handleRestoreOrder={handleCancelPaymentMethod} />
            </PaymentProviderCard>
          </ContentCard>
        );
    }
  };

  // Effetto per gestire il redirect quando l'ordine è cancellato in modalità standard
  useEffect(() => {
    if (pendingOrder?.status === "cancelled") {
      navigate("/dashboard");
    }
  }, [orderMode, pendingOrder?.status, navigate]);

  // Effetto per gestire il redirect di Stripe
  useEffect(() => {
    if (!stripe || !isReady) return;

    const urlParams = new URLSearchParams(window.location.search);
    const clientSecret = urlParams.get("payment_intent_client_secret");
    const paymentIntentId = urlParams.get("payment_intent");
    const redirectStatus = urlParams.get("redirect_status");

    if (!clientSecret || !paymentIntentId || !redirectStatus) return;

    const processPaymentResult = async () => {
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        const completedOrderId = localStorage.getItem("completed-order");

        if (!completedOrderId) return;

        switch (paymentIntent?.status) {
          case "succeeded":
            // Mappa i payment methods ai loro display names
            const getPaymentMethodDisplay = (method: string | null) => {
              switch (method) {
                case "klarna":
                  return { method: "Klarna", title: "Klarna" };
                case "paypal":
                  return { method: "PayPal", title: "PayPal" };
                case "revolut_pay":
                  return { method: "Revolut Pay", title: "Revolut Pay" };
                case "google_pay":
                  return { method: "Google Pay", title: "Google Pay" };
                default:
                  return { method: "Credit card", title: "Carta di credito" };
              }
            };

            const paymentDisplay = getPaymentMethodDisplay(paymentMethod);

            await data.setOrderStatus(+completedOrderId, "completed", {
              payment_method: paymentDisplay.method,
              payment_method_title: paymentDisplay.title,
              customer_note:
                orderMode === "loan"
                  ? "Blocco opera"
                  : orderMode === "redeem"
                    ? "Saldo completato"
                    : "Transazione conclusa",
            });
            setPaymentCompleted({
              status: "completed",
              orderNumber: +completedOrderId,
              orderTotal: pendingOrder?.total || "0",
            });
            refreshOrders(); // Aggiorna PaymentDraw
            localStorage.removeItem("completed-order");
            localStorage.removeItem("showCheckout");
            localStorage.removeItem("checkoutUrl");
            navigate(`/complete-order/${pendingOrder?.id}`);
            break;

          case "requires_capture":
            if (orderMode === "loan") {
              await data.setOrderStatus(+completedOrderId, "on-hold", {
                payment_method: "Acconto blocco opera",
                payment_method_title: "Blocco opera",
                customer_note: `Versato acconto ${data.downpaymentPercentage()}%`,
              });
              setPaymentCompleted({
                status: "on-hold",
                orderNumber: +completedOrderId,
                orderTotal: pendingOrder?.total || "0",
              });
              refreshOrders(); // Aggiorna PaymentDraw
              localStorage.removeItem("completed-order");
              localStorage.removeItem("showCheckout");
              localStorage.removeItem("checkoutUrl");
            }
            break;

          default:
            console.log("Payment not completed:", paymentIntent?.status);
            setPaymentCompleted({
              status: "failed",
              orderNumber: +completedOrderId,
              orderTotal: pendingOrder?.total || "0",
            });
            refreshOrders(); // Aggiorna PaymentDraw
            break;
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
      }
    };

    processPaymentResult();
  }, [stripe, isReady, data, paymentMethod, orderMode, pendingOrder?.payment_method]);

  return (
    <DirectPurchaseLayout>
      <div className={"flex flex-col mb-6"}>
        <div className={"order-last lg:order-first"}>
          {renderer()}
          {orderMode !== "loan" && auth.isAuthenticated && (paymentMethod == "card" || paymentMethod == "klarna") && (
            <ContentCard contentPadding={0} title="Metodo di spedizione" icon={<PiTruckThin size="28px" />}>
              <RadioGroup defaultValue="selected" name="radio-buttons-group" className={"p-0!"}>
                {availableShippingMethods.map((s) => {
                  return (
                    <RadioButton
                      sx={{ mb: 2 }}
                      key={s.method_id}
                      value={s.method_id}
                      disabled={isSaving}
                      onClick={() => handleSelectShippingMethod(s, estimatedShippingCost, onChangePaymentMethod)}
                      checked={currentShippingMethod === s.method_id}
                      label={s.method_title}
                      description={s.method_description(estimatedShippingCost)}
                      className={`${
                        currentShippingMethod === s.method_id ? "bg-[#F0F1FD] " : "bg-[#FAFAFB] "
                      } mb-6 p-6 rounded-lg`}
                    />
                  );
                })}
              </RadioGroup>
              {showBillingSection && (
                <>
                  <PaymentProviderCard
                    backgroundColor={"bg-[#FAFAFB]"}
                    className={"mt-6"}
                    cardTitle={"Dati fatturazione"}
                    disabled={!requireInvoice}
                    button={
                      <Button onClick={() => handleBlockNavigation("/profile/personal-settings")} className={"text-primary !underline block mt-4 w-fit !px-0 !font-light"}>
                        Modifica
                      </Button>
                    }>
                    <BillingDataPreview value={userProfile?.billing} />
                  </PaymentProviderCard>
                </>
              )}
              {currentShippingMethod !== "local_pickup" && (
                <PaymentProviderCard
                  backgroundColor={"bg-[#FAFAFB]"}
                  className={"mt-6"}
                  cardTitle={"Dati spedizione"}
                  disabled={!requireInvoice}
                  button={
                    <Button onClick={() => handleBlockNavigation("/profile/personal-settings")} className={"text-primary !underline block mt-4 w-fit !px-0 !font-light"}>
                      Modifica
                    </Button>
                  }>
                  <BillingDataPreview value={userProfile?.billing} />
                </PaymentProviderCard>
              )}
            </ContentCard>
          )}

          {/*<ContentCard
            title="Informazioni di contatto"
            icon={<UserIcon />}
            headerButtons={contactHeaderButtons}
            contentPadding={0}>
            {!auth.isAuthenticated && (
              <Button onClick={() => auth.login()} sx={{ maxWidth: "320px", mb: 2 }} variant="contained" fullWidth>
                Effettua il login
              </Button>
            )}


            <div className={"flex gap-2 my-6"}>
              <button
                className={`${
                  requireInvoice ? "bg-primary" : "bg-gray-300"
                } rounded-full border border-gray-300 px-3 cursor-pointer relative disabled:cursor-not-allowed disabled:opacity-65`}
                disabled={isSaving}
                onClick={() => handleRequireInvoice(!requireInvoice)}>
                <span
                  className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                    requireInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                  }`}></span>
              </button>
              Hai bisogno di una fattura?
            </div>
            {userProfile && (requireInvoice || orderMode === "loan") && (
              <Box pt={orderMode === "loan" ? 0 : 3} className={"bg-[#FAFAFB] p-4 rounded-lg mt-6"}>
                <Typography variant="h6" sx={{ mb: 4 }} color="textSecondary">
                  Dati di fatturazione
                </Typography>
                {shippingDataEditing ? (
                  <BillingDataForm
                    defaultValues={userProfile.billing}
                    shippingData={userProfile.shipping}
                    onSubmit={(formData) => handleProfileDataSubmit(formData, true)}
                  />
                ) : (
                  <BillingDataPreview value={userProfile.billing} />
                )}
              </Box>
            )}
          </ContentCard>*/}
        </div>
        {/*<div className={"order-first lg:order-last px-2"}>
            <ContentCard
              title={cardContentTitle}
              icon={<ShoppingBagIcon />}
              contentPadding={0}
              contentPaddingMobile={0}
              variant={"shadow"}>
              {galleries && galleries.length == 0 ? (
                <div className={"flex justify-center items-center w-full"}>
                  <CircularProgress />
                </div>
              ) : (
                <Box display="flex" flexDirection="column" gap={3} mt={3}>
                  {pendingOrder?.line_items.map((item: any, i: number) => (
                    <Box key={item.id} className={"flex items-center w-full gap-4"}>
                      <DisplayImage
                        src={item.image.src}
                        width="64px"
                        height="64px"
                        objectFit={"cover"}
                        borderRadius={"5px"}
                      />
                      <div className={"space-y-1"}>
                        <div className={"flex gap-2"}>
                          <Typography variant="body1" fontWeight={500}>
                            {item.name}
                          </Typography>
                          <Typography variant="body1" fontWeight={500} color="textSecondary">
                            {artworks[i]?.artistName}
                          </Typography>
                        </div>
                        <div className={"flex gap-2 text-xs text-secondary"}>
                          <Typography variant="body2" color="textSecondary">
                            {artworks[i]?.technique}
                          </Typography>
                          {artworks[i].technique && artworks[i].dimensions && "|"}
                          <Typography variant="body2" color="textSecondary">
                            {artworks[i]?.dimensions}
                          </Typography>
                        </div>
                        <Typography variant="body1" fontWeight={500}>
                          {artworks[i]?.galleryName}
                        </Typography>
                      </div>
                    </Box>
                  ))}
                </Box>
              )}
              <Divider sx={{ my: 3, borderColor: "#d8ddfa" }} />
              <Box display="flex" flexDirection="column" gap={2} sx={{ px: 2 }}>
                {orderMode === "loan" ? (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight={500}>
                        Costo opera
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        € {pendingOrder?.total}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight={500}>
                        Caparra
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {data.downpaymentPercentage()}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight={500}>
                        Totale
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        € {((+(pendingOrder?.total || 0) * data.downpaymentPercentage()) / 100).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontSize={20} fontWeight={700}>
                        Totale
                      </Typography>
                      <Typography variant="subtitle1" fontSize={20} fontWeight={700}>
                        € {(+(pendingOrder?.total || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                    {shippingPrice != 0 && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" sx={{ mb: 1, mt: 0 }} className={"text-secondary"}>
                          Costi di spedizione
                        </Typography>
                        <Typography className={"text-secondary"} variant="body1">
                          € {(shippingPrice || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {showCommissioni ? (
                      <>
                        {pendingOrder?.fee_lines?.some((fee: any) => fee.name === "payment-gateway-fee") &&
                          paymentMethod !== "Santander" && (
                            <Box display="flex" justifyContent="space-between" className={"text-secondary "}>
                              <Typography variant="body1">Commissioni di servizio</Typography>
                              <Typography variant="body1">
                                {" "}
                                €&nbsp;
                                {(
                                  +(
                                    pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")
                                      ?.total || 0
                                  ) +
                                  +(
                                    pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")
                                      ?.total_tax || 0
                                  )
                                ).toFixed(2)}
                              </Typography>
                            </Box>
                          )}
                      </>
                    ) : (
                      <p className={"flex gap-3 w-full text-secondary justify-between "}>
                        <span className={"animate-pulse"}>Calcolo commissioni...</span>
                        <span
                          className={
                            "h-4 w-4 rounded-full border-2 border-secondary border-b-transparent animate-spin"
                          }></span>
                      </p>
                    )}
                  </>
                )}
                <div className={"mt-6"}>

                </div>
                {paymentMethod === "Santander" ? (
                  <div className={"w-full flex justify-center "}>
                    <SantanderButton order={pendingOrder as Order} disabled={!privacyChecked} />
                  </div>
                ) : (
                  <Button
                    disabled={!checkoutEnabled}
                    startIcon={
                      isReady || !auth.isAuthenticated ? undefined : <CircularProgress size="20px" />
                    }
                    onClick={() => handlePurchase(checkoutButtonRef)}
                    variant="contained"
                    fullWidth>
                    {orderMode === "loan" ? "Prenota l'opera" : "Completa acquisto"}
                  </Button>
                )}
              </Box>
            </ContentCard>
          </div>*/}
      </div>
    </DirectPurchaseLayout>
  );
};

export default DirectPurchaseView;
