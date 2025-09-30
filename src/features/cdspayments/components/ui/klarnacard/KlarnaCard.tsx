import { NavLink } from "react-router-dom";
import { PaymentProviderCardProps } from "../../../types.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../../stores/paymentStore.ts";
import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import KlarnaIcon from "../paymentprovidercard/KlarnaIcon.tsx";
import { calculateTotalFee } from "../../../utils.ts";
import { useEffect, useState } from "react";
import PaymentForm from "../paymentform/PaymentForm.tsx";
import { Elements } from "@stripe/react-stripe-js";
import { usePayments } from "../../../../../hoc/PaymentProvider.tsx";

const KlarnaCard = ({ subtotal, disabled, paymentSelected = true }: Partial<PaymentProviderCardProps>) => {
  const payments = usePayments();
  const { order, setPaymentData, paymentIntent } = usePaymentStore();
  const [fee, setFee] = useState<number>(0);
  const data = useData();
  const quote = subtotal ? (Number(subtotal) * 1.104658) / 3 : 0;

  const handlingKlarnaSelection = async (): Promise<void> => {
    if(!order) {
      console.log("order not found");
      return;
    }

    setPaymentData({
        loading: true,
      });
      try {

        const updatePayment = await data.updatePaymentIntent({
          wc_order_key: order?.order_key,
          payment_method: "klarna",
        });
        if (!updatePayment) throw new Error("Error during updating payment intent");
        console.log('update payment intent', updatePayment);


        const updateOrder = await data.updateOrder(order.id, { payment_method: "klarna" });
        if (!updateOrder) throw new Error("Error during updating payment intent");
        console.log('update order', updateOrder);


        setPaymentData({
          paymentMethod: "klarna",
          paymentIntent: updatePayment
        });


      } catch (e) {
        console.error(e);
      } finally {
        setPaymentData({
          loading: false,
        });
      }
  };

  const createPaymentIntent = async () => {
    if(!order) {
      console.log("order not found");
      return;
    }

    try {
      const createPayment = await data.createPaymentIntentCds({ wc_order_key: order?.order_key });
      if (!createPayment) throw new Error("Errore nella creazione del payment intent");
      console.log("Primo payment intent creato", createPayment);

      setPaymentData({
        paymentIntent: createPayment,
      })
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!paymentIntent) createPaymentIntent();
    if (order) {
      const totalFee = calculateTotalFee(order);
      setFee(totalFee);
    }


  }, [order]);


  return (
    <PaymentProviderCard
      disabled={disabled}
      backgroundColor={"bg-[#FFE9EE]"}
      cardTitle={"Klarna"}
      icon={<KlarnaIcon />}
      subtitle={"Paga in 3 rate fino a €2.500,00"}>
      {paymentSelected ? (
        <>
          {order?.payment_method == "klarna" && paymentIntent ? (
            <Elements
              stripe={payments.stripe}
              options={{
                clientSecret: paymentIntent?.client_secret || undefined,
                loader: "always",
                appearance: {
                  theme: "flat",
                  variables: {
                    colorBackground: '#fff',
                    colorTextSecondary: '#808791'
                  },
                  rules: {
                    ".Block": {
                      backgroundColor: "#FFE9EE",
                    },
                  },
                },

              }}>
              <PaymentForm />
            </Elements>
          ) : (
            order &&
            Number(order?.total) <= 2500 && (
              <>
                <p className={"border-b border-zinc-300 pb-6"}>{`Tre rate senza interessi da € ${quote.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</p>
                <ul className={"space-y-4 py-4"}>
                  <li className={"w-full flex justify-between"}>
                    Subtotale: <span>€&nbsp;{subtotal?.toLocaleString('it-IT', { maximumFractionDigits: 2 , minimumFractionDigits: 2})}</span>
                  </li>
                  <li >
                    <div className={"w-full flex justify-between"}>
                      Commissioni artpay: <span>€&nbsp;{fee.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className={'text-secondary text-xs'}>Inclusi costi del finanziamento</p>
                  </li>
                  <li className={"w-full flex justify-between"}>
                    <strong>Totale:</strong> <strong>€&nbsp;{(Number(subtotal) + Number(fee)).toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</strong>
                  </li>
                </ul>
                <div className={"flex justify-center"}>
                  <button
                    onClick={handlingKlarnaSelection}
                    className={"artpay-button-style bg-klarna hover:bg-klarna-hover"}>
                    Paga la prima rata da € {quote.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  </button>
                </div>
              </>
            )
          )}
          <NavLink
            to={"/guide/klarna"}
            className={`text-tertiary underline underline-offset-2 mt-8 block ${disabled ? 'cursor-not-allowed': 'cursor-pointer'} `}
            aria-disabled={disabled}>
            Scopri di più
          </NavLink>
        </>
      ) : (
        disabled ? (
          <></>
        ) : (
          <span>
          Ci hai ripensato?{" "}
            <button onClick={handlingKlarnaSelection} disabled={disabled || Number(order?.total) > 2500}>
            <strong className={"underline cursor-pointer disabled:cursor-not-allowed"}>Paga con Klarna</strong>
          </button>
        </span>
        )
      )}
    </PaymentProviderCard>
  );
};

export default KlarnaCard;
