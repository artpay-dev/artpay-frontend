import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { BillingData, UserProfile } from "../types/user.ts";
import DefaultLayout from "../components/DefaultLayout.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import { Box, Button, Typography, useTheme } from "@mui/material";
import ShippingDataForm from "../components/ShippingDataForm.tsx";
import { isAxiosError } from "axios";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import Checkbox from "../components/Checkbox.tsx";
import PasswordChangeForm, { PasswordChangeFormData } from "../components/PasswordChangeForm.tsx";
import PersonalDataForm, { PersonalDataFormData } from "../components/PersonalDataForm.tsx";
import AvatarSelector from "../components/AvatarSelector.tsx";
import BillingDataForm from "../components/BillingDataForm.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useNavigate } from "react-router-dom";

export interface ProfileSettingsProps {
}

const confirmDeleteContent = {
  title: "Cancellazione account",
  text: "Siamo dispiaciuti che te ne vuoi andare: se elimini questo account, sappi che l'operazione non è reversibile, il tuo profilo non sarà più disponibile e non potrai più registrarti e acquistare su Artpay."
};
const accountDeletedContent = {
  title: "Account cancellato",
  text: "Il tuo account è stato cancellato, riceverai un'email che conferma questa operazione"
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const snackbar = useSnackbars();
  const dialogs = useDialogs();

  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [requireInvoice, setRequireInvoice] = useState(false);

  const personalDataDefaultValues: PersonalDataFormData = {
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || ""
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
  const handleRequireInvoice = (newVal: boolean) => {
    if (!profile) {
      return;
    }
    setIsSaving(true);
    data.updateUserProfile({
      billing: {
        invoice_type: newVal ? "receipt" : ""
      }
    })
      .then((resp) => {
        setIsSaving(false);
        setRequireInvoice(resp.billing?.invoice_type !== "");
      });
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

  const handleDeleteAccount = async () => {
    try {
      const confirmDelete = await dialogs.okOnly(confirmDeleteContent.title, confirmDeleteContent.text, {
        txtOk: "PROCEDI",
        okButtonColor: "error",
        okButtonVariant: "outlined"
      });
      if (confirmDelete) {
        navigate("/");
        await auth.logout();
        await dialogs.okOnly(accountDeletedContent.title, accountDeletedContent.text);
      }
    } catch (e) { /* empty */
    }
  };

  useEffect(() => {
    Promise.all([
      data.getUserProfile().then((resp) => {
        setProfile(resp);
        setRequireInvoice(resp.billing?.invoice_type !== "");
      })
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
        <ShippingDataForm
          defaultValues={profile?.shipping}
          onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
          disabled={isSaving}
        />
        <Box mt={2}>
          <Checkbox
            disabled={isSaving}
            checked={requireInvoice}
            onChange={(_e, checked) => handleRequireInvoice(checked)}
            label="Inserisci dati per la richiesta fattura"
          />
        </Box>
      </Box>
      {requireInvoice && (
        <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Dati di fatturazione
          </Typography>
          <BillingDataForm
            defaultValues={profile?.billing}
            shippingData={profile?.shipping}
            disabled={isSaving}
            onSubmit={(formData) => handleProfileDataSubmit(formData, true)}
          />
        </Box>
      )}
      <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Cambio password
        </Typography>
        <PasswordChangeForm askOldPassword onSubmit={handlePasswordChange} />
      </Box>
      <Box px={6} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Newsletter
        </Typography>
        <Checkbox
          disabled={isSaving}
          checked={!requireInvoice}
          onClick={() => {
          }}
          label="Sei iscrittə alla newsletter di artpay"
        />
      </Box>
      <Box px={6} mt={12} mb={6} sx={{ maxWidth: theme.breakpoints.values.md }}>
        <Typography variant="h5">Cancellazione account</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Eliminazione permanente account
        </Typography>
        <Button onClick={handleDeleteAccount} color="error" variant="outlined">
          Cancella account
        </Button>
      </Box>
    </DefaultLayout>
  );
};

export default ProfileSettings;
