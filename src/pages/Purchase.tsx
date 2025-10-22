import React, { ReactNode, useEffect, useRef } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Button, CircularProgress, Divider, Grid, Link, RadioGroup, Typography } from "@mui/material";
import ContentCard from "../components/ContentCard.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import { Cancel, Edit } from "@mui/icons-material";
import ShippingDataForm from "../components/ShippingDataForm.tsx";
import { areBillingFieldsFilled } from "../utils.ts";
import ShippingDataPreview from "../components/ShippingDataPreview.tsx";
import Checkbox from "../components/Checkbox.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Order } from "../types/order.ts";
import ShoppingBagIcon from "../components/icons/ShoppingBagIcon.tsx";
import RadioButton from "../components/RadioButton.tsx";
import { useNavigate } from "../utils.ts";
import DisplayImage from "../components/DisplayImage.tsx";
import { PiTruckThin } from "react-icons/pi";
import { isAxiosError } from "axios";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import PaymentCard from "../components/PaymentCard.tsx";
import BillingDataForm from "../components/BillingDataForm.tsx";
import BillingDataPreview from "../components/BillingDataPreview.tsx";
import ErrorIcon from "../components/icons/ErrorIcon.tsx";
import { useParams } from "react-router-dom";
import SantanderButton from "../components/SantanderButton.tsx";
import { usePurchaseData } from "../hooks/usePurchaseData.ts";
import { usePurchaseHandlers } from "../hooks/usePurchaseHandlers.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import PurchaseSectionSkeleton from "../components/PurchaseSectionSkeleton.tsx";

export interface PurchaseProps {
  orderMode?: "standard" | "loan" | "redeem" | "onHold";
}

const Purchase: React.FC<PurchaseProps> = ({ orderMode = "standard" }) => {
  const data = useData();
  const auth = useAuth();
  const snackbar = useSnackbars();
  const navigate = useNavigate();
  const payments = usePayments();
  const urlParams = useParams();

  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  // Use custom hooks for data management and handlers
  const { state, pageData, updateState, updatePageData } = usePurchaseData(orderMode);

  const showError = async (err?: unknown, text: string = "Si è verificato un errore"): Promise<void> => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    snackbar.error(text, { autoHideDuration: 60000 });
  };

  const handlers = usePurchaseHandlers(state, pageData, updateState, updatePageData, showError);

  orderMode = orderMode === "loan" || pageData.pendingOrder?.customer_note === "Blocco opera" ? "loan" : orderMode;

  // Handle payments ready state
  useEffect(() => {
    if (payments.isReady) {
      updateState({ paymentsReady: payments.isReady });
    }
  }, [payments.isReady]);

  // Handle no pending order navigation
  useEffect(() => {
    if (state.noPendingOrder) {
      navigate("/errore/404");
    }
  }, [state.noPendingOrder, navigate]);

  const onChangePaymentMethod = async (payment: string): Promise<void> => {
    console.log("payment method", payment);
    updateState({ showCommissioni: false });

    if (pageData.pendingOrder) {
      const wc_order_key = pageData.pendingOrder.order_key;
      try {
        const newPaymentIntent = await data.updatePaymentIntent({ wc_order_key, payment_method: payment });
        updatePageData({ paymentIntent: newPaymentIntent });

        const paymentMethodMap: Record<string, string> = {
          card: "Carta",
          klarna: "Klarna",
          Santander: "Santander",
        };
        updateState({ paymentMethod: paymentMethodMap[payment] || "Bonifico" });

        const getOrderFunction =
          orderMode === "redeem" && urlParams.order_id
            ? data.getOrder(+urlParams.order_id)
            : orderMode === "onHold"
              ? data.getOnHoldOrder()
              : data.getPendingOrder();

        const order = await getOrderFunction;
        if (order) updatePageData({ pendingOrder: order });
        updateState({ showCommissioni: true });
      } catch (e) {
        console.error("Update payment method error: ", e);
        updateState({ showCommissioni: false });
      }
    }
  };

  const contactHeaderButtons: ReactNode[] = [];
  if (auth.isAuthenticated) {
    if (
      state.shippingDataEditing &&
      (areBillingFieldsFilled(pageData.userProfile?.billing) || areBillingFieldsFilled(pageData.userProfile?.shipping))
    ) {
      contactHeaderButtons.push(
        <Button
          key="cancel-btn"
          color="error"
          disabled={state.isSaving}
          onClick={() => updateState({ shippingDataEditing: false })}
          startIcon={<Cancel />}>
          Annulla
        </Button>,
      );
    } else if (!state.shippingDataEditing) {
      contactHeaderButtons.push(
        <Button
          key="edit-btn"
          disabled={state.isSaving}
          onClick={() => updateState({ shippingDataEditing: true })}
          startIcon={<Edit />}>
          Modifica
        </Button>,
      );
    }
  }

  const currentShippingMethod = pageData.pendingOrder?.shipping_lines?.length
    ? pageData.pendingOrder.shipping_lines[0].method_id
    : "local_pickup";
  const estimatedShippingCost = [0, ...pageData.artworks.map((a) => +(a.estimatedShippingCost || "0"))].reduce(
    (a, b) => a + b,
  );
  const thankYouPage =
    orderMode === "loan"
      ? `/opera-bloccata/${pageData.artworks.length ? pageData.artworks[0].slug : ""}`
      : `/thank-you-page/${pageData.pendingOrder?.id}`;
  const checkoutEnabled =
    state.checkoutReady &&
    state.privacyChecked &&
    !state.isSaving &&
    (currentShippingMethod || (orderMode === "loan" && areBillingFieldsFilled(pageData.userProfile?.billing)));

  const shippingPrice =
    currentShippingMethod === "local_pickup" || !currentShippingMethod ? 0 : estimatedShippingCost || 0;

  const cardContentTitle = "Dettagli dell'ordine";

  if (state.noPendingOrder) {
    return (
      <DefaultLayout pageLoading={!state.isReady || !state.paymentsReady} pb={6} authRequired>
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
  }

  console.log(state.paymentMethod);

  return (
    <DefaultLayout pageLoading={false} pb={6} authRequired>
      {!state.isReady || !state.paymentsReady ? (
        <PurchaseSectionSkeleton
          showLoanSection={orderMode === "loan"}
          showShippingSection={orderMode !== "loan" && auth.isAuthenticated}
        />
      ) : (
        <div className={"flex flex-col md:grid lg:grid-cols-2 gap-8 md:gap-32 pb-24 pt-35 md:pt-0"}>
          <div className={"order-last lg:order-first"}>
            {orderMode === "loan" && (
              <Box sx={{ borderTop: `1px solid #d8ddfa`, borderBottom: `1px solid #d8ddfa` }} py={3} mb={8}>
                <Typography variant="h1">
                  Prenota {pageData.artworks?.length ? pageData.artworks[0].title : "l'opera"}
                  {pageData.artworks?.length && pageData.artworks[0].year ? `, ${pageData.artworks[0].year}` : ""}
                </Typography>
                <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
                  Per 7 giorni avrai diritto esclusivo di acquisto di quest'opera. Nessun altro potrà prenotarla o
                  acquistarla. Durante questo periodo, potrai completare l'acquisto con le modalità a te preferite.
                </Typography>
              </Box>
            )}
            <PaymentCard
              orderMode={orderMode}
              paymentMethod={state.paymentMethod || ""}
              checkoutButtonRef={checkoutButtonRef}
              onCheckout={() => handlers.handleSubmitCheckout()}
              onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
              onReady={() => updateState({ checkoutReady: true })}
              paymentIntent={pageData.paymentIntent}
              thankYouPage={thankYouPage}
            />
            {orderMode !== "loan" && auth.isAuthenticated && (
              <ContentCard contentPadding={0} title="Metodo di spedizione" icon={<PiTruckThin size="28px" />}>
                <RadioGroup defaultValue="selected" name="radio-buttons-group" className={"p-0!"}>
                  {pageData.availableShippingMethods.map((s) => {
                    return (
                      <RadioButton
                        sx={{ mb: 2 }}
                        key={s.method_id}
                        value={s.method_id}
                        disabled={state.isSaving}
                        onClick={() =>
                          handlers.handleSelectShippingMethod(s, estimatedShippingCost, onChangePaymentMethod)
                        }
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
              </ContentCard>
            )}
            <ContentCard
              title="Informazioni di contatto"
              icon={<UserIcon />}
              headerButtons={contactHeaderButtons}
              contentPadding={0}>
              {!auth.isAuthenticated && (
                <Button onClick={() => auth.login()} sx={{ maxWidth: "320px", mb: 2 }} variant="contained" fullWidth>
                  Effettua il login
                </Button>
              )}
              {orderMode !== "loan" && auth.isAuthenticated && (
                <div className={"bg-[#FAFAFB] p-4 rounded-lg"}>
                  <Typography variant="h6" sx={{ mb: 4 }} color="textSecondary">
                    Dati di spedizione
                  </Typography>
                  {pageData.userProfile &&
                    (state.shippingDataEditing ? (
                      <ShippingDataForm
                        defaultValues={pageData.userProfile.shipping}
                        onSubmit={(formData) => handlers.handleProfileDataSubmit(formData, false)}
                      />
                    ) : (
                      <ShippingDataPreview value={pageData.userProfile.shipping} />
                    ))}
                </div>
              )}

              <div className={"flex gap-2 my-6"}>
                <button
                  className={`${
                    state.requireInvoice ? "bg-primary" : "bg-gray-300"
                  } rounded-full border border-gray-300 px-3 cursor-pointer relative disabled:cursor-not-allowed disabled:opacity-65`}
                  disabled={state.isSaving}
                  onClick={() => handlers.handleRequireInvoice(!state.requireInvoice)}>
                  <span
                    className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                      state.requireInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                    }`}></span>
                </button>
                Hai bisogno di una fattura?
              </div>
              {pageData.userProfile && (state.requireInvoice || orderMode === "loan") && (
                <Box pt={orderMode === "loan" ? 0 : 3} className={"bg-[#FAFAFB] p-4 rounded-lg mt-6"}>
                  <Typography variant="h6" sx={{ mb: 4 }} color="textSecondary">
                    Dati di fatturazione
                  </Typography>
                  {state.shippingDataEditing ? (
                    <BillingDataForm
                      defaultValues={pageData.userProfile.billing}
                      shippingData={pageData.userProfile.shipping}
                      onSubmit={(formData) => handlers.handleProfileDataSubmit(formData, true)}
                    />
                  ) : (
                    <BillingDataPreview value={pageData.userProfile.billing} />
                  )}
                </Box>
              )}
            </ContentCard>
          </div>
          <div className={"order-first lg:order-last px-2"}>
            <ContentCard
              title={cardContentTitle}
              icon={<ShoppingBagIcon />}
              contentPadding={0}
              contentPaddingMobile={0}
              variant={"shadow"}>
              {pageData.galleries && pageData.galleries.length == 0 ? (
                <div className={"flex justify-center items-center w-full"}>
                  <CircularProgress />
                </div>
              ) : (
                <Box display="flex" flexDirection="column" gap={3} mt={3}>
                  {pageData.pendingOrder?.line_items.map((item: any, i: number) => (
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
                            {pageData.artworks[i]?.artistName}
                          </Typography>
                        </div>
                        <div className={"flex gap-2 text-xs text-secondary"}>
                          <Typography variant="body2" color="textSecondary">
                            {pageData.artworks[i]?.technique}
                          </Typography>
                          {pageData.artworks[i].technique && pageData.artworks[i].dimensions && "|"}
                          <Typography variant="body2" color="textSecondary">
                            {pageData.artworks[i]?.dimensions}
                          </Typography>
                        </div>
                        <Typography variant="body1" fontWeight={500}>
                          {pageData.artworks[i]?.galleryName}
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
                        € {pageData.pendingOrder?.total}
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
                        € {((+(pageData.pendingOrder?.total || 0) * data.downpaymentPercentage()) / 100).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    {/*<Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontSize={20} fontWeight={700}>
                      Totale
                    </Typography>
                    <Typography variant="body1" fontSize={20} fontWeight={500}>
                      {`€ ${state.subtotal.toFixed(2) || 0}`}
                    </Typography>
                  </Box>*/}
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontSize={20} fontWeight={700}>
                        Totale
                      </Typography>
                      <Typography variant="subtitle1" fontSize={20} fontWeight={700}>
                        € {(+(pageData.pendingOrder?.total || 0)).toFixed(2)}
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
                    {state.showCommissioni ? (
                      <>
                        {pageData.pendingOrder?.fee_lines?.some((fee: any) => fee.name === "payment-gateway-fee") &&
                          state.paymentMethod !== "Santander" && (
                            <Box display="flex" justifyContent="space-between" className={"text-secondary "}>
                              <Typography variant="body1">Commissioni di servizio</Typography>
                              <Typography variant="body1">
                                {" "}
                                €&nbsp;
                                {(
                                  +(
                                    pageData.pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")
                                      ?.total || 0
                                  ) +
                                  +(
                                    pageData.pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")
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
                  <Checkbox
                    disabled={state.isSaving}
                    checked={state.privacyChecked}
                    onChange={(e) => updateState({ privacyChecked: e.target.checked })}
                    label={
                      <Typography variant="body1">
                        Accetto le{" "}
                        <Link href="/condizioni-generali-di-acquisto" target="_blank">
                          condizioni generali d'acquisto
                        </Link>
                      </Typography>
                    }
                  />
                </div>
                {state.paymentMethod === "Santander" ? (
                  <div className={"w-full flex justify-center "}>
                    <SantanderButton order={pageData.pendingOrder as Order} disabled={!state.privacyChecked} />
                  </div>
                ) : (
                  <Button
                    disabled={!checkoutEnabled}
                    startIcon={
                      state.checkoutReady || !auth.isAuthenticated ? undefined : <CircularProgress size="20px" />
                    }
                    onClick={() => handlers.handlePurchase(checkoutButtonRef)}
                    variant="contained"
                    fullWidth>
                    {orderMode === "loan" ? "Prenota l'opera" : "Completa acquisto"}
                  </Button>
                )}
              </Box>
            </ContentCard>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default Purchase;
