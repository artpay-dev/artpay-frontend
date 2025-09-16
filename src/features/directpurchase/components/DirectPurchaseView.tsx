import { ReactNode, useRef } from "react";
import { useAuth } from "../../../hoc/AuthProvider.tsx";
// import { useData } from "../../../hoc/DataProvider.tsx";
import { areBillingFieldsFilled } from "../../../utils.ts";
import { Box, Button, Grid, RadioGroup, Typography } from "@mui/material";
import { Cancel, Edit } from "@mui/icons-material";
import DefaultLayout from "../../../components/DefaultLayout.tsx";
import ErrorIcon from "../../../components/icons/ErrorIcon.tsx";
// import PurchaseSectionSkeleton from "../../../components/PurchaseSectionSkeleton.tsx";
import PaymentCard from "../../../components/PaymentCard.tsx";
import ContentCard from "../../../components/ContentCard.tsx";
import { PiTruckThin } from "react-icons/pi";
import RadioButton from "../../../components/RadioButton.tsx";
/*import UserIcon from "../../../components/icons/custom/UserIcon.tsx";
import ShippingDataForm from "../../../components/ShippingDataForm.tsx";
import ShippingDataPreview from "../../../components/BillingDataPreview.tsx";
import BillingDataForm from "../../../components/BillingDataForm.tsx";
import BillingDataPreview from "../../../components/BillingDataPreview.tsx";*/
// import ShoppingBagIcon from "../../../components/icons/ShoppingBagIcon.tsx";
// import DisplayImage from "../../../components/DisplayImage.tsx";
// import Checkbox from "../../../components/Checkbox.tsx";
// import SantanderButton from "../../../components/SantanderButton.tsx";
// import { Order } from "../../../types/order.ts";
import { useDirectPurchase } from "../contexts/DirectPurchaseContext.tsx";
import DirectPurchaseLayout from "../layouts/DirectPurchaseLayout.tsx";
//import CheckoutForm from "../../../components/CheckoutForm.tsx";

const DirectPurchaseView = () => {
  const auth = useAuth();
  // const data = useData();
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  const {
    // State
    isReady,
    paymentsReady,
    paymentMethod,
    isSaving,
    noPendingOrder,
    shippingDataEditing,
    // requireInvoice,
    // privacyChecked,
    // showCommissioni,
    // subtotal,

    // Data
    userProfile,
    availableShippingMethods,
    // pendingOrder,
    paymentIntent,
    artworks,
    // galleries,
    orderMode,

    // Actions
    updateState,

    // Handlers
    // handleRequireInvoice,
    // handleProfileDataSubmit,
    handleSelectShippingMethod,
    // handlePurchase,
    handleSubmitCheckout,
    onChangePaymentMethod,

    // Utils
    getCurrentShippingMethod,
    getEstimatedShippingCost,
    getThankYouPage,
    // getCheckoutEnabled,
    // getShippingPrice,
    // getCardContentTitle,
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
  // const checkoutEnabled = getCheckoutEnabled();
  // const shippingPrice = getShippingPrice();
  // const cardContentTitle = getCardContentTitle();

  if (noPendingOrder) {
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
  }

  console.log(paymentIntent);

  return (
    <DirectPurchaseLayout>
      <div className={"flex flex-col mb-6"}>
        <div className={"order-last lg:order-first"}>
          {orderMode === "loan" && (
            <Box sx={{ borderTop: `1px solid #d8ddfa`, borderBottom: `1px solid #d8ddfa` }} py={3} mb={8}>
              <Typography variant="h1">
                Prenota {artworks?.length ? artworks[0].title : "l'opera"}
                {artworks?.length && artworks[0].year ? `, ${artworks[0].year}` : ""}
              </Typography>
              <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
                Per 7 giorni avrai diritto esclusivo di acquisto di quest'opera. Nessun altro potrà prenotarla o
                acquistarla. Durante questo periodo, potrai completare l'acquisto con le modalità a te preferite.
              </Typography>
            </Box>
          )}
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
          {orderMode !== "loan" && auth.isAuthenticated && (
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
                  <Checkbox
                    disabled={isSaving}
                    checked={privacyChecked}
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
