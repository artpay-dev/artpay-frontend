import { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider";
import { useAuth } from "../hoc/AuthProvider";
import { useParams } from "react-router-dom";
import { PaymentIntent } from "@stripe/stripe-js";
import { Order, ShippingMethodOption } from "../types/order";
import { UserProfile } from "../types/user";
import { ArtworkCardProps } from "../components/ArtworkCard";
import { Gallery } from "../types/gallery";
import { areBillingFieldsFilled, artworksToGalleryItems } from "../utils";

export interface PurchaseState {
  isReady: boolean;
  paymentsReady: boolean;
  paymentMethod: string | null;
  isSaving: boolean;
  checkoutReady: boolean;
  noPendingOrder: boolean;
  shippingDataEditing: boolean;
  requireInvoice: boolean;
  privacyChecked: boolean;
  showCommissioni: boolean;
  subtotal: number;
}

export interface PurchaseData {
  userProfile?: UserProfile;
  availableShippingMethods: ShippingMethodOption[];
  pendingOrder?: Order;
  paymentIntent?: PaymentIntent;
  artworks: ArtworkCardProps[];
  galleries: Gallery[];
}

export const usePurchaseData = (orderMode: string) => {
  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();

  const [state, setState] = useState<PurchaseState>({
    isReady: false,
    paymentsReady: false,
    paymentMethod: null,
    isSaving: false,
    checkoutReady: false,
    noPendingOrder: false,
    shippingDataEditing: false,
    requireInvoice: false,
    privacyChecked: false,
    showCommissioni: true,
    subtotal: 0
  });

  const [pageData, setPageData] = useState<PurchaseData>({
    availableShippingMethods: [],
    artworks: [],
    galleries: []
  });

  const updateState = (updates: Partial<PurchaseState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updatePageData = (updates: Partial<PurchaseData>) => {
    setPageData(prev => ({ ...prev, ...updates }));
  };

  const createPaymentIntent = async (resp: Order, orderMode: string) => {
    if (resp.payment_method === "bnpl" && orderMode === "redeem") {
      resp.payment_method = "";
      return await data.createRedeemIntent({ wc_order_key: resp.order_key });
    }
    
    const intentMap: Record<string, () => Promise<PaymentIntent>> = {
      loan: () => data.createBlockIntent({ wc_order_key: resp.order_key }),
      redeem: () => data.createRedeemIntent({ wc_order_key: resp.order_key }),
      default: () => data.createPaymentIntent({ wc_order_key: resp.order_key })
    };
    
    return await (intentMap[orderMode] || intentMap.default)();
  };

  const logError = (err?: unknown) => {
    console.error(err);
  };

  const loadInitialData = async () => {
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
  };

  useEffect(() => {
    loadInitialData();
  }, [auth.isAuthenticated, orderMode, urlParams.order_id]);

  // Calculate subtotal when order changes
  useEffect(() => {
    if (pageData.pendingOrder) {
      const totalSum = pageData.pendingOrder.line_items.reduce((acc, item) => 
        acc + parseFloat(item.total), 0);
      const totalTaxSum = pageData.pendingOrder.line_items.reduce((acc, item) => 
        acc + parseFloat(item.total_tax), 0);
      
      updateState({ subtotal: totalSum + totalTaxSum });
      localStorage.setItem("showCheckout", "true");
    }
  }, [pageData.pendingOrder]);

  return {
    state,
    pageData,
    updateState,
    updatePageData
  };
};