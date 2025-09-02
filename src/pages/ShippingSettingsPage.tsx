import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useEffect, useState } from "react";
import { BillingData, UserProfile } from "../types/user.ts";
import { isAxiosError } from "axios";
import ShippingDataForm from "../components/ShippingDataForm.tsx";
import Checkbox from "../components/Checkbox.tsx";
import BillingDataForm from "../components/BillingDataForm.tsx";
import GenericPageSkeleton from "../components/GenericPageSkeleton";

const ShippingSettingsPage = () => {
  const data = useData();
  const snackbar = useSnackbars();

  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [requireInvoice, setRequireInvoice] = useState(false);


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
      const payload = {
        ...formData,
        email: profile.email,
      };
      if (isBilling) {
        updatedProfile = await data.updateUserProfile({ billing: payload });
      } else {
        updatedProfile = await data.updateUserProfile({ shipping: payload });
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
    data
      .updateUserProfile({
        billing: {
          invoice_type: newVal ? "receipt" : "",
        },
      })
      .then((resp) => {
        setIsSaving(false);
        setRequireInvoice(resp.billing?.invoice_type !== "");
      });
  };

  useEffect(() => {
    Promise.all([
      data.getUserProfile().then((resp) => {
        setProfile(resp);
        setRequireInvoice(resp.billing?.invoice_type !== "");
      }),
    ]).then(() => {
      setIsReady(true);
    });
  }, [data]);

  return (
    <DefaultLayout authRequired>
      <section className={"pt-35 md:pt-0 space-y-12 mb-24"}>
        {isReady ? (
          <>
            <h1 className={"text-5xl leading-[105%] font-normal"}>Spedizione e fatturazione</h1>
            <div className={" border-t border-[#CDCFD3] pt-12"}>
              <h4 className={"leading-[125%] mb-4"}>Dati di spedizione</h4>
              <ShippingDataForm
                defaultValues={profile?.shipping}
                onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
                disabled={isSaving}
                className={'pb-12 border-b border-[#CDCFD3]'}
              />
            </div>
            <Checkbox
              disabled={isSaving}
              checked={requireInvoice}
              onChange={(_e, checked) => handleRequireInvoice(checked)}
              label="Inserisci dati per la richiesta fattura"
            />
            {requireInvoice && (
              <div>
                <h4 className={"leading-[125%] mb-4"}>Dati di fatturazione</h4>
                <BillingDataForm
                  defaultValues={profile?.billing}
                  onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
                  disabled={isSaving}
                  className={'pb-12 border-b border-[#CDCFD3]'}
                />
              </div>
            )}
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

export default ShippingSettingsPage;

{
  /*<AvatarSelector src={profile?.avatar_url ? profile.avatar_url : ""} />*/
}
