import usePaymentStore from "./stores/paymentStore.ts";
import PaymentMethodsList from "./components/paymentmethodslist/PaymentMethodsList.tsx";
import { Order } from "../../types/order.ts";
import CdsTransactionLayout from "./layouts/cdstransactionlayout/CdsTransactionLayout.tsx";
import ConfirmPayment from "./components/confirmpayment/ConfirmPayment.tsx";
import SantanderFlow from "./components/santanderflow/SantanderFlow.tsx";
import PaymentFailed from "./components/paymentfailed/PaymentFailed.tsx";
import PaymentComplete from "./components/paymentcomplete/PaymentComplete.tsx";
import HeyLightFlow from "./components/heylightflow/HeyLightFlow.tsx";


const CdsPayments = () => {
  const { order, paymentMethod, paymentStatus , loading, orderNote } = usePaymentStore();

  const choosePaymentMethod = paymentMethod == "bnpl" ;
  const processedOrder = paymentStatus == "processing" ;
  const completedOrder = paymentStatus == "completed" ;
  const failedOrder = paymentStatus == "failed" ;

  console.log('Payment Method:',order?.payment_method)
  console.log('Payment total:',order?.total)
  console.log('Order:',order)
  console.log("Note:", orderNote)

  localStorage.setItem("checkOrder", "true");

  return (
    <CdsTransactionLayout>
      {choosePaymentMethod && !completedOrder && !failedOrder && <PaymentMethodsList order={order as Order} isLoading={loading} /> }
      {!choosePaymentMethod && !processedOrder && !completedOrder && !failedOrder && <ConfirmPayment order={order as Order} isLoading={loading} /> }
      {processedOrder && orderNote.startsWith('Ctr') && (<HeyLightFlow order={order as Order} isLoading={loading} />)}
      {processedOrder && !orderNote.startsWith('Ctr') && (<SantanderFlow order={order as Order} isLoading={loading} />)}
      {completedOrder && <PaymentComplete order={order as Order} isLoading={loading} />}
      {failedOrder && <PaymentFailed order={order as Order} isLoading={loading} />}
    </CdsTransactionLayout>
  );
};

export default CdsPayments;