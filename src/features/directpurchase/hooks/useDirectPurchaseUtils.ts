import { useCallback } from "react";
import { isAxiosError } from "axios";
import { useSnackbars } from "../../../hoc/SnackbarProvider.tsx";
import { useData } from "../../../hoc/DataProvider.tsx";
import useDirectPurchaseStore from "../stores/directPurchaseStore.ts";
import { areBillingFieldsFilled } from "../../../utils.ts";

export const useDirectPurchaseUtils = () => {
  const snackbar = useSnackbars();
  const data = useData();
  
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
    updateState({ showCommissioni: false });

    if (pendingOrder) {
      const wc_order_key = pendingOrder.order_key;
      try {
        const newPaymentIntent = await data.updatePaymentIntent({ wc_order_key, payment_method: payment });
        updatePageData({ paymentIntent: newPaymentIntent });

        const paymentMethodMap: Record<string, string> = {
          card: "Carta",
          klarna: "Klarna",
          Santander: "Santander",
        };
        updateState({ paymentMethod: paymentMethodMap[payment] || "Bonifico" });

        const getOrderFunction =
          orderMode === "redeem" && window.location.pathname.includes('order_id')
            ? data.getOrder(+window.location.pathname.split('/').pop()!)
            : orderMode === "onHold"
              ? data.getOnHoldOrder()
              : data.getPendingOrder();

        const order = await getOrderFunction;
        if (order) updatePageData({ pendingOrder: order });
        updateState({ showCommissioni: true });
      } catch (e) {
        console.error("Update payment method error: ", e);
        updateState({ showCommissioni: false });
      }
    }
  }, [pendingOrder, orderMode, data, updateState, updatePageData]);

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

  return {
    showError,
    onChangePaymentMethod,
    getCurrentShippingMethod,
    getEstimatedShippingCost,
    getThankYouPage,
    getCheckoutEnabled,
    getShippingPrice,
    getCardContentTitle,
  };
};