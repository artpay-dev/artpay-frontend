import { ReactNode, useRef, useEffect, useState } from "react";
import { useAuth } from "../../../hoc/AuthProvider.tsx";
import { useData } from "../../../hoc/DataProvider.tsx";
import { areBillingFieldsFilled } from "../../../utils.ts";
import { useStripe } from "@stripe/react-stripe-js";
import { Button, RadioGroup } from "@mui/material";
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
import { Link } from "react-router-dom";
import { BankTransfer } from "../../cdspayments/components/banktransfer";
import PaymentStatusPlaceholder from "./PaymentStatusPlaceholder.tsx";

const DirectPurchaseView = () => {
  const auth = useAuth();
  const data = useData();
  const stripe = useStripe();
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

    // Utils
    getCurrentShippingMethod,
    getEstimatedShippingCost,
    getThankYouPage,
    onCancelPaymentMethod
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

  const showBillingSection = userProfile && (requireInvoice || orderMode === "loan")


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
      if (pendingOrder?.status === "completed" || pendingOrder?.status === "failed") {
        return (
          <PaymentStatusPlaceholder
            status={pendingOrder.status}
            orderNumber={pendingOrder?.id}
            orderTotal={pendingOrder?.total}
          />
        );
      }

      // Altrimenti mostra il form di pagamento
      return (
        <PaymentCard
          orderMode={orderMode}
          paymentMethod={paymentMethod || "card"}
          checkoutButtonRef={checkoutButtonRef}
          onCheckout={() => handleSubmitCheckout()}
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
        return (
          <PaymentStatusPlaceholder
            status={pendingOrder.status}
            orderNumber={pendingOrder?.id}
            orderTotal={pendingOrder?.total}
          />
        );
      }

      // Per ordini non completati, controlla se è stato selezionato un metodo di pagamento
      switch (pendingOrder?.payment_method) {
        case "":
          return (
            <PaymentsSelection paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />
          );
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
        default:
          return (
            <PaymentsSelection paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />
          );
      }
    }



    // Per gli altri orderMode, usa la logica esistente
    switch (pendingOrder?.payment_method) {
      case "":
        return (
          <PaymentsSelection paymentMethod={paymentMethod} onChange={onChangePaymentMethod} />
        )
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
        )
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
        )
      case "bank_transfer":
        return (
          <ContentCard
            title="Pagamento"
            icon={<PiCreditCardThin size="28px" />}
            contentPadding={0}
            contentPaddingMobile={0}
          >
            <PaymentProviderCard>
              <BankTransfer order={pendingOrder} handleRestoreOrder={onCancelPaymentMethod} />
            </PaymentProviderCard>
          </ContentCard>
        )

    }
  }

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
            await data.setOrderStatus(+completedOrderId, "completed", {
              payment_method: paymentMethod === "klarna" ? "Klarna" : "Credit card",
              payment_method_title: paymentMethod === "klarna" ? "Klarna" : "Carta di credito",
              customer_note: orderMode === "loan" ? "Blocco opera" : orderMode === "redeem" ? "Saldo completato" : "Transazione conclusa",
            });
            setPaymentCompleted({
              status: "completed",
              orderNumber: +completedOrderId,
              orderTotal: pendingOrder?.total || "0"
            });
            localStorage.removeItem("completed-order");
            localStorage.removeItem("showCheckout");
            localStorage.removeItem("checkoutUrl");
            break;

          case "requires_capture":
            if (orderMode === "loan") {
              await data.setOrderStatus(+completedOrderId, "on-hold", {
                payment_method: "Acconto blocco opera",
                payment_method_title: "Blocco opera",
                customer_note: `Versato acconto ${data.downpaymentPercentage()}%`
              });
              setPaymentCompleted({
                status: "on-hold",
                orderNumber: +completedOrderId,
                orderTotal: pendingOrder?.total || "0"
              });
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
              orderTotal: pendingOrder?.total || "0"
            });
            break;
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
      }
    };

    processPaymentResult();
  }, [stripe, isReady, data, paymentMethod, orderMode, auth.user?.username, pendingOrder?.payment_method]);


  return (
    <DirectPurchaseLayout>
      <div className={"flex flex-col mb-6"}>
        <div className={"order-last lg:order-first"}>
          {renderer()}
          {orderMode !== "loan" && auth.isAuthenticated && (paymentMethod == 'card' || paymentMethod == 'klarna') && (
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
                  button={<Link to={"/profile/shipping-invoice-settings"} className={'text-primary underline block font-light mt-4'}>Modifica</Link>}>
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
                  button={<Link to={"/profile/shipping-invoice-settings"} className={'text-primary underline block font-light mt-4'}>Modifica</Link>}>
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
