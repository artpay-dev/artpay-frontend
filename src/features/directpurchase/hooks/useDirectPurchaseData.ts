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

    // Per gli ordini deposit, usa l'endpoint dedicato /adp/v1/balance/pay
    if (orderMode === "deposit") {
      return await data.payDepositBalance(resp.id);
    }

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
    // Imposta loading a true all'inizio
    updateState({ loading: true });

    // Prima cosa: controlla se c'è un order_id nei parametri URL
    if (urlParams.order_id) {
      console.log("Order ID found in URL params:", urlParams.order_id);

      try {
        // Carica l'ordine specificato
        const order = await data.getOrder(+urlParams.order_id);

        if (order) {
          console.log("Order loaded:", order);

          // Carica anche il profilo utente se autenticato
          let userProfile = null;
          let availableShippingMethods = null;

          if (auth.isAuthenticated) {
            [userProfile, availableShippingMethods] = await Promise.all([
              data.getUserProfile().then((resp) => {
                const profile = { ...resp };
                profile.shipping.email = profile.shipping.email || profile.email || "";
                profile.billing.email = profile.billing.email || profile.email || "";
                return profile;
              }),
              data.getAvailableShippingMethods()
            ]);
          }

          // Carica le opere dell'ordine
          const artworks = await Promise.all(
            order.line_items.map((item) => data.getArtwork(item.product_id.toString())),
          );
          const artworkItems = artworksToGalleryItems(artworks, undefined, data);

          // Aggiorna lo stato con i dati dell'ordine
          const pageData: any = {
            pendingOrder: order,
            artworks: artworkItems
          };

          if (userProfile) pageData.userProfile = userProfile;
          if (availableShippingMethods) pageData.availableShippingMethods = availableShippingMethods;

          updatePageData(pageData);

          // Gestione basata sullo stato dell'ordine
          if (order.status === "completed") {
            console.log("Order is completed - no payment method setup needed");
            updateState({
              paymentMethod: null,
              checkoutReady: false
            });
          } else if (order.status === "pending" || order.status === "on-hold") {
            console.log("Order is pending/on-hold - setting up payment method");

            // Gestione del payment method basata sull'orderMode
            if (orderMode === "loan") {
              const supportedMethods = ["card", "paypal", "revolut_pay", "google_pay"];
              const methodToUse = order.payment_method && supportedMethods.includes(order.payment_method)
                ? order.payment_method
                : "card";

              updateState({ paymentMethod: methodToUse });

              try {
                const paymentIntent = await createPaymentIntent(order, orderMode, methodToUse);
                updatePageData({ paymentIntent });
              } catch (e) {
                console.error("Error creating payment intent for loan:", e);
              }
            } else {
              const supportedMethods = ["card", "klarna", "paypal", "revolut_pay", "google_pay"];

              if (order.payment_method && supportedMethods.includes(order.payment_method)) {
                updateState({ paymentMethod: order.payment_method });

                try {
                  const paymentIntent = await createPaymentIntent(order, orderMode);
                  updatePageData({ paymentIntent });
                } catch (e) {
                  console.error("Error creating payment intent:", e);
                }
              } else {
                updateState({ paymentMethod: null });
              }
            }
          }

          // Configurazioni aggiuntive se autenticato
          if (userProfile) {
            updateState({
              shippingDataEditing: !areBillingFieldsFilled(userProfile.shipping) ||
                (!areBillingFieldsFilled(userProfile.billing) && orderMode === "loan"),
              requireInvoice: userProfile?.billing?.invoice_type !== ""
            });

            // Load galleries
            data.getGalleries(artworks.map((a) => +a.vendor))
              .then((galleries) => updatePageData({ galleries }));
          }

          updateState({ isReady: true, loading: false });
          return; // Exit early since we handled the order
        } else {
          console.log("Order not found");
          updateState({ noPendingOrder: true, isReady: true, loading: false });
          return;
        }
      } catch (e) {
        console.error("Error loading order from URL params:", e);
        logError(e);
        updateState({ noPendingOrder: true, isReady: true, loading: false });
        return;
      }
    }

    // Flusso originale se non c'è order_id nei parametri
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
            const supportedMethods = ["card", "paypal", "revolut_pay", "google_pay"];
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
            const supportedMethods = ["card", "klarna", "paypal", "revolut_pay", "google_pay"];

            // NON sovrascrivere se l'utente ha già selezionato un metodo e c'è un payment intent
            if (currentPaymentMethod && currentPaymentIntent && supportedMethods.includes(currentPaymentMethod)) {
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
        updateState({ isReady: true, loading: false });
      } catch (e) {
        logError(e);
        updateState({ loading: false });
      }
      return;
    }

    const getOrderFunction =
      orderMode === "redeem" || orderMode === "deposit" || urlParams.order_id
        ? data.getOrder(+(urlParams?.order_id ?? 0))
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

        console.log(order)
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
          const supportedMethods = ["card", "paypal", "revolut_pay", "google_pay"];
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
          const supportedMethods = ["card", "klarna", "paypal", "revolut_pay", "google_pay"];

          // NON sovrascrivere se l'utente ha già selezionato un metodo e c'è un payment intent
          if (currentPaymentMethod && currentPaymentIntent && supportedMethods.includes(currentPaymentMethod)) {
            updateState({ loading: false });
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

      updateState({ isReady: true, loading: false });
    } catch (e) {
      logError(e);
      updateState({ isReady: true, loading: false });
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