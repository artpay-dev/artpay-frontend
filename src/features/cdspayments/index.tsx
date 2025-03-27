import usePaymentStore from "./store.ts";
import PaymentMethodsList from "./components/paymentmethodslist/PaymentMethodsList.tsx";
import { Order } from "../../types/order.ts";
import Payments from "./components/payments/Payments.tsx";
import CdsTransactionLayout from "./layouts/cdstransactionlayout/CdsTransactionLayout.tsx";


const CdsPayments = () => {
  const { order, paymentMethod, loading } = usePaymentStore();

  const choosePaymentMethod = paymentMethod == "bnpl";

  console.log('Payment Method:',order?.payment_method)
  console.log('Payment total:',order?.total)

  return (
    <CdsTransactionLayout>
      {choosePaymentMethod && <PaymentMethodsList order={order as Order} isLoading={loading} /> }
      {!choosePaymentMethod && <Payments order={order as Order} isLoading={loading} /> }
    </CdsTransactionLayout>
  );
};

export default CdsPayments;


/*
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
</CdsTransactionLayout>*/
