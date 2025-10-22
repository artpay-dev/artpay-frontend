import { useCallback } from "react";
import { useData } from "../hoc/DataProvider";
import { BillingData, ShippingData } from "../types/user";
import { ShippingLineUpdateRequest, ShippingMethodOption } from "../types/order";
import { PurchaseState, PurchaseData } from "./usePurchaseData";

export const usePurchaseHandlers = (
  state: PurchaseState,
  pageData: PurchaseData,
  updateState: (updates: Partial<PurchaseState>) => void,
  updatePageData: (updates: Partial<PurchaseData>) => void,
  showError: (err?: unknown, text?: string) => Promise<void>
) => {
  const data = useData();

  const handleRequireInvoice = useCallback(async (newVal: boolean) => {
    if (!pageData.userProfile) return;
    
    // Update state immediately for instant UI feedback
    updateState({ requireInvoice: newVal, isSaving: true });
    
    try {
      const resp = await data.updateUserProfile({
        billing: { invoice_type: newVal ? "receipt" : "" }
      });
      // Sync with server response in case of discrepancy
      updateState({ requireInvoice: resp.billing?.invoice_type !== "" });
    } catch (e) {
      // Revert to previous state on error
      updateState({ requireInvoice: !newVal });
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [pageData.userProfile, data, updateState, showError]);

  const handleProfileDataSubmit = useCallback(async (formData: BillingData | ShippingData, isBilling = false) => {
    if (!pageData.userProfile?.id) return;

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
  }, [pageData.userProfile, data, updateState, updatePageData, showError]);

  const handleSelectShippingMethod = useCallback(async (selectedShippingMethod: ShippingMethodOption, estimatedShippingCost: number, onChangePaymentMethod: (method: string) => Promise<void>) => {
    if (!pageData.pendingOrder) return;

    updateState({ isSaving: true });
    try {
      const existingShippingLine = pageData.pendingOrder.shipping_lines?.length 
        ? pageData.pendingOrder.shipping_lines[0] 
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

      await data.updateOrder(pageData.pendingOrder.id, {
        shipping_lines: [updatedShippingLine]
      });

      const paymentMethodMap: Record<string, string> = {
        "Carta": "card",
        "Klarna": "klarna"
      };
      
      const paymentMethodForUpdate = paymentMethodMap[state.paymentMethod || ""] || "Santander";
      await onChangePaymentMethod(paymentMethodForUpdate);
    } catch (e) {
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [pageData.pendingOrder, state.paymentMethod, data, updateState, showError]);

  const handlePurchase = useCallback(async (checkoutButtonRef: React.RefObject<HTMLButtonElement>) => {
    if (!checkoutButtonRef?.current || !pageData.pendingOrder || !pageData.userProfile?.shipping) return;

    updateState({ isSaving: true, checkoutReady: false });
    try {
      await data.updateOrder(pageData.pendingOrder.id, {
        shipping: { ...pageData.userProfile.shipping },
        billing: state.requireInvoice && pageData.userProfile.billing 
          ? { ...pageData.userProfile.billing } 
          : { ...pageData.userProfile.shipping }
      });
      
      localStorage.setItem("completed-order", pageData.pendingOrder.id.toString());
      checkoutButtonRef.current.click();
      updateState({ checkoutReady: true });
    } catch (e) {
      await showError(e);
    } finally {
      updateState({ isSaving: false });
    }
  }, [pageData.pendingOrder, pageData.userProfile, state.requireInvoice, data, updateState, showError]);

  const handleSubmitCheckout = useCallback(() => {
    console.log("submit checkout", pageData.pendingOrder);
  }, [pageData.pendingOrder]);

  return {
    handleRequireInvoice,
    handleProfileDataSubmit,
    handleSelectShippingMethod,
    handlePurchase,
    handleSubmitCheckout
  };
};