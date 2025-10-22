import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useNavigate } from "../utils.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import { useEffect, useState } from "react";
import { UserProfile } from "../types/user.ts";
import { isAxiosError } from "axios";
import PersonalDataForm, { PersonalDataFormData } from "../components/PersonalDataForm.tsx";
import PasswordChangeForm, { PasswordChangeFormData } from "../components/PasswordChangeForm.tsx";
import { Button } from "@mui/material";
import GenericPageSkeleton from "../components/GenericPageSkeleton.tsx";

const confirmDeleteContent = {
  title: "Cancellazione account",
  text: "Siamo dispiaciuti che te ne vuoi andare: se elimini questo account, sappi che l'operazione non è reversibile, il tuo profilo non sarà più disponibile e non potrai più registrarti e acquistare su Artpay."
};
const accountDeletedContent = {
  title: "Account cancellato",
  text: "Il tuo account è stato cancellato, riceverai un'email che conferma questa operazione"
};

const PersonalSettingsPage = () => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();
  const snackbar = useSnackbars();
  const dialogs = useDialogs();

  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();

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

  const handleDeleteAccount = async () => {
    try {
      const confirmDelete = await dialogs.okOnly(confirmDeleteContent.title, confirmDeleteContent.text, {
        txtOk: "PROCEDI",
        okButtonColor: "error",
        okButtonVariant: "outlined"
      });
      if (confirmDelete) {
        await data.deleteUser();
        navigate("/");
        await auth.logout();
        await dialogs.okOnly(accountDeletedContent.title, accountDeletedContent.text);
      }
    } catch (e) { /* empty */
      await snackbar.error(e);
    }
  };

  const handlePasswordChange = async (formData: PasswordChangeFormData) => {
    if (!profile?.id) {
      return;
    }
    try {
      setIsSaving(true);
      console.error("TODO: modifica password", formData);
      await dialogs.okOnly("Modifica password", "Password modificata con successo");
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
      data.getUserProfile().then((resp) => {
        setProfile(resp);
      })
    ]).then(() => {
      setIsReady(true);
    });
  }, [data]);

  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-12 mb-24 px-3 md:px-0'}>
        {isReady ? (
        <>
          <h1 className={'text-5xl leading-[105%] font-normal'}>Impostazioni personali</h1>
          <div className={' border-t border-[#CDCFD3] pt-12'}>
            <h4 className={'leading-[125%] mb-4'}>Impostazioni personali</h4>
            <PersonalDataForm defaultValues={personalDataDefaultValues} onSubmit={handlePersonalDataSubmit} className={'pb-12 border-b border-[#CDCFD3]'} disabled={isSaving} />
          </div>
          <div>
            <h4 className={'leading-[125%] mb-4'}>Cambio password</h4>
            <PasswordChangeForm askOldPassword onSubmit={handlePasswordChange} className={'pb-12 border-b border-[#CDCFD3]'} disabled={isSaving} />
          </div>
          <div className="space-y-4 pb-12">
            <h5 >Cancellazione account</h5>
            <h6 className={'text-secondary text-sm'}>
              Eliminazione permanente account
            </h6>
            <Button onClick={handleDeleteAccount} color="error" variant="outlined">
              Cancella account
            </Button>
          </div>
        </>
        ) : (
          <>
            <GenericPageSkeleton />
          </>
        )}

      </section>
    </DefaultLayout>
  );
};

export default PersonalSettingsPage;

{/*<AvatarSelector src={profile?.avatar_url ? profile.avatar_url : ""} />*/}