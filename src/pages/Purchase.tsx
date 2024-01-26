import React, { ReactNode, useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Button, Grid } from "@mui/material";
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

export interface PurchaseProps {}

const Purchase: React.FC<PurchaseProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const snackbar = useSnackbars();
  const [isReady, setIsReady] = useState(false);
  const [shippingDataEditing, setShippingDataEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    if (auth.isAuthenticated) {
      data.getUserProfile().then((resp) => {
        const userProfile = { ...resp };
        userProfile.shipping.email = userProfile.shipping.email || userProfile.email || "";
        userProfile.billing.email = userProfile.billing.email || userProfile.email || "";
        setShippingDataEditing(!areBillingFieldsFilled(userProfile.shipping));
        setUserProfile(userProfile);
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, [auth.isAuthenticated, data]);

  const handleShippingDataSubmit = async (formData: BillingData) => {
    if (!userProfile?.id) {
      return;
    }
    try {
      const updatedProfile = await data.updateUserProfile({ shipping: formData });
      setUserProfile(updatedProfile);
      setShippingDataEditing(false);
    } catch (e) {
      await snackbar.error(e?.toString() || "Si è verificato un errore");
    }
  };

  const contactHeaderButtons: ReactNode[] = [];
  if (auth.isAuthenticated) {
    if (shippingDataEditing) {
      contactHeaderButtons.push(
        <Button key="cancel-btn" color="error" onClick={() => setShippingDataEditing(false)} startIcon={<Cancel />}>
          Annulla
        </Button>,
      );
    } else {
      contactHeaderButtons.push(
        <Button key="edit-btn" onClick={() => setShippingDataEditing(true)} startIcon={<Edit />}>
          Modifica
        </Button>,
      );
    }
  }

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
            {userProfile &&
              (shippingDataEditing ? (
                <UserDataForm defaultValues={userProfile.shipping} onSubmit={handleShippingDataSubmit} />
              ) : (
                <UserDataPreview value={userProfile.shipping} />
              ))}
            {userProfile && (
              <Box mt={2}>
                <Checkbox label="I dati di fatturazione coincidono con quelli di spedizione" defaultChecked />
              </Box>
            )}
          </ContentCard>
          <ContentCard title="Metodo di spedizione" icon={<LocalShipping />} />
          <ContentCard title="Metodo di pagamento" icon={<CreditCardOutlined />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ContentCard title="Riassunto dell'ordine" icon={<ShoppingBagOutlined />} />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Purchase;
