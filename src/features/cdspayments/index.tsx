import { useMemo } from "react";
import usePaymentStore from "./stores/paymentStore.ts";
import PaymentMethodsList from "./components/paymentmethodslist/PaymentMethodsList.tsx";
import type { Order } from "../../types/order.ts";
import CdsTransactionLayout from "./layouts/cdstransactionlayout/CdsTransactionLayout.tsx";
import ConfirmPayment from "./components/confirmpayment/ConfirmPayment.tsx";
import SantanderFlow from "./components/santanderflow/SantanderFlow.tsx";
import PaymentFailed from "./components/paymentfailed/PaymentFailed.tsx";
import PaymentComplete from "./components/paymentcomplete/PaymentComplete.tsx";

// Constants
const PAYMENT_METHODS = {
  BNPL: "bnpl",
  KLARNA: "klarna", 
  SANTANDER: "santander"
} as const;

const PAYMENT_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed", 
  FAILED: "failed",
  ON_HOLD: "on-hold"
} as const;

const CdsPayments = () => {
  const { order, paymentMethod, paymentStatus, loading, orderNote } = usePaymentStore();

  // Memoized conditions for better performance and clarity
  const paymentStage = useMemo(() => {
    // Priority order matters here
    if (paymentStatus === PAYMENT_STATUS.COMPLETED) return 'completed';
    if (paymentStatus === PAYMENT_STATUS.FAILED) return 'failed'; 
    if (paymentStatus === PAYMENT_STATUS.PROCESSING) return 'processing';
    if (paymentMethod === PAYMENT_METHODS.BNPL || !paymentMethod) return 'selection';
    
    // Any other payment method selected but not yet processing/completed/failed
    return 'confirmation';
  }, [paymentMethod, paymentStatus]);

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log({
      paymentMethod: order?.payment_method,
      paymentTotal: order?.total,
      paymentStage,
      orderNote,
      order
    });
  }

  const renderContent = () => {
    // Show loading skeletons when order is not loaded yet
    if (!order || loading) {
      switch (paymentStage) {
        case 'confirmation':
          return <ConfirmPayment order={order as Order} isLoading={true} />;
        
        case 'processing':
          return <SantanderFlow order={order as Order} isLoading={true} />;
        
        case 'completed':
          return <PaymentComplete order={order as Order} isLoading={true} />;
        
        case 'failed':
          return <PaymentFailed order={order as Order} isLoading={true} />;
        
        default:
          return <PaymentMethodsList order={order as Order} isLoading={true} />;
      }
    }

    switch (paymentStage) {
      case 'selection':
        return <PaymentMethodsList order={order} isLoading={false} />;
      
      case 'confirmation':
        return <ConfirmPayment order={order} isLoading={false} />;
      
      case 'processing':
        return <SantanderFlow order={order} isLoading={false} />;
      
      case 'completed':
        return <PaymentComplete order={order} isLoading={false} />;
      
      case 'failed':
        return <PaymentFailed order={order} isLoading={false} />;
      
      default:
        return <PaymentMethodsList order={order} isLoading={false} />;
    }
  };

  return (
    <CdsTransactionLayout>
      {renderContent()}
    </CdsTransactionLayout>
  );
};

export default CdsPayments;