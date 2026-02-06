import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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

const CdsTransactionsProvider = ({ children }: { children: ReactNode }) => {
  const data = useData();
  const { setPaymentData, vendor, user, userChoiceMade } = usePaymentStore();
  const navigate = useNavigate();
  const location = useLocation();
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

    // Try to get order from URL params first using flashOrder endpoint
    if (orderParam) {
      const flashOrderResponse = await data.flashOrder(orderParam);
      console.log("FlashOrder response:", flashOrderResponse);
      console.log("FlashOrder email:", flashOrderResponse?.email);

      if (flashOrderResponse) {
        // FlashOrder response has billing_address already populated
        // We need to merge this with WooCommerce order
        try {
          const orderResp = await data.getOrder(flashOrderResponse?.artpay_id);
          console.log("WooCommerce order before merge:", orderResp);
          console.log("WooCommerce order email before merge:", orderResp?.email);
          console.log("WooCommerce order billing_email before merge:", orderResp?.billing_email);

          if (orderResp) {
            console.log("Order found in URL params");
            localStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO_ACQUISTO_ESTERNO, "true");

            // Preserve email and billing_address from flashOrder if order doesn't have them
            if (flashOrderResponse.email) {
              (orderResp as any).email = flashOrderResponse.email;
              if (!orderResp.billing_email) {
                orderResp.billing_email = flashOrderResponse.email;
              }
              console.log("Merged email from flashOrder:", flashOrderResponse.email);
              console.log("Order after email merge:", orderResp.email, orderResp.billing_email);
            } else {
              console.warn("FlashOrder response has no email!");
            }

            if (flashOrderResponse.billing_address &&
                (!orderResp.billing || !orderResp.billing.first_name)) {
              orderResp.billing = flashOrderResponse.billing_address;
              (orderResp as any).billing_address = flashOrderResponse.billing_address;
              console.log("Merged billing_address from flashOrder:", orderResp.billing);
            }

            return orderResp;
          }
        } catch (err) {
          console.error("Error fetching WooCommerce order:", err);
          // Fallback: use flashOrder response directly
          // Cast it to look like an Order for compatibility
          const baseTotal = Number(flashOrderResponse.auction_details?.base_total || 0);
          const platformFee = Number(flashOrderResponse.auction_details?.platform_fee || 0);
          const total = baseTotal + platformFee;

          const fallbackOrder: any = {
            ...flashOrderResponse,
            id: flashOrderResponse.artpay_id,
            order_key: flashOrderResponse.id,
            email: flashOrderResponse.email,
            billing: flashOrderResponse.billing_address,
            billing_email: flashOrderResponse.email,
            billing_address: flashOrderResponse.billing_address,
            shipping: flashOrderResponse.shipping_address,
            shipping_address: flashOrderResponse.shipping_address,
            total: total.toFixed(2),
            created_via: 'gallery_auction',
            line_items: [],
            // Use fee_lines instead of meta_data because values are already with VAT included
            fee_lines: [
              {
                id: 0,
                name: 'Auction Item',
                tax_class: '',
                tax_status: 'taxable',
                total: baseTotal.toFixed(2),  // Already includes VAT
                total_tax: '0',
              },
              {
                id: 1,
                name: 'Commissione Artpay',
                tax_class: '',
                tax_status: 'taxable',
                total: platformFee.toFixed(2),  // Already includes VAT
                total_tax: '0',
              }
            ],
            meta_data: [],
          };

          return fallbackOrder;
        }
      }
    }

    // Try to get from localStorage externalOrderKey
    const externalOrderKey = localStorage.getItem("externalOrderKey");
    if (externalOrderKey) {
      const flashOrderResponse = await data.flashOrder(externalOrderKey);
      if (flashOrderResponse) {
        console.log("Order found from localStorage externalOrderKey");

        // Try to get WooCommerce order
        try {
          const orderResp = await data.getOrder(flashOrderResponse?.artpay_id);
          if (orderResp) {
            // Preserve email and billing_address from flashOrder if order doesn't have them
            if (flashOrderResponse.email) {
              (orderResp as any).email = flashOrderResponse.email;
              if (!orderResp.billing_email) {
                orderResp.billing_email = flashOrderResponse.email;
              }
              console.log("Merged email from flashOrder:", flashOrderResponse.email);
            }

            if (flashOrderResponse.billing_address &&
                (!orderResp.billing || !orderResp.billing.first_name)) {
              orderResp.billing = flashOrderResponse.billing_address;
              (orderResp as any).billing_address = flashOrderResponse.billing_address;
              console.log("Merged billing_address from flashOrder:", orderResp.billing);
            }

            return orderResp;
          }
        } catch (err) {
          console.error("Error fetching WooCommerce order:", err);
          // Fallback to flashOrder response
          return flashOrderResponse;
        }
      }
    }

    // Try to get from localStorage CdsOrder
    const cdsOrderString = localStorage.getItem(LOCAL_STORAGE_KEYS.CDS_ORDER);
    if (cdsOrderString) {
      const cdsOrder = safeParseJSON(cdsOrderString);
      if (cdsOrder?.order_key) {
        const flashOrderResponse = await data.flashOrder(cdsOrder.order_key);
        if (flashOrderResponse) {
          console.log("Order found from localStorage CdsOrder");

          // Try to get WooCommerce order
          try {
            const orderResp = await data.getOrder(flashOrderResponse?.artpay_id);
            if (orderResp) {
              // Preserve email and billing_address from flashOrder if order doesn't have them
              if (flashOrderResponse.email) {
                (orderResp as any).email = flashOrderResponse.email;
                if (!orderResp.billing_email) {
                  orderResp.billing_email = flashOrderResponse.email;
                }
                console.log("Merged email from flashOrder:", flashOrderResponse.email);
              }

              if (flashOrderResponse.billing_address &&
                  (!orderResp.billing || !orderResp.billing.first_name)) {
                orderResp.billing = flashOrderResponse.billing_address;
                (orderResp as any).billing_address = flashOrderResponse.billing_address;
                console.log("Merged billing_address from flashOrder:", orderResp.billing);
              }

              return orderResp;
            }
          } catch (err) {
            console.error("Error fetching WooCommerce order:", err);
            // Fallback to flashOrder response
            return flashOrderResponse;
          }
        }
      }
    }

    return null;
  }, [data, searchParamsData]);

  const loadUserAndVendor = useCallback(async (orderResp: any) => {
    const promises = [];

    // Load user if not present (optional - non fa fallire se l'utente non è autenticato)
    if (!user) {
      promises.push(
        data.getUserProfile()
          .then(resp => {
            if (!resp) return null;
            return { type: 'user', data: resp };
          })
          .catch(error => {
            console.log("User not authenticated, continuing as guest:", error);
            return null; // Non fa fallire se l'utente non è autenticato
          })
      );
    }

    // Load vendor if not present
    if (!vendor && orderResp?.line_items?.[0]?.product_id) {
      const productId = orderResp.line_items[0].product_id.toString();

      promises.push(
        data.getArtwork(productId).then(async (artworkResp: Artwork) => {
          if (!artworkResp) throw new Error("Artwork not found");

          const vendorResp: Gallery = await data.getGallery(artworkResp.vendor as string);
          if (!vendorResp) throw new Error("Vendor not found");

          return { type: 'vendor', data: vendorResp };
        })
      );
    }

    if (promises.length === 0) return {};

    const results = await Promise.all(promises);
    const updates: any = {};

    results.forEach(result => {
      if (result) { // Ignora i risultati null
        updates[result.type] = result.data;
      }
    });

    return updates;
  }, [data, user, vendor]);

  const handlePaymentIntent = useCallback(async (orderResp: any) => {
    const { redirectStatus } = searchParamsData;

    if (redirectStatus === REDIRECT_STATUS.SUCCEEDED) {
      // Check if payment method is santander (customer_balance/bank transfer)
      const isSantander = orderResp.payment_method === "santander";

      let updateOrderStatus;

      if (isSantander) {
        // For Santander/bank transfer, keep order in processing and add note
        updateOrderStatus = await data.updateCdsOrder(orderResp.id, {
          status: ORDER_STATUS.PROCESSING,
          customer_note: "In attesa dell'accredito del bonifico bancario"
        });
        if (!updateOrderStatus) throw new Error("Error updating order");

        console.log("Santander payment confirmed - order in processing, awaiting bank transfer");
      } else {
        // For other payment methods, complete the order normally
        updateOrderStatus = await data.setCdsOrderStatus(orderResp.id, ORDER_STATUS.COMPLETED);
        if (!updateOrderStatus) throw new Error("Error completing order");
      }

      // Handle billing update for receipts
      if (user?.billing?.invoice_type === INVOICE_TYPE.RECEIPT) {
        const billing = user.billing || user.shipping;
        updateOrderStatus = await data.updateCdsOrder(orderResp.id, { billing });
      }

      // Send notification (only for completed orders, not for Santander awaiting transfer)
      if (vendor && !isSantander) {
        await sendPaymentNotification({
          ...vendor,
          url: `${import.meta.env.VITE_ARTPAY_WEB_SERVICE}/api/test/notification`,
        }, orderResp);
      }

      clearLocalStorage(orderResp);
      return updateOrderStatus;

    } else if (redirectStatus === REDIRECT_STATUS.FAILED) {
      // Use order id for CDS orders
      const updateOrderStatus = await data.setCdsOrderStatus(orderResp.id, ORDER_STATUS.FAILED);
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
      console.log("Order Response:", orderResp);
      console.log("Order fee_lines:", orderResp?.fee_lines);
      console.log("Order meta_data:", orderResp?.meta_data);
      console.log("Order total:", orderResp?.total);
      console.log("Order user_registered:", (orderResp as any)?.user_registered);
      const { hasPaymentIntent } = searchParamsData;

      if (!orderResp && !hasPaymentIntent) {
        // Per utenti non autenticati senza parametro order, mostra errore invece di redirect
        const { orderParam } = searchParamsData;
        if (!orderParam) {
          console.warn("Nessun ordine trovato. Parametro order mancante.");
        }

        // Clean up localStorage and redirect solo se non siamo già sulla homepage
        [LOCAL_STORAGE_KEYS.CDS_ORDER, LOCAL_STORAGE_KEYS.SHOW_CHECKOUT, LOCAL_STORAGE_KEYS.CHECKOUT_URL]
          .forEach(key => localStorage.removeItem(key));

        if (location.pathname !== "/") {
          navigate("/");
        }
        return;
      }

      if (!orderResp) return;

      // Check if user is registered and not authenticated
      const userRegistered = (orderResp as any)?.user_registered;
      console.log("Checking user_registered:", {
        userRegistered,
        user,
        userChoiceMade,
        shouldShowModal: userRegistered && !user && !userChoiceMade
      });

      // Only show modal if user is registered, not authenticated, and hasn't made a choice yet
      if (userRegistered && !user && !userChoiceMade) {
        console.log("✅ User registered but not authenticated - showing modal");
        setPaymentData({
          order: orderResp,
          showUserRegisteredModal: true,
          userRegistered: true,
          loading: false,
        });
        return;
      } else {
        console.log("❌ Not showing modal because:", {
          userRegistered,
          hasUser: !!user,
          userChoiceMade
        });
      }

      // If user is logged in and order has user_registered=true, verify email matches
      if (user && userRegistered) {
        const orderEmail = (orderResp as any)?.email || orderResp?.billing_email;
        const userEmail = user.email || user.billing?.email;

        console.log("Checking email match:", {
          orderEmail,
          userEmail,
          match: orderEmail === userEmail
        });

        if (orderEmail && userEmail && orderEmail !== userEmail) {
          console.error("⚠️ Email mismatch: logged user email doesn't match order email");
          // Force logout and show modal again
          setPaymentData({
            user: undefined,
            showUserRegisteredModal: true,
            userRegistered: true,
            userChoiceMade: false,
            loading: false,
          });
          return;
        }
      }

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

      // Check if guest form should be skipped
      const isAuthenticated = !!additionalData.user;
      const hasBillingData = (orderResp.billing?.first_name && orderResp.billing?.last_name) ||
                             (orderResp.billing_address?.first_name && orderResp.billing_address?.last_name);

      if (isAuthenticated || hasBillingData) {
        console.log("Skipping guest form - authenticated or has billing data");
        setPaymentData({ guestFormCompleted: true });
      }

      // Handle payment intent processing
      let finalOrder = orderResp;
      if (hasPaymentIntent) {
        finalOrder = await handlePaymentIntent(orderResp);
      }

      // Final payment data update
      console.log("Setting payment data with order:", finalOrder);
      console.log("Order email before setting payment data:", (finalOrder as any)?.email);
      console.log("Order billing_email before setting payment data:", finalOrder?.billing_email);

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
  }, [findOrder, loadUserAndVendor, handlePaymentIntent, setPaymentData, navigate, searchParamsData, location.pathname]);

  useEffect(() => {
    void fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  return <>{children}</>;
};

export default CdsTransactionsProvider;
