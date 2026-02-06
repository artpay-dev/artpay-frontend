import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../../hoc/DataProvider.tsx";
import useAuctionCheckoutStore from "../stores/auctionCheckoutStore.ts";
import type { GuestBillingData } from "../types.ts";
import { ORDER_STATUS } from "../utils/constants.ts";

/**
 * Hook for event handlers
 */
export const useAuctionCheckoutHandlers = (
  showError: (err?: unknown, text?: string) => Promise<void>
) => {
  const data = useData();
  const navigate = useNavigate();

  const {
    order,
    updateState,
    updatePageData,
  } = useAuctionCheckoutStore();

  /**
   * Handle guest form submission
   */
  const handleGuestFormSubmit = useCallback(
    async (formData: GuestBillingData): Promise<void> => {
      if (!order) {
        console.error("No order to update");
        return;
      }

      try {
        updateState({ isSaving: true });

        console.log("Submitting guest billing data:", formData);

        // Update order with billing data (use numeric order ID)
        await data.updateCdsOrder(order.id, {
          billing: formData,
          billing_email: formData.email,
        });

        console.log("Order updated with billing data");

        // Store guest data in state
        updatePageData({ guestData: formData });

        // Mark form as valid
        updateState({
          formValid: true,
          isSaving: false,
        });

        console.log("Guest form submitted successfully");
      } catch (error) {
        console.error("Error submitting guest form:", error);
        await showError(error, "Errore durante il salvataggio dei dati");
        updateState({ isSaving: false });
      }
    },
    [data, order, updateState, updatePageData, showError]
  );

  /**
   * Handle payment method selection
   * This delegates to onChangePaymentMethod in utils hook
   */
  const handlePaymentMethodSelect = useCallback(
    async (method: string, onChangePaymentMethod: (method: string) => Promise<void>): Promise<void> => {
      try {
        await onChangePaymentMethod(method);
      } catch (error) {
        console.error("Error selecting payment method:", error);
        await showError(error, "Errore durante la selezione del metodo di pagamento");
      }
    },
    [showError]
  );

  /**
   * Handle Stripe checkout submission
   * This is called after successful Stripe payment
   */
  const handleStripeSubmit = useCallback(
    async (orderId: number): Promise<void> => {
      try {
        console.log("Stripe payment successful, redirecting...");

        // Store completed order ID
        localStorage.setItem("completed-order", orderId.toString());

        // Navigate to thank you page
        navigate(`/auction-checkout/complete/${orderId}`);
      } catch (error) {
        console.error("Error handling Stripe success:", error);
        await showError(error, "Errore durante il completamento del pagamento");
      }
    },
    [navigate, showError]
  );

  /**
   * Handle order completion (called by Stripe redirect)
   */
  const handleOrderCompletion = useCallback(
    async (): Promise<void> => {
      if (!order) {
        console.error("No order to complete");
        return;
      }

      try {
        console.log("Completing order:", order.id);

        // Update order status to completed
        await data.setCdsOrderStatus(order.id, ORDER_STATUS.COMPLETED);

        console.log("Order marked as completed");

        // Navigate to thank you page
        navigate(`/auction-checkout/complete/${order.id}`);
      } catch (error) {
        console.error("Error completing order:", error);
        await showError(error, "Errore durante il completamento dell'ordine");
      }
    },
    [data, order, navigate, showError]
  );

  return {
    handleGuestFormSubmit,
    handlePaymentMethodSelect,
    handleStripeSubmit,
    handleOrderCompletion,
  };
};