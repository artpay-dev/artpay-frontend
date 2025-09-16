import { useCallback } from "react";
import { useData } from "../../../hoc/DataProvider.tsx";
import { useAuth } from "../../../hoc/AuthProvider.tsx";
import { useParams } from "react-router-dom";
import { PaymentIntent } from "@stripe/stripe-js";
import { Order } from "../../../types/order.ts";
import { areBillingFieldsFilled, artworksToGalleryItems } from "../../../utils.ts";
import useDirectPurchaseStore from "../stores/directPurchaseStore.ts";

export const useDirectPurchaseData = () => {
  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();
  
  const {
    orderMode,
    setDirectPurchaseData,
    updateState,
    updatePageData,
  } = useDirectPurchaseStore();

  const createPaymentIntent = useCallback(async (resp: Order, orderMode: string): Promise<PaymentIntent> => {
    if (resp.payment_method === "bnpl" && orderMode === "redeem") {
      resp.payment_method = "";
      return await data.createRedeemIntent({ wc_order_key: resp.order_key });
    }
    
    const intentMap: Record<string, () => Promise<PaymentIntent>> = {
      loan: () => data.createBlockIntent({ wc_order_key: resp.order_key }),
      redeem: () => data.createRedeemIntent({ wc_order_key: resp.order_key }),
      default: () => data.createPaymentIntent({ wc_order_key: resp.order_key }),
    };
    
    return await (intentMap[orderMode] || intentMap.default)();
  }, [data]);

  const logError = useCallback((err?: unknown) => {
    console.error(err);
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!auth.isAuthenticated) {
      try {
        const resp = await data.getPendingOrder();
        if (resp) {
          const artworks = await Promise.all(
            resp.line_items.map((item) => data.getArtwork(item.product_id.toString())),
          );
          updatePageData({ 
            pendingOrder: resp, 
            artworks: artworksToGalleryItems(artworks, undefined, data) 
          });
        }
        updateState({ isReady: true });
      } catch (e) {
        logError(e);
      }
      return;
    }

    const getOrderFunction = 
      orderMode === "redeem" && urlParams.order_id
        ? data.getOrder(+urlParams.order_id)
        : orderMode === "onHold"
          ? data.getOnHoldOrder()
          : data.getPendingOrder();

    try {
      const [userProfile, shippingMethods, order] = await Promise.all([
        data.getUserProfile().then((resp) => {
          const profile = { ...resp };
          profile.shipping.email = profile.shipping.email || profile.email || "";
          profile.billing.email = profile.billing.email || profile.email || "";
          return profile;
        }),
        data.getAvailableShippingMethods(),
        getOrderFunction
      ]);

      if (order) {
        const artworks = await Promise.all(
          order.line_items.map((item) => data.getArtwork(item.product_id.toString())),
        );
        const artworkItems = artworksToGalleryItems(artworks, undefined, data);
        const paymentIntent = await createPaymentIntent(order, orderMode);

        updatePageData({ 
          userProfile,
          availableShippingMethods: shippingMethods,
          pendingOrder: order, 
          artworks: artworkItems, 
          paymentIntent 
        });

        updateState({
          shippingDataEditing: !areBillingFieldsFilled(userProfile.shipping) || 
            (!areBillingFieldsFilled(userProfile.billing) && orderMode === "loan"),
          requireInvoice: userProfile?.billing?.invoice_type !== ""
        });

        // Load galleries
        data.getGalleries(artworks.map((a) => +a.vendor))
          .then((galleries) => updatePageData({ galleries }));
      } else {
        updateState({ noPendingOrder: true });
      }

      updateState({ isReady: true });
    } catch (e) {
      logError(e);
      updateState({ isReady: true });
    }
  }, [auth.isAuthenticated, orderMode, urlParams.order_id, data, createPaymentIntent, updatePageData, updateState, logError]);

  const initialize = useCallback((initialOrderMode: "standard" | "loan" | "redeem" | "onHold" = "standard") => {
    setDirectPurchaseData({ orderMode: initialOrderMode });
  }, [setDirectPurchaseData]);

  return {
    initialize,
    loadInitialData,
    createPaymentIntent,
    logError
  };
};