import SkeletonCard from "../ui/paymentprovidercard/SkeletonCard.tsx";
import { Order } from "../../../../types/order.ts";
import PaymentProviderCard from "../ui/paymentprovidercard/PaymentProviderCard.tsx";
import { ArrowRight } from "@mui/icons-material";
import { useAuth } from "../../../../hoc/AuthProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";
import BankTransfer from "../banktransfer/BankTransfer.tsx";
import SantanderIcon from "../../../../components/icons/SantanderIcon.tsx";

type SantanderFlowProps = {
  isLoading?: boolean;
  order?: Order;
};

const SantanderFlow = ({ isLoading, order }: SantanderFlowProps) => {
  const { setPaymentData, orderNote } = usePaymentStore();
  const data = useData();
  const subtotal = !order?.fee_lines.length ? Number(order?.total) / 1.04 : Number(order?.total) / 1.04 / 1.061;
  const { user } = useAuth();

  const event_name = "santander_click";
  const properties = {
    id: user?.id || "anonimo",
    username: user?.username || "non fornito",
    event_data: {},
  };

  properties.event_data = {
    order: order?.id,
    user_email: user?.email || "anonimo",
    total: order?.total,
  };

  const handleDeleteOrder = async () => {
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
      console.log("Order restore to on-hold");

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
    }
  };

  const handleSantanderButton = () => {
    window.Brevo.push(["track", event_name, properties]);

    console.log("push", event_name, properties);
  };

  const handleCompletePayment = async () => {
    if (!order) return;

    setPaymentData({
      loading: true,
    });
    try {
      const resp = await data.updateOrder(order?.id, { customer_note: "Prestito ottenuto" });
      console.log(resp);
      if (!resp) throw Error("Error updating order");
      setPaymentData({
        readyToPay: true,
        orderNote: resp.customer_note,
        order: resp,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  return (
    <section className={"space-y-6"}>
      <div className={"border-t border-secondary mt-12 "}>
        <h3 className={"text-secondary py-4.5 flex items-center gap-2"}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.375 7C3.375 6.10254 4.10254 5.375 5 5.375H19C19.8975 5.375 20.625 6.10254 20.625 7V8.625H3.375V7ZM3.375 17V11.375H20.625V17C20.625 17.8975 19.8975 18.625 19 18.625H5C4.10254 18.625 3.375 17.8975 3.375 17ZM5 4.625C3.68832 4.625 2.625 5.68832 2.625 7V17C2.625 18.3117 3.68832 19.375 5 19.375H19C20.3117 19.375 21.375 18.3117 21.375 17V7C21.375 5.68832 20.3117 4.625 19 4.625H5Z"
                fill="#CDCFD3"
              />
            </g>
            <defs>
              <clipPath>
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Pagamenti
        </h3>
        <ul className={"flex flex-col items-center space-y-6 lg:flex-row lg:items-start lg:justify-start "}>
          <li className={"w-full"}>
            {!order || isLoading ? (
              <SkeletonCard />
            ) : (
              <div className={"space-y-6"}>
                <PaymentProviderCard subtotal={subtotal} backgroundColor={"bg-[#42B39640]"}>
                  <div className={"space-y-4"}>
                    <div className={"flex gap-6 items-center "}>
                      <span>
                        <SantanderIcon />
                      </span>
                      <h3 className={"text-lg leading-[125%] text-tertiary text-balance"}>
                        Complimenti il tuo lotto è pronto per {orderNote == "" ? <span>richiedere il prestito</span> : <span>completare il pagamento</span>}
                      </h3>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>N. Ordine</span>
                      <span className={"text-lg"}>{order.id}</span>
                      <p>Il N. Ordine va inserito nella causale in caso di pagamento con bonifico</p>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Stato</span>
                      {order.customer_note != "" ? <p>Prestito ottenuto</p> : <p>Richiesta prestito in corso</p>}
                    </div>
                  </div>
                </PaymentProviderCard>

                  {orderNote != "" ? (
                    <>

                    </>
                  ) : (
                    <PaymentProviderCard backgroundColor={"bg-[#FAFAFB]"}>
                      <div className={"space-y-1 border-b border-b-zinc-300 pb-4"}>
                        <h3 className={"font-bold leading-[125%] text-tertiary"}>Calcola la rata</h3>
                        <p>Avvia la procedura di richiesta prestito</p>
                      </div>
                      <a
                        className={"cursor-pinter flex gap-2 items-center"}
                        onClick={handleSantanderButton}
                        href={"https://www.santanderconsumer.it/prestito/partner/artpay"}
                        target={"_blank"}>
                        <span>
                          <svg
                            width="34"
                            height="24"
                            viewBox="0 0 34 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#EA1D25" />
                            <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
                            <path
                              d="M19.6526 10.2795C19.9083 10.6554 20.0362 11.0892 20.0682 11.5229C22.4334 12.0723 24.0315 13.2578 23.9995 14.559C23.9995 16.4675 20.8672 18 16.9998 18C13.1323 18 10 16.4675 10 14.559C10 13.2 11.6301 12.0145 13.9633 11.4651C13.9633 11.9855 14.0912 12.506 14.3788 12.9687L16.5843 16.4096C16.7441 16.6699 16.8719 16.959 16.9358 17.2482L17.0317 17.1036C17.5751 16.2651 17.5751 15.1952 17.0317 14.3566L15.2738 11.6096C14.7304 10.7422 14.7304 9.7012 15.2738 8.86265L15.3697 8.71807C15.4336 9.00723 15.5615 9.29639 15.7213 9.55663L16.7441 11.1759L18.3422 13.6916C18.502 13.9518 18.6298 14.241 18.6938 14.5301L18.7897 14.3855C19.333 13.547 19.333 12.4771 18.7897 11.6386L17.0317 8.89157C16.4884 8.05301 16.4884 6.98313 17.0317 6.14458L17.1276 6C17.1915 6.28916 17.3194 6.57831 17.4792 6.83855L19.6526 10.2795Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                        <span>Calcola la rata con Santander</span>
                        <ArrowRight />
                      </a>
                    </PaymentProviderCard>
                  )}
                {orderNote != "" ? (
                  <PaymentProviderCard backgroundColor={"bg-[#FAFAFB]"}>
                    <BankTransfer order={order} handleRestoreOrder={handleDeleteOrder}/>
                  </PaymentProviderCard>
                ) : (
                  <PaymentProviderCard backgroundColor={"bg-[#FAFAFB]"}>
                    <div className={"space-y-1 mb-6"}>
                      <h3 className={"font-bold leading-[125%] text-tertiary"}>Completa pagamento</h3>
                      <p>Una volta ottenuto il prestito completa il pagamento sulla nostra piattaforma</p>
                    </div>
                    <div className={"space-y-6 flex flex-col"}>
                      <button
                        className={"artpay-button-style bg-primary py-3! text-white"}
                        onClick={handleCompletePayment}>
                        Completa pagamento
                      </button>
                      <button className={"text-secondary cursor-pointer"} onClick={handleDeleteOrder}>
                        Annulla
                      </button>
                    </div>
                  </PaymentProviderCard>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default SantanderFlow;
