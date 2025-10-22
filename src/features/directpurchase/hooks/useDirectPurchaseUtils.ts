import { useCallback } from "react";
import { isAxiosError } from "axios";
import { useSnackbars } from "../../../hoc/SnackbarProvider.tsx";
import { useData } from "../../../hoc/DataProvider.tsx";
import useDirectPurchaseStore from "../stores/directPurchaseStore.ts";
import { areBillingFieldsFilled } from "../../../utils.ts";
import { useDirectPurchaseData } from "./useDirectPurchaseData.ts";

export const useDirectPurchaseUtils = () => {
  const snackbar = useSnackbars();
  const data = useData();
  const { createPaymentIntent } = useDirectPurchaseData();

  const {
    orderMode,
    pendingOrder,
    userProfile,
    artworks,
    updateState,
    updatePageData,
  } = useDirectPurchaseStore();

  const showError = useCallback(async (err?: unknown, text: string = "Si è verificato un errore"): Promise<void> => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    snackbar.error(text, { autoHideDuration: 60000 });
  }, [snackbar]);

  const onChangePaymentMethod = useCallback(async (payment: string): Promise<void> => {
    console.log("payment method", payment);
    updateState({ showCommissioni: false, isSaving: true });

    if (pendingOrder) {
      console.log("pendingOrder", pendingOrder);
      //const wc_order_key = pendingOrder.order_key;

      const paymentMethodMap: Record<string, string> = {
        card: "Carta",
        klarna: "Klarna",
        Santander: "Santander",
        bank_transfer: "Bonifico",
      };

      const displayName = paymentMethodMap[payment] || payment;

      try {
        // 1. Aggiorna il metodo di pagamento su WooCommerce prima
        if (pendingOrder.id) {
          await data.updateOrder(pendingOrder.id, {
            payment_method: payment,
            payment_method_title: displayName,
            customer_note: "Pagamento da completare"
          });
        }

        console.log("Payment method updated to:", payment);

        // 2. Recupera l'ordine aggiornato da WooCommerce con le fee corrette
        let order;
        if (orderMode === "redeem" ) {
          const orderId = +window.location.pathname.split('/').pop()!;
          order = await data.getOrder(orderId);
        } else if (orderMode === "onHold") {
          order = await data.getOnHoldOrder();
        } else {
          order = await data.getPendingOrder();
        }

        if (!order) {
          throw new Error("Failed to fetch updated order");
        }

        console.log("Order fetched with updated fees:", order);

        // 3. Aggiorna lo stato locale con l'ordine aggiornato
        updatePageData({ pendingOrder: order });

        // 4. Crea il payment intent usando l'ordine aggiornato (con le fee corrette)
        if (payment != "bank_transfer") {
          const newPaymentIntent = await createPaymentIntent(order, orderMode, payment);
          console.log("New payment intent created with updated order:", newPaymentIntent);
          updatePageData({ paymentIntent: newPaymentIntent });
        } else {
          // Per bonifico, rimuovi il payment intent
          updatePageData({ paymentIntent: undefined });
        }

        // 5. Aggiorna il payment method nello stato locale
        updateState({ paymentMethod: payment });

        updateState({ showCommissioni: true, isSaving: false });
      } catch (e) {
        console.error("Update payment method error: ", e);
        updateState({ showCommissioni: false, isSaving: false });
      }
    } else {
      updateState({ isSaving: false });
    }
  }, [pendingOrder, orderMode, data, updateState, updatePageData, showError, createPaymentIntent]);

  const getCurrentShippingMethod = useCallback((): string => {
    return pendingOrder?.shipping_lines?.length
      ? pendingOrder.shipping_lines[0].method_id
      : "local_pickup";
  }, [pendingOrder]);

  const getEstimatedShippingCost = useCallback((): number => {
    return [0, ...artworks.map((a) => +(a.estimatedShippingCost || "0"))].reduce((a, b) => a + b);
  }, [artworks]);

  const getThankYouPage = useCallback((): string => {
    return orderMode === "loan"
      ? `/opera-bloccata/${artworks.length ? artworks[0].slug : ""}`
      : `/thank-you-page/${pendingOrder?.id}`;
  }, [orderMode, artworks, pendingOrder]);

  const getCheckoutEnabled = useCallback((): boolean => {
    const currentShippingMethod = getCurrentShippingMethod();
    const { checkoutReady, privacyChecked, isSaving } = useDirectPurchaseStore.getState();

    return !!(checkoutReady &&
      privacyChecked &&
      !isSaving &&
      (currentShippingMethod || (orderMode === "loan" && areBillingFieldsFilled(userProfile?.billing))));
  }, [getCurrentShippingMethod, orderMode, userProfile]);

  const getShippingPrice = useCallback((): number => {
    const currentShippingMethod = getCurrentShippingMethod();
    const estimatedShippingCost = getEstimatedShippingCost();
    return currentShippingMethod === "local_pickup" || !currentShippingMethod ? 0 : estimatedShippingCost || 0;
  }, [getCurrentShippingMethod, getEstimatedShippingCost]);

  const getCardContentTitle = useCallback((): string => {
    return "Dettagli dell'ordine";
  }, []);

  const onCancelPaymentMethod = useCallback(async (): Promise<void> => {
    console.log("Cancelling payment method...");
    updateState({ isSaving: true });

    try {
      // Clear payment intent from localStorage
      if (pendingOrder?.order_key) {
        const paymentIntentKeys = [
          `payment-intents-${pendingOrder.order_key}`,
          `payment-intents-cds-${pendingOrder.order_key}`,
          `payment-intents-redeem-${pendingOrder.order_key}`,
          `payment-intents-block-${pendingOrder.order_key}`
        ];
        paymentIntentKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log("Removed from localStorage:", key);
        });
      }

      // Update order to remove payment method on WooCommerce
      if (pendingOrder?.id) {
        await data.updateOrder(pendingOrder.id, {
          payment_method: "",
          payment_method_title: "",
          customer_note: "",
          status: "pending" // Riporta l'ordine in pending quando si annulla il pagamento
        });
        console.log("Order payment method cleared and status set to pending on WooCommerce");

        // Refresh the order to get updated state based on orderMode
        let updatedOrder;
        if (orderMode === "redeem") {
          updatedOrder = await data.getOrder(pendingOrder.id);
        } else if (orderMode === "onHold") {
          updatedOrder = await data.getOnHoldOrder();
        } else {
          updatedOrder = await data.getPendingOrder();
        }

        if (updatedOrder) {
          // Update both order and local state
          updatePageData({
            pendingOrder: updatedOrder,
            paymentIntent: undefined
          });

          // Reset payment method based on the updated order
          updateState({
            paymentMethod: updatedOrder.payment_method || null,
            showCommissioni: false
          });

          console.log("Order and local state updated after cancelling payment method:", updatedOrder);
        }
      } else {
        // If no order ID, just reset local state
        updateState({ paymentMethod: null });
        updatePageData({ paymentIntent: undefined });
      }
    } catch (e) {
      console.error("Error cancelling payment method:", e);
      await showError(e, "Errore durante l'annullamento del metodo di pagamento");
    } finally {
      updateState({ isSaving: false });
    }
  }, [pendingOrder, data, updateState, updatePageData, showError, orderMode]);

  return {
    showError,
    onChangePaymentMethod,
    onCancelPaymentMethod,
    getCurrentShippingMethod,
    getEstimatedShippingCost,
    getThankYouPage,
    getCheckoutEnabled,
    getShippingPrice,
    getCardContentTitle,
  };
};