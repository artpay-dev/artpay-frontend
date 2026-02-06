import { ReactNode, useEffect } from "react";
import { AuctionCheckoutContext } from "../contexts/AuctionCheckoutContext.tsx";
import { useAuctionCheckoutData } from "../hooks/useAuctionCheckoutData.ts";
import { useAuctionCheckoutUtils } from "../hooks/useAuctionCheckoutUtils.ts";
import { useAuctionCheckoutHandlers } from "../hooks/useAuctionCheckoutHandlers.ts";
import useAuctionCheckoutStore from "../stores/auctionCheckoutStore.ts";

interface AuctionCheckoutProviderProps {
  children: ReactNode;
}

/**
 * Auction checkout provider
 * Composes hooks and provides context to children
 */
const AuctionCheckoutProvider = ({ children }: AuctionCheckoutProviderProps) => {
  // Initialize hooks
  const dataHook = useAuctionCheckoutData();
  const utilsHook = useAuctionCheckoutUtils();
  const handlersHook = useAuctionCheckoutHandlers(utilsHook.showError);

  // Get store state
  const storeState = useAuctionCheckoutStore();

  // Load initial data on mount
  useEffect(() => {
    void dataHook.loadInitialData();
  }, [dataHook.loadInitialData]);

  // Create context value by merging all hooks + store
  const contextValue = {
    // Store state
    ...storeState,

    // Data hook methods
    ...dataHook,

    // Utils hook methods
    ...utilsHook,

    // Handlers hook methods
    ...handlersHook,
  };

  return (
    <AuctionCheckoutContext.Provider value={contextValue}>
      {children}
    </AuctionCheckoutContext.Provider>
  );
};

export default AuctionCheckoutProvider;