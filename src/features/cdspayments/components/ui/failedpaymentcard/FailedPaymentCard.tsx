import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import { useNavigate } from "../../../../../utils.ts";
import usePaymentStore from "../../../stores/paymentStore.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import ErrorIcon from "../../../../../components/icons/ErrorIcon.tsx";

const FailedPaymentCard = () => {
  const navigate = useNavigate();
  const { setPaymentData, order } = usePaymentStore();
  const data = useData();

  const handleNavigate = () => {
    navigate("/");
  };

  const handleRetryPayment = async () => {
    setPaymentData({
      loading: true,
    });
    try {
      if (!order) return;

      const restoreToOnHold = await data.updateOrder(order?.id, {
        status: "on-hold",
        payment_method: "bnpl",
        customer_note: "",
      });
      if (!restoreToOnHold) throw Error("Error updating order to on-hold");
      console.log("Order restored to on-hold");

      setPaymentData({
        paymentStatus: "on-hold",
        paymentMethod: "bnpl",
        orderNote: "",
      });


    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      })
      navigate(`/acquisto-esterno?=order${order?.id}`);
    }
  };

  return (
    <PaymentProviderCard backgroundColor={"bg-white"} className={"shadow-lg"}>
      <div className={"flex flex-col items-center justify-center w-full space-y-6"}>
        <div className={"flex flex-col items-center space-y-2"}>
          <div className={'flex items-center space-x-2'}>
            <ErrorIcon />
            <p className={"text-2xl text-center leading-[125%]"}>Ops!</p>
          </div>
          <p className={'text-center'}>Il pagamento non è andato a buon fine!</p>
        </div>
        <div className={"mb-6"}>
          <button
            onClick={handleRetryPayment}
            className={"artpay-button-style bg-primary hover:bg-primary-hover text-white max-w-fit"}>
            Riprova
          </button>
        </div>
        <div className={"mb-6"}>
          <button
            onClick={handleNavigate}
            className={
              "artpay-button-style border border-primary hover:border-primary-hover text-primary hover:text-primary-hover bg-white max-w-fit"
            }>
            Torna alla home
          </button>
        </div>
      </div>
    </PaymentProviderCard>
  );
};

export default FailedPaymentCard;
