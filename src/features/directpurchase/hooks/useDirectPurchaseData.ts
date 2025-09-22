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

  const createPaymentIntent = useCallback(async (resp: Order, orderMode: string, paymentMethod?: string): Promise<PaymentIntent> => {
    // Usa SEMPRE il metodo passato come parametro se fornito, altrimenti quello dell'ordine
    const methodToUse = paymentMethod || resp.payment_method;

    if (resp.payment_method === "bnpl" && orderMode === "redeem") {
      return await data.createRedeemIntent({
        wc_order_key: resp.order_key as string,
        payment_method: methodToUse || ""
      });
    }

    const intentParams: any = {
      wc_order_key: resp.order_key,
      payment_method: methodToUse || ""
    };

    const intentMap: Record<string, () => Promise<PaymentIntent>> = {
      loan: () => data.createBlockIntent(intentParams),
      redeem: () => data.createRedeemIntent(intentParams),
      default: () => data.createPaymentIntent(intentParams),
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

          // Se orderMode è "loan", controlla se c'è già un metodo impostato o usa "card" di default
          if (orderMode === "loan") {
            const currentPaymentMethod = useDirectPurchaseStore.getState().paymentMethod;
            const supportedMethods = ["card", "klarna"];
            const methodToUse = currentPaymentMethod && supportedMethods.includes(currentPaymentMethod)
              ? currentPaymentMethod
              : (resp.payment_method && supportedMethods.includes(resp.payment_method)
                ? resp.payment_method
                : "card");

            updateState({ paymentMethod: methodToUse });

            try {
              const paymentIntent = await createPaymentIntent(resp, orderMode, methodToUse);
              updatePageData({ paymentIntent });
            } catch (e) {
              console.error("Error creating payment intent for loan:", e);
            }
          } else {
            // Per gli orderMode non-loan, controlla se l'utente ha già selezionato un metodo
            const currentPaymentMethod = useDirectPurchaseStore.getState().paymentMethod;
            const currentPaymentIntent = useDirectPurchaseStore.getState().paymentIntent;
            const supportedMethods = ["card", "klarna"];

            // NON sovrascrivere se l'utente ha già selezionato un metodo e c'è un payment intent
            if (currentPaymentMethod && currentPaymentIntent && supportedMethods.includes(currentPaymentMethod)) {
              console.log("Keeping existing payment method and intent (non-auth):", currentPaymentMethod);
              return; // Non fare nulla, mantieni lo stato corrente
            }

            // Imposta il paymentMethod solo se è supportato per gli altri orderMode
            if (resp.payment_method && supportedMethods.includes(resp.payment_method)) {
              updateState({ paymentMethod: resp.payment_method });

              // Crea il payment intent per il metodo esistente
              try {
                const paymentIntent = await createPaymentIntent(resp, orderMode);
                updatePageData({ paymentIntent });
              } catch (e) {
                console.error("Error creating payment intent for existing method:", e);
              }
            } else {
              updateState({ paymentMethod: null });
            }
          }
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

        updatePageData({
          userProfile,
          availableShippingMethods: shippingMethods,
          pendingOrder: order,
          artworks: artworkItems
        });

        // Se orderMode è "loan", controlla se c'è già un metodo impostato o usa "card" di default
        if (orderMode === "loan") {
          const currentPaymentMethod = useDirectPurchaseStore.getState().paymentMethod;
          const supportedMethods = ["card", "klarna"];
          const methodToUse = currentPaymentMethod && supportedMethods.includes(currentPaymentMethod)
            ? currentPaymentMethod
            : (order.payment_method && supportedMethods.includes(order.payment_method)
              ? order.payment_method
              : "card");

          updateState({ paymentMethod: methodToUse });

          try {
            const paymentIntent = await createPaymentIntent(order, orderMode, methodToUse);
            updatePageData({ paymentIntent });
          } catch (e) {
            console.error("Error creating payment intent for loan:", e);
          }
        } else {
          // Per gli orderMode non-loan, controlla se l'utente ha già selezionato un metodo
          const currentPaymentMethod = useDirectPurchaseStore.getState().paymentMethod;
          const currentPaymentIntent = useDirectPurchaseStore.getState().paymentIntent;
          const supportedMethods = ["card", "klarna"];

          // NON sovrascrivere se l'utente ha già selezionato un metodo e c'è un payment intent
          if (currentPaymentMethod && currentPaymentIntent && supportedMethods.includes(currentPaymentMethod)) {
            console.log("Keeping existing payment method and intent:", currentPaymentMethod);
            return; // Non fare nulla, mantieni lo stato corrente
          }

          // Imposta il paymentMethod solo se è supportato per gli altri orderMode
          if (order.payment_method && supportedMethods.includes(order.payment_method)) {
            updateState({ paymentMethod: order.payment_method });

            // Crea il payment intent per il metodo esistente
            try {
              const paymentIntent = await createPaymentIntent(order, orderMode);
              updatePageData({ paymentIntent });
            } catch (e) {
              console.error("Error creating payment intent for existing method:", e);
            }
          } else {
            updateState({ paymentMethod: null });
          }
        }

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
  }, [auth.isAuthenticated, orderMode, urlParams.order_id, data, updatePageData, updateState, logError]);

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