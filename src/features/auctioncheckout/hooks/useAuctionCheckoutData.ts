import { useCallback } from "react";
import { useData } from "../../../hoc/DataProvider.tsx";
import { useAuth } from "../../../hoc/AuthProvider.tsx";
import { useSearchParams } from "react-router-dom";
import type { PaymentIntent } from "@stripe/stripe-js";
import type { Order } from "../../../types/order.ts";
import type { Artwork } from "../../../types/artwork.ts";
import useAuctionCheckoutStore from "../stores/auctionCheckoutStore.ts";
import { PAYMENT_METHODS } from "../utils/constants.ts";
import type { FlashOrderResponse } from "../types.ts";

/**
 * Hook for data loading and API integration
 */
export const useAuctionCheckoutData = () => {
  const data = useData();
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  const {
    setAuctionCheckoutData,
    updateState,
    updatePageData,
  } = useAuctionCheckoutStore();

  /**
   * Load initial data from URL params
   */
  const loadInitialData = useCallback(async () => {
    updateState({ loading: true });

    try {
      // Extract order_id from URL
      const orderKey = searchParams.get("order_id");

      if (!orderKey) {
        console.error("No order_id in URL params");
        updateState({ loading: false });
        return;
      }

      console.log("Loading auction order:", orderKey);

      // Call flashOrder API to retrieve flash order response
      const flashOrderResponse = await data.flashOrder(orderKey) as unknown as FlashOrderResponse;

      if (!flashOrderResponse || !flashOrderResponse.artpay_id) {
        console.error("Order not found:", orderKey);
        updateState({ loading: false });
        return;
      }

      console.log("Flash order response:", flashOrderResponse);

      // Get full WooCommerce order using order_key (guest-accessible)
      // Instead of getOrder(id), use WooCommerce API with order_key parameter
      let order: Order | null = null;

      try {
        // Try to get order via WooCommerce API with order_key
        const authHeader = auth.isAuthenticated ? auth.getAuthToken() : auth.getGuestAuth();
        const ordersResponse = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/wp-json/wc/v3/orders?order_key=${orderKey}`,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        if (ordersResponse.ok) {
          const orders = await ordersResponse.json();
          if (orders && orders.length > 0) {
            order = orders[0];
            console.log("Full WooCommerce order loaded via order_key:", order);
          }
        }
      } catch (err) {
        console.error("Error fetching order via order_key:", err);
      }

      // Fallback: if authenticated, try getOrder with artpay_id
      if (!order && auth.isAuthenticated) {
        try {
          order = await data.getOrder(flashOrderResponse.artpay_id);
          console.log("Order loaded via getOrder (authenticated):", order);
        } catch (err) {
          console.error("Error in getOrder:", err);
        }
      }

      if (!order) {
        console.error("Could not load order");
        updateState({ loading: false });
        return;
      }

      // Store order key and order
      updatePageData({ orderKey, order });

      // Check if already completed
      if (order.status === "completed") {
        console.log("Order already completed, redirecting...");
        updateState({ isReady: true, loading: false });
        return;
      }

      // Check if user is authenticated
      const isAuthenticated = auth.isAuthenticated;

      if (isAuthenticated) {
        console.log("User is authenticated, regaining order...");

        try {
          // Associate order with logged-in user
          await data.regainFlashOrder({ order_id: orderKey });

          // Load user profile to pre-fill billing data
          const profile = await data.getUserProfile();

          if (profile?.billing) {
            updatePageData({ guestData: profile.billing });
            updateState({
              isGuest: false,
              formValid: true, // Skip guest form for authenticated users
            });
          }
        } catch (error) {
          console.error("Error regaining order:", error);
          // Continue as guest if regain fails
          updateState({ isGuest: true, formValid: false });
        }
      } else {
        console.log("User is guest");

        // Pre-fill guest email from flash order response
        const guestEmail = flashOrderResponse.email || flashOrderResponse.billing_address?.email;

        if (guestEmail) {
          updatePageData({
            guestData: {
              email: guestEmail,
              first_name: "",
              last_name: "",
              address_1: "",
              city: "",
              postcode: "",
              country: "IT",
              phone: "",
              codice_fiscale: "",
            },
          });
          console.log("Pre-filled guest email:", guestEmail);
        }

        updateState({ isGuest: true, formValid: false });
      }

      // Load artwork data (if available in order)
      if (order.line_items && order.line_items.length > 0) {
        const productId = order.line_items[0].product_id?.toString();

        if (productId) {
          try {
            const artwork = await data.getArtwork(productId);
            updatePageData({ artwork });
          } catch (error) {
            console.error("Error loading artwork:", error);
          }
        }
      }

      // Set ready state
      updateState({ isReady: true, loading: false });
    } catch (error) {
      console.error("Error loading initial data:", error);
      updateState({ loading: false });
    }
  }, [data, auth, searchParams, setAuctionCheckoutData, updateState, updatePageData]);

  /**
   * Create payment intent for auction order
   */
  const createPaymentIntent = useCallback(
    async (order: Order, paymentMethod: string): Promise<PaymentIntent | null> => {
      try {
        console.log("Creating payment intent for method:", paymentMethod);

        // Call CDS payment intent endpoint
        const intent = await data.createPaymentIntentCds({
          wc_order_key: order.order_key as string,
        });

        // If Klarna, update fee
        if (paymentMethod === PAYMENT_METHODS.KLARNA) {
          console.log("Updating Klarna fee...");
          const updatedIntent = await data.updatePaymentIntentCds({
            wc_order_key: order.order_key as string,
            payment_method: paymentMethod,
          });

          return updatedIntent;
        }

        return intent;
      } catch (error) {
        console.error("Error creating payment intent:", error);
        return null;
      }
    },
    [data]
  );

  /**
   * Refresh order to get updated fees
   */
  const refreshOrder = useCallback(async () => {
    const { orderKey, order: currentOrder } = useAuctionCheckoutStore.getState();

    if (!orderKey) {
      console.error("No order key to refresh");
      return;
    }

    try {
      console.log("Refreshing order with order_key:", orderKey);

      // Use same pattern as loadInitialData
      const authHeader = auth.isAuthenticated ? auth.getAuthToken() : auth.getGuestAuth();
      const ordersResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/wp-json/wc/v3/orders?order_key=${orderKey}`,
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        if (orders && orders.length > 0) {
          const updatedOrder = orders[0];
          console.log("Order refreshed:", updatedOrder);

          // Preserve email and billing_address from current order
          if (currentOrder) {
            const preservedEmail = (currentOrder as any).email || currentOrder.billing_email;
            const preservedBillingAddress = (currentOrder as any).billing_address || currentOrder.billing;

            if (preservedEmail) {
              (updatedOrder as any).email = preservedEmail;
              if (!updatedOrder.billing_email) {
                updatedOrder.billing_email = preservedEmail;
              }
            }

            if (preservedBillingAddress) {
              (updatedOrder as any).billing_address = preservedBillingAddress;
            }
          }

          updatePageData({ order: updatedOrder });
          return;
        }
      }

      // Fallback: if authenticated and we have order, use getOrder
      if (auth.isAuthenticated && currentOrder) {
        const updatedOrder = await data.getOrder(currentOrder.id);
        if (updatedOrder) {
          updatePageData({ order: updatedOrder });
        }
      }
    } catch (error) {
      console.error("Error refreshing order:", error);
    }
  }, [data, auth, updatePageData]);

  /**
   * Log error helper
   */
  const logError = useCallback((err?: unknown) => {
    console.error("Auction checkout error:", err);
  }, []);

  return {
    loadInitialData,
    createPaymentIntent,
    refreshOrder,
    logError,
  };
};