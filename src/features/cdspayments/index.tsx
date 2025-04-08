import usePaymentStore from "./store.ts";
import PaymentMethodsList from "./components/paymentmethodslist/PaymentMethodsList.tsx";
import { Order } from "../../types/order.ts";
import CdsTransactionLayout from "./layouts/cdstransactionlayout/CdsTransactionLayout.tsx";
import ConfirmPayment from "./components/confirmpayment/ConfirmPayment.tsx";
import SantanderFlow from "./components/santanderflow/SantanderFlow.tsx";
import PaymentComplete from "./components/paymentcomplete/PaymentComplete.tsx";


const CdsPayments = () => {
  const { order, paymentMethod, paymentStatus , loading } = usePaymentStore();

  const choosePaymentMethod = paymentMethod == "bnpl" ;
  const processedOrder = paymentStatus == "processing" ;
  const completedOrder = paymentStatus == "completed" ;

  console.log('Payment Method:',order?.payment_method)
  console.log('Payment total:',order?.total)
  console.log('Order:',order)

  return (
    <CdsTransactionLayout>
      {choosePaymentMethod && !completedOrder && <PaymentMethodsList order={order as Order} isLoading={loading} /> }
      {!choosePaymentMethod && !processedOrder && !completedOrder && <ConfirmPayment order={order as Order} isLoading={loading} /> }
      {processedOrder && (<SantanderFlow order={order as Order} isLoading={loading} />)}
      {completedOrder && <PaymentComplete order={order as Order} isLoading={loading} />}
    </CdsTransactionLayout>
  );
};

export default CdsPayments;