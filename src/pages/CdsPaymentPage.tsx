import CdsTransactionLayout from "../features/cdspayments/layouts/cdstransactionlayout/CdsTransactionLayout.tsx";
import { Order } from "../types/order.ts";
import PaymentMethodsList from "../features/cdspayments/components/paymentmethodslist/PaymentMethodsList.tsx";
import usePaymentStore from "../features/cdspayments/store.ts";
import Payments from "../features/cdspayments/components/payments/Payments.tsx";
import SantanderFlow from "../features/cdspayments/components/santanderflow/SantanderFlow.tsx";
import SkeletonCard from "../features/cdspayments/components/paymentprovidercard/SkeletonCard.tsx";

const CdsPaymentPage = () => {
  const { order, paymentMethod, loading, paymentStatus } = usePaymentStore();

  const choosePaymentMethod = paymentMethod == "bnpl";


  return (
    <CdsTransactionLayout>
      {choosePaymentMethod ? (
        <PaymentMethodsList order={order as Order} isLoading={loading} />
      ) : order?.status === "on-hold" ? (
        <Payments order={order as Order} isLoading={loading} />
      ) : paymentStatus === "processing" ? (
        loading ? (
          <div className="border-t border-secondary mt-12 space-y-6 pt-12">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <SantanderFlow order={order as Order} isLoading={loading} />
        )
      ) : (
        <div className="border-t border-secondary mt-12 space-y-6 pt-12">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
    </CdsTransactionLayout>

  );
};

export default CdsPaymentPage;
