import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Grid } from "@mui/material";
import ContentCard from "../components/ContentCard.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import { CreditCardOutlined, LocalShipping, ShoppingBagOutlined } from "@mui/icons-material";
import UserDataForm from "../components/UserDataForm.tsx";
import { BillingData, UserProfile } from "../types/user.ts";

export interface PurchaseProps {}

const Purchase: React.FC<PurchaseProps> = ({}) => {
  const data = useData();
  const [isReady, setIsReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    data.getUserProfile().then((resp) => {
      const userProfile = { ...resp };
      userProfile.shipping.email = userProfile.shipping.email || userProfile.email || "";
      userProfile.billing.email = userProfile.billing.email || userProfile.email || "";
      setUserProfile(userProfile);
      setIsReady(true);
    });
  }, [data]);

  const handleShippingDataSubmit = async (formData: BillingData) => {
    if (!userProfile?.id) {
      return;
    }
    const updatedProfile = await data.updateUserProfile({ ...userProfile, shipping: formData });
    setUserProfile(updatedProfile);
  };

  return (
    <DefaultLayout pageLoading={!isReady}>
      <Grid mt={16} spacing={3} px={3} container>
        <Grid item gap={3} display="flex" flexDirection="column" xs={12} md={8}>
          <ContentCard title="Informazioni di contatto" icon={<UserIcon />}>
            {userProfile && <UserDataForm defaultValues={userProfile.shipping} onSubmit={handleShippingDataSubmit} />}
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
