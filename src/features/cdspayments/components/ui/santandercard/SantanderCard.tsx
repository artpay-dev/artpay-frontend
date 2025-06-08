import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import ArtpayButton from "../artpaybutton/ArtpayButton.tsx";
import { PaymentProviderCardProps } from "../../../types.ts";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import usePaymentStore from "../../../stores/paymentStore.ts";
import { calculateArtPayFee } from "../../../utils.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import AgreementCheckBox from "../agreementcheckbox/AgreementCheckBox.tsx";
import SantanderIcon from "../../../../../components/icons/SantanderIcon.tsx";

const SantanderCard = ({ subtotal, disabled, paymentSelected = true }: Partial<PaymentProviderCardProps>) => {
  const [fee, setFee] = useState<number>(0);
  const data = useData();
  const { setPaymentData, order, paymentIntent } = usePaymentStore();
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const processOrder = async () => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      const updateStatus = await data.setOrderStatus(order?.id, "processing");
      if (!updateStatus) throw new Error("update status failed");
      console.log("status updated to processing");

      setPaymentData({
        paymentStatus: "processing",
        order: updateStatus,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const handlingArtpaySelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      if (paymentIntent) {
        const updatePayment = await data.updatePaymentIntent({
          wc_order_key: order.order_key,
          payment_method: "santander",
        });
        if (!updatePayment) throw new Error("Error during updating payment intent");

        setPaymentData({
          paymentMethod: "santander",
          paymentIntent: updatePayment,
        });
      }

      const updateOrder = await data.updateOrder(order.id, { payment_method: "santander", needs_processing: false });
      if (!updateOrder) throw new Error("Error during updating order");


      setPaymentData({
        paymentMethod: "santander",
        paymentIntent: null,
        order: updateOrder,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const abortArtpaySelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      if (paymentIntent) {
        const updatePayment = await data.updatePaymentIntent({
          wc_order_key: order?.order_key,
          payment_method: "bnpl",
        });
        if (!updatePayment) throw new Error("Error during updating payment intent");

        setPaymentData({
          paymentIntent: updatePayment,
        })
      }

      const updateOrder = await data.updateOrder(order.id, { payment_method: "bnpl" });
      if (!updateOrder) throw new Error("Error during updating payment intent");

      setPaymentData({
        paymentMethod: "bnpl",
        paymentIntent: null,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  useEffect(() => {
    if (order) {
      const artpayFee = calculateArtPayFee(order);
      setFee(artpayFee);
    }
  }, [order]);

  return (
    <PaymentProviderCard
      disabled={disabled}
      icon={<SantanderIcon />}
      cardTitle={"Santander"}
      subtitle={"A partire da € 1.500,00 fino a € 30.000,00"}
      paymentSelected={paymentSelected}>
      {!disabled && paymentSelected ? (
        <>
          <ol className={"list-decimal ps-4 space-y-1 border-b border-zinc-300 pb-6"}>
            <li>Richiedi finanziamento</li>
            <li>Calcola rata e conferma richiesta</li>
            <li>Paga su artpay con il finanziamento ricevuto</li>
          </ol>
          <ul className={"space-y-4 py-4"}>
            <li className={"w-full flex justify-between"}>
              Subtotale: <span>€&nbsp;{subtotal?.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
            </li>
            <li>
              <div className={"w-full flex justify-between"}>
              Commissioni artpay: <span>€&nbsp;{fee.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
              </div>
              <p className={'text-secondary text-xs'}>Inclusi costi del finanziamento</p>
            </li>
            <li className={"w-full flex justify-between"}>
              <strong>Totale:</strong> <strong>€&nbsp;{(Number(subtotal) + Number(fee)).toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</strong>
            </li>
          </ul>
          {order?.payment_method == "santander" ? (
            <>
              <AgreementCheckBox isChecked={isChecked} handleChange={handleCheckBox} />
              <button
                onClick={processOrder}
                className={"artpay-button-style bg-primary text-white disabled:opacity-65"}
                disabled={!isChecked}>
                Avvia richiesta prestito
              </button>
              <button className={"w-full flex justify-center mb-4 mt-8 cursor-pointer"} onClick={abortArtpaySelection}>Annulla</button>
            </>
          ) : (
            <>
              <div className={"flex justify-center"}>
                <ArtpayButton onClick={handlingArtpaySelection} disabled={disabled} />
              </div>
              <NavLink to={"/"} className={"text-tertiary underline underline-offset-2 mt-8 block"}>
                Scopri di più
              </NavLink>
            </>
          )}
        </>
      ) : (
        disabled ? (<></>) : (
          <span>
          Ci hai ripensato?{" "}
            <button onClick={handlingArtpaySelection} className={"cursor-pointer"} disabled={disabled}>
            <strong className={"underline"}>Paga con Prestito</strong>
          </button>
        </span>
        )
      )}
    </PaymentProviderCard>
  );
};

export default SantanderCard;
