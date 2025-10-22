import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
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
import type { BillingData, UserProfile } from "../../../../types/user.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";
import PaymentProviderCard from "../../components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import { useNavigate } from "../../../../utils.ts";
import { clearLocalStorage } from "../../utils.ts";

// Constants
const INVOICE_TYPE = {
  RECEIPT: "receipt",
  NONE: ""
} as const;

const ORDER_STATUS = {
  PROCESSING: "processing",
  ON_HOLD: "on-hold",
  CANCELLED: "cancelled"
} as const;

const PAYMENT_METHOD = {
  BNPL: "bnpl"
} as const;


const CdsTransactionLayout = ({ children }: { children: ReactNode }) => {
  const { order, vendor, user, setPaymentData, paymentMethod, loading } = usePaymentStore();
  const [shippingDataEditing, setShippingDataEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const data = useData();
  const navigate = useNavigate();

  // Derived state
  const requireInvoice = useMemo(() => 
    user?.billing?.invoice_type === INVOICE_TYPE.RECEIPT, 
    [user?.billing?.invoice_type]
  );

  const showBillingSection = useMemo(() => 
    paymentMethod !== PAYMENT_METHOD.BNPL && 
    paymentMethod !== "" &&
    paymentMethod !== null &&
    (order?.status === ORDER_STATUS.ON_HOLD),
    [paymentMethod, order?.status]
  );

  const isOrderLoading = !order;

  const getUserProfile = useCallback(async () => {
    try {
      const resp = await data.getUserProfile();
      if (!resp) throw new Error("Error getting user profile");
      setProfile(resp);
    } catch (error) {
      console.error("Failed to get user profile:", error);
    }
  }, [data]);

  const handleCancelPayment = useCallback(async () => {
    if (!order) return;
    
    setPaymentData({ loading: true });
    
    try {
      const cancelOrder = await data.updateOrder(order.id, {
        status: ORDER_STATUS.CANCELLED,
      });
      
      if (!cancelOrder) throw new Error("Failed to cancel order");
      
      console.log("Order cancelled successfully:", cancelOrder.id);
      
      setPaymentData({
        order: cancelOrder,
        paymentStatus: ORDER_STATUS.CANCELLED,
        paymentMethod: INVOICE_TYPE.NONE,
        orderNote: INVOICE_TYPE.NONE,
        loading: false
      });
      
      clearLocalStorage(order);
      navigate("/");
      
    } catch (error) {
      console.error("Failed to cancel payment:", error);
      setPaymentData({ loading: false });
    }
  }, [order, data, setPaymentData, navigate]);


  const handleProfileDataSubmit = useCallback(async (formData: BillingData) => {
    if (!user?.id) return;
    
    setSaving(true);
    
    try {
      const updatedProfile = await data.updateUserProfile({ billing: formData });
      if (!updatedProfile) throw new Error("Failed to update user profile");
      
      setPaymentData({ user: updatedProfile });
      setShippingDataEditing(false);
      
    } catch (error) {
      console.error("Failed to update profile data:", error);
    } finally {
      setSaving(false);
    }
  }, [user?.id, data, setPaymentData]);

  const handleInvoiceToggle = useCallback(async () => {
    setSaving(true);
    
    try {
      const newInvoiceType = requireInvoice ? INVOICE_TYPE.NONE : INVOICE_TYPE.RECEIPT;
      
      const updatedProfile = await data.updateUserProfile({ 
        billing: { invoice_type: newInvoiceType } 
      });
      
      if (!updatedProfile) throw new Error("Failed to update invoice preference");
      
      setPaymentData({ user: updatedProfile });
      
    } catch (error) {
      console.error("Failed to update invoice setting:", error);
    } finally {
      setSaving(false);
    }
  }, [requireInvoice, data, setPaymentData]);

  useEffect(() => {
    void getUserProfile();
  }, [getUserProfile]);


  return (
    <CdsTransactionsProvider>
      <Tooltip />
      <div className="min-h-screen flex flex-col bg-primary pt-35">
        <div className="mx-auto container max-w-2xl">
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
            {isOrderLoading ? <SkeletonOrderDetails /> : <OrderSummary vendor={vendor} order={order} />}
            {children}

            {showBillingSection && (
              <>
                <PaymentProviderCard className={"mt-6"} backgroundColor={"bg-[#FAFAFB]"}>
                  <p className={"flex gap-2"}>
                    <button
                      className={`${
                        requireInvoice ? "bg-primary" : "bg-gray-300"
                      } rounded-full border border-gray-300 px-3 cursor-pointer relative`}
                      onClick={handleInvoiceToggle}
                      disabled={saving}>
                      <span
                        className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                          requireInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                        }`}
                      />
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
              <p className={"leading-[125%] text-center"}>
                Se interrompi la procedura con artpay il tuo lotto verrà rimosso dal carrello. 
                Potrai aggiungerlo di nuovo in un secondo momento.
              </p>
              <button
                className={"text-[#EC6F7B] artpay-button-style bg-[#FAFAFB] disabled:cursor-not-allowed disabled:opacity-65"}
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
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
                title="Privacy Policy">
                Privacy Policy
              </a>
              <a
                href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
                title="Cookie Policy">
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
