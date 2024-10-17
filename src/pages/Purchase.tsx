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
  useMediaQuery, useTheme
} from "@mui/material";
import ContentCard from "../components/ContentCard.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import { Cancel, Edit } from "@mui/icons-material";
import ShippingDataForm from "../components/ShippingDataForm.tsx";
import { BillingData, ShippingData, UserProfile } from "../types/user.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import {
  areBillingFieldsFilled,
  artworksToGalleryItems
} from "../utils.ts";
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
import LoanCard from "../components/LoanCard.tsx";
import { useParams } from "react-router-dom";
import LoanCardVertical from "../components/LoanCardVertical.tsx";

export interface PurchaseProps {
  orderMode?: "standard" | "loan" | "redeem";
}

const Purchase: React.FC<PurchaseProps> = ({ orderMode = "standard" }) => {
  const data = useData();
  const auth = useAuth();
  const snackbar = useSnackbars();
  const navigate = useNavigate();
  const payments = usePayments();
  const urlParams = useParams();
  const theme = useTheme();

  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
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

  orderMode = (orderMode === "loan" || pendingOrder?.customer_note === "Blocco opera") ? "loan" : orderMode;
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    return snackbar.error(text, { autoHideDuration: 60000 });
  };

  useEffect(() => {

    if (auth.isAuthenticated) {

      const getOrderFunction = orderMode === "redeem" && urlParams.order_id ? data.getOrder(+urlParams.order_id) : data.getPendingOrder();

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
              resp.line_items.map((item) => data.getArtwork(item.product_id.toString()))
            );
            setArtworks(artworksToGalleryItems(artworks, undefined, data));
            // const existingIntentId = getPropertyFromOrderMetadata(resp.meta_data, "_stripe_intent_id");
            // console.log("existingIntentId", existingIntentId);

            let paymentIntent: PaymentIntent;
            if (orderMode === "loan") {
              paymentIntent = await data.createBlockIntent({ wc_order_key: resp.order_key });
            } else if (orderMode === "redeem") {
              paymentIntent = await data.createRedeemIntent({ wc_order_key: resp.order_key });
            } else {
              paymentIntent = await data.createPaymentIntent({ wc_order_key: resp.order_key });
            }
            setPaymentIntent(paymentIntent);
            data.getGalleries(artworks.map(a => +a.vendor)).then(galleries => setGalleries(galleries));
          } else {
            setNoPendingOrder(true);
            navigate("/errore/404");
          }
        })
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
            resp.line_items.map((item) => data.getArtwork(item.product_id.toString()))
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
    data.updateUserProfile({
      billing: {
        invoice_type: newVal ? "receipt" : ""
      }
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
      total: selectedShippingMethod.method_id === "local_pickup" ? "0" : estimatedShippingCost.toFixed(2)
    };
    if (existingShippingLine) {
      updatedShippingLine.id = existingShippingLine.id;
    }
    updatedOrder.shipping_lines = [updatedShippingLine];
    try {
      const updatedOrderResp = await data.updateOrder(pendingOrder.id, updatedOrder);
      setPendingOrder(updatedOrderResp);
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
        billing:
          requireInvoice && userProfile?.billing ? { ...userProfile?.billing } : { ...userProfile?.shipping }
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

  const contactHeaderButtons: ReactNode[] = [];
  if (auth.isAuthenticated) {
    if (shippingDataEditing && (areBillingFieldsFilled(userProfile?.billing) || areBillingFieldsFilled(userProfile?.shipping))) {
      contactHeaderButtons.push(
        <Button
          key="cancel-btn"
          color="error"
          disabled={isSaving}
          onClick={() => setShippingDataEditing(false)}
          startIcon={<Cancel />}>
          Annulla
        </Button>
      );
    } else if (!shippingDataEditing) {
      contactHeaderButtons.push(
        <Button key="edit-btn" disabled={isSaving} onClick={() => setShippingDataEditing(true)} startIcon={<Edit />}>
          Modifica
        </Button>
      );
    }
  }

  const currentShippingMethod = pendingOrder?.shipping_lines?.length
    ? pendingOrder.shipping_lines[0].method_id
    : undefined;
  const estimatedShippingCost = [0, ...artworks.map((a) => +(a.estimatedShippingCost || "0"))].reduce((a, b) => a + b);
  // const formattedSubtotal = (+(pendingOrder?.total || 0) - +(pendingOrder?.total_tax || 0)).toFixed(2);
  const thankYouPage =
    orderMode === "loan" ? `/opera-bloccata/${artworks.length ? artworks[0].slug : ""}` : `/thank-you-page/${pendingOrder?.id}`;
  const checkoutEnabled =
    checkoutReady &&
    privacyChecked &&
    !isSaving &&
    (currentShippingMethod || (orderMode === "loan" && areBillingFieldsFilled(userProfile?.billing)));


  const shippingPrice = (currentShippingMethod === "local_pickup" || !currentShippingMethod) ? 0 : estimatedShippingCost || 0;

  const px = { xs: 3, sm: 4, md: 10, lg: 12 };

  if (noPendingOrder) {
    return <DefaultLayout pageLoading={!isReady || !paymentsReady} pb={6}>
      <Grid mt={16} spacing={3} px={3} container>
        <Grid item xs={12}>
          <Typography variant="h3"><ErrorIcon color="error" fontSize="large" /> Non ci sono opere nel
            carrello</Typography>
          <Typography sx={{ mt: 1 }} variant="subtitle1" color="textSecondary">
            Esplora Artpay e inizia ad acquistare
          </Typography>
        </Grid>
      </Grid>
    </DefaultLayout>;
  }

  return (
    <DefaultLayout pageLoading={!isReady || !paymentsReady} pb={6}>
      <Grid mt={16} spacing={3} sx={{ px: px }} container>
        <Grid item gap={3} display="flex" flexDirection="column" xs={12} md={8}>
          {orderMode === "loan" &&
            <Box sx={{ borderTop: `1px solid #d8ddfa`, borderBottom: `1px solid #d8ddfa` }} py={3} mb={8}>
              <Typography
                variant="h1">Prenota {artworks?.length ? artworks[0].title : "l'opera"}{artworks?.length && artworks[0].year ? `, ${artworks[0].year}` : ""}</Typography>
              <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
                Per 7 giorni avrai diritto esclusivo di acquisto di quest’opera.
                Nessun altro potrà prenotarla o acquistarla. Durante questo periodo, potrai completare l’acquisto con le
                modalità a te preferite.
              </Typography>
            </Box>
          }
          <ContentCard title="Informazioni di contatto" icon={<UserIcon />} headerButtons={contactHeaderButtons}>
            {!auth.isAuthenticated && (
              <Button onClick={() => auth.login()} sx={{ maxWidth: "320px", mb: 2 }} variant="contained" fullWidth>
                Effettua il login
              </Button>
            )}
            {(orderMode !== "loan" && auth.isAuthenticated) && (
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
          {(orderMode !== "loan" && auth.isAuthenticated) && (
            <ContentCard title="Metodo di spedizione" icon={<PiTruckThin size="28px" />}>
              <RadioGroup defaultValue="selected" name="radio-buttons-group">
                {availableShippingMethods.map((s) => (
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
                ))}
              </RadioGroup>
            </ContentCard>
          )}

          <PaymentCard
            checkoutButtonRef={checkoutButtonRef}
            onCheckout={() => handleSubmitCheckout()}
            onReady={() => setCheckoutReady(true)}
            paymentIntent={paymentIntent}
            thankYouPage={thankYouPage}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ mb: { xs: 4, md: 0 } }}>
          <ContentCard
            title="Riassunto dell'ordine"
            icon={<ShoppingBagIcon />}
            contentPadding={0}
            contentPaddingMobile={0}
            sx={{ position: "sticky", top: "96px" }}>
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
                  {(galleries?.length === artworks?.length && !!galleries[i]?.address?.city) &&
                    <Typography variant="body1" fontWeight={500} color="textSecondary">
                      {galleries[i]?.address?.city}
                    </Typography>}
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 3, borderColor: "#d8ddfa" }} />
            <Box display="flex" flexDirection="column" gap={2} sx={{ px: { xs: 3, md: 5 } }}>
              {orderMode === "loan" ? (
                <>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={500}>Costo opera</Typography>
                    <Typography variant="body1" fontWeight={500}>€ {pendingOrder?.total}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={500}>Caparra</Typography>
                    <Typography variant="body1"
                                fontWeight={500}>{data.downpaymentPercentage()}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={500}>Totale</Typography>
                    <Typography variant="body1"
                                fontWeight={500}>€ {(+(pendingOrder?.total || 0) * data.downpaymentPercentage() / 100).toFixed(2)}</Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Subtotale</Typography>
                    <Typography
                      variant="body1">€ {(+(pendingOrder?.total || 0) - (shippingPrice || 0)).toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Spedizione</Typography>
                    <Typography variant="body1">€ {(shippingPrice || 0).toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">Totale</Typography>
                    <Typography variant="subtitle1">
                      € {(+(pendingOrder?.total || 0)).toFixed(2)}
                    </Typography>
                  </Box>
                </>
              )}
              <Checkbox
                sx={{ mt: 1 }}
                disabled={isSaving || !checkoutReady}
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                label={<Typography variant="body1">Accetto le <Link href="/condizioni-generali-di-acquisto"
                                                                    target="_blank">condizioni
                  generali d'acquisto</Link></Typography>}
              />
              <Button
                sx={{ my: 6 }}
                disabled={!checkoutEnabled}
                startIcon={(checkoutReady || !auth.isAuthenticated) ? undefined :
                  <CircularProgress size="20px" />}
                onClick={handlePurchase}
                variant="contained"
                fullWidth>
                {orderMode === "loan" ? "Prenota l'opera" : "Acquista ora"}
              </Button>
            </Box>
          </ContentCard>
          {!isMobile && <Box sx={{ px: { xs: 0 }, mt: 3, mb: 12 }}>
            <LoanCardVertical />
          </Box>}
          {/*orderMode === "loan" &&
            <ContentCard sx={{ mt: 3, pb: 1, pt: 3 }} contentPadding={3} hideHeader>
              <Typography variant="body2">
                Ad acquisto avvenuto, l’opera è tua e avrai massima libertà di personalizzare le modalità di
                consegna, confrontandoti direttamente col personale della galleria d’arte responsabile della
                vendita.
              </Typography>
              <Button sx={{ mt: 3 }} variant="outlined" fullWidth>
                Compra ora
              </Button>
            </ContentCard>*/
          }
        </Grid>
      </Grid>
      {isMobile && <Box sx={{ px: { ...px, xs: 0 }, mt: 3, mb: 12 }}>
        <LoanCard />
      </Box>}
    </DefaultLayout>
  );
};

export default Purchase;
