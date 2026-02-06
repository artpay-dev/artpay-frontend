import { useData } from "../../../../hoc/DataProvider.tsx";
import { useAuth } from "../../../../hoc/AuthProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserRegisteredModal = () => {
  const { order, setPaymentData } = usePaymentStore();
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔴 UserRegisteredModal rendered!");

  const handleLogin = () => {
    // Mark that user made a choice
    setPaymentData({
      showUserRegisteredModal: false,
      userChoiceMade: true
    });
    // Show AuthProvider login modal
    auth.login();
  };

  const handleContinueAsGuest = async () => {
    if (!order) return;

    setIsLoading(true);
    setError(null);
    try {
      // Convert order to guest
      const convertResponse = await data.convertCdsOrderToGuest(order.order_key);
      console.log("Convert to guest response:", convertResponse);

      // Re-fetch the complete order using flashOrder
      const completeOrder = await data.flashOrder(order.order_key);
      console.log("Complete order after conversion:", completeOrder);

      if (!completeOrder) {
        throw new Error("Failed to fetch complete order after conversion");
      }

      // Preserve email and billing_address from current order
      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (completeOrder as any).email = preservedEmail;
        if (!completeOrder.billing_email) {
          completeOrder.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress && (!completeOrder.billing || !completeOrder.billing.first_name)) {
        completeOrder.billing = preservedBillingAddress;
        (completeOrder as any).billing_address = preservedBillingAddress;
      }

      console.log("Final guest order with all data:", completeOrder);

      // Close modal and mark choice as made
      setPaymentData({
        showUserRegisteredModal: false,
        userRegistered: false,
        userChoiceMade: true,
      });

      // Force reload by navigating to the same page with order parameter
      // This will trigger CdsTransactionsProvider to reload everything
      navigate(`/acquisto-esterno?order=${order.order_key}`, { replace: true });
    } catch (err) {
      console.error("Convert to guest error:", err);
      setError("Errore durante la conversione in ospite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Account esistente trovato
          </h2>
          <p className="text-gray-600">
            L'email associata a questo ordine corrisponde a un account Artpay esistente.
            Vuoi accedere per vedere i tuoi ordini e gestire il tuo profilo?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="artpay-button-style w-full py-3! bg-primary hover:bg-primary-hover text-white">
            Accedi al tuo account
          </button>

          <button
            onClick={handleContinueAsGuest}
            disabled={isLoading}
            className="artpay-button-style w-full py-3! bg-white border border-gray-300 hover:border-gray-400 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Caricamento..." : "Continua come ospite"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRegisteredModal;