import { ReactNode, useEffect } from "react";
import { usePayments } from "../../hoc/PaymentProvider.tsx";
import { DirectPurchaseContext } from "./contexts/DirectPurchaseContext.tsx";
import { useDirectPurchaseData } from "./hooks/useDirectPurchaseData.ts";
import { useDirectPurchaseHandlers } from "./hooks/useDirectPurchaseHandlers.ts";
import { useDirectPurchaseUtils } from "./hooks/useDirectPurchaseUtils.ts";
import useDirectPurchaseStore from "./stores/directPurchaseStore.ts";


export interface PurchaseProps {
  orderMode?: "standard" | "loan" | "redeem" | "onHold";
  children?: ReactNode;
}

const DirectPurchaseProvider: React.FC<PurchaseProps> = ({ orderMode = "standard", children }) => {
  const payments = usePayments();
  
  // Initialize hooks
  const { initialize, loadInitialData } = useDirectPurchaseData();
  const { showError, onChangePaymentMethod, getCurrentShippingMethod, 
          getEstimatedShippingCost, getThankYouPage, getCheckoutEnabled,
          getShippingPrice, getCardContentTitle, onCancelPaymentMethod } = useDirectPurchaseUtils();
  const handlers = useDirectPurchaseHandlers(showError);

  // Get store state
  const { pendingOrder, orderMode: currentOrderMode,
    updateState, setDirectPurchaseData
  } = useDirectPurchaseStore();

  // Initialize store with order mode
  useEffect(() => {
    initialize(orderMode);
  }, [initialize, orderMode]);

  // Load initial data when ready
  useEffect(() => {
    if (currentOrderMode) {void loadInitialData();
    }
  }, [loadInitialData, currentOrderMode]);

  // Handle payments ready state
  useEffect(() => {
    if (payments.isReady) {
      updateState({ paymentsReady: payments.isReady });
    }
  }, [payments.isReady, updateState]);

  /*// Handle no pending order navigation
  useEffect(() => {
    if (noPendingOrder) {
      navigate("/errore/404");
    }
  }, [noPendingOrder, navigate]);*/

  // Calculate subtotal when order changes
  useEffect(() => {
    if (pendingOrder) {
      const totalSum = pendingOrder.line_items.reduce((acc, item) => acc + parseFloat(item.total), 0);
      const totalTaxSum = pendingOrder.line_items.reduce((acc, item) => acc + parseFloat(item.total_tax), 0);
      
      updateState({ subtotal: totalSum + totalTaxSum });
      localStorage.setItem("showCheckout", "true");
    }
  }, [pendingOrder, updateState]);

  // Update order mode based on customer note
  useEffect(() => {
    if (pendingOrder?.customer_note === "Blocco opera" && currentOrderMode !== "loan") {
      setDirectPurchaseData({ orderMode: "loan" });
    }
  }, [pendingOrder, currentOrderMode, setDirectPurchaseData]);

  // Create context value  
  const storeState = useDirectPurchaseStore();
  const contextValue = {
    ...storeState,
    ...handlers,
    onChangePaymentMethod,
    showError,
    getCurrentShippingMethod,
    getEstimatedShippingCost,
    getThankYouPage,
    getCheckoutEnabled,
    getShippingPrice,
    getCardContentTitle,
    onCancelPaymentMethod,
  };

  console.log(contextValue);

  return (
    <DirectPurchaseContext.Provider value={contextValue}>
      {children}
    </DirectPurchaseContext.Provider>
  );
};

export default DirectPurchaseProvider;
