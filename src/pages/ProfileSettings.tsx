import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { BillingData, User, UserProfile } from "../types/user.ts";
import DefaultLayout from "../components/DefaultLayout.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import { Box, Button, Typography, useTheme } from "@mui/material";
import UserDataForm from "../components/UserDataForm.tsx";
import { isAxiosError } from "axios";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import Checkbox from "../components/Checkbox.tsx";
import PasswordChangeForm, { PasswordChangeFormData } from "../components/PasswordChangeForm.tsx";
import PersonalDataForm, { PersonalDataFormData } from "../components/PersonalDataForm.tsx";
import AvatarSelector from "../components/AvatarSelector.tsx";

export interface ProfileSettingsProps {}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({}) => {
  const data = useData();
  const theme = useTheme();
  const snackbar = useSnackbars();

  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [userInfo, setUserInfo] = useState<User>();
  const [billingDataEnabled, setBillingDataEnabled] = useState(false);

  const personalDataDefaultValues: PersonalDataFormData = {
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
  };

  const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    return snackbar.error(text, { autoHideDuration: 60000 });
  };

  const handleProfileDataSubmit = async (formData: BillingData, isBilling = false) => {
    if (!profile?.id) {
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
      setProfile(updatedProfile);
    } catch (e) {
      console.error(e);
      await showError(e);
    }
    setIsSaving(false);
  };

  const handleEnableBillingData = () => {
    if (!profile) {
      return;
    }
    // userInfo?.acf.same_shipping_billing_address
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
      setProfile({ ...profile, billing: { ...profile.shipping } });
      setBillingDataEnabled(true);
    }
  };

  const handlePersonalDataSubmit = async (formData: PersonalDataFormData) => {
    if (!profile?.id) {
      return;
    }
    try {
      setIsSaving(true);
      const updatedProfile = await data.updateUserProfile({ ...formData });
      setProfile(updatedProfile);
    } catch (e) {
      console.error(e);
      await showError(e);
    }
    setIsSaving(false);
  };
  const handlePasswordChange = async (formData: PasswordChangeFormData) => {
    if (!profile?.id) {
      return;
    }
    try {
      setIsSaving(true);
      console.log("formData", formData);
      // const updatedProfile = await data.updateUserProfile({ ...formData })
      // setProfile(updatedProfile);
    } catch (e) {
      console.error(e);
      await showError(e);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    Promise.all([
      data.getUserInfo().then((resp) => {
        setUserInfo(resp);
      }),
      data.getUserProfile().then((resp) => {
        setProfile(resp);
      }),
    ]).then(() => {
      setIsReady(true);
    });
  }, [data]);

  return (
    <DefaultLayout pageLoading={!isReady} authRequired maxWidth="xl">
      <ProfileHeader profile={profile} />
      <Box p={6}>
        <Typography variant="h3">Impostazioni profilo</Typography>
        <Typography variant="body1">Qui puoi vedere / modificare i tuoi dati personali</Typography>
      </Box>
      <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Impostazioni personali
        </Typography>
        <AvatarSelector src={profile?.avatar_url} />
        <Box mt={3}>
          <PersonalDataForm defaultValues={personalDataDefaultValues} onSubmit={handlePersonalDataSubmit} />
        </Box>
      </Box>
      <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Dati di spedizione
        </Typography>
        <UserDataForm
          defaultValues={profile?.shipping}
          onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
          disabled={isSaving}
        />
        <Box mt={2}>
          <Checkbox
            disabled={isSaving}
            checked={userInfo?.acf.same_shipping_billing_address || false}
            onClick={handleEnableBillingData}
            label="I dati di fatturazione coincidono con quelli di spedizione"
          />
        </Box>
      </Box>
      {billingDataEnabled && (
        <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Dati di fatturazione
          </Typography>
          <UserDataForm
            defaultValues={profile?.billing}
            disabled={isSaving}
            onSubmit={(formData) => handleProfileDataSubmit(formData, true)}
          />
        </Box>
      )}
      <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Cambio password
        </Typography>
        <PasswordChangeForm onSubmit={handlePasswordChange} />
      </Box>
      <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Newsletter
        </Typography>
        <Checkbox
          disabled={isSaving}
          checked={!billingDataEnabled}
          onClick={() => {}}
          label="Sei iscrittə alla newsletter di artpay"
        />
      </Box>
      <Box px={6} mt={12} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h5">Cancellazione account</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Eliminazione permanente account
        </Typography>
        <Button color="error" variant="outlined">
          Cancella account
        </Button>
      </Box>
    </DefaultLayout>
  );
};

export default ProfileSettings;
