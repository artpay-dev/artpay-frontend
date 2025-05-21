import BillingDataForm from "../../../../components/BillingDataForm.tsx";
import { BillingData } from "../../../../types/user.ts";
import usePaymentStore from "../../../cdspayments/stores/paymentStore.ts";
import { useState } from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
//import { Close } from "@mui/icons-material";
//import useModalStore from "../../store/addressModalStore.ts";

const BillingModal = () => {
  const { user, setPaymentData, order} = usePaymentStore();
  const data = useData();
  const [saving, setSaving] = useState(false);
  //const {showModal} = useModalStore()

  const handleRestoreOrder = async () => {
    setPaymentData({
      loading: true,
    });
    try {
      if (!order) return;

      const restoreToOnHold = await data.updateOrder(order?.id, {
        status: "on-hold",
        payment_method: "bnpl",
        customer_note: "",
      });
      if (!restoreToOnHold) throw Error("Error updating order to on-hold");
      console.log("Order restore to on-hold");

      setPaymentData({
        paymentStatus: "on-hold",
        paymentMethod: "bnpl",
        orderNote: "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const handleProfileDataSubmit = async (formData: BillingData) => {
    if (!user?.id) {
      return;
    }
    setSaving(true);

    try {
      const updatedProfile = await data.updateUserProfile({ billing: formData as BillingData });
      if (!updatedProfile) throw new Error("Update user profile failed");

      setPaymentData({
        user: updatedProfile,
      });

    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={'w-full max-w-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white z-100 pt-10 pb-6 rounded-3xl animate-fade-in-slow md:max-w-lg'}>
      <header className={'px-4 border-b border-[#E2E6FC] pb-6'}>
        {/*<button
          className={
            "cursor-pointer bg-gray-100 rounded-full p-1 -translate-y-1/2 float-end relative right-3 top-3 "
          }
          onClick={() => showModal({ visible: false })}>
          <Close />
        </button>*/}
        <p className={'text-tertiary'}>Per procedere con la richiesta prestito tramite HeyLight devi completare i dati di fatturazione:</p>
      </header>
      <main className={'max-h-96 overflow-y-auto py-6 px-3'}>
          <BillingDataForm
          disabled={saving}
          defaultValues={user?.billing}
          shippingData={user?.shipping}
          isOnlyCDS={true}
          onSubmit={(formData) => handleProfileDataSubmit({ ...formData})} />
      </main>
      <footer className={'flex w-full justify-center border-t border-[#E2E6FC] pt-4 shadow-custom-top'}>
        <button
          type={"button"}
          className={"artpay-button-style py-3! disabled:opacity-65 disabled:cursor-not-allowed text-secondary"}
          onClick={handleRestoreOrder}>
          Annulla
        </button>
      </footer>
    </div>
  );
};

export default BillingModal;