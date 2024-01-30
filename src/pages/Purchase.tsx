import React, { ReactNode, useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Button, Divider, Grid, RadioGroup, Typography } from "@mui/material";
import ContentCard from "../components/ContentCard.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import { Cancel, CreditCardOutlined, Edit, LocalShipping, ShoppingBagOutlined } from "@mui/icons-material";
import UserDataForm from "../components/UserDataForm.tsx";
import { BillingData, UserProfile } from "../types/user.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { areBillingFieldsFilled } from "../utils.ts";
import UserDataPreview from "../components/UserDataPreview.tsx";
import Checkbox from "../components/Checkbox.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Order, ShippingLine, ShippingMethodOption } from "../types/order.ts";
import ShoppingBagIcon from "../components/icons/ShoppingBagIcon.tsx";
import RadioButton from "../components/RadioButton.tsx";
import { useNavigate } from "react-router-dom";

export interface PurchaseProps {}

const Purchase: React.FC<PurchaseProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const snackbar = useSnackbars();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [shippingDataEditing, setShippingDataEditing] = useState(false);
  const [billingDataEnabled, setBillingDataEnabled] = useState(false);

  const [availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [pendingOrder, setPendingOrder] = useState<Order>();

  const selectedShippingMethod = pendingOrder?.shipping_lines?.length ? pendingOrder.shipping_lines[0].id : undefined;

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
        data.getPendingOrder().then((resp) => {
          if (resp) {
            setPendingOrder(resp);
          }
        }),
      ])
        .then(() => {
          setIsReady(true);
        })
        .catch(async (e) => {
          await snackbar.error("Si è verificato un errore", { autoHideDuration: 60000 });
          console.error(e);
          navigate("/");
        });
    } else {
      setIsReady(true);
    }
  }, [auth.isAuthenticated, data]);

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
      await snackbar.error(e?.toString() || "Si è verificato un errore");
    }
    setIsSaving(false);
  };

  const handleSelectShippingMethod = async (selectedShippingMethod: ShippingMethodOption) => {
    if (!pendingOrder) {
      return;
    }
    setIsSaving(true);
    const updatedOrder: Order = { ...pendingOrder };
    const existingShippingLine = updatedOrder.shipping_lines.length ? updatedOrder.shipping_lines[0] : {};
    const updatedShippingLine: ShippingLine = {
      ...existingShippingLine,
      instance_id: selectedShippingMethod.instance_id.toString(),
      method_id: selectedShippingMethod.method_id,
      method_title: selectedShippingMethod.method_title,
    };
    updatedOrder.shipping_lines = [updatedShippingLine];
    try {
      //data.updateOrder()
    } catch (e) {
      await snackbar.error(e?.toString() || "Si è verificato un errore");
    }
    setPendingOrder(updatedOrder);
    setIsSaving(false);
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

  const shoppingBagIcon = <ShoppingBagIcon color="#FFFFFF" />;

  return (
    <DefaultLayout pageLoading={!isReady}>
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
          <ContentCard title="Metodo di spedizione" icon={<LocalShipping />}>
            <RadioGroup defaultValue="selected" name="radio-buttons-group">
              {availableShippingMethods.map((s) => (
                <RadioButton
                  sx={{ mb: 2 }}
                  key={s.method_id}
                  value={s.method_id}
                  disabled={isSaving}
                  onClick={() => handleSelectShippingMethod(s)}
                  checked={selectedShippingMethod === s.id}
                  label={s.method_title}
                  description={s.method_description}
                />
              ))}
            </RadioGroup>
          </ContentCard>
          <ContentCard title="Metodo di pagamento" icon={<CreditCardOutlined />}></ContentCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ContentCard title="Riassunto dell'ordine" icon={<ShoppingBagOutlined />}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1">Subtotale</Typography>
                <Typography variant="body1">€ {pendingOrder?.shipping_total}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1">Spedizione</Typography>
                <Typography variant="body1">€ {pendingOrder?.discount_total}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Totale</Typography>
                <Typography variant="subtitle1">€ {pendingOrder?.total}</Typography>
              </Box>
              <Button disabled={isSaving} startIcon={shoppingBagIcon} variant="contained" fullWidth size="large">
                Acquista ora
              </Button>
            </Box>
            <Divider />
          </ContentCard>
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Purchase;
