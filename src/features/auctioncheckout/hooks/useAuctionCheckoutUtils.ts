import { useCallback } from "react";
import { useData } from "../../../hoc/DataProvider.tsx";
import { useSnackbars } from "../../../hoc/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import useAuctionCheckoutStore from "../stores/auctionCheckoutStore.ts";
import { useAuctionCheckoutData } from "./useAuctionCheckoutData.ts";
import {
  KLARNA_MAX_LIMIT,
  KLARNA_FEE_MULTIPLIER,
  KLARNA_FEE_RATE,
  PAYMENT_METHODS,
} from "../utils/constants.ts";
import { validateGuestForm as validateForm } from "../utils/validation.ts";
import type { GuestBillingData } from "../types.ts";

/**
 * Hook for utilities, validations, and fee calculations
 */
export const useAuctionCheckoutUtils = () => {
  const data = useData();
  const snackbar = useSnackbars();
  const { createPaymentIntent, refreshOrder } = useAuctionCheckoutData();

  const {
    order,
    updateState,
    updatePageData,
  } = useAuctionCheckoutStore();

  /**
   * Show error with snackbar
   */
  const showError = useCallback(
    async (err?: unknown, text: string = "Si è verificato un errore"): Promise<void> => {
      if (isAxiosError(err) && err.response?.data?.message) {
        text = err.response.data.message;
      }

      console.error("Auction checkout error:", err);
      snackbar.error(text, { autoHideDuration: 60000 });
    },
    [snackbar]
  );

  /**
   * Validate guest form
   */
  const validateGuestForm = useCallback((formData: Partial<GuestBillingData>): string | null => {
    return validateForm(formData);
  }, []);

  /**
   * Calculate Klarna fee
   */
  const calculateKlarnaFee = useCallback((subtotal: number): number => {
    return subtotal * KLARNA_FEE_RATE;
  }, []);

  /**
   * Check if Klarna is available for order total
   */
  const isKlarnaAvailable = useCallback((orderTotal: number): boolean => {
    const totalWithFee = orderTotal * KLARNA_FEE_MULTIPLIER;
    return totalWithFee <= KLARNA_MAX_LIMIT;
  }, []);

  /**
   * Change payment method with DUAL UPDATE PATTERN
   * This is the critical method that ensures backend and frontend stay in sync
   */
  const onChangePaymentMethod = useCallback(
    async (method: string): Promise<void> => {
      if (!order) {
        console.error("No order to update");
        return;
      }

      updateState({ isSaving: true, showCommissioni: false });

      try {
        console.log("Changing payment method to:", method);

        // STEP 1: Update order on backend (use numeric order ID)
        const paymentMethodTitle = method === PAYMENT_METHODS.KLARNA ? "Klarna" : "Carta di credito";

        await data.updateCdsOrder(order.id, {
          payment_method: method,
          payment_method_title: paymentMethodTitle,
        });

        console.log("Order updated on backend");

        // STEP 2: Fetch updated order (backend has recalculated fees)
        await refreshOrder();

        const updatedOrder = useAuctionCheckoutStore.getState().order;

        if (!updatedOrder) {
          throw new Error("Failed to fetch updated order");
        }

        console.log("Order refreshed with new fees:", updatedOrder);

        // STEP 3: Create payment intent with correct amount
        const paymentIntent = await createPaymentIntent(updatedOrder, method);

        if (!paymentIntent) {
          throw new Error("Failed to create payment intent");
        }

        console.log("Payment intent created:", paymentIntent);

        // STEP 4: Update local state (LAST step)
        updatePageData({ paymentIntent });
        updateState({
          paymentMethod: method,
          showCommissioni: true,
          isSaving: false,
        });

        console.log("Payment method changed successfully");
      } catch (error) {
        console.error("Error changing payment method:", error);
        await showError(error, "Errore durante il cambio metodo di pagamento");

        updateState({
          showCommissioni: false,
          isSaving: false,
        });
      }
    },
    [data, order, updateState, updatePageData, createPaymentIntent, refreshOrder, showError]
  );

  /**
   * Cancel payment method selection
   */
  const onCancelPaymentMethod = useCallback(async (): Promise<void> => {
    if (!order) return;

    try {
      updateState({ isSaving: true });

      // Reset payment method on backend (use numeric order ID)
      await data.updateCdsOrder(order.id, {
        payment_method: "",
        payment_method_title: "",
      });

      // Clear local state
      updateState({
        paymentMethod: null,
        checkoutReady: false,
        isSaving: false,
      });
      updatePageData({ paymentIntent: null });

      console.log("Payment method cancelled");
    } catch (error) {
      console.error("Error cancelling payment method:", error);
      await showError(error, "Errore durante l'annullamento");
      updateState({ isSaving: false });
    }
  }, [data, order, updateState, updatePageData, showError]);

  /**
   * Get thank you page URL
   */
  const getThankYouUrl = useCallback((orderId: number): string => {
    return `/auction-checkout/complete/${orderId}`;
  }, []);

  return {
    showError,
    validateGuestForm,
    calculateKlarnaFee,
    isKlarnaAvailable,
    onChangePaymentMethod,
    onCancelPaymentMethod,
    getThankYouUrl,
  };
};