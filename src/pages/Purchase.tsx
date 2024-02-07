import React, { ReactNode, useEffect, useRef, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Button, CircularProgress, Divider, Grid, RadioGroup, Typography } from "@mui/material";
import ContentCard from "../components/ContentCard.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import { Cancel, Edit } from "@mui/icons-material";
import UserDataForm from "../components/UserDataForm.tsx";
import { BillingData, UserProfile } from "../types/user.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { areBillingFieldsFilled, artworksToGalleryItems } from "../utils.ts";
import UserDataPreview from "../components/UserDataPreview.tsx";
import Checkbox from "../components/Checkbox.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Order, OrderUpdateRequest, ShippingLineUpdateRequest, ShippingMethodOption } from "../types/order.ts";
import ShoppingBagIcon from "../components/icons/ShoppingBagIcon.tsx";
import RadioButton from "../components/RadioButton.tsx";
import { useNavigate } from "react-router-dom";
import DisplayImage from "../components/DisplayImage.tsx";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { PiCreditCardThin, PiTruckThin } from "react-icons/pi";
import { isAxiosError } from "axios";
import CheckoutForm from "../components/CheckoutForm.tsx";
import { Elements } from "@stripe/react-stripe-js";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { PaymentIntent } from "@stripe/stripe-js";

export interface PurchaseProps {}

const Purchase: React.FC<PurchaseProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const snackbar = useSnackbars();
  const navigate = useNavigate();
  const payments = usePayments();

  const checkoutFormRef = useRef<HTMLFormElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [shippingDataEditing, setShippingDataEditing] = useState(false);
  const [billingDataEnabled, setBillingDataEnabled] = useState(false);

  const [availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [pendingOrder, setPendingOrder] = useState<Order>();
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);

  const currentShippingMethod = pendingOrder?.shipping_lines?.length
    ? pendingOrder.shipping_lines[0].method_id
    : undefined;

  const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    return snackbar.error(text, { autoHideDuration: 60000 });
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      Promise.all([
        data.getUserProfile().then((resp) => {
          const userProfile = { ...resp };
          userProfile.shipping.email = userProfile.shipping.email || userProfile.email || "";
          userProfile.billing.email = userProfile.billing.email || userProfile.email || "";
          setShippingDataEditing(!areBillingFieldsFilled(userProfile.shipping));
          setUserProfile(userProfile);
          if (areBillingFieldsFilled(userProfile.billing)) {
            setBillingDataEnabled(true);
          }
        }),
        data.getAvailableShippingMethods().then((resp) => {
          setAvailableShippingMethods(resp);
        }),
        data.getPendingOrder().then(async (resp) => {
          if (resp) {
            setPendingOrder(resp);
            const artworks = await Promise.all(
              resp.line_items.map((item) => data.getArtwork(item.product_id.toString())),
            );
            setArtworks(artworksToGalleryItems(artworks));
            const paymentIntent = await data.createPaymentIntent({ wc_order_key: resp.order_key });
            setPaymentIntent(paymentIntent);
          }
        }),
      ])
        .then(() => {
          setIsReady(true);
        })
        .catch(async (e) => {
          await showError(e);
          console.error(e);
          navigate("/");
        });
    } else {
      setIsReady(true);
    }
  }, [auth.isAuthenticated, data]);

  useEffect(() => {
    if (payments.isReady) {
      setPaymentsReady(payments.isReady);
    }
  }, [payments.isReady]);

  const handleEnableBillingData = () => {
    if (!userProfile) {
      return;
    }
    if (billingDataEnabled) {
      setIsSaving(true);
      setBillingDataEnabled(false);
      data
        .updateUserProfile({
          billing: {
            address_1: "",
            address_2: "",
            city: "",
            company: "",
            country: "",
            first_name: "",
            last_name: "",
            phone: "",
            postcode: "",
            state: "",
          },
        })
        .then(() => {
          setIsSaving(false);
        });
    } else {
      setUserProfile({ ...userProfile, billing: { ...userProfile.shipping } });
      setBillingDataEnabled(true);
    }
  };

  const handleProfileDataSubmit = async (formData: BillingData, isBilling = false) => {
    if (!userProfile?.id) {
      return;
    }
    try {
      setIsSaving(true);
      let updatedProfile: UserProfile;
      if (isBilling) {
        updatedProfile = await data.updateUserProfile({ billing: formData });
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

  const handlePurchase = () => {
    if (checkoutFormRef?.current) {
      checkoutFormRef.current.dispatchEvent(new Event("submit"));
    }
  };

  const contactHeaderButtons: ReactNode[] = [];
  if (auth.isAuthenticated) {
    if (shippingDataEditing) {
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
    } else {
      contactHeaderButtons.push(
        <Button key="edit-btn" disabled={isSaving} onClick={() => setShippingDataEditing(true)} startIcon={<Edit />}>
          Modifica
        </Button>,
      );
    }
  }

  const formattedSubtotal = (+(pendingOrder?.total || 0) - +(pendingOrder?.total_tax || 0)).toFixed(2);

  const shoppingBagIcon = <ShoppingBagIcon color="#FFFFFF" />;
  // background={theme.palette.secondary.light}
  return (
    <DefaultLayout pageLoading={!isReady || !paymentsReady} pb={6}>
      <Grid mt={16} spacing={3} px={3} container>
        <Grid item gap={3} display="flex" flexDirection="column" xs={12} md={8}>
          <ContentCard title="Informazioni di contatto" icon={<UserIcon />} headerButtons={contactHeaderButtons}>
            {!auth.isAuthenticated && (
              <Button onClick={() => auth.login()} variant="contained" fullWidth>
                Effettua il login
              </Button>
            )}
            <Typography variant="h6" sx={{ mb: 1 }} color="textSecondary">
              Dati di spedizione
            </Typography>
            {userProfile &&
              (shippingDataEditing ? (
                <UserDataForm
                  defaultValues={userProfile.shipping}
                  onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
                />
              ) : (
                <UserDataPreview value={userProfile.shipping} />
              ))}
            {userProfile && billingDataEnabled && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ mb: 1 }} color="textSecondary">
                  Dati di fatturazione
                </Typography>
                {shippingDataEditing ? (
                  <UserDataForm
                    defaultValues={userProfile.billing}
                    onSubmit={(formData) => handleProfileDataSubmit(formData, true)}
                  />
                ) : (
                  <UserDataPreview value={userProfile.billing} />
                )}
              </Box>
            )}
            {userProfile && (
              <Box mt={2}>
                <Checkbox
                  disabled={!shippingDataEditing}
                  checked={!billingDataEnabled}
                  onClick={handleEnableBillingData}
                  label="I dati di fatturazione coincidono con quelli di spedizione"
                />
              </Box>
            )}
          </ContentCard>
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
                  description={s.method_description}
                />
              ))}
            </RadioGroup>
          </ContentCard>
          <ContentCard title="Metodo di pagamento" icon={<PiCreditCardThin size="28px" />}>
            {paymentIntent && (
              <Elements
                stripe={payments.stripe}
                options={{
                  clientSecret: paymentIntent.client_secret || undefined,
                  loader: "always",
                  appearance: {
                    theme: "flat",
                    variables: {
                      borderRadius: "24px",
                    },
                    rules: {
                      ".AccordionItem": {
                        border: "none",
                        paddingLeft: "8px",
                      },
                    },
                  },
                }}>
                <CheckoutForm ref={checkoutFormRef} onReady={() => setCheckoutReady(true)} />
              </Elements>
            )}
          </ContentCard>
        </Grid>
        <Grid item xs={12} md={4} sx={{ mb: { xs: 4, md: 0 } }}>
          <ContentCard
            title="Riassunto dell'ordine"
            icon={<ShoppingBagIcon />}
            contentPadding={0}
            contentPaddingMobile={0}>
            <Box display="flex" flexDirection="column" gap={2} sx={{ px: { xs: 3, md: 5 } }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1">Subtotale</Typography>
                <Typography variant="body1">€ {formattedSubtotal}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1">IVA</Typography>
                <Typography variant="body1">€ {pendingOrder?.total_tax}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Totale</Typography>
                <Typography variant="subtitle1">€ {pendingOrder?.total}</Typography>
              </Box>
              <Button
                disabled={isSaving || !checkoutReady}
                startIcon={checkoutReady ? shoppingBagIcon : <CircularProgress size="20px" />}
                onClick={handlePurchase}
                variant="contained"
                fullWidth
                size="large">
                Acquista ora
              </Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" sx={{ px: { xs: 3, md: 5 } }} flexDirection="column" gap={3} mt={3}>
              {pendingOrder?.line_items.map((item, i) => (
                <Box key={item.id}>
                  <DisplayImage src={item.image.src} width="100%" height="230px" />
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 0, mt: 2 }}>
                    {artworks[i]?.artistName}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ my: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {artworks[i]?.galleryName}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ContentCard>
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Purchase;
