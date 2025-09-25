import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { useData } from "../../../hoc/DataProvider.tsx";
import useDirectPurchaseStore from "../stores/directPurchaseStore.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Artwork } from "../../../types/artwork.ts";
import type { Gallery } from "../../../types/gallery.ts";

// Constants
const ORDER_STATUS = {
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
  ON_HOLD: "on-hold",
  PROCESSING: "processing",
  PENDING: "pending"
} as const;

const REDIRECT_STATUS = {
  SUCCEEDED: "succeeded",
  FAILED: "failed"
} as const;

const INVOICE_TYPE = {
  RECEIPT: "receipt"
} as const;

const LOCAL_STORAGE_KEYS = {
  REDIRECT_TO_DIRECT_PURCHASE: "redirectToDirectPurchase",
  DIRECT_PURCHASE_ORDER: "DirectPurchaseOrder",
  SHOW_CHECKOUT: "showCheckout",
  CHECKOUT_URL: "checkoutUrl",
  ARTPAY_USER: "artpay-user"
} as const;

// Helper functions
const safeParseJSON = (jsonString: string | null) => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON from localStorage:", error);
    return null;
  }
};

const getOrderStatuses = (includeCompleted = true) => {
  const statuses = [ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED];
  return includeCompleted ? [ORDER_STATUS.COMPLETED, ...statuses] : statuses;
};

const clearLocalStorage = (orderResp: any) => {
  console.log("Clearing localStorage for order:", orderResp?.id);
  [
    LOCAL_STORAGE_KEYS.DIRECT_PURCHASE_ORDER,
    LOCAL_STORAGE_KEYS.SHOW_CHECKOUT,
    LOCAL_STORAGE_KEYS.CHECKOUT_URL
  ].forEach(key => localStorage.removeItem(key));
};

const sendPaymentNotification = async (vendor: Gallery, order: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_ARTPAY_WEB_SERVICE}/api/test/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor,
        order
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Payment notification sent successfully');
  } catch (error) {
    console.error('Failed to send payment notification:', error);
  }
};

interface DirectPurchaseTransactionsProviderProps {
  children: ReactNode;
}

const DirectPurchaseTransactionsProvider = ({ children }: DirectPurchaseTransactionsProviderProps) => {
  const data = useData();
  const { setDirectPurchaseData, updatePageData, userProfile, galleries } = useDirectPurchaseStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProcessingRef = useRef(false);

  // Memoized values
  const searchParamsData = useMemo(() => ({
    hasPaymentIntent: searchParams.has("payment_intent"),
    orderParam: searchParams.get("order"),
    redirectStatus: searchParams.get("redirect_status")
  }), [searchParams]);

  const findOrder = useCallback(async () => {
    const { orderParam } = searchParamsData;

    // Try to get order from URL params first
    if (orderParam) {
      const orderResp = await data.getOrder(Number(orderParam));
      if (orderResp) {
        console.log("Order found in URL params");
        localStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO_DIRECT_PURCHASE, "true");
        return orderResp;
      }
    }

    // Try to get on-hold order
    let orderResp = await data.getOnHoldOrder();
    if (orderResp) {
      console.log("Found on-hold order");
      localStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO_DIRECT_PURCHASE, "true");
      return orderResp;
    }

    // Try to get processing order
    orderResp = await data.getProcessingOrder();
    if (orderResp) {
      console.log("Found processing order");
      return orderResp;
    }

    // Try to get pending order (most recent order after clicking "Acquista")
    orderResp = await data.getPendingOrder();
    if (orderResp) {
      console.log("Found pending order");
      return orderResp;
    }

    // Try to get completed/cancelled/failed orders
    const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.ARTPAY_USER);
    const parsedUser = safeParseJSON(userString);

    if (parsedUser?.id) {
      const listOrders = await data.listOrders({
        status: getOrderStatuses(),
        customer: Number(parsedUser.id),
      });

      return listOrders[0] || null;
    }

    return null;
  }, [data, searchParamsData]);

  const loadUserAndGallery = useCallback(async (orderResp: any) => {
    const promises = [];

    // Load user if not present
    if (!userProfile) {
      promises.push(
        data.getUserProfile().then(resp => {
          if (!resp) throw new Error("User not found");
          return { type: 'userProfile', data: resp };
        })
      );
    }

    // Load gallery if not present
    if ((!galleries || galleries.length === 0) && orderResp?.line_items?.[0]?.product_id) {
      const productId = orderResp.line_items[0].product_id.toString();

      promises.push(
        data.getArtwork(productId).then(async (artworkResp: Artwork) => {
          if (!artworkResp) throw new Error("Artwork not found");

          const galleryResp: Gallery = await data.getGallery(artworkResp.vendor);
          if (!galleryResp) throw new Error("Gallery not found");

          return { type: 'galleries', data: [galleryResp] };
        })
      );
    }

    if (promises.length === 0) return {};

    const results = await Promise.all(promises);
    const updates: any = {};

    results.forEach(result => {
      updates[result.type] = result.data;
    });

    return updates;
  }, [data, userProfile, galleries]);

  const handlePaymentIntent = useCallback(async (orderResp: any) => {
    const { redirectStatus } = searchParamsData;
    const currentGallery = galleries?.[0];

    if (redirectStatus === REDIRECT_STATUS.SUCCEEDED) {
      let updateOrderStatus = await data.setOrderStatus(orderResp.id, ORDER_STATUS.COMPLETED);
      if (!updateOrderStatus) throw new Error("Error completing order");

      // Handle billing update for receipts
      if (userProfile?.billing?.invoice_type === INVOICE_TYPE.RECEIPT) {
        const billing = userProfile.billing || userProfile.shipping;
        updateOrderStatus = await data.updateOrder(orderResp.id, { billing });
      }

      // Send notification
      if (currentGallery) {
        await sendPaymentNotification(currentGallery, orderResp);
      }

      clearLocalStorage(orderResp);
      return updateOrderStatus;

    } else if (redirectStatus === REDIRECT_STATUS.FAILED) {
      const updateOrderStatus = await data.setOrderStatus(orderResp.id, ORDER_STATUS.FAILED);
      if (!updateOrderStatus) throw new Error("Error marking order as failed");

      console.log("Payment failed:", updateOrderStatus);
      return updateOrderStatus;
    }

    return orderResp;
  }, [data, userProfile, galleries, searchParamsData]);

  const fetchPaymentDetails = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const { hasPaymentIntent, orderParam, redirectStatus } = searchParamsData;

      // Only handle transaction-related cases
      // Let normal DirectPurchaseProvider handle regular pending orders
      if (!hasPaymentIntent && !orderParam && !redirectStatus) {
        isProcessingRef.current = false;
        return;
      }

      setDirectPurchaseData({ loading: true });

      const orderResp = await findOrder();

      if (!orderResp && !hasPaymentIntent) {
        // Clean up localStorage and redirect
        [
          LOCAL_STORAGE_KEYS.DIRECT_PURCHASE_ORDER,
          LOCAL_STORAGE_KEYS.SHOW_CHECKOUT,
          LOCAL_STORAGE_KEYS.CHECKOUT_URL
        ].forEach(key => localStorage.removeItem(key));
        navigate("/");
        return;
      }

      if (!orderResp) return;

      // Handle completed order early return
      if (orderResp.status === ORDER_STATUS.COMPLETED && !hasPaymentIntent) {
        console.log("Payment completed:", orderResp);
        updatePageData({ pendingOrder: orderResp });
        setDirectPurchaseData({ loading: false,
          paymentStatus: "completed" });
        clearLocalStorage(orderResp);
        return;
      }

      // Load user and gallery data in parallel
      const additionalData = await loadUserAndGallery(orderResp);

      // Update payment data with additional data
      if (Object.keys(additionalData).length > 0) {
        updatePageData(additionalData);
      }

      // Handle payment intent processing
      let finalOrder = orderResp;
      if (hasPaymentIntent) {
        finalOrder = await handlePaymentIntent(orderResp);
      }

      // Final payment data update
      updatePageData({ pendingOrder: finalOrder });

      // Only set paymentStatus when we have transaction-related URL params
      // For normal orders without params, don't set paymentStatus to let normal flow work
      const hasTransactionParams = hasPaymentIntent || orderParam || redirectStatus;

      // Only set paymentStatus for terminal states AND when handling transactions
      const terminalStates = [ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED, ORDER_STATUS.CANCELLED];
      const shouldShowStatus = hasTransactionParams && terminalStates.includes(finalOrder?.status);

      setDirectPurchaseData({
        loading: false,
        paymentStatus: shouldShowStatus ? finalOrder?.status as "completed" | "failed" | "cancelled" : undefined
      });

    } catch (error) {
      console.error("Payment processing error:", error);
      setDirectPurchaseData({ loading: false });
    } finally {
      isProcessingRef.current = false;
    }
  }, [findOrder, loadUserAndGallery, handlePaymentIntent, setDirectPurchaseData, updatePageData, navigate, searchParamsData]);

  useEffect(() => {
    void fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  return <>{children}</>;
};

export default DirectPurchaseTransactionsProvider;