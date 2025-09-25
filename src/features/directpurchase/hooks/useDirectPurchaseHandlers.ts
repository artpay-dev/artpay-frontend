import { useCallback } from "react";
import { useData } from "../../../hoc/DataProvider.tsx";
import { BillingData, ShippingData } from "../../../types/user.ts";
import { ShippingLineUpdateRequest, ShippingMethodOption } from "../../../types/order.ts";
import useDirectPurchaseStore from "../stores/directPurchaseStore.ts";

export const useDirectPurchaseHandlers = (
  showError: (err?: unknown, text?: string) => Promise<void>
) => {
  const data = useData();
  const {
    pendingOrder,
    userProfile,
    paymentMethod,
    requireInvoice,
    updateState,
    updatePageData,
  } = useDirectPurchaseStore();

  const handleRequireInvoice = useCallback(async (newVal: boolean) => {
    if (!userProfile) return;
    
    updateState({ requireInvoice: newVal, isSaving: true });
    
    try {
      const resp = await data.updateUserProfile({
        billing: { invoice_type: newVal ? "receipt" : "" }
      });
      updateState({ requireInvoice: resp.billing?.invoice_type !== "" });
    } catch (e) {
      updateState({ requireInvoice: !newVal });
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [userProfile, data, updateState, showError]);

  const handleProfileDataSubmit = useCallback(async (formData: BillingData | ShippingData, isBilling = false) => {
    if (!userProfile?.id) return;

    updateState({ isSaving: true });
    try {
      const updatedProfile = isBilling
        ? await data.updateUserProfile({ billing: formData as BillingData })
        : await data.updateUserProfile({ shipping: formData });
      
      updatePageData({ userProfile: updatedProfile });
      updateState({ shippingDataEditing: false });
    } catch (e) {
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [userProfile, data, updateState, updatePageData, showError]);

  const handleSelectShippingMethod = useCallback(async (
    selectedShippingMethod: ShippingMethodOption, 
    estimatedShippingCost: number, 
    onChangePaymentMethod: (method: string) => Promise<void>
  ) => {
    if (!pendingOrder) return;

    updateState({ isSaving: true });
    try {
      const existingShippingLine = pendingOrder.shipping_lines?.length 
        ? pendingOrder.shipping_lines[0] 
        : null;

      const updatedShippingLine: ShippingLineUpdateRequest = {
        instance_id: selectedShippingMethod.instance_id.toString(),
        method_id: selectedShippingMethod.method_id,
        method_title: selectedShippingMethod.method_title,
        total: selectedShippingMethod.method_id === "local_pickup" ? "0" : estimatedShippingCost.toFixed(2),
      };
      
      if (existingShippingLine) {
        updatedShippingLine.id = existingShippingLine.id;
      }

      await data.updateOrder(pendingOrder.id, {
        shipping_lines: [updatedShippingLine]
      });

      const paymentMethodMap: Record<string, string> = {
        "Carta": "card",
        "Klarna": "klarna"
      };
      
      const paymentMethodForUpdate = paymentMethodMap[paymentMethod || ""] || "card";
      await onChangePaymentMethod(paymentMethodForUpdate);
    } catch (e) {
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [pendingOrder, paymentMethod, data, updateState, showError]);

  const handlePurchase = useCallback(async (checkoutButtonRef: React.RefObject<HTMLButtonElement>) => {
    if (!checkoutButtonRef?.current || !pendingOrder || !userProfile?.shipping) return;
    console.log(pendingOrder);
    updateState({ isSaving: true, checkoutReady: false });
    try {
      await data.updateOrder(pendingOrder.id, {
        shipping: { ...userProfile.shipping },
        billing: requireInvoice && userProfile.billing
          ? { ...userProfile.billing }
          : { ...userProfile.shipping }
      });

      localStorage.setItem("completed-order", pendingOrder.id.toString());
      checkoutButtonRef.current.click();
      updateState({ checkoutReady: true });
    } catch (e) {
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [pendingOrder, userProfile, requireInvoice, data, updateState, showError]);

  const handleSubmitCheckout = useCallback(() => {
    console.log("submit checkout", pendingOrder);
  }, [pendingOrder]);

  return {
    handleRequireInvoice,
    handleProfileDataSubmit,
    handleSelectShippingMethod,
    handlePurchase,
    handleSubmitCheckout
  };
};