import React, { ReactNode, useEffect, useRef, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  RadioGroup,
  Typography,
} from "@mui/material";
import ContentCard from "../components/ContentCard.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import { Cancel, Edit } from "@mui/icons-material";
import ShippingDataForm from "../components/ShippingDataForm.tsx";
import { BillingData, ShippingData, UserProfile } from "../types/user.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { areBillingFieldsFilled, artworksToGalleryItems } from "../utils.ts";
import ShippingDataPreview from "../components/ShippingDataPreview.tsx";
import Checkbox from "../components/Checkbox.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Order, OrderUpdateRequest, ShippingLineUpdateRequest, ShippingMethodOption } from "../types/order.ts";
import ShoppingBagIcon from "../components/icons/ShoppingBagIcon.tsx";
import RadioButton from "../components/RadioButton.tsx";
import { useNavigate } from "../utils.ts";
import DisplayImage from "../components/DisplayImage.tsx";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { PiTruckThin } from "react-icons/pi";
import { isAxiosError } from "axios";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { PaymentIntent } from "@stripe/stripe-js";
import PaymentCard from "../components/PaymentCard.tsx";
import BillingDataForm from "../components/BillingDataForm.tsx";
import BillingDataPreview from "../components/BillingDataPreview.tsx";
import ErrorIcon from "../components/icons/ErrorIcon.tsx";
import { Gallery } from "../types/gallery.ts";
import { useParams } from "react-router-dom";
import SantanderButton from "../components/SantanderButton.tsx";

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

  const [isReady, setIsReady] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [noPendingOrder, setNoPendingOrder] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [shippingDataEditing, setShippingDataEditing] = useState(false);
  const [requireInvoice, setRequireInvoice] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const [availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [pendingOrder, setPendingOrder] = useState<Order>();
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  const [subtotal, setSubtotal] = useState<number>(0);

  const [showCommissioni, setShowCommissioni] = useState(true);

  const [isOnlySantander, setIsOnlySantander] = useState(false);

  const isGalleryAuction = pendingOrder?.created_via === "gallery_auction";



  orderMode = orderMode === "loan" || pendingOrder?.customer_note === "Blocco opera" ? "loan" : orderMode;

  const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    return snackbar.error(text, { autoHideDuration: 60000 });
  };
  useEffect(() => {

    if (isGalleryAuction) setShowCommissioni(true);

    if (auth.isAuthenticated) {
      const getOrderFunction =
        orderMode === "redeem" && urlParams.order_id
          ? data.getOrder(+urlParams.order_id)
          : orderMode === "onHold"
            ? data.getOnHoldOrder()
            : data.getPendingOrder();

      Promise.all([
        data.getUserProfile().then((resp) => {
          const userProfile = { ...resp };
          userProfile.shipping.email = userProfile.shipping.email || userProfile.email || "";
          userProfile.billing.email = userProfile.billing.email || userProfile.email || "";
          setShippingDataEditing(!areBillingFieldsFilled(userProfile.shipping));
          setUserProfile(userProfile);
          if (userProfile?.billing?.invoice_type !== "") {
            setRequireInvoice(true);
          }
          if (!areBillingFieldsFilled(userProfile.billing) && orderMode === "loan") {
            setShippingDataEditing(true);
          }
        }),
        data.getAvailableShippingMethods().then((resp) => {
          setAvailableShippingMethods(resp);
        }),
        getOrderFunction.then(async (resp) => {
          if (resp) {
            setPendingOrder(resp);
            const artworks = await Promise.all(
              resp.line_items.map((item) => data.getArtwork(item.product_id.toString())),
            );
            setArtworks(artworksToGalleryItems(artworks, undefined, data));
            // const existingIntentId = getPropertyFromOrderMetadata(resp.meta_data, "_stripe_intent_id");
            // console.log("existingIntentId", existingIntentId);

            let paymentIntent: PaymentIntent;
            if (resp.payment_method === "bnpl" && orderMode === "redeem") {
              resp.payment_method = "";
              paymentIntent = await data.createRedeemIntent({ wc_order_key: resp.order_key });
            } else if (resp.payment_method === "bnpl") {
              localStorage.setItem("redirectToAcquistoEsterno", "true");
              paymentIntent = await data.createPaymentIntentCds({ wc_order_key: resp.order_key });
            } else {
              if (orderMode === "loan") {
                paymentIntent = await data.createBlockIntent({ wc_order_key: resp.order_key });
              } else if (orderMode === "redeem") {
                paymentIntent = await data.createRedeemIntent({ wc_order_key: resp.order_key });
              } else {
                paymentIntent = await data.createPaymentIntent({ wc_order_key: resp.order_key });
              }
            }

            setPaymentIntent(paymentIntent);
            data.getGalleries(artworks.map((a) => +a.vendor)).then((galleries) => setGalleries(galleries));
          } else {
            setNoPendingOrder(true);
            navigate("/errore/404");
          }
        }),
      ])
        .then(() => {
          setIsReady(true);
        })
        .catch(async (e) => {
          await showError(e);
          console.error(e);
          navigate("/errore");
        });
    } else {
      data.getPendingOrder().then(async (resp) => {
        if (resp) {
          setPendingOrder(resp);
          const artworks = await Promise.all(
            resp.line_items.map((item) => data.getArtwork(item.product_id.toString())),
          );
          setArtworks(artworksToGalleryItems(artworks, undefined, data));
        }
      });
      setIsReady(true);
    }
  }, [data]);

  useEffect(() => {
    if (payments.isReady) {
      setPaymentsReady(payments.isReady);
    }
  }, [payments.isReady]);

  const handleRequireInvoice = (newVal: boolean) => {
    if (!userProfile) {
      return;
    }
    setIsSaving(true);
    data
      .updateUserProfile({
        billing: {
          invoice_type: newVal ? "receipt" : "",
        },
      })
      .then(async (resp) => {
        setIsSaving(false);
        setRequireInvoice(resp.billing?.invoice_type !== "");
      });
  };

  const handleProfileDataSubmit = async (formData: BillingData | ShippingData, isBilling = false) => {
    if (!userProfile?.id) {
      return;
    }
    try {
      setIsSaving(true);
      let updatedProfile: UserProfile;
      if (isBilling) {
        updatedProfile = await data.updateUserProfile({ billing: formData as BillingData });
      } else {
        updatedProfile = await data.updateUserProfile({ shipping: formData });
      }
      setUserProfile(updatedProfile);

      setShippingDataEditing(false);
    } catch (e) {
      console.error(e);
      await showError(e);
    }
    setIsSaving(false);
  };

  const handleSelectShippingMethod = async (selectedShippingMethod: ShippingMethodOption) => {
    if (!pendingOrder) {
      return;
    }
    setIsSaving(true);
    const updatedOrder: OrderUpdateRequest = {};
    const existingShippingLine = pendingOrder.shipping_lines?.length ? pendingOrder.shipping_lines[0] : null;

    const updatedShippingLine: ShippingLineUpdateRequest = {
      instance_id: selectedShippingMethod.instance_id.toString(),
      method_id: selectedShippingMethod.method_id,
      method_title: selectedShippingMethod.method_title,
      total: selectedShippingMethod.method_id === "local_pickup" ? "0" : estimatedShippingCost.toFixed(2),
    };
    if (existingShippingLine) {
      updatedShippingLine.id = existingShippingLine.id;
    }
    updatedOrder.shipping_lines = [updatedShippingLine];
    try {
      await data.updateOrder(pendingOrder.id, updatedOrder);
      let paymentMethodForUpdate = "Santander";
      if (paymentMethod === "Carta") {
        paymentMethodForUpdate = "card";
      } else if (paymentMethod === "Klarna") {
        paymentMethodForUpdate = "klarna";
      }
      await onChangePaymentMethod(paymentMethodForUpdate);
      //setPendingOrder(updatedOrderResp);
    } catch (e) {
      console.error(e);
      await showError(e);
    }
    setIsSaving(false);
  };

  const handlePurchase = async () => {
    if (checkoutButtonRef?.current && pendingOrder && userProfile?.shipping) {
      setIsSaving(true);
      setCheckoutReady(false);
      await data.updateOrder(pendingOrder.id, {
        shipping: { ...userProfile?.shipping },
        billing: requireInvoice && userProfile?.billing ? { ...userProfile?.billing } : { ...userProfile?.shipping },
      });
      localStorage.setItem("completed-order", pendingOrder.id.toString());
      checkoutButtonRef.current.click();
      setIsSaving(false);
      setCheckoutReady(true);
    }
  };
  const handleSubmitCheckout = () => {
    console.log("submit checkout", pendingOrder);
  };

  const onChangePaymentMethod = async (payment: string): Promise<void> => {
    setShowCommissioni(false)
    if (pendingOrder) {
      const wc_order_key = pendingOrder.order_key;
      /*console.log("Payment method: ", payment, wc_order_key);*/
      try {
        const newPaymentIntent = await data.updatePaymentIntent({ wc_order_key, payment_method: payment });
        setPaymentIntent(newPaymentIntent);
        if (payment === "card") {
          setPaymentMethod("Carta");
        } else if (payment === "klarna") {
          setPaymentMethod("Klarna");
        } else if (payment === "Santander") {
          setPaymentMethod("Santander");
        }

        const getOrderFunction =
          orderMode === "redeem" && urlParams.order_id
            ? data.getOrder(+urlParams.order_id)
            : orderMode === "onHold"
              ? data.getOnHoldOrder()
              : data.getPendingOrder();

        const order = await getOrderFunction;
        if (order) setPendingOrder(order);
        setShowCommissioni(true);
      } catch (e) {
        console.error("Update payment method error: ", e);
        setShowCommissioni(false);
      }
    }
  };

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
          onClick={() => setShippingDataEditing(false)}
          startIcon={<Cancel />}>
          Annulla
        </Button>,
      );
    } else if (!shippingDataEditing) {
      contactHeaderButtons.push(
        <Button key="edit-btn" disabled={isSaving} onClick={() => setShippingDataEditing(true)} startIcon={<Edit />}>
          Modifica
        </Button>,
      );
    }
  }

  const currentShippingMethod = pendingOrder?.shipping_lines?.length
    ? pendingOrder.shipping_lines[0].method_id
    : "local_pickup";
  const estimatedShippingCost = [0, ...artworks.map((a) => +(a.estimatedShippingCost || "0"))].reduce((a, b) => a + b);
  // const formattedSubtotal = (+(pendingOrder?.total || 0) - +(pendingOrder?.total_tax || 0)).toFixed(2);
  const thankYouPage =
    orderMode === "loan"
      ? `/opera-bloccata/${artworks.length ? artworks[0].slug : ""}`
      : `/thank-you-page/${pendingOrder?.id}`;
  const checkoutEnabled =
    checkoutReady &&
    privacyChecked &&
    !isSaving &&
    (currentShippingMethod || (orderMode === "loan" && areBillingFieldsFilled(userProfile?.billing)));

  const shippingPrice =
    currentShippingMethod === "local_pickup" || !currentShippingMethod ? 0 : estimatedShippingCost || 0;

  const px = { xs: 3, sm: 4, md: 10, lg: 12 };


  useEffect(() => {
    if (pendingOrder) {
      const totalSum = pendingOrder.line_items.reduce((acc, item) => {
        return acc + parseFloat(item.total);
      }, 0);

      const totalTaxSum = pendingOrder.line_items.reduce((acc, item) => {
        return acc + parseFloat(item.total_tax);
      }, 0);

      setSubtotal(totalSum + totalTaxSum);
    }


    setIsOnlySantander(subtotal > 2500.0);
  }, [pendingOrder]);

  const reverseFee = (base: number): number => {
    return Number((base / 1.06).toFixed(2));
  };

  const cardContentTitle = isGalleryAuction ? `Il tuo ordine presso:` : "Riassunto dell'ordine";

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



  return (
    <DefaultLayout pageLoading={!isReady || !paymentsReady} pb={6} authRequired>
      <Grid mt={16} spacing={3} sx={{ px: px }} container>
        <Grid item gap={3} display="flex" flexDirection="column" xs={12} md={8}>
          {orderMode === "loan" && (
            <Box sx={{ borderTop: `1px solid #d8ddfa`, borderBottom: `1px solid #d8ddfa` }} py={3} mb={8}>
              <Typography variant="h1">
                Prenota {artworks?.length ? artworks[0].title : "l'opera"}
                {artworks?.length && artworks[0].year ? `, ${artworks[0].year}` : ""}
              </Typography>
              <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
                Per 7 giorni avrai diritto esclusivo di acquisto di quest’opera. Nessun altro potrà prenotarla o
                acquistarla. Durante questo periodo, potrai completare l’acquisto con le modalità a te preferite.
              </Typography>
            </Box>
          )}
          <PaymentCard
            auction={isGalleryAuction}
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onChange={(payment_method: string) => onChangePaymentMethod(payment_method)}
            onReady={() => setCheckoutReady(true)}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
            tabTitles={[
              paymentIntent != undefined
                ? paymentIntent.payment_method_types
                    .map((method) => {
                      if (method.toUpperCase() === "CUSTOMER_BALANCE") {
                        return "Bonifico Bancario";
                      } else {
                        return method.charAt(0).toUpperCase() + method.slice(1);
                      }
                    })
                    .join(", ")
                : "Metodi classici",
              "Santander",
            ]}
          />
          {orderMode !== "loan" && auth.isAuthenticated && (
            <ContentCard title="Metodo di spedizione" icon={<PiTruckThin size="28px" />}>
              <RadioGroup defaultValue="selected" name="radio-buttons-group">
                {availableShippingMethods.map((s) => {
                  if(isGalleryAuction && s.method_id == "mvx_vendor_shipping") return

                  return (
                    (
                      <RadioButton
                        sx={{ mb: 2 }}
                        key={s.method_id}
                        value={s.method_id}
                        disabled={isSaving}
                        onClick={() => handleSelectShippingMethod(s)}
                        checked={currentShippingMethod === s.method_id}
                        label={s.method_title}
                        description={s.method_description(estimatedShippingCost)}
                      />
                    )
                  )
                })}
              </RadioGroup>
            </ContentCard>
          )}
          <ContentCard title="Informazioni di contatto" icon={<UserIcon />} headerButtons={contactHeaderButtons}>
            {!auth.isAuthenticated && (
              <Button onClick={() => auth.login()} sx={{ maxWidth: "320px", mb: 2 }} variant="contained" fullWidth>
                Effettua il login
              </Button>
            )}
            {orderMode !== "loan" && auth.isAuthenticated && (
              <>
                <Typography variant="h6" sx={{ mb: 1 }} color="textSecondary">
                  Dati di spedizione
                </Typography>
                {userProfile &&
                  (shippingDataEditing ? (
                    <ShippingDataForm
                      defaultValues={userProfile.shipping}
                      onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
                    />
                  ) : (
                    <ShippingDataPreview value={userProfile.shipping} />
                  ))}
              </>
            )}
            {userProfile && (requireInvoice || orderMode === "loan") && (
              <Box pt={orderMode === "loan" ? 0 : 3}>
                <Typography variant="h6" sx={{ mb: 1 }} color="textSecondary">
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
            {userProfile && orderMode !== "loan" && (
              <Box mt={2}>
                <Checkbox
                  disabled={!shippingDataEditing}
                  checked={requireInvoice}
                  onClick={() => handleRequireInvoice(!requireInvoice)}
                  label="Richiedi fattura"
                />
              </Box>
            )}
          </ContentCard>
        </Grid>
        <Grid item xs={12} md={4} sx={{ mb: { xs: 4, md: 0 } }}>
          <ContentCard title={cardContentTitle} icon={<ShoppingBagIcon />} contentPadding={0} contentPaddingMobile={0}>
            {galleries && galleries.length == 0 ? (
              <div className={"flex justify-center items-center w-full"}>
                <CircularProgress />
              </div>
            ) : (
              <>
                {isGalleryAuction && galleries?.length > 0 && (
                  <div className={"flex space-x-2 items-center justify-center w-full"}>
                    <div className={"w-11 h-11 rounded-sm overflow-hidden"}>
                      <img
                        src={galleries[0].shop.image}
                        alt={galleries[0].display_name}
                        className={"w-full h-full aspect-square object-cover"}
                      />
                    </div>
                    <h3 className={"text-xl"}>{galleries[0].display_name}</h3>
                  </div>
                )}
                {!isGalleryAuction && (
                  <Box display="flex" sx={{ px: { xs: 3, md: 5 } }} flexDirection="column" gap={3} mt={3}>
                    {pendingOrder?.line_items.map((item, i) => (
                      <Box key={item.id}>
                        <DisplayImage src={item.image.src} width="100%" height="230px" />
                        <Typography variant="body1" fontWeight={500} sx={{ mt: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body1" fontWeight={500} color="textSecondary" sx={{ mb: 1, mt: 0 }}>
                          {artworks[i]?.artistName}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }} color="textSecondary">
                          {artworks[i]?.technique}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }} color="textSecondary">
                          {artworks[i]?.dimensions}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {artworks[i]?.galleryName}
                        </Typography>
                        {galleries?.length === artworks?.length && !!galleries[i]?.address?.city && (
                          <Typography variant="body1" fontWeight={500} color="textSecondary">
                            {galleries[i]?.address?.city}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </>
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
                    <Typography variant="body1" fontSize={20} fontWeight={500}>
                      Subtotale
                    </Typography>
                    <Typography variant="body1" fontSize={20} fontWeight={500}>
                      {`€ ${isGalleryAuction ? reverseFee(subtotal) : subtotal.toFixed(2) || 0}`}
                    </Typography>
                  </Box>
                  {showCommissioni ? (
                    !isGalleryAuction ? (
                      <>
                        {pendingOrder?.fee_lines?.some((fee) => fee.name === "payment-gateway-fee") &&
                          paymentMethod !== "Santander" && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body1">Commissioni di servizio</Typography>
                              <Typography variant="body1">
                                {" "}
                                €&nbsp;
                                {(
                                  +(
                                    pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total ||
                                    0
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
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1">Commissioni Artpay</Typography>
                        <Typography variant="body1">
                          {" "}
                          €&nbsp;
                          {!isOnlySantander ? (
                            (
                              +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total || 0) +
                              +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total_tax || 0) +
                              +(subtotal - reverseFee(subtotal))
                            ).toFixed(2)
                          ) : (+(subtotal - reverseFee(subtotal))
                            ).toFixed(2)}
                        </Typography>
                      </Box>
                    )
                  ) : (
                    <p className={'flex gap-3 w-full text-gray-700 justify-between'}>
                      <span className={'animate-pulse'}>Calcolo commissioni...</span>
                      <span className={'h-4 w-4 rounded-full border-2 border-gray-700 border-b-transparent animate-spin'}></span>
                    </p>
                  )}

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" sx={{ mb: 1, mt: 0 }}>
                      Spedizione (IVA esente)
                    </Typography>
                    <Typography variant="body1">€ {(shippingPrice || 0).toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1" fontSize={20} fontWeight={700}>
                      Totale
                    </Typography>
                    <Typography variant="subtitle1" fontSize={20} fontWeight={700}>
                      € {(+(pendingOrder?.total || 0)).toFixed(2)}
                    </Typography>
                  </Box>
                  {!isGalleryAuction && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight={500} color="textSecondary" fontSize={15}>
                        Di cui IVA
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="textSecondary" fontSize={15}>
                        € {Number(pendingOrder?.total_tax).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              <Checkbox
                sx={{ mt: 1 }}
                disabled={isSaving }
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                label={
                  <Typography variant="body1">
                    Accetto le{" "}
                    <Link href="/condizioni-generali-di-acquisto" target="_blank">
                      condizioni generali d'acquisto
                    </Link>
                  </Typography>
                }
              />
              {Number(pendingOrder?.total) >= 2500 || paymentMethod === 'Santander' ? (
                  <div className={'w-full flex justify-center my-12'}>
                    <SantanderButton order={pendingOrder as Order} disabled={!privacyChecked} />
                  </div>
              ) : (
                <Button
                  sx={{ my: 6 }}
                  disabled={!checkoutEnabled}
                  startIcon={checkoutReady || !auth.isAuthenticated ? undefined : <CircularProgress size="20px" />}
                  onClick={handlePurchase}
                  variant="contained"
                  fullWidth>
                  {orderMode === "loan" ? "Prenota l'opera" : "Acquista ora"}
                </Button>
              )}
            </Box>
          </ContentCard>
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Purchase;
