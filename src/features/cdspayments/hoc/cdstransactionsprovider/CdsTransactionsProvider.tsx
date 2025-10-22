import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Artwork } from "../../../../types/artwork.ts";
import type { Gallery } from "../../../../types/gallery.ts";
import { clearLocalStorage, sendPaymentNotification } from "../../utils.ts";

// Constants
const ORDER_STATUS = {
  COMPLETED: "completed",
  CANCELLED: "cancelled", 
  FAILED: "failed",
  ON_HOLD: "on-hold",
  PROCESSING: "processing"
} as const;

const REDIRECT_STATUS = {
  SUCCEEDED: "succeeded",
  FAILED: "failed"
} as const;

const INVOICE_TYPE = {
  RECEIPT: "receipt"
} as const;

const LOCAL_STORAGE_KEYS = {
  REDIRECT_TO_ACQUISTO_ESTERNO: "redirectToAcquistoEsterno",
  CDS_ORDER: "CdsOrder",
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

const CdsTransactionsProvider = ({ children }: { children: ReactNode }) => {
  const data = useData();
  const { setPaymentData, vendor, user } = usePaymentStore();
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
        localStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO_ACQUISTO_ESTERNO, "true");
        return orderResp;
      }
    }

    // Try to get on-hold order
    let orderResp = await data.getOnHoldOrder();
    if (orderResp) {
      console.log("Found on-hold order");
      localStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO_ACQUISTO_ESTERNO, "true");
      return orderResp;
    }

    // Try to get processing order  
    orderResp = await data.getProcessingOrder();
    if (orderResp) {
      console.log("Found processing order");
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

  const loadUserAndVendor = useCallback(async (orderResp: any) => {
    const promises = [];
    
    // Load user if not present
    if (!user) {
      promises.push(
        data.getUserProfile().then(resp => {
          if (!resp) throw new Error("User not found");
          return { type: 'user', data: resp };
        })
      );
    }

    // Load vendor if not present
    if (!vendor && orderResp?.line_items?.[0]?.product_id) {
      const productId = orderResp.line_items[0].product_id.toString();
      
      promises.push(
        data.getArtwork(productId).then(async (artworkResp: Artwork) => {
          if (!artworkResp) throw new Error("Artwork not found");
          
          const vendorResp: Gallery = await data.getGallery(artworkResp.vendor);
          if (!vendorResp) throw new Error("Vendor not found");
          
          return { type: 'vendor', data: vendorResp };
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
  }, [data, user, vendor]);

  const handlePaymentIntent = useCallback(async (orderResp: any) => {
    const { redirectStatus } = searchParamsData;
    
    if (redirectStatus === REDIRECT_STATUS.SUCCEEDED) {
      let updateOrderStatus = await data.setOrderStatus(orderResp.id, ORDER_STATUS.COMPLETED);
      if (!updateOrderStatus) throw new Error("Error completing order");

      // Handle billing update for receipts
      if (user?.billing?.invoice_type === INVOICE_TYPE.RECEIPT) {
        const billing = user.billing || user.shipping;
        updateOrderStatus = await data.updateOrder(orderResp.id, { billing });
      }

      // Send notification
      if (vendor) {
        await sendPaymentNotification({
          ...vendor,
          url: `${import.meta.env.VITE_ARTPAY_WEB_SERVICE}/api/test/notification`,
        }, orderResp);
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
  }, [data, user, vendor, searchParamsData]);

  const fetchPaymentDetails = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setPaymentData({ loading: true });

      const orderResp = await findOrder();
      const { hasPaymentIntent } = searchParamsData;

      if (!orderResp && !hasPaymentIntent) {
        // Clean up localStorage and redirect
        [LOCAL_STORAGE_KEYS.CDS_ORDER, LOCAL_STORAGE_KEYS.SHOW_CHECKOUT, LOCAL_STORAGE_KEYS.CHECKOUT_URL]
          .forEach(key => localStorage.removeItem(key));
        navigate("/");
        return;
      }

      if (!orderResp) return;

      // Handle completed order early return
      if (orderResp.status === ORDER_STATUS.COMPLETED && !hasPaymentIntent) {
        console.log("Payment completed:", orderResp);
        setPaymentData({
          order: orderResp,
          paymentStatus: orderResp.status,
          paymentMethod: orderResp.payment_method,
          paymentIntent: null,
          loading: false,
        });
        clearLocalStorage(orderResp);
        return;
      }

      // Load user and vendor data in parallel
      const additionalData = await loadUserAndVendor(orderResp);

      // Update payment data with additional data
      if (Object.keys(additionalData).length > 0) {
        setPaymentData(additionalData);
      }

      // Handle payment intent processing
      let finalOrder = orderResp;
      if (hasPaymentIntent) {
        finalOrder = await handlePaymentIntent(orderResp);
      }

      // Final payment data update
      setPaymentData({
        order: finalOrder,
        paymentStatus: finalOrder?.status,
        paymentMethod: finalOrder?.payment_method,
        orderNote: finalOrder?.customer_note,
        loading: false,
      });

    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentData({ loading: false });
    } finally {
      isProcessingRef.current = false;
    }
  }, [findOrder, loadUserAndVendor, handlePaymentIntent, setPaymentData, navigate, searchParamsData]);

  useEffect(() => {
    void fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  return <>{children}</>;
};

export default CdsTransactionsProvider;
