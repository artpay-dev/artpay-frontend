import { ReactNode, useEffect, useState } from "react";
import Navbar from "../../components/ui/navbar/Navbar.tsx";
import { NavLink } from "react-router-dom";
import usePaymentStore from "../../stores/paymentStore.ts";
import SkeletonOrderDetails from "../../components/paymentmethodslist/SkeletonOrderDetails.tsx";
import OrderSummary from "../../components/ordersummary/OrderSummary.tsx";
import VendorDetails from "../../components/vendordetails/VendorDetails.tsx";
import CdsTransactionsProvider from "../../hoc/cdstransactionsprovider/CdsTransactionsProvider.tsx";
import Tooltip from "../../components/ui/tooltip/ToolTip.tsx";
import BillingDataForm from "../../../../components/BillingDataForm.tsx";
import BillingDataPreview from "../../../../components/BillingDataPreview.tsx";
import { BillingData, UserProfile } from "../../../../types/user.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";
import PaymentProviderCard from "../../components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import { useNavigate } from "../../../../utils.ts";
import { clearLocalStorage } from "../../utils.ts";

const CdsTransactionLayout = ({ children }: { children: ReactNode }) => {
  const { order, vendor, user, setPaymentData, paymentMethod, loading } = usePaymentStore();
  const [shippingDataEditing, setShippingDataEditing] = useState(false);
  const data = useData();
  const [saving, setSaving] = useState(false);
  const [requireInvoice, setRequireInvoice] = useState<boolean>(user?.billing.invoice_type == "receipt");
  const [profile, setProfile] = useState<UserProfile>();

  const navigate = useNavigate();

  const getUserProfile = async () => {
    try {
      const resp = await data.getUserProfile()
      if (!resp) throw new Error("Error getting user profile");
      setProfile(resp);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCancelPayment = async () => {
    setPaymentData({
      loading: true,
    });
    try {
      if (!order) return;

      const cancelOrder = await data.updateOrder(order?.id, {
        status: "cancelled",
      });
      if (!cancelOrder) throw Error("Error deleting order!");
      console.log("Order deleted");

      setPaymentData({
        paymentStatus: "cancelled",
        paymentMethod: "",
        orderNote: "",
      });

      clearLocalStorage(order)


    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      })
      navigate(`/`);
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

      setShippingDataEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleInvoice = async () => {
    setRequireInvoice(!requireInvoice);
    setSaving(true);
    try {
      const updateUserProfile = await  data.updateUserProfile({ billing: { invoice_type: requireInvoice ? "" : "receipt"}})
      setPaymentData({
        user: updateUserProfile,
      });

    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (user) {
      setRequireInvoice(user?.billing.invoice_type == "receipt");
    }
    getUserProfile();

  }, [user]);


  return (
    <CdsTransactionsProvider>
      <Tooltip />
      <div className="min-h-screen flex flex-col bg-primary pt-35">
        <div className="mx-auto container max-w-md">
          <Navbar />
          <section className="px-8 mb-6 container lg:px-0">
            <h2 className="text-4xl text-white font-normal">
              {order ? (
                <>
                  Ordine <br /> N.{order.id}
                </>
              ) : (
                <span className="size-12 my-5 block border-2 border-white border-b-transparent rounded-full animate-spin"></span>
              )}
            </h2>
          </section>
          <main className="flex-1 bg-white rounded-t-3xl p-8 pb-24">
            {!order ? <SkeletonOrderDetails /> : <OrderSummary vendor={vendor} order={order} />}
            {children}

            {paymentMethod != "bnpl" && (order?.status == "processing" || order?.status == "on-hold") && (
              <>
                <PaymentProviderCard className={"mt-6 "} backgroundColor={"bg-[#FAFAFB]"}>
                  <p className={"flex gap-2"}>
                    <button
                      className={`${
                        requireInvoice ? "bg-primary" : "bg-gray-300"
                      } rounded-full border border-gray-300 px-3 cursor-pointer relative`}
                      onClick={handleInvoice}>
                      <span
                        className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                          requireInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                        }`}></span>
                    </button>
                    Hai bisogno di una fattura?
                  </p>
                </PaymentProviderCard>
                <PaymentProviderCard
                  backgroundColor={"bg-[#FAFAFB]"}
                  className={"mt-6"}
                  cardTitle={"Dati fatturazione"}
                  disabled={!requireInvoice}
                  button={
                    <button
                      onClick={() => setShippingDataEditing(!shippingDataEditing)}
                      disabled={!requireInvoice}
                      className={"font-normal text-primary underline cursor-pointer disabled:cursor-not-allowed"}>
                      {shippingDataEditing ? "Annulla" : "Modifica"}
                    </button>
                  }>
                  {shippingDataEditing ? (
                    <BillingDataForm
                      disabled={saving}
                      defaultValues={user?.billing}
                      shippingData={user?.shipping}
                      isOnlyCDS={true}
                      onSubmit={(formData) => handleProfileDataSubmit({ ...formData, email: profile?.email })}
                    />
                  ) : (
                    <BillingDataPreview value={user?.billing} />
                  )}
                </PaymentProviderCard>
              </>
            )}
            <div className={"flex flex-col items-center space-y-6 mt-12"}>
              <p className={"leading-[125%]"}>
                Puoi annullare il pagamento quando vuoi! Potrai sempre aggiungerlo nuovamente!{" "}
              </p>
              <button
                className={
                  "text-[#EC6F7B] artpay-button-style bg-[#FAFAFB] disabled:cursor-not-allowed disabled:opacity-65"
                }
                onClick={handleCancelPayment}
                disabled={loading}>
                Elimina Transazione
              </button>
            </div>
            {vendor && <VendorDetails vendor={vendor} />}
          </main>
        </div>
        <footer className={"p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary"}>
          <section className={"md:max-w-xl lg:max-w-4xl mx-auto"}>
            <p>© artpay srl 2024 - Tutti i diritti riservati</p>
            <div className={"flex items-center gap-4 border-b border-gray-300 py-8 flex-wrap"}>
              <a
                href="https://www.iubenda.com/privacy-policy/71113702"
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
                title="Privacy Policy ">
                Privacy Policy
              </a>
              <a
                href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
                title="Cookie Policy ">
                Cookie Policy
              </a>
              <NavLink to="/termini-e-condizioni" className={"underline-none text-primary"}>
                Termini e condizioni
              </NavLink>

              <NavLink to="/condizioni-generali-di-acquisto" className={"underline-none text-primary"}>
                Condizioni generali di acquisto
              </NavLink>
            </div>
            <div className={"pt-8"}>
              <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
            </div>
          </section>
        </footer>
      </div>
    </CdsTransactionsProvider>
  );
};

export default CdsTransactionLayout;
