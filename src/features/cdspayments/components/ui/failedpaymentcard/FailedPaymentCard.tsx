import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import { useNavigate } from "../../../../../utils.ts";
import usePaymentStore from "../../../stores/paymentStore.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";

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
      });
      navigate(`/acquisto-esterno?=order${order?.id}`);
    }
  };

  return (
    <PaymentProviderCard backgroundColor={"bg-[#FAFAFB]"} className={"border border-[#EC6F7B]"}>
      <div className={"w-full space-y-8 "}>
        <div className={"space-y-4"}>
          <div className={"space-y-2"}>
            <svg
              width="16"
              height="15"
              viewBox="0 0 16 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={"size-5"}>
              <path
                d="M15.5 3.08617V9.26117C15.5 10.9413 14.4783 12.0068 12.8134 12.0068H7.11173L4.55061 14.2768C4.40701 14.4127 4.28374 14.5 4.13056 14.5C3.92659 14.5 3.78724 14.3443 3.78724 14.0939V12.0068H3.18667C1.51667 12.0068 0.5 10.959 0.5 9.26117V3.08617C0.5 1.38313 1.51667 0.333344 3.18667 0.333344H12.8134C14.4783 0.333344 15.5 1.40076 15.5 3.08617ZM7.48377 9.05132C7.48377 9.3288 7.71847 9.57483 8.00451 9.57483C8.28861 9.57483 8.52331 9.33087 8.52331 9.05132C8.52331 8.76341 8.29056 8.52271 8.00451 8.52271C7.7165 8.52271 7.48377 8.76548 7.48377 9.05132ZM7.65951 3.1717L7.71057 7.12341C7.71255 7.33474 7.82564 7.46623 8.00451 7.46623C8.17747 7.46623 8.29056 7.33674 8.29258 7.12341L8.35267 3.17372C8.34956 2.96243 8.21271 2.81386 8.00256 2.81386C7.79039 2.81386 7.65753 2.96041 7.65951 3.1717Z"
                fill={"#EC6F7B"}
              />
            </svg>
            <p className={"leading-[125%] font-semibold"}>Ci dispiace, ma il pagamento non è andato a buon fine.</p>
          </div>
          <p className={"leading-[125%]"}>Errore durante il pagamento</p>
        </div>
        <div className={"space-y-4"}>
          <button
            onClick={handleRetryPayment}
            className={"artpay-button-style bg-primary hover:bg-primary-hover text-white "}>
            Riprova
          </button>
          <button
            onClick={handleNavigate}
            className={
              "artpay-button-style border border-primary hover:border-primary-hover text-primary hover:text-primary-hover bg-white max-w-fit"
            }>
            Annulla il pagamento
          </button>
        </div>
      </div>
    </PaymentProviderCard>
  );
};

export default FailedPaymentCard;
